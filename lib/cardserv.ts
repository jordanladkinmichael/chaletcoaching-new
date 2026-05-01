import { CardServCurrency, getCardServConfig } from "@/lib/cardserv-config";
import { logCardServEvent } from "@/lib/cardserv-observability";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

type UnknownRecord = Record<string, unknown>;

export type CardServNormalizedPayload = {
  orderSystemId: string | null;
  orderState: string;
  redirectUrl: string | null;
  threeDSAuth: UnknownRecord | null;
  errorCode: number | null;
  errorMessage: string | null;
};

type CardServBrowser = {
  ipAddress?: string;
  acceptHeader?: string;
  colorDepth?: number;
  javascriptEnabled?: boolean;
  acceptLanguage?: string;
  screenHeight?: number;
  screenWidth?: number;
  timeZone?: number;
  userAgent?: string;
  javaEnabled?: boolean;
};

type CardServHostedSalePayload = {
  orderMerchantId: string;
  amountGross: number;
  currency: CardServCurrency;
  description?: string;
  email: string;
  customerName: string;
  countryCode?: string | null;
  appUrl: string;
  browser?: CardServBrowser;
};

type CardServH2hSalePayload = CardServHostedSalePayload & {
  card: {
    cardNumber: string;
    cvv: string;
    expiry: string;
    name: string;
    address?: string;
    city?: string;
    postalCode?: string;
    countryCode?: string | null;
  };
};

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

function splitCustomerName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return {
    firstname: parts[0] || "John",
    lastname: parts.slice(1).join(" ") || "Doe",
  };
}

function fallbackAddress(countryCode: string) {
  switch (countryCode) {
    case "GB":
      return { countryCode, zipCode: "SW1A1AA", city: "London", line1: "10 Downing Street" };
    case "US":
      return { countryCode, zipCode: "10001", city: "New York", line1: "350 5th Avenue" };
    default:
      return { countryCode, zipCode: "10115", city: "Berlin", line1: "Friedrichstrasse 123" };
  }
}

function buildBrowserInfo(browser: CardServBrowser | undefined) {
  const source = browser ?? {};

  return {
    ipAddress: source.ipAddress || "127.0.0.1",
    acceptHeader:
      source.acceptHeader ||
      "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    colorDepth: source.colorDepth || 32,
    javascriptEnabled: String(source.javascriptEnabled ?? true),
    acceptLanguage: source.acceptLanguage || "en-US",
    screenHeight: source.screenHeight || 1080,
    screenWidth: source.screenWidth || 1920,
    timeZone: source.timeZone ?? 0,
    userAgent: source.userAgent || "Mozilla/5.0",
    javaEnabled: String(source.javaEnabled ?? false),
  };
}

function isAccessTokenError(responseStatus: number, payload: unknown) {
  const errorCode = firstNumber(payload, ["errorCode", "data.errorCode"]);
  const errorMessage = (
    firstString(payload, ["errorMessage", "data.errorMessage"]) || ""
  ).toLowerCase();

  return responseStatus === 401 || errorCode === -7 || errorMessage.includes("access token");
}

async function readJsonResponse(response: Response, label: string) {
  const text = await response.text();
  try {
    return JSON.parse(text) as UnknownRecord;
  } catch {
    throw new Error(`${label} returned non-JSON response: ${text.slice(0, 300)}`);
  }
}

async function postWithTokenFallback(
  label: string,
  url: string,
  body: UnknownRecord,
  currency: CardServCurrency,
) {
  const cfg = getCardServConfig(currency);
  let lastFailure: { status: number; data: UnknownRecord } | null = null;

  for (const token of cfg.tokenCandidates) {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await readJsonResponse(response, label);

    logCardServEvent(`${label}.attempt`, {
      url,
      requestorId: cfg.requestorId,
      tokenFingerprint: `${token.slice(0, 8)}...${token.slice(-6)}`,
      status: response.status,
      ok: response.ok,
      data,
    });

    if (response.ok || !isAccessTokenError(response.status, data)) {
      return { response, data, token };
    }

    lastFailure = { status: response.status, data };
  }

  if (lastFailure) {
    return {
      response: new Response(JSON.stringify(lastFailure.data), {
        status: lastFailure.status,
        headers: { "Content-Type": "application/json" },
      }),
      data: lastFailure.data,
      token: null,
    };
  }

  throw new Error(`${label} failed before any token attempt was completed`);
}

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
      "data.outputRedirectToUrl",
      "result.outputRedirectToUrl",
      "outputRedirectUrl",
      "data.outputRedirectUrl",
      "result.outputRedirectUrl",
      "redirectUrl",
      "data.redirectUrl",
      "result.redirectUrl",
      "redirectData.redirectUrl",
      "redirectData.threeDSRedirectUrl",
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

