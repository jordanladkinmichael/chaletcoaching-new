import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createCardServOrder } from "@/lib/cardserv";
import { pickRedirectUrl } from "@/lib/pickRedirectUrl";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const orderMerchantId = `order_${Date.now()}`;

    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("🟡 [SALE START]", orderMerchantId);
    console.log("📦 Request body:", JSON.stringify(body, null, 2));

    const chargedAmount =
      typeof body.total === "number" && Number.isFinite(body.total)
        ? body.total
        : body.amount;

    console.log("💳 [SALE] Charged amount:", chargedAmount);

    const sale = await createCardServOrder({
      ...body,
      amount: chargedAmount,
      orderMerchantId,
    });

    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("🟢 [SALE RESPONSE]");
    console.log("📊 Sale state:", sale.orderState);
    console.log("🔑 Order system ID:", sale.orderSystemId);
    console.log("📄 Raw sale data:", JSON.stringify(sale.raw?.sale, null, 2));
    console.log("📄 Raw status data:", JSON.stringify(sale.raw?.status, null, 2));

    // Витягуємо 3DS дані
    const statusData = sale.raw?.status;
    const saleData = sale.raw?.sale;
    const threeDSAuth = sale.threeDSAuth;

    console.log("[SALE] 3DS auth:", JSON.stringify(threeDSAuth, null, 2));

    const redirectUrl = sale.redirectUrl || pickRedirectUrl(statusData) || pickRedirectUrl(saleData);

    console.log("🔗 [REDIRECT URL CHECK]");
    console.log("Extracted redirectUrl:", redirectUrl);
    console.log("Status outputRedirectToUrl:", statusData?.outputRedirectToUrl);
    console.log("Status redirectData:", JSON.stringify(statusData?.redirectData, null, 2));
    console.log("Sale outputRedirectToUrl:", saleData?.outputRedirectToUrl);
    console.log("Sale redirectData:", JSON.stringify(saleData?.redirectData, null, 2));

    await db.order.create({
      data: {
        userEmail: body.email,
        amount: chargedAmount,
        currency: body.currency,
        description: body.description,
        tokens: body.tokens ?? 0,
        orderMerchantId,
        orderSystemId: sale.orderSystemId,
        status: sale.orderState,
        response: sale.raw,
      },
    });

    console.log("💾 [DB] Order created successfully");

    const hardFailure =
      !redirectUrl &&
      !threeDSAuth &&
      ["UNKNOWN", "ERROR", "DECLINED"].includes(sale.orderState) &&
      sale.orderSystemId == null;

    const response = {
      ok: !hardFailure,
      orderMerchantId,
      orderSystemId: sale.orderSystemId ?? null,
      state: sale.orderState,
      redirectUrl,
      threeDSAuth,
      raw: sale.raw,
      errorCode: sale.errorCode ?? null,
      errorMessage: sale.errorMessage ?? null,
      transientNotFound:
        sale.orderState === "UNKNOWN" && Number(statusData?.errorCode) === -27,
    };

    console.log("📤 [RESPONSE TO FRONTEND]");
    console.log(JSON.stringify(response, null, 2));
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    return NextResponse.json(response, { status: hardFailure ? 502 : 200 });
  } catch (e: unknown) {
    const rawMessage = e instanceof Error ? e.message : "Unknown error";
    const stack = e instanceof Error ? e.stack : undefined;

    let message = rawMessage;
    if (rawMessage.includes("906 Cannot validate session")) {
      message =
        "CardServ rejected this card/session. Please try another card, or use a provider-supported test card for integration checks.";
    }

    console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.error("❌ [SALE ERROR]", rawMessage);
    if (stack) console.error("Stack:", stack);
    console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    return NextResponse.json(
      { ok: false, error: message, rawError: rawMessage },
      { status: 500 }
    );
  }
}
