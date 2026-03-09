import { prisma } from "@/lib/db";

type GatewaySource = "sale" | "status" | "result" | "webhook";

type GatewayUpdate = {
  orderMerchantId: string;
  orderState: string;
  orderSystemId?: string | null;
  redirectUrl?: string | null;
  errorCode?: number | null;
  errorMessage?: string | null;
  raw?: unknown;
  source: GatewaySource;
};

function normalizeState(state: string | null | undefined): string {
  const normalized = (state || "PROCESSING").toUpperCase();
  if (["APPROVED", "DECLINED", "ERROR", "PROCESSING", "UNKNOWN"].includes(normalized)) {
    return normalized;
  }
  return "PROCESSING";
}

function rawFieldBySource(source: GatewaySource):
  | "rawSale"
  | "rawStatus"
  | "rawResult"
  | "rawWebhook" {
  switch (source) {
    case "sale":
      return "rawSale";
    case "status":
      return "rawStatus";
    case "result":
      return "rawResult";
    default:
      return "rawWebhook";
  }
}

export async function applyCardServGatewayUpdate(update: GatewayUpdate) {
  const order = await prisma.paymentOrder.findUnique({
    where: { orderMerchantId: update.orderMerchantId },
  });

  if (!order) {
    return { ok: false as const, notFound: true as const };
  }

  const nextState = normalizeState(update.orderState);
  const rawField = rawFieldBySource(update.source);

  const updateData: {
    status: string;
    orderSystemId?: string;
    redirectUrl?: string;
    failureReason?: string;
    rawSale?: string;
    rawStatus?: string;
    rawResult?: string;
    rawWebhook?: string;
  } = {
    status: nextState,
  };

  if (update.orderSystemId) updateData.orderSystemId = update.orderSystemId;
  if (update.redirectUrl) updateData.redirectUrl = update.redirectUrl;
  if (update.errorMessage && ["DECLINED", "ERROR"].includes(nextState)) {
    updateData.failureReason = update.errorMessage;
  }
  if (update.raw !== undefined) {
    updateData[rawField] = JSON.stringify(update.raw);
  }

  await prisma.paymentOrder.update({ where: { id: order.id }, data: updateData });

  if (nextState !== "APPROVED") {
    return {
      ok: true as const,
      notFound: false as const,
      finalized: !!order.finalizedAt,
      credited: false as const,
      state: nextState,
    };
  }

  const finalized = await prisma.$transaction(async (tx) => {
    const claim = await tx.paymentOrder.updateMany({
      where: { id: order.id, finalizedAt: null },
      data: {
        finalizedAt: new Date(),
        status: "APPROVED",
        ...(update.orderSystemId ? { orderSystemId: update.orderSystemId } : {}),
      },
    });

    if (claim.count === 0) {
      const already = await tx.paymentOrder.findUnique({ where: { id: order.id } });
      return {
        credited: false,
        alreadyFinalized: true,
        tokensAdded: 0,
        newBalance: null,
        transactionId: already?.transactionId ?? null,
      };
    }

    const transaction = await tx.transaction.create({
      data: {
        userId: order.userId,
        type: "topup",
        amount: order.tokens,
        meta: JSON.stringify({
          provider: "cardserv",
          orderMerchantId: order.orderMerchantId,
          orderSystemId: update.orderSystemId ?? order.orderSystemId ?? null,
          packageId: order.packageId,
          packageName: order.packageName,
          currency: order.currency,
          amountNet: order.amountNet,
          amountGross: order.amountGross,
          vatAmount: order.vatAmount,
        }),
      },
    });

    const user = await tx.user.update({
      where: { id: order.userId },
      data: { tokens: { increment: order.tokens } },
      select: { tokens: true },
    });

    await tx.paymentOrder.update({
      where: { id: order.id },
      data: { transactionId: transaction.id },
    });

    return {
      credited: true,
      alreadyFinalized: false,
      tokensAdded: order.tokens,
      newBalance: user.tokens,
      transactionId: transaction.id,
    };
  });

  return {
    ok: true as const,
    notFound: false as const,
    finalized: true,
    state: "APPROVED",
    ...finalized,
  };
}