export function readCardServWebhookOrderId(payload: unknown): string | null {
  return firstString(payload, [
    "orderMerchantId",
    "order.orderMerchantId",
    "data.orderMerchantId",
    "result.orderMerchantId",
  ]);
}

export function parseCardServWebhookPayload(payload: unknown): CardServNormalizedPayload {
  return normalizeCardServPayload(payload);
}

export async function createCardServH2hSale(payload: CardServH2hSalePayload) {
  const cfg = getCardServConfig(payload.currency);
  const saleUrl = `${cfg.baseUrl}/api/payments/sale/${cfg.requestorId}`;
  const statusUrl = `${cfg.baseUrl}/api/payments/status/${cfg.requestorId}`;
  const customerName = splitCustomerName(payload.customerName);
  const [expireMonth, expireYearRaw] = payload.card.expiry.split("/");
  const expireYear = expireYearRaw?.length === 2 ? `20${expireYearRaw}` : expireYearRaw;
  const address = {
    ...fallbackAddress(payload.card.countryCode || payload.countryCode || cfg.country),
    ...(payload.card.address ? { line1: payload.card.address } : {}),
    ...(payload.card.city ? { city: payload.card.city } : {}),
    ...(payload.card.postalCode ? { zipCode: payload.card.postalCode } : {}),
    ...(payload.card.countryCode ? { countryCode: payload.card.countryCode } : {}),
  };

  const requestBody: UnknownRecord = {
    order: {
      orderMerchantId: payload.orderMerchantId,
      orderDescription: payload.description || "Token purchase",
      orderAmount: payload.amountGross.toFixed(2),
      orderCurrencyCode: cfg.currency,
      challengeIndicator: "01",
    },
    browser: buildBrowserInfo(payload.browser),
    customer: {
      firstname: customerName.firstname,
      lastname: customerName.lastname,
      customerEmail: payload.email,
      address,
    },
    card: {
      cardNumber: payload.card.cardNumber.replace(/\s+/g, ""),
      cvv2: payload.card.cvv,
      expireMonth,
      expireYear,
      cardPrintedName: payload.card.name,
    },
    urls: {
      resultUrl: `${payload.appUrl}/api/cardserv/result/${encodeURIComponent(payload.orderMerchantId)}`,
      webhookUrl: `${payload.appUrl}/api/cardserv/webhook`,
    },
  };

  logCardServEvent("sale.request", {
    integrationMode: cfg.integrationMode,
    saleUrl,
    statusUrl,
    requestorId: cfg.requestorId,
    tokenCandidates: cfg.tokenCandidates.map((token) => `${token.slice(0, 8)}...${token.slice(-6)}`),
    payload: requestBody,
  });

  const sale = await postWithTokenFallback("sale.response", saleUrl, requestBody, payload.currency);
  const saleMeta = normalizeCardServPayload(sale.data);

  const hardFailure =
    !sale.response.ok ||
    ["ERROR", "DECLINED", "FILTERED", "CHAIN_STEP"].includes(saleMeta.orderState);

  if (hardFailure && !saleMeta.redirectUrl && !saleMeta.threeDSAuth) {
    throw new Error(
      `CardServ sale failed: ${saleMeta.errorCode ?? sale.response.status} ${saleMeta.errorMessage ?? saleMeta.orderState}`,
    );
  }

  let statusData = sale.data;
  let statusMeta = saleMeta;
  const pollDelays = [3000, 5000, 5000];

  for (let i = 0; i < pollDelays.length; i += 1) {
    if (statusMeta.redirectUrl || statusMeta.threeDSAuth) break;
    if (["APPROVED", "DECLINED", "ERROR", "FILTERED", "CHAIN_STEP"].includes(statusMeta.orderState)) break;

    await sleep(pollDelays[i]);

    const statusRequestBody: UnknownRecord = {
      orderMerchantId: payload.orderMerchantId,
      ...(statusMeta.orderSystemId ? { orderSystemId: statusMeta.orderSystemId } : {}),
    };

    const status = await postWithTokenFallback("sale.poll_response", statusUrl, statusRequestBody, payload.currency);

    statusData = status.data;
    statusMeta = normalizeCardServPayload(status.data);
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
      sale: sale.data,
      status: statusData,
    },
  };
}

