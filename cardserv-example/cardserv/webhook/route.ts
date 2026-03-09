import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCardServStatus } from "@/lib/cardserv";
import type { CardServCurrency } from "@/lib/config";

export async function POST(req: Request) {
  try {
    const { orderMerchantId } = await req.json();

    if (!orderMerchantId) {
      return NextResponse.json(
        { ok: false, error: "Missing orderMerchantId" },
        { status: 400 }
      );
    }

    const order = await db.order.findFirst({
      where: { orderMerchantId },
    });

    if (!order) {
      return NextResponse.json(
        { ok: false, error: "Order not found" },
        { status: 404 }
      );
    }

    const currency = (order.currency ?? "EUR") as CardServCurrency;
    const status = await getCardServStatus(
      orderMerchantId,
      currency,
      order.orderSystemId
    );

    const existingResponse =
      order.response && typeof order.response === "object"
        ? (order.response as Record<string, unknown>)
        : {};

    await db.order.updateMany({
      where: { orderMerchantId },
      data: {
        status: status.orderState,
        response: {
          ...existingResponse,
          webhook: status.raw,
        },
      },
    });

    if (status.orderState === "APPROVED") {
      const userEmail = order.userEmail ?? undefined;

      if (userEmail) {
        const user = await db.user.findUnique({
          where: { email: userEmail },
        });

        if (user) {
          const tokens = order.tokens ?? 0;
          const newBalance = user.tokenBalance + tokens;

          await db.user.update({
            where: { id: user.id },
            data: { tokenBalance: newBalance },
          });

          await db.ledgerEntry.create({
            data: {
              userId: user.id,
              type: "Top-up",
              delta: tokens,
              balanceAfter: newBalance,
              currency,
              amount: Math.round(order.amount * 100),
              receiptUrl: `order:${orderMerchantId}`,
            },
          });
        }
      }
    }

    return NextResponse.json({
      ok: true,
      state: status.orderState,
      orderSystemId: status.orderSystemId ?? order.orderSystemId ?? null,
      errorCode: status.errorCode ?? null,
      errorMessage: status.errorMessage ?? null,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Webhook Error:", message);
    return NextResponse.json(
      { ok: false, error: message },
      { status: 500 }
    );
  }
}
