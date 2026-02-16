/**
 * Unified exchange rates — single source of truth.
 * Base currency: EUR
 *
 * To switch to dynamic rates later, replace EXCHANGE_RATES
 * with an API fetch + cache (e.g. exchangerate-api.com).
 */

export const BASE_CURRENCY = "EUR" as const;

export const EXCHANGE_RATES = {
  EUR: 1,
  GBP: 0.8696, // 1 EUR ≈ 0.87 GBP (mid-market)
  USD: 1.1850, // 1 EUR ≈ 1.19 USD (mid-market)
} as const;

export const VAT_RATE = 0.2; // 20% UK/EU VAT

export type Currency = keyof typeof EXCHANGE_RATES;

/** Convert EUR amount to target currency */
export function convertFromEUR(amountEUR: number, currency: Currency): number {
  return Math.round(amountEUR * EXCHANGE_RATES[currency] * 100) / 100;
}

/** Convert target currency amount back to EUR */
export function convertToEUR(amount: number, currency: Currency): number {
  return Math.round((amount / EXCHANGE_RATES[currency]) * 100) / 100;
}

/** Add VAT to a net price */
export function addVat(netPrice: number): number {
  return Math.round(netPrice * (1 + VAT_RATE) * 100) / 100;
}

/** Calculate VAT amount from a net price */
export function vatAmount(netPrice: number): number {
  return Math.round(netPrice * VAT_RATE * 100) / 100;
}
