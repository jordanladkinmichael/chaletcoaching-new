import { CardServCurrency, getCardServConfig } from "@/lib/cardserv-config";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

type UnknownRecord = Record<string, unknown>;

function asRecord(value: unknown): UnknownRecord | null {
  return value && typeof value === "object" ? (value as UnknownRecord) : null;
}

function readPath(source: unknown, path: string): unknown {
  const root = asRecord(source);
  if (!root) return undefined;

  const parts = path.split(".");
  let cursor: unknown = root;

  for (const part of parts) {
    const current = asRecord(cursor);
    if (!current || !(part in current)) return undefined;
    cursor = current[part];
  }

  return cursor;
}

function firstString(source: unknown, paths: string[]): string | null {
  for (const path of paths) {
    const value = readPath(source, path);
    if (typeof value === "string" && value.trim()) return value;
    if (typeof value === "number") return String(value);
  }
  return null;
}

function firstNumber(source: unknown, paths: string[]): number | null {
  for (const path of paths) {
    const value = readPath(source, path);
    if (typeof value === "number") return value;
    if (typeof value === "string" && value.trim()) {
      const parsed = Number(value);
      if (!Number.isNaN(parsed)) return parsed;
    }
  }
  return null;
}

function firstRecord(source: unknown, paths: string[]): UnknownRecord | null {
  for (const path of paths) {
    const value = readPath(source, path);
    const parsed = asRecord(value);
    if (parsed) return parsed;
  }
  return null;
}

export type CardServNormalizedPayload = {
  orderSystemId: string | null;
  orderState: string;
  redirectUrl: string | null;
  threeDSAuth: UnknownRecord | null;
  errorCode: number | null;
  errorMessage: string | null;
};

export function normalizeCardServPayload(payload: unknown): CardServNormalizedPayload {
  return {
    orderSystemId: firstString(payload, [
      "orderSystemId",
      "order.orderSystemId",
      "data.orderSystemId",
      "result.orderSystemId",
      "payment.orderSystemId",
    ]),
    orderState:
      firstString(payload, [
        "orderState",
        "order.orderState",
        "data.orderState",
        "result.orderState",
        "payment.orderState",
      ]) ?? "PROCESSING",
    redirectUrl: firstString(payload, [
      "outputRedirectToUrl",
      "redirectUrl",
      "redirectData.redirectUrl",
      "redirectData.threeDSRedirectUrl",
      "data.outputRedirectToUrl",
      "data.redirectUrl",
      "result.outputRedirectToUrl",
      "result.redirectUrl",
    ]),
    threeDSAuth: firstRecord(payload, [
      "threeDSAuth",
      "threeDS",
      "data.threeDSAuth",
      "result.threeDSAuth",
      "payment.threeDSAuth",
    ]),
    errorCode: firstNumber(payload, ["errorCode", "data.errorCode", "result.errorCode"]),
    errorMessage: firstString(payload, [
      "errorMessage",
      "data.errorMessage",
      "result.errorMessage",
    ]),
  };
}