export async function createCardServRedirectSession(payload: CardServHostedSalePayload) {
  const cfg = getCardServConfig(payload.currency);
  const saleUrl = `${cfg.baseUrl}/api/payments/sale-form/${cfg.requestorId}`;
  const statusUrl = `${cfg.baseUrl}/api/payments/status/${cfg.requestorId}`;
  const customerName = splitCustomerName(payload.customerName);
  const address = fallbackAddress(payload.countryCode || cfg.country);

  const requestBody: UnknownRecord = {
    order: {
      orderMerchantId: payload.orderMerchantId,
      orderDescription: payload.description || "Token purchase",
      orderPurpose: payload.description || "Token purchase",
      orderAmount: payload.amountGross.toFixed(2),
      orderCurrencyCode: cfg.currency,
    },
    browser: buildBrowserInfo(payload.browser),
    customer: {
      firstname: customerName.firstname,
      lastname: customerName.lastname,
      customerEmail: payload.email,
      address,
    },
    urls: {
      resultUrl: `${payload.appUrl}/api/cardserv/result/${encodeURIComponent(payload.orderMerchantId)}`,
      cresUrl: `${payload.appUrl}/api/cardserv/cres`,
      webhookUrl: `${payload.appUrl}/api/cardserv/webhook`,
      redirectWebhookUrl: `${payload.appUrl}/api/cardserv/redirect-webhook`,
    },
  };

  logCardServEvent("sale_form.request", {
    integrationMode: cfg.integrationMode,
    saleUrl,
    statusUrl,
    requestorId: cfg.requestorId,
    tokenCandidates: cfg.tokenCandidates.map((token) => `${token.slice(0, 8)}...${token.slice(-6)}`),
    payload: requestBody,
  });

  const sale = await postWithTokenFallback("sale_form.response", saleUrl, requestBody, payload.currency);
  const saleMeta = normalizeCardServPayload(sale.data);

  const hardFailure =
    !sale.response.ok ||
    ["ERROR", "DECLINED", "FILTERED", "CHAIN_STEP"].includes(saleMeta.orderState);

  if (hardFailure && !saleMeta.redirectUrl && !saleMeta.threeDSAuth) {
    throw new Error(
      `CardServ sale-form failed: ${saleMeta.errorCode ?? sale.response.status} ${saleMeta.errorMessage ?? saleMeta.orderState}`,
    );
  }

  let statusData = sale.data;
  let statusMeta = saleMeta;
  const pollDelays = [3000, 5000, 5000];

  for (let i = 0; i < pollDelays.length; i += 1) {
    if (statusMeta.redirectUrl || statusMeta.threeDSAuth) break;
    if (["APPROVED", "DECLINED", "ERROR", "FILTERED", "CHAIN_STEP"].includes(statusMeta.orderState)) break;

    await sleep(pollDelays[i]);

    const statusRequestBody: UnknownRecord = {
      orderMerchantId: payload.orderMerchantId,
      ...(statusMeta.orderSystemId ? { orderSystemId: statusMeta.orderSystemId } : {}),
    };

    const status = await postWithTokenFallback(
      "sale_form.poll_response",
      statusUrl,
      statusRequestBody,
      payload.currency,
    );

    statusData = status.data;
    statusMeta = normalizeCardServPayload(status.data);
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
      saleForm: sale.data,
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
  const requestBody: UnknownRecord = {
    orderMerchantId,
    ...(orderSystemId ? { orderSystemId } : {}),
  };

  const response = await postWithTokenFallback(
    "status.response",
    `${cfg.baseUrl}/api/payments/status/${cfg.requestorId}`,
    requestBody,
    currency,
  );

  const normalized = normalizeCardServPayload(response.data);

  return {
    orderMerchantId,
    orderSystemId: normalized.orderSystemId,
    orderState: normalized.orderState,
    redirectUrl: normalized.redirectUrl,
    threeDSAuth: normalized.threeDSAuth,
    errorCode: normalized.errorCode,
    errorMessage: normalized.errorMessage,
    raw: response.data,
  };
}
