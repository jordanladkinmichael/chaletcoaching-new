import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";

import { authOptions } from "@/lib/auth";
import { createCardServOrder } from "@/lib/cardserv";
import type { CardServCurrency } from "@/lib/cardserv-config";
import { prisma } from "@/lib/db";
import { applyCardServGatewayUpdate } from "@/lib/payment-orders";
import { isForceSuccessEnabled } from "@/lib/payments-force-success";
import { Currency, getPackagePrice, TOKEN_PACKAGES, TokenPackageId } from "@/lib/payment";
import { calculateTokensFromAmount } from "@/lib/token-packages";
import { logCardServEvent } from "@/lib/cardserv-observability";
import { countryNameToIso2 } from "@/lib/country-codes";

const BodySchema = z.object({
  packageId: z.enum(["STARTER", "POPULAR", "PRO", "ENTERPRISE"] as const),
  currency: z.enum(["EUR", "GBP", "USD"] as const),
  amount: z.number().positive(),
  grossAmount: z.number().positive(),
  vatAmount: z.number().nonnegative(),
  tokens: z.number().int().positive(),
  description: z.string().min(1),
  email: z.string().email().optional(),
  card: z.object({
    cardNumber: z.string().min(12),
    cvv: z.string().min(3).max(4),
    expiry: z.string().regex(/^(0[1-9]|1[0-2])\/\d{2}$/),
    name: z.string().min(2),
    address: z.string().optional(),
    country: z.string().min(2),
    city: z.string().optional(),
    postalCode: z.string().optional(),
  }),
  browser: z.object({
    colorDepth: z.number().int().positive().optional(),
    screenHeight: z.number().int().positive().optional(),
    screenWidth: z.number().int().positive().optional(),
    timeZone: z.number().int().optional(),
    javaEnabled: z.boolean().optional(),
    javascriptEnabled: z.boolean().optional(),
    acceptLanguage: z.string().min(2).optional(),
    userAgent: z.string().min(4).optional(),
  }).optional(),
  address: z.string().optional(),
  country: z.string().min(2),
  city: z.string().optional(),
  postalCode: z.string().optional(),
});

function getAppUrl(req: Request): string {
  const requestUrl = new URL(req.url);
  const origin = `${requestUrl.protocol}//${requestUrl.host}`;
  const hostname = requestUrl.hostname.toLowerCase();
  const isLocalHost =
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "::1" ||
    hostname.endsWith(".local");
  const envUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL;

  if (!isLocalHost && origin) return origin;
  if (envUrl) return envUrl.replace(/\/$/, "");
  if (origin) return origin;

  throw new Error("Unable to resolve app base URL");
}

function normalizeCardServIp(value: string | undefined): string {
  const trimmed = value?.trim();
  if (!trimmed || trimmed === "::1" || trimmed === "0:0:0:0:0:0:0:1") {
    return "127.0.0.1";
  }
  return trimmed;
}

function normalizeAcceptHeader(value: string | undefined): string {
  const trimmed = value?.trim();
  if (!trimmed || trimmed.length < 10 || trimmed === "*/*") {
    return "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8";
  }
  return trimmed;
}

