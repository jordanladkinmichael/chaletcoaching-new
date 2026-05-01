import { NextResponse } from "next/server";

import {
  parseCardServWebhookPayload,
  readCardServWebhookOrderId,
} from "@/lib/cardserv";
import { prisma } from "@/lib/db";
import { applyCardServGatewayUpdate } from "@/lib/payment-orders";
import { logCardServEvent } from "@/lib/cardserv-observability";

export async function POST(req: Request) {
  try {
    const payload = (await req.json().catch(() => ({}))) as Record<string, unknown>;
    const orderMerchantId = readCardServWebhookOrderId(payload);

    logCardServEvent("webhook.route_request", {
      orderMerchantId,
      payload,
    });

    if (!orderMerchantId) {
      return NextResponse.json({ ok: false, error: "Missing orderMerchantId" }, { status: 400 });
    }

    const order = await prisma.paymentOrder.findUnique({ where: { orderMerchantId } });
    if (!order) {
      return NextResponse.json({ ok: false, error: "Order not found" }, { status: 404 });
    }

    const status = parseCardServWebhookPayload(payload);

    const result = await applyCardServGatewayUpdate({
      orderMerchantId,
      orderState: status.orderState,
      orderSystemId: status.orderSystemId,
      redirectUrl: status.redirectUrl,
      errorCode: status.errorCode,
      errorMessage: status.errorMessage,
      raw: { webhook: payload },
      source: "webhook",
    });

    return NextResponse.json({
      ok: true,
      orderMerchantId,
      state: status.orderState,
      finalized: result.ok ? result.finalized : false,
      credited: result.ok && "credited" in result ? result.credited : false,
      tokensAdded: result.ok && "tokensAdded" in result ? result.tokensAdded : 0,
    });
  } catch (error) {
    logCardServEvent("webhook.route_error", {
      error: error instanceof Error ? error.message : String(error),
    });
    const message = error instanceof Error ? error.message : "Webhook processing failed";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
