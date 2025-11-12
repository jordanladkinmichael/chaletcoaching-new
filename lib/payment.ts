// Абстрактная система платежей для будущих интеграций
export interface PaymentProvider {
  name: string;
  createPaymentSession(data: PaymentSessionData): Promise<PaymentSessionResult>;
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
        price: 10,
        tokens: 1000,
    },
    POPULAR: {
        name: "Builder",
        price: 20,
        tokens: 2060, // 2000 + 3% bonus
    },
    PRO: {
        name: "Pro",
        price: 49,
        tokens: 5390, // 4900 + 10% bonus
    },
    ENTERPRISE: {
        name: "Custom",
        price: 0,
        tokens: 0, // calculated dynamically
    },
} as const;

export type TokenPackageId = keyof typeof TOKEN_PACKAGES;

// Валюты
export const SUPPORTED_CURRENCIES = {
  EUR: { symbol: '€', name: 'Euro' },
  GBP: { symbol: '£', name: 'British Pound' },
  USD: { symbol: '$', name: 'US Dollar' },
} as const;

export type Currency = keyof typeof SUPPORTED_CURRENCIES;

// Курсы конвертации (базовая валюта - EUR)
// 1 EUR = 1.00 EUR (базовая)
// 1 USD = 1.087 EUR ≈ 1.09 EUR (рассчитано: 1.25/1.15, где 1.25 USD = 1 GBP, 1 GBP = 1.15 EUR)
const CONVERSION_RATE_USD = 1.087; // 1 EUR = 1.087 USD, или 1 USD = 0.92 EUR

export function getPackagePrice(id: keyof typeof TOKEN_PACKAGES, currency: Currency): number {
    const basePrice = TOKEN_PACKAGES[id].price; // Цены уже в EUR
    
    if (currency === 'EUR') {
        return basePrice;
    } else if (currency === 'USD') {
        // Конвертируем из EUR в USD: price * (1 USD / 0.92 EUR) = price * 1.087
        return Math.round(basePrice * CONVERSION_RATE_USD * 100) / 100;
    } else if (currency === 'GBP') {
        // Для обратной совместимости: 1 GBP = 0.87 EUR (1/1.15)
        const GBP_TO_EUR = 1 / 1.15;
        return Math.round(basePrice * GBP_TO_EUR * 100) / 100;
    }
    
    return basePrice;
}

// Утилиты для работы с пакетами
export function getTokenPackage(id: TokenPackageId) {
  return TOKEN_PACKAGES[id];
}

export function getAllTokenPackages() {
  return Object.entries(TOKEN_PACKAGES).map(([id, packageData]) => ({
    id: id as TokenPackageId,
    ...packageData,
  }));
}

export function formatPrice(price: number, currency: Currency = 'EUR'): string {
  const { symbol } = SUPPORTED_CURRENCIES[currency];
  return `${symbol}${price.toFixed(2)}`;
}