function expectedAmounts(packageId: TokenPackageId, currency: Currency, amount: number) {
  if (packageId === "ENTERPRISE") {
    const roundedNet = Math.round(amount * 100) / 100;
    const vatAmount = 0;
    const grossAmount = roundedNet;
    const tokens = calculateTokensFromAmount(roundedNet, currency);
    return { net: roundedNet, vatAmount, grossAmount, tokens };
  }

  const net = getPackagePrice(packageId, currency);
  const vatAmount = 0;
  const grossAmount = net;
  const tokens = TOKEN_PACKAGES[packageId].tokens;
  return { net, vatAmount, grossAmount, tokens };
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const parsed = BodySchema.parse(await req.json());
    const forwardedFor = req.headers.get("x-forwarded-for");
    const browserIp = normalizeCardServIp(
      forwardedFor?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || undefined,
    );
    const acceptHeader = normalizeAcceptHeader(req.headers.get("accept") || undefined);
    const requestUserAgent = req.headers.get("user-agent") || undefined;
    const payerEmail = parsed.email || session.user.email;
    if (!payerEmail) {
      return NextResponse.json({ error: "Missing customer email" }, { status: 400 });
    }

    const currency: CardServCurrency = parsed.currency;
    const expected = expectedAmounts(parsed.packageId, currency, parsed.amount);

    if (
      Math.abs(expected.net - parsed.amount) > 0.01 ||
      Math.abs(expected.vatAmount - parsed.vatAmount) > 0.01 ||
      Math.abs(expected.grossAmount - parsed.grossAmount) > 0.01 ||
      Math.abs(expected.tokens - parsed.tokens) > 0
    ) {
      return NextResponse.json(
        { error: "Checkout data mismatch. Please restart checkout from pricing." },
        { status: 400 },
      );
    }

    const orderMerchantId = `cc_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    await prisma.paymentOrder.create({
      data: {
        userId: session.user.id,
        packageId: parsed.packageId,
        packageName: parsed.packageId === "ENTERPRISE" ? "Custom" : TOKEN_PACKAGES[parsed.packageId].name,
        currency,
        amountNet: expected.net,
        vatAmount: expected.vatAmount,
        amountGross: expected.grossAmount,
        tokens: expected.tokens,
        status: "PENDING",
        orderMerchantId,
      },
    });

    const salePayload = {
      orderMerchantId,
      amountGross: expected.grossAmount,
      currency,
      description: parsed.description,
      email: payerEmail,
      card: parsed.card,
      address: parsed.address,
      countryCode: countryNameToIso2(parsed.country) ?? countryNameToIso2(parsed.card.country),
      city: parsed.city,
      postalCode: parsed.postalCode,
      appUrl: getAppUrl(req),
      browser: {
        ipAddress: browserIp,
        acceptHeader,
        colorDepth: parsed.browser?.colorDepth,
        screenHeight: parsed.browser?.screenHeight,
        screenWidth: parsed.browser?.screenWidth,
        timeZone: parsed.browser?.timeZone,
        javaEnabled: parsed.browser?.javaEnabled,
        javascriptEnabled: parsed.browser?.javascriptEnabled,
        acceptLanguage: parsed.browser?.acceptLanguage || req.headers.get("accept-language") || undefined,
        userAgent: parsed.browser?.userAgent || requestUserAgent,
      },
    };

    logCardServEvent("sale.route_request", {
      orderMerchantId,
      userId: session.user.id,
      packageId: parsed.packageId,
      currency,
      amount: expected.grossAmount,
      email: payerEmail,
      browser: salePayload.browser,
      billingCountry: parsed.country,
      countryCode: salePayload.countryCode,
      forceSuccess: isForceSuccessEnabled(),
    });

    if (!salePayload.countryCode) {
      return NextResponse.json({ ok: false, error: "Unsupported billing country" }, { status: 400 });
    }

    if (isForceSuccessEnabled()) {
      const fallbackRedirect = `${salePayload.appUrl}/api/cardserv/result?order=${encodeURIComponent(orderMerchantId)}&forced=1`;
      let redirectUrl = fallbackRedirect;
      let probeRaw: unknown = null;

      // Try to get a real CardServ redirect URL so forced mode keeps gateway redirect UX.
      try {
        const probe = await createCardServOrder(salePayload);
        if (probe.redirectUrl) redirectUrl = probe.redirectUrl;
        probeRaw = probe.raw;
      } catch {
        // Keep fallback redirect if gateway test call cannot return a redirect URL.
      }

      const forced = await applyCardServGatewayUpdate({
        orderMerchantId,
        orderState: "APPROVED",
        orderSystemId: `forced_${orderMerchantId}`,
        redirectUrl,
        errorCode: null,
        errorMessage: null,
        raw: {
          forced: true,
          source: "sale",
          mode: "sandbox",
          redirectUrl,
          probeRaw,
          at: new Date().toISOString(),
        },
        source: "sale",
      });

      return NextResponse.json({
        ok: true,
        orderMerchantId,
        orderSystemId: `forced_${orderMerchantId}`,
        state: "APPROVED",
        redirectUrl,
        threeDSAuth: null,
        errorCode: null,
        errorMessage: null,
        finalized: forced.ok ? forced.finalized : false,
        tokensAdded: forced.ok && "tokensAdded" in forced ? forced.tokensAdded : 0,
      });
    }

    const sale = await createCardServOrder(salePayload);

    const stateResult = await applyCardServGatewayUpdate({
      orderMerchantId,
      orderState: sale.orderState,
      orderSystemId: sale.orderSystemId,
      redirectUrl: sale.redirectUrl,
      errorCode: sale.errorCode,
      errorMessage: sale.errorMessage,
      raw: sale.raw,
      source: "sale",
    });

    return NextResponse.json({
      ok: true,
      orderMerchantId,
      orderSystemId: sale.orderSystemId ?? null,
      state: sale.orderState,
      redirectUrl: sale.redirectUrl,
      threeDSAuth: sale.threeDSAuth,
      errorCode: sale.errorCode ?? null,
      errorMessage: sale.errorMessage ?? null,
      finalized: stateResult.ok ? stateResult.finalized : false,
      tokensAdded: stateResult.ok && "tokensAdded" in stateResult ? stateResult.tokensAdded : 0,
    });
  } catch (error) {
    logCardServEvent("sale.route_error", {
      error: error instanceof Error ? error.message : String(error),
    });
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { ok: false, error: "Invalid request payload", details: error.flatten() },
        { status: 400 },
      );
    }
    const message = error instanceof Error ? error.message : "Failed to create CardServ sale";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
