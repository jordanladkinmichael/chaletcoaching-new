import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";

import { authOptions } from "@/lib/auth";
import { getCardServStatus } from "@/lib/cardserv";
import type { CardServCurrency } from "@/lib/cardserv-config";
import { prisma } from "@/lib/db";
import { applyCardServGatewayUpdate } from "@/lib/payment-orders";
import { isForceSuccessEnabled } from "@/lib/payments-force-success";
import { logCardServEvent } from "@/lib/cardserv-observability";

const BodySchema = z.object({
  orderMerchantId: z.string().min(4),
});

type PaymentOrderLookup = {
  findUnique(args: { where: { orderMerchantId: string } }): Promise<{
    userId: string;
    orderSystemId: string | null;
    currency: string;
  } | null>;
};

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { orderMerchantId } = BodySchema.parse(await req.json());
    logCardServEvent("status.route_request", {
      orderMerchantId,
      userId: session.user.id,
      forceSuccess: isForceSuccessEnabled(),
    });
    const paymentOrders = (prisma as unknown as { paymentOrder: PaymentOrderLookup }).paymentOrder;
    const order = await paymentOrders.findUnique({ where: { orderMerchantId } });

    if (!order || order.userId !== session.user.id) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (isForceSuccessEnabled()) {
      const forced = await applyCardServGatewayUpdate({
        orderMerchantId,
        orderState: "APPROVED",
        orderSystemId: order.orderSystemId ?? `forced_${orderMerchantId}`,
        errorCode: null,
        errorMessage: null,
        raw: { forced: true, source: "status", at: new Date().toISOString() },
        source: "status",
      });

      return NextResponse.json({
        ok: true,
        orderMerchantId,
        orderSystemId: order.orderSystemId ?? `forced_${orderMerchantId}`,
        state: "APPROVED",
        redirectUrl: null,
        errorCode: null,
        errorMessage: null,
        finalized: forced.ok ? forced.finalized : false,
        credited: forced.ok && "credited" in forced ? forced.credited : false,
        tokensAdded: forced.ok && "tokensAdded" in forced ? forced.tokensAdded : 0,
        newBalance: forced.ok && "newBalance" in forced ? forced.newBalance : null,
      });
    }

    const status = await getCardServStatus(
      orderMerchantId,
      order.currency as CardServCurrency,
      order.orderSystemId,
    );

    const result = await applyCardServGatewayUpdate({
      orderMerchantId,
      orderState: status.orderState,
      orderSystemId: status.orderSystemId,
      redirectUrl: status.redirectUrl,
      errorCode: status.errorCode,
      errorMessage: status.errorMessage,
      raw: status.raw,
      source: "status",
    });

    return NextResponse.json({
      ok: true,
      orderMerchantId,
      orderSystemId: status.orderSystemId,
      state: status.orderState,
      redirectUrl: status.redirectUrl,
      errorCode: status.errorCode,
      errorMessage: status.errorMessage,
      finalized: result.ok ? result.finalized : false,
      credited: result.ok && "credited" in result ? result.credited : false,
      tokensAdded: result.ok && "tokensAdded" in result ? result.tokensAdded : 0,
      newBalance: result.ok && "newBalance" in result ? result.newBalance : null,
    });
  } catch (error) {
    logCardServEvent("status.route_error", {
      error: error instanceof Error ? error.message : String(error),
    });
    const message = error instanceof Error ? error.message : "Failed to fetch payment status";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
