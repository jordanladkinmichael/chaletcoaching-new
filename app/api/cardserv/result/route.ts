import { NextResponse } from "next/server";

import { getCardServStatus } from "@/lib/cardserv";
import type { CardServCurrency } from "@/lib/cardserv-config";
import { prisma } from "@/lib/db";
import { applyCardServGatewayUpdate } from "@/lib/payment-orders";

function getAppUrl(req: Request): string {
  const requestUrl = new URL(req.url);
  const origin = `${requestUrl.protocol}//${requestUrl.host}`;
  if (origin.includes("localhost") || origin.includes("127.0.0.1")) {
    return origin;
  }

  const envUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL;
  if (envUrl) return envUrl.replace(/\/$/, "");
  return origin;
}

function isForceSuccessEnabled(): boolean {
  const flag = (process.env.PAYMENTS_FORCE_SUCCESS || "").toLowerCase();
  const enabled = ["1", "true", "yes", "on"].includes(flag);
  return enabled && process.env.NODE_ENV !== "production";
}

function getOrderMerchantId(req: Request, form?: FormData): string | null {
  const { searchParams } = new URL(req.url);

  return (
    form?.get("MD")?.toString() ||
    form?.get("threeDSSessionData")?.toString() ||
    searchParams.get("order") ||
    searchParams.get("orderId") ||
    searchParams.get("orderMerchantId") ||
    form?.get("order")?.toString() ||
    form?.get("orderId")?.toString() ||
    null
  );
}

async function handleResult(req: Request, form?: FormData) {
  const orderMerchantId = getOrderMerchantId(req, form);
  const appUrl = getAppUrl(req);

  if (!orderMerchantId) {
    return NextResponse.redirect(`${appUrl}/payment-failed?reason=missing_order`, 302);
  }

  const order = await prisma.paymentOrder.findUnique({ where: { orderMerchantId } });
  if (!order) {
    return NextResponse.redirect(
      `${appUrl}/payment-failed?reason=order_not_found&order=${encodeURIComponent(orderMerchantId)}`,
      302,
    );
  }

  const forceSuccess = isForceSuccessEnabled();
  const status = forceSuccess
    ? {
        orderState: "APPROVED",
        orderSystemId: order.orderSystemId ?? `forced_${orderMerchantId}`,
        redirectUrl: null,
        errorCode: null,
        errorMessage: null,
        raw: { forced: true, source: "result", at: new Date().toISOString() },
      }
    : await getCardServStatus(
        orderMerchantId,
        order.currency as CardServCurrency,
        order.orderSystemId,
      );

  await applyCardServGatewayUpdate({
    orderMerchantId,
    orderState: status.orderState,
    orderSystemId: status.orderSystemId,
    redirectUrl: status.redirectUrl,
    errorCode: status.errorCode,
    errorMessage: status.errorMessage,
    raw: {
      form: form ? Object.fromEntries(form.entries()) : {},
      status: status.raw,
      forced: forceSuccess,
    },
    source: "result",
  });

  if (!forceSuccess && ["DECLINED", "ERROR"].includes(status.orderState)) {
    return NextResponse.redirect(
      `${appUrl}/payment-failed?order=${encodeURIComponent(orderMerchantId)}&reason=${encodeURIComponent(status.errorMessage || status.orderState)}`,
      302,
    );
  }

  return NextResponse.redirect(
    `${appUrl}/payment-success?order=${encodeURIComponent(orderMerchantId)}`,
    302,
  );
}

export async function POST(req: Request) {
  try {
    const form = await req.formData().catch(() => undefined);
    return await handleResult(req, form);
  } catch (error) {
    const appUrl = getAppUrl(req);
    const message = error instanceof Error ? error.message : "result_error";
    return NextResponse.redirect(
      `${appUrl}/payment-failed?reason=${encodeURIComponent(message)}`,
      302,
    );
  }
}

export async function GET(req: Request) {
  try {
    return await handleResult(req);
  } catch (error) {
    const appUrl = getAppUrl(req);
    const message = error instanceof Error ? error.message : "result_error";
    return NextResponse.redirect(
      `${appUrl}/payment-failed?reason=${encodeURIComponent(message)}`,
      302,
    );
  }
}
