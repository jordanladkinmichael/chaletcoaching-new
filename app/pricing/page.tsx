"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";
import { Container, H1, Paragraph } from "@/components/ui";
import { useCurrencyStore } from "@/lib/stores/currency-store";
import { TOKEN_PACKS, TOKEN_RATES, type UiPackId } from "@/lib/token-packages";
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
  const region: Region = currency === "USD" ? "US" : currency === "GBP" ? "UK" : "EU";
  
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
      page === "home"
        ? "/"
        : page.startsWith("/")
          ? page
          : `/${page}`;
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
      let packageId: string;
      let amount: number | undefined;
      const currencyForApi: "EUR" | "GBP" | "USD" = currency;

      if (pack === "custom") {
        packageId = "ENTERPRISE";
        amount = customAmount;
      } else {
        const packInfo = TOKEN_PACKS.find(p => p.uiId === pack);
        if (!packInfo) {
          throw new Error("Invalid pack");
        }
        packageId = packInfo.apiId;
        const priceInEUR = packInfo.tokens / TOKEN_RATES.EUR;
        const { convertPrice } = useCurrencyStore.getState();
        amount = convertPrice(priceInEUR);
      }

      const res = await fetch("/api/tokens/topup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          packageId,
          currency: currencyForApi,
          amount: amount?.toString(),
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data?.error ?? "Failed to process token topup");
      }

      // Reload balance
      const balanceRes = await fetch("/api/tokens/balance");
      if (balanceRes.ok) {
        const balanceData: { balance?: number } = await balanceRes.json();
        setBalance(balanceData.balance ?? 0);
      }

      // Show success message
      alert(`Successfully added ${data.tokensAdded?.toLocaleString() ?? 0} tokens!`);
    } catch (error) {
      console.error("Top-up failed:", error);
      alert(error instanceof Error ? error.message : "Failed to process token topup");
    } finally {
      setTopUpLoading(false);
    }
  };

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
                100 tokens = €1.00 | £0.87 | $1.35
              </Paragraph>
              <Paragraph className="text-sm text-text-muted">
                Top up once and use tokens across Instant AI plans and coach-built requests.
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

