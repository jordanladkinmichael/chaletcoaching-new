import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Currency = "GBP" | "EUR" | "USD";

interface CurrencyStore {
  currency: Currency;
  exchangeRates: {
    GBP: number;
    EUR: number;
    USD: number;
  };
  setCurrency: (currency: Currency) => void;
  formatPrice: (priceInGBP: number) => string;
  convertPrice: (priceInGBP: number) => number;
}

// Token economics (base currency EUR)
// 100 tokens = €1.00 / £0.87 / $1.35
// Exchange rates: EUR=1 (base), GBP=0.87, USD=1.35
const EXCHANGE_RATES = {
  EUR: 1,
  GBP: 0.87,
  USD: 1.35,
} as const;


export const useCurrencyStore = create<CurrencyStore>()(
  persist(
    (set, get) => ({
      currency: "EUR", // Default to EUR
      exchangeRates: EXCHANGE_RATES,
      setCurrency: (currency) => set({ currency }),
      formatPrice: (priceInEUR: number) => {
        const { currency, convertPrice } = get();
        const convertedPrice = convertPrice(priceInEUR);
        return new Intl.NumberFormat("en-GB", {
          style: "currency",
          currency,
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(convertedPrice);
      },
      convertPrice: (priceInEUR: number) => {
        const { currency, exchangeRates } = get();
        return priceInEUR * exchangeRates[currency];
      },
    }),
    {
      name: "currency-storage",
      skipHydration: true, // Skip hydration on server-side
    }
  )
);