export async function createCardServOrder(payload: {
  orderMerchantId: string;
  amountGross: number;
  currency: CardServCurrency;
  description?: string;
  email: string;
  card: {
    cardNumber: string;
    cvv: string;
    expiry: string;
    name: string;
    address?: string;
    city?: string;
    postalCode?: string;
  };
  address?: string;
  city?: string;
  postalCode?: string;
  appUrl: string;
}) {
  const cfg = getCardServConfig(payload.currency);

  const headers = {
    Authorization: `Bearer ${cfg.token}`,
    "Content-Type": "application/json",
  };

  const saleUrl = `${cfg.baseUrl}/api/payments/sale/${cfg.requestorId}`;
  const statusUrl = `${cfg.baseUrl}/api/payments/status/${cfg.requestorId}`;

  const [expMonth, expYearRaw] = payload.card.expiry.split("/");
  const expYear = expYearRaw?.length === 2 ? `20${expYearRaw}` : expYearRaw;

  const billingAddress = payload.address || payload.card.address || "10 Downing Street";
  const billingCity = payload.city || payload.card.city || "London";
  const billingPostalCode = payload.postalCode || payload.card.postalCode || "SW1A1AA";

  const body = {
    order: {
      orderMerchantId: payload.orderMerchantId,
      orderDescription: payload.description || "Token purchase",
      orderAmount: payload.amountGross.toFixed(2),
      orderCurrencyCode: cfg.currency,
      challengeIndicator: "01",
    },
    browser: {
      ipAddress: "8.8.8.8",
      acceptHeader:
        "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      colorDepth: 32,
      javascriptEnabled: "true",
      acceptLanguage: "en-US",
      screenHeight: 1080,
      screenWidth: 1920,
      timeZone: 0,
      userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
      javaEnabled: "false",
    },
    customer: {
      firstname: payload.card.name.split(" ")[0] || "John",
      lastname: payload.card.name.split(" ").slice(1).join(" ") || "Doe",
      customerEmail: payload.email,
      address: {
        countryCode: cfg.country,
        zipCode: billingPostalCode,
        city: billingCity,
        line1: billingAddress,
      },
    },
    card: {
      cardNumber: payload.card.cardNumber.replace(/\s/g, ""),
      cvv2: payload.card.cvv,
      expireMonth: expMonth,
      expireYear: expYear,
      cardPrintedName: payload.card.name,
    },
    urls: {
      resultUrl: `${payload.appUrl}/api/cardserv/result?order=${encodeURIComponent(payload.orderMerchantId)}`,
      webhookUrl: `${payload.appUrl}/api/cardserv/webhook`,
    },
  };

  const saleRes = await fetch(saleUrl, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });

  const saleText = await saleRes.text();
  const saleData = JSON.parse(saleText);
  const saleMeta = normalizeCardServPayload(saleData);

  const hardFailure =
    !saleRes.ok || saleMeta.orderState === "ERROR" || saleMeta.orderState === "DECLINED";

  if (hardFailure && !saleMeta.redirectUrl && !saleMeta.threeDSAuth) {
    throw new Error(
      `CardServ sale failed: ${saleMeta.errorCode ?? "n/a"} ${saleMeta.errorMessage ?? saleMeta.orderState}`,
    );
  }

  let statusData = saleData;
  let statusMeta = saleMeta;

  const pollDelays = [800, 1200, 1800, 2500, 3200];
  for (let i = 0; i < pollDelays.length; i += 1) {
    if (statusMeta.redirectUrl || statusMeta.threeDSAuth) break;
    if (["APPROVED", "DECLINED", "ERROR"].includes(statusMeta.orderState)) break;

    await sleep(pollDelays[i]);

    const statusRequestBody = {
      orderMerchantId: payload.orderMerchantId,
      ...(statusMeta.orderSystemId ? { orderSystemId: statusMeta.orderSystemId } : {}),
    };

    const statusRes = await fetch(statusUrl, {
      method: "POST",
      headers,
      body: JSON.stringify(statusRequestBody),
    });

    const statusText = await statusRes.text();
    statusData = JSON.parse(statusText);
    statusMeta = normalizeCardServPayload(statusData);
  }

  return {
    orderMerchantId: payload.orderMerchantId,
    orderSystemId: statusMeta.orderSystemId ?? saleMeta.orderSystemId,
    orderState: statusMeta.orderState ?? saleMeta.orderState,
    redirectUrl: statusMeta.redirectUrl ?? saleMeta.redirectUrl,
    threeDSAuth: statusMeta.threeDSAuth ?? saleMeta.threeDSAuth,
    errorCode: statusMeta.errorCode ?? saleMeta.errorCode,
    errorMessage: statusMeta.errorMessage ?? saleMeta.errorMessage,
    raw: {
      sale: saleData,
      status: statusData,
    },
  };
}

export async function getCardServStatus(
  orderMerchantId: string,
  currency: CardServCurrency,
  orderSystemId?: string | null,
) {
  const cfg = getCardServConfig(currency);

  const requestBody = {
    orderMerchantId,
    ...(orderSystemId ? { orderSystemId } : {}),
  };

  const res = await fetch(`${cfg.baseUrl}/api/payments/status/${cfg.requestorId}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${cfg.token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestBody),
  });

  const responseText = await res.text();
  const data = JSON.parse(responseText);
  const normalized = normalizeCardServPayload(data);

  return {
    orderSystemId: normalized.orderSystemId ?? orderSystemId ?? null,
    orderState: normalized.orderState,
    redirectUrl: normalized.redirectUrl,
    threeDSAuth: normalized.threeDSAuth,
    errorCode: normalized.errorCode,
    errorMessage: normalized.errorMessage,
    raw: data,
  };
}

