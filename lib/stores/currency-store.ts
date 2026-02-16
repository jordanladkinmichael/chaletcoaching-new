import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  EXCHANGE_RATES,
  addVat,
  vatAmount as calcVatAmount,
  type Currency,
} from "@/lib/exchange-rates";

export type { Currency };

interface CurrencyStore {
  currency: Currency;
  exchangeRates: typeof EXCHANGE_RATES;
  setCurrency: (currency: Currency) => void;
  /** Format a EUR-denominated net price in current currency (no VAT) */
  formatPrice: (priceInEUR: number) => string;
  /** Convert a EUR-denominated net price to current currency (no VAT) */
  convertPrice: (priceInEUR: number) => number;
  /** Format a EUR-denominated net price as gross (inc. VAT) in current currency */
  formatPriceWithVat: (priceInEUR: number) => string;
  /** Convert a EUR-denominated net price to gross (inc. VAT) in current currency */
  convertPriceWithVat: (priceInEUR: number) => number;
  /** Get VAT amount for a EUR-denominated net price in current currency */
  getVatAmount: (priceInEUR: number) => number;
}

export const useCurrencyStore = create<CurrencyStore>()(
  persist(
    (set, get) => ({
      currency: "EUR",
      exchangeRates: EXCHANGE_RATES,
      setCurrency: (currency) => set({ currency }),

      formatPrice: (priceInEUR: number) => {
        const { currency, convertPrice } = get();
        const converted = convertPrice(priceInEUR);
        if (currency === "USD") return `$${converted.toFixed(2)}`;
        return new Intl.NumberFormat("en-GB", {
          style: "currency",
          currency,
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(converted);
      },

      convertPrice: (priceInEUR: number) => {
        const { currency, exchangeRates } = get();
        return Math.round(priceInEUR * exchangeRates[currency] * 100) / 100;
      },

      formatPriceWithVat: (priceInEUR: number) => {
        const { currency, convertPrice } = get();
        const net = convertPrice(priceInEUR);
        const gross = addVat(net);
        if (currency === "USD") return `$${gross.toFixed(2)}`;
        return new Intl.NumberFormat("en-GB", {
          style: "currency",
          currency,
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(gross);
      },

      convertPriceWithVat: (priceInEUR: number) => {
        const { convertPrice } = get();
        return addVat(convertPrice(priceInEUR));
      },

      getVatAmount: (priceInEUR: number) => {
        const { convertPrice } = get();
        return calcVatAmount(convertPrice(priceInEUR));
      },
    }),
    {
      name: "currency-storage",
      skipHydration: true,
    }
  )
);
