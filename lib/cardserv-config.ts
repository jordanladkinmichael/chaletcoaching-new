import { isForceSuccessEnabled } from "@/lib/payments-force-success";

export type CardServCurrency = "EUR" | "USD" | "GBP";
export type CardServFlow = "redirect" | "h2h";

type CardServConfig = {
  integrationMode: "REDIRECT_FLOW" | "H2H_FLOW";
  requestorId: string;
  tokenCandidates: string[];
  currency: CardServCurrency;
  country: "DE" | "US" | "GB";
  baseUrl: string;
};

export function getCardServFlow(): CardServFlow {
  const raw = (process.env.CARDSERV_FLOW || process.env.NEXT_PUBLIC_CARDSERV_FLOW || "redirect")
    .trim()
    .toLowerCase();
  return raw === "h2h" ? "h2h" : "redirect";
}

function readRequired(name: string, value: string | undefined): string {
  const normalized = value?.trim();
  if (!normalized) throw new Error(`Missing ${name}`);
  return normalized;
}

function collectTokenCandidates(currency: CardServCurrency): string[] {
  const keys = [
    `CARDSERV_${currency}_TOKEN`,
    `CARDSERV_${currency}_FALLBACK_TOKEN`,
    "CARDSERV_TOKEN",
    "CARDSERV_FALLBACK_TOKEN",
  ] as const;

  const values = keys
    .map((key) => process.env[key]?.trim())
    .filter((value): value is string => Boolean(value));

  return [...new Set(values)];
}

function readRequestorId(currency: CardServCurrency) {
  return (
    process.env[`CARDSERV_${currency}_REQUESTOR_ID` as const]?.trim() ||
    process.env.CARDSERV_REQUESTOR_ID?.trim()
  );
}

export function getCardServConfig(currency: CardServCurrency): CardServConfig {
  const requestedMode = (process.env.CARDSERV_MODE || "live").toLowerCase();
  const forceSuccess = isForceSuccessEnabled();
  const mode = forceSuccess || requestedMode === "sandbox" ? "sandbox" : "live";

  const rawBaseUrl = process.env.CARDSERV_BASE_URL?.trim();
  const defaultBaseUrl =
    mode === "sandbox" ? "https://test.cardserv.io" : "https://live.cardserv.io";
  const baseUrl = rawBaseUrl || defaultBaseUrl;

  const countryByCurrency: Record<CardServCurrency, "DE" | "US" | "GB"> = {
    EUR: "DE",
    USD: "US",
    GBP: "GB",
  };

  const requestorId =
    mode === "sandbox"
      ? readRequired(
          "CARDSERV_SANDBOX_REQUESTOR_ID",
          process.env.CARDSERV_SANDBOX_REQUESTOR_ID?.trim() || readRequestorId(currency),
        )
      : readRequired(`CARDSERV_${currency}_REQUESTOR_ID`, readRequestorId(currency));

  const tokenCandidates =
    mode === "sandbox"
      ? [
          ...new Set(
            [
              process.env.CARDSERV_SANDBOX_TOKEN?.trim(),
              process.env.CARDSERV_SANDBOX_FALLBACK_TOKEN?.trim(),
              ...collectTokenCandidates(currency),
            ].filter((value): value is string => Boolean(value)),
          ),
        ]
      : collectTokenCandidates(currency);

  if (tokenCandidates.length === 0) {
    throw new Error(`Missing CardServ token for ${currency}`);
  }

  return {
    integrationMode: getCardServFlow() === "h2h" ? "H2H_FLOW" : "REDIRECT_FLOW",
    requestorId,
    tokenCandidates,
    currency,
    country: countryByCurrency[currency],
    baseUrl,
  };
}
