export type CardServCurrency = "EUR" | "USD" | "GBP";

type CardServConfig = {
  requestorId: string;
  token: string;
  currency: CardServCurrency;
  country: "DE" | "US" | "GB";
  baseUrl: string;
};

function readRequired(name: string, value: string | undefined): string {
  const normalized = value?.trim();
  if (!normalized) throw new Error(`Missing ${name}`);
  return normalized;
}

function perCurrencyRequestor(currency: CardServCurrency): string | undefined {
  const key = `CARDSERV_${currency}_REQUESTOR_ID` as const;
  return process.env[key] || process.env.CARDSERV_REQUESTOR_ID;
}

function perCurrencyToken(currency: CardServCurrency): string | undefined {
  const key = `CARDSERV_${currency}_TOKEN` as const;
  return process.env[key] || process.env.CARDSERV_TOKEN;
}

export function getCardServConfig(currency: CardServCurrency): CardServConfig {
  const requestedMode = (process.env.CARDSERV_MODE || "live").toLowerCase();
  const mode = requestedMode === "sandbox" ? "sandbox" : "live";

  const rawBaseUrl = process.env.CARDSERV_BASE_URL?.trim();
  const defaultBaseUrl =
    mode === "sandbox" ? "https://test.cardserv.io" : "https://live.cardserv.io";
  const baseUrl = rawBaseUrl || defaultBaseUrl;

  const countryByCurrency: Record<CardServCurrency, "DE" | "US" | "GB"> = {
    EUR: "DE",
    USD: "US",
    GBP: "GB",
  };

  if (mode === "sandbox") {
    const requestorId = readRequired(
      "CARDSERV_SANDBOX_REQUESTOR_ID",
      process.env.CARDSERV_SANDBOX_REQUESTOR_ID || process.env.CARDSERV_REQUESTOR_ID,
    );
    const token = readRequired(
      "CARDSERV_SANDBOX_TOKEN",
      process.env.CARDSERV_SANDBOX_TOKEN || process.env.CARDSERV_TOKEN,
    );

    return {
      requestorId,
      token,
      currency,
      country: countryByCurrency[currency],
      baseUrl,
    };
  }

  const requestorId = readRequired(
    `CARDSERV_${currency}_REQUESTOR_ID`,
    perCurrencyRequestor(currency),
  );
  const token = readRequired(`CARDSERV_${currency}_TOKEN`, perCurrencyToken(currency));

  return {
    requestorId,
    token,
    currency,
    country: countryByCurrency[currency],
    baseUrl,
  };
}

