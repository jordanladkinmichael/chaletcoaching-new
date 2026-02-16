import {
  EXCHANGE_RATES,
  convertFromEUR,
  type Currency as FxCurrency,
} from "@/lib/exchange-rates";

// Abstract payment system for future integrations
export interface PaymentProvider {
  name: string;
  createPaymentSession(
    data: PaymentSessionData
  ): Promise<PaymentSessionResult>;
  verifyPayment(sessionId: string): Promise<PaymentVerificationResult>;
}

export interface PaymentSessionData {
  userId: string;
  amount: number;
  currency: string;
  tokens: number;
  packageName: string;
  successUrl: string;
  cancelUrl: string;
}

export interface PaymentSessionResult {
  sessionId: string;
  paymentUrl?: string;
  success: boolean;
  error?: string;
}

export interface PaymentVerificationResult {
  success: boolean;
  paid: boolean;
  amount?: number;
  tokens?: number;
  error?: string;
}

export const TOKEN_PACKAGES = {
  STARTER: {
    name: "Starter",
    price: 100, // €100 for 10,000 tokens (100 tokens = €1)
    tokens: 10_000,
  },
  POPULAR: {
    name: "Builder",
    price: 200, // €200 for 20,000 tokens
    tokens: 20_000,
  },
  PRO: {
    name: "Pro",
    price: 300, // €300 for 30,000 tokens
    tokens: 30_000,
  },
  ENTERPRISE: {
    name: "Custom",
    price: 0,
    tokens: 0, // calculated dynamically
  },
} as const;

export type TokenPackageId = keyof typeof TOKEN_PACKAGES;

// Supported currencies
export const SUPPORTED_CURRENCIES = {
  EUR: { symbol: "€", name: "Euro" },
  GBP: { symbol: "£", name: "British Pound" },
  USD: { symbol: "$", name: "US Dollar" },
} as const;

export type Currency = keyof typeof SUPPORTED_CURRENCIES;

/**
 * Get package price in the specified currency.
 * Uses the unified exchange rates from lib/exchange-rates.ts.
 */
export function getPackagePrice(
  id: keyof typeof TOKEN_PACKAGES,
  currency: Currency
): number {
  const basePrice = TOKEN_PACKAGES[id].price; // EUR base
  return convertFromEUR(basePrice, currency as FxCurrency);
}

// Package utilities
export function getTokenPackage(id: TokenPackageId) {
  return TOKEN_PACKAGES[id];
}

export function getAllTokenPackages() {
  return Object.entries(TOKEN_PACKAGES).map(([id, packageData]) => ({
    id: id as TokenPackageId,
    ...packageData,
  }));
}

export function formatPrice(
  price: number,
  currency: Currency = "EUR"
): string {
  const { symbol } = SUPPORTED_CURRENCIES[currency];
  return `${symbol}${price.toFixed(2)}`;
}
