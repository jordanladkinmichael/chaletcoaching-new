import { NextResponse } from "next/server";

import { getCardServStatus } from "@/lib/cardserv";
import type { CardServCurrency } from "@/lib/cardserv-config";
import { prisma } from "@/lib/db";
import { applyCardServGatewayUpdate } from "@/lib/payment-orders";

function getAppUrl(req: Request): string {
  const envUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL;
  if (envUrl) return envUrl.replace(/\/$/, "");
  const requestUrl = new URL(req.url);
  return `${requestUrl.protocol}//${requestUrl.host}`;
}

function getOrderMerchantId(form: FormData, req: Request): string | null {
  const { searchParams } = new URL(req.url);

  return (
    form.get("MD")?.toString() ||
    form.get("threeDSSessionData")?.toString() ||
    searchParams.get("order") ||
    searchParams.get("orderId") ||
    searchParams.get("orderMerchantId") ||
    form.get("order")?.toString() ||
    form.get("orderId")?.toString() ||
    null
  );
}

async function handleResult(req: Request) {
  const form = await req.formData();
  const orderMerchantId = getOrderMerchantId(form, req);
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

  const status = await getCardServStatus(
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
      form: Object.fromEntries(form.entries()),
      status: status.raw,
    },
    source: "result",
  });

  if (["DECLINED", "ERROR"].includes(status.orderState)) {
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

export async function GET(req: Request) {
  const appUrl = getAppUrl(req);
  const { searchParams } = new URL(req.url);
  const orderMerchantId =
    searchParams.get("order") ||
    searchParams.get("orderId") ||
    searchParams.get("orderMerchantId");

  if (!orderMerchantId) {
    return NextResponse.redirect(`${appUrl}/payment-failed?reason=missing_order`, 302);
  }

  return NextResponse.redirect(
    `${appUrl}/payment-success?order=${encodeURIComponent(orderMerchantId)}`,
    302,
  );
}

