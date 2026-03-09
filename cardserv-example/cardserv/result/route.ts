import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCardServStatus } from "@/lib/cardserv";

export type CardServCurrency = "GBP" | "EUR" | "USD";

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const { searchParams } = new URL(req.url);

    // 3DS fields (gateway-dependent naming)
    const md = form.get("MD")?.toString();
    const threeDSSessionData = form.get("threeDSSessionData")?.toString();

    const orderMerchantId =
      md ||
      threeDSSessionData ||
      searchParams.get("order") ||
      searchParams.get("orderId") ||
      searchParams.get("orderMerchantId") ||
      form.get("order")?.toString() ||
      form.get("orderId")?.toString();

    const appUrl = process.env.NEXT_PUBLIC_APP_URL!;

    if (!orderMerchantId) {
      console.error("❌ Missing orderMerchantId in 3DS callback");
      return NextResponse.redirect(`${appUrl}/payment/processing`, 302);
    }

    // ✅ 1. Забираємо order з БД (ЦЕ КЛЮЧОВЕ)
    const order = await db.order.findFirst({
      where: { orderMerchantId },
    });

    if (!order) {
      console.error("❌ Order not found:", orderMerchantId);
      return NextResponse.redirect(
        `${appUrl}/payment/processing?order=${encodeURIComponent(orderMerchantId)}`,
        302
      );
    }

    // ✅ 2. Перевіряємо статус у CardServ (З ВАЛЮТОЮ)
    const status = await getCardServStatus(
      orderMerchantId,
      order.currency as CardServCurrency,
      order.orderSystemId,
    );


    // ✅ 3. Оновлюємо order
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
          result: status.raw,
        },
      },
    });

    // ✅ 4. Якщо APPROVED → зараховуємо токени
    if (status.orderState === "APPROVED" && order.tokens && order.userEmail) {
      const user = await db.user.findUnique({
        where: { email: order.userEmail },
      });

      if (user) {
        const newBalance = user.tokenBalance + order.tokens;

        await db.user.update({
          where: { id: user.id },
          data: { tokenBalance: newBalance },
        });

        await db.ledgerEntry.create({
          data: {
            userId: user.id,
            type: "Top-up",
            delta: order.tokens,
            balanceAfter: newBalance,
            currency: order.currency,
            amount: Math.round(order.amount * 100),
          },
        });

        console.log(
          `✅ Tokens credited: ${user.email} +${order.tokens}`
        );
      }
    }

    // ✅ 5. Редірект користувача назад у frontend
    const redirectUrl = `${appUrl}/payment/processing?order=${encodeURIComponent(
      orderMerchantId
    )}`;

    console.log("🔁 Redirecting to:", redirectUrl);
    return NextResponse.redirect(redirectUrl, 302);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("❌ /api/cardserv/result POST error:", message);
    return NextResponse.json(
      { ok: false, error: message },
      { status: 500 }
    );
  }
}

// 🔹 fallback якщо CardServ робить GET
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const orderId =
    searchParams.get("order") ||
    searchParams.get("orderId") ||
    searchParams.get("orderMerchantId");
  const appUrl = process.env.NEXT_PUBLIC_APP_URL!;

  if (!orderId) {
    return NextResponse.redirect(`${appUrl}/payment/processing`, 302);
  }

  const redirectUrl = `${appUrl}/payment/processing?order=${encodeURIComponent(orderId)}`;

  return NextResponse.redirect(redirectUrl, 302);
}
