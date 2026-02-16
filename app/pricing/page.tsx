"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";
import { Container, H1, Paragraph } from "@/components/ui";
import { useCurrencyStore } from "@/lib/stores/currency-store";
import {
  TOKEN_PACKS,
  TOKEN_RATES,
  calculateTokensFromAmount,
  type UiPackId,
} from "@/lib/token-packages";
import { EXCHANGE_RATES, VAT_RATE } from "@/lib/exchange-rates";
import { Pricing } from "@/components/pricing/Pricing";
import type { Route } from "next";

type Region = "EU" | "UK" | "US";

export default function PricingPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { currency } = useCurrencyStore();
  const [topUpLoading, setTopUpLoading] = useState(false);
  const [balance, setBalance] = useState(0);
  const [balanceLoading, setBalanceLoading] = useState(false);

  // Determine region from currency
  const region: Region =
    currency === "USD" ? "US" : currency === "GBP" ? "UK" : "EU";

  const isAuthed = !!session?.user;

  // Load balance
  useEffect(() => {
    async function load() {
      if (!isAuthed) {
        setBalance(0);
        return;
      }
      setBalanceLoading(true);
      try {
        const res = await fetch("/api/tokens/balance");
        if (!res.ok) {
          setBalance(0);
          return;
        }
        const j: { balance?: number } = await res.json();
        setBalance(j.balance ?? 0);
      } catch {
        setBalance(0);
      } finally {
        setBalanceLoading(false);
      }
    }
    void load();
  }, [isAuthed]);

  // Auth handler
  const openAuth = (mode?: "signup" | "signin") => {
    router.push(`/?auth=${mode || "signup"}`);
  };

  // Navigation handler
  const handleNavigate = (page: string) => {
    const target =
      page === "home" ? "/" : page.startsWith("/") ? page : `/${page}`;
    router.push(target as Route);
  };

  // Format number helper
  const formatNumber = (n: number) => n.toLocaleString();

  // Region setter
  const setRegion = (newRegion: Region) => {
    const currencyMap: Record<Region, "EUR" | "GBP" | "USD"> = {
      EU: "EUR",
      UK: "GBP",
      US: "USD",
    };
    useCurrencyStore.getState().setCurrency(currencyMap[newRegion]);
  };

  // Top up handler
  const onTopUp = async (pack: UiPackId | "custom", customAmount?: number) => {
    if (!isAuthed) {
      openAuth("signup");
      return;
    }

    setTopUpLoading(true);
    try {
      const currencyForApi: "EUR" | "GBP" | "USD" = currency;
      let packageId: string;
      let netAmount: number;
      let tokens: number;
      let description = "";

      if (pack === "custom") {
        if (!customAmount || Number(customAmount) <= 0) {
          alert("Please enter a valid amount.");
          setTopUpLoading(false);
          return;
        }
        packageId = "ENTERPRISE";
        netAmount = Number(customAmount);
        tokens = calculateTokensFromAmount(netAmount, currencyForApi);
        description = "Custom top-up";
      } else {
        const packInfo = TOKEN_PACKS.find((p) => p.uiId === pack);
        if (!packInfo) {
          throw new Error("Invalid pack");
        }
        packageId = packInfo.apiId;
        tokens = packInfo.tokens;
        const priceInEUR = packInfo.tokens / TOKEN_RATES.EUR;
        const { convertPrice } = useCurrencyStore.getState();
        netAmount = convertPrice(priceInEUR);
        description = packInfo.title;
      }

      // Calculate VAT and gross
      const vatAmt = Math.round(netAmount * VAT_RATE * 100) / 100;
      const grossAmount = Math.round((netAmount + vatAmt) * 100) / 100;

      if (typeof window !== "undefined") {
        const checkoutData = {
          packageId,
          amount: netAmount, // net price for token calculation
          grossAmount, // total with VAT for payment display
          vatAmount: vatAmt, // VAT amount
          currency: currencyForApi,
          tokens,
          description,
          email: session?.user?.email ?? undefined,
        };
        localStorage.setItem("checkoutData", JSON.stringify(checkoutData));
        router.push("/checkout");
      }
    } catch (error) {
      console.error("Top-up failed:", error);
      alert(error instanceof Error ? error.message : "Failed to start checkout");
    } finally {
      setTopUpLoading(false);
    }
  };

  // Exchange rate display — round to 2dp for user-friendly display
  const gbpRate = EXCHANGE_RATES.GBP.toFixed(2);
  const usdRate = EXCHANGE_RATES.USD.toFixed(2);

  return (
    <div className="min-h-screen flex flex-col bg-bg text-text">
      <SiteHeader
        onOpenAuth={openAuth}
        onNavigate={handleNavigate}
        balance={balance}
        balanceLoading={balanceLoading}
        formatNumber={formatNumber}
        region={region}
        setRegion={setRegion}
      />
      <main className="flex-1">
        <Container className="py-12 md:py-16">
          <div className="space-y-6 mb-8">
            <H1>Pricing</H1>
            <div className="space-y-2">
              <Paragraph className="text-lg">
                100 tokens = €1.00 | £{gbpRate} | ${usdRate}
              </Paragraph>
              <Paragraph className="text-sm text-text-muted">
                Top up once and use tokens across Instant AI plans and
                coach-built requests. All prices include 20% VAT.
              </Paragraph>
            </div>
          </div>

          <Pricing
            region={region}
            requireAuth={!isAuthed}
            openAuth={openAuth}
            onTierBuy={async (pack) => onTopUp(pack)}
            onCustomTopUp={async (amount) => onTopUp("custom", amount)}
            loading={topUpLoading}
          />
        </Container>
      </main>
      <SiteFooter onNavigate={handleNavigate} />
    </div>
  );
}
