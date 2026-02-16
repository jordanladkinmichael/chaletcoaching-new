/**
 * Single source of truth for token packages and rates.
 * Token rates derived from unified exchange rates in lib/exchange-rates.ts.
 * Base rate: 100 tokens = €1.00
 */

import { EXCHANGE_RATES, VAT_RATE } from "@/lib/exchange-rates";

export type ApiPackageId = "STARTER" | "POPULAR" | "PRO" | "ENTERPRISE";
export type UiPackId = "starter" | "momentum" | "elite";
export type Currency = "EUR" | "GBP" | "USD";

// Token rates derived from unified exchange rates
// 100 tokens per €1, scaled by FX rate for other currencies
export const TOKEN_RATES = {
  EUR: 100,
  GBP: 100 / EXCHANGE_RATES.GBP, // ≈ 115.01 tokens per £1
  USD: 100 / EXCHANGE_RATES.USD, // ≈ 84.39 tokens per $1
} as const;

export { VAT_RATE };

export const TOKEN_PACKS: Array<{
  uiId: UiPackId;
  apiId: Exclude<ApiPackageId, "ENTERPRISE">;
  title: string;
  tokens: number;
  highlight?: boolean;
  microcopy: string;
}> = [
  {
    uiId: "starter",
    apiId: "STARTER",
    title: "Starter Spark",
    tokens: 10_000,
    microcopy: "For a quick start",
  },
  {
    uiId: "momentum",
    apiId: "POPULAR",
    title: "Momentum Pack",
    tokens: 20_000,
    highlight: true,
    microcopy: "Best value for consistency",
  },
  {
    uiId: "elite",
    apiId: "PRO",
    title: "Elite Performance",
    tokens: 30_000,
    microcopy: "Built for long-term progress",
  },
];

// Quick amount chips (currency-adaptive)
export const QUICK_AMOUNTS: Record<Currency, number[]> = {
  EUR: [50, 100, 200],
  GBP: [45, 90, 180],
  USD: [70, 140, 280],
};

// Helper functions
export function getPackByUiId(uiId: UiPackId) {
  return TOKEN_PACKS.find((p) => p.uiId === uiId);
}

export function getPackByApiId(apiId: ApiPackageId) {
  if (apiId === "ENTERPRISE") return null;
  return TOKEN_PACKS.find((p) => p.apiId === apiId);
}

/**
 * Calculate tokens from currency amount (net, before VAT).
 * @param amount - Net amount in currency units
 * @param currency - Currency code
 * @returns Tokens (rounded down to nearest 10)
 */
export function calculateTokensFromAmount(
  amount: number,
  currency: Currency
): number {
  if (amount <= 0) return 0;
  const tokens = amount * TOKEN_RATES[currency];
  // Small epsilon compensates for IEEE 754 floating-point errors
  // (e.g. 173.92 * 115.00 = 19999.9999996 instead of 20000)
  const FP_EPSILON = 0.01;
  return Math.floor((tokens + FP_EPSILON) / 10) * 10;
}

/**
 * Check if rounding was applied during token calculation.
 */
export function wasRounded(amount: number, currency: Currency): boolean {
  if (amount <= 0) return false;
  const exactTokens = amount * TOKEN_RATES[currency];
  const roundedTokens = calculateTokensFromAmount(amount, currency);
  // Treat sub-1-token differences as "not rounded" (FP noise)
  return Math.abs(exactTokens - roundedTokens) > 1;
}
