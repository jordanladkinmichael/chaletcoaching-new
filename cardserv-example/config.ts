export type CardServCurrency = "EUR" | "USD" | "GBP";

type CardServConfig = {
  requestorId: string;
  token: string;
  currency: CardServCurrency;
  country: "DE" | "US" | "GB";
  BASE_URL: string;
};

function readRequired(name: string, value: string | undefined): string {
  if (!value) throw new Error(`Missing ${name}`);
  return value;
}

export function getCardServConfig(currency: CardServCurrency): CardServConfig {
  const requestedMode = (process.env.CARDSERV_MODE || "live").toLowerCase();
  const mode = requestedMode === "sandbox" ? "sandbox" : "live";

  const rawBaseUrl = process.env.CARDSERV_BASE_URL?.trim();
  const defaultBaseUrl = mode === "sandbox" ? "https://test.cardserv.io" : "https://live.cardserv.io";

  const mismatchedSandbox = mode === "sandbox" && rawBaseUrl?.includes("live.cardserv.io");
  const mismatchedLive = mode === "live" && rawBaseUrl?.includes("test.cardserv.io");

  if (mismatchedSandbox) {
    console.warn("[CARDSERV] Ignoring live CARDSERV_BASE_URL because sandbox mode is active");
  }

  if (mismatchedLive) {
    console.warn("[CARDSERV] Ignoring sandbox CARDSERV_BASE_URL because live mode is active");
  }

  const BASE_URL = mismatchedSandbox || mismatchedLive ? defaultBaseUrl : (rawBaseUrl || defaultBaseUrl);

  const baseByCurrency: Record<CardServCurrency, Omit<CardServConfig, "BASE_URL">> = {
    EUR: { currency: "EUR", country: "DE", requestorId: "", token: "" },
    USD: { currency: "USD", country: "US", requestorId: "", token: "" },
    GBP: { currency: "GBP", country: "GB", requestorId: "", token: "" },
  };

  if (mode === "sandbox") {
    const sandboxRequestorId =
      process.env.CARDSERV_SANDBOX_REQUESTOR_ID ||
      process.env.CARDSERV_REQUESTOR_ID;
    const sandboxToken =
      process.env.CARDSERV_SANDBOX_TOKEN ||
      process.env.CARDSERV_TOKEN;

    const requestorId = readRequired("CARDSERV_SANDBOX_REQUESTOR_ID", sandboxRequestorId);
    const token = readRequired("CARDSERV_SANDBOX_TOKEN", sandboxToken);

    return {
      BASE_URL,
      ...baseByCurrency[currency],
      requestorId,
      token,
    };
  }

  const liveMap: Record<CardServCurrency, Omit<CardServConfig, "BASE_URL">> = {
    EUR: {
      requestorId: readRequired("CARDSERV_EUR_REQUESTOR_ID", process.env.CARDSERV_EUR_REQUESTOR_ID),
      token: readRequired("CARDSERV_EUR_TOKEN", process.env.CARDSERV_EUR_TOKEN),
      currency: "EUR",
      country: "DE",
    },
    USD: {
      requestorId: readRequired("CARDSERV_USD_REQUESTOR_ID", process.env.CARDSERV_USD_REQUESTOR_ID),
      token: readRequired("CARDSERV_USD_TOKEN", process.env.CARDSERV_USD_TOKEN),
      currency: "USD",
      country: "US",
    },
    GBP: {
      requestorId: readRequired("CARDSERV_GBP_REQUESTOR_ID", process.env.CARDSERV_GBP_REQUESTOR_ID),
      token: readRequired("CARDSERV_GBP_TOKEN", process.env.CARDSERV_GBP_TOKEN),
      currency: "GBP",
      country: "GB",
    },
  };

  return {
    BASE_URL,
    ...liveMap[currency],
  };
}
