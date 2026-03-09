import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCardServStatus } from "@/lib/cardserv";
import { pickRedirectUrl } from "@/lib/pickRedirectUrl";

export async function POST(req: Request) {
  try {
    const { orderMerchantId } = await req.json();

    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("🔁 [STATUS CHECK START]", orderMerchantId);

    const order = await db.order.findFirst({ where: { orderMerchantId } });
    if (!order) {
      console.log("❌ [STATUS] ORDER NOT FOUND");
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      return NextResponse.json({ ok: false }, { status: 404 });
    }

    console.log("📦 [STATUS] Order found:", {
      id: order.id,
      currency: order.currency,
      amount: order.amount,
      currentStatus: order.status,
    });

    const status = await getCardServStatus(
      orderMerchantId,
      order.currency,
      order.orderSystemId,
    );

    console.log("🔵 [STATUS RESPONSE]");
    console.log("📊 Status state:", status.orderState);
    console.log("📄 Raw status data:", JSON.stringify(status.raw, null, 2));
    console.log("🔐 3DS Auth:", JSON.stringify(status.threeDSAuth, null, 2));

    const redirectUrl = status.redirectUrl || pickRedirectUrl(status.raw);

    console.log("🔗 [REDIRECT URL]:", redirectUrl);
    console.log("All redirect fields:", {
      outputRedirectToUrl: status.raw?.outputRedirectToUrl,
      redirectData: status.raw?.redirectData,
      redirectUrl: status.raw?.redirectUrl,
    });

    const existingResponse =
      order.response && typeof order.response === "object"
        ? (order.response as Record<string, unknown>)
        : {};

    await db.order.update({
      where: { id: order.id },
      data: {
        status: status.orderState,
        response: {
          ...existingResponse,
          status: status.raw,
        },
      },
    });

    console.log("💾 [DB] Order updated");

    const response = {
      ok: true,
      orderMerchantId,
      orderSystemId: status.orderSystemId ?? order.orderSystemId ?? null,
      state: status.orderState,
      redirectUrl,
      threeDSAuth: status.threeDSAuth,
      raw: status.raw,
      errorCode: status.errorCode ?? null,
      errorMessage: status.errorMessage ?? null,
      transientNotFound:
        status.orderState === "UNKNOWN" && Number(status.raw?.errorCode) === -27,
    };

    console.log("📤 [RESPONSE TO FRONTEND]");
    console.log(JSON.stringify(response, null, 2));
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    return NextResponse.json(response);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error";
    const stack = e instanceof Error ? e.stack : undefined;
    console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.error("❌ [STATUS ERROR]:", message);
    if (stack) console.error("Stack:", stack);
    console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    return NextResponse.json(
      { ok: false, error: message },
      { status: 500 }
    );
  }
}
