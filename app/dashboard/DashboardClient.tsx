"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";
import { useCurrencyStore } from "@/lib/stores/currency-store";
import { calcFullCourseTokens, type GeneratorOpts } from "@/lib/tokens";
import { Dashboard } from "@/components/dashboard/Dashboard";
import type { Route } from "next";

type Region = "EU" | "UK" | "US";

export default function DashboardClient() {
  const { data: session } = useSession();
  const router = useRouter();
  const { currency } = useCurrencyStore();
  const [balance, setBalance] = useState(0);
  const [balanceLoading, setBalanceLoading] = useState(false);
  const [currentPreview, setCurrentPreview] = useState<{
    title: string;
    description: string;
    images?: string[];
    originalOpts: GeneratorOpts;
  } | null>(null);

  const region: Region = currency === "USD" ? "US" : currency === "GBP" ? "UK" : "EU";
  const isAuthed = !!session?.user;

  // Load balance
  const loadBalance = useCallback(async () => {
    if (!isAuthed) {
      setBalance(0);
      return;
    }
    try {
      setBalanceLoading(true);
      const res = await fetch("/api/tokens/balance", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setBalance(typeof data.balance === "number" ? data.balance : 0);
      }
    } finally {
      setBalanceLoading(false);
    }
  }, [isAuthed]);

  useEffect(() => {
    void loadBalance();
  }, [loadBalance]);

  // Auth handler
  const openAuth = useCallback((mode?: "signup" | "signin") => {
    const currentPath = "/dashboard";
    const returnTo = encodeURIComponent(currentPath);
    const target = `/auth/${mode || "signin"}?returnTo=${returnTo}`;
    router.push(target as Route);
  }, [router]);

  // Navigation handler
  const handleNavigate = useCallback((page: string) => {
    const target =
      page === "home"
        ? "/"
        : page.startsWith("/")
          ? page
          : `/${page}`;
    router.push(target as Route);
  }, [router]);

  // Format number helper
  const formatNumber = useCallback((n: number) => n.toLocaleString(), []);

  // Region setter
  const setRegion = useCallback((newRegion: Region) => {
    const currencyMap: Record<Region, "EUR" | "GBP" | "USD"> = {
      EU: "EUR",
      UK: "GBP",
      US: "USD",
    };
    useCurrencyStore.getState().setCurrency(currencyMap[newRegion]);
  }, []);

  // Publish course handler
  const handlePublishCourse = useCallback(async (opts: GeneratorOpts) => {
    if (!isAuthed) {
      openAuth("signup");
      return;
    }

    const cost = calcFullCourseTokens(opts);
    if (balance < cost) {
      alert(`Insufficient tokens. You need ${cost} tokens, but have ${balance}.`);
      return;
    }

    try {
      const res = await fetch("/api/generator/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ options: opts }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error ?? "Publish failed");
      
      // Reload balance
      await loadBalance();
      
      alert("Course published successfully!");
    } catch (error) {
      console.error("Course publication failed:", error);
      alert(error instanceof Error ? error.message : "Failed to publish course");
    }
  }, [isAuthed, balance, loadBalance, openAuth]);

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
      <main className="flex-1 py-8 md:py-12">
        <Dashboard
          requireAuth={!isAuthed}
          openAuth={openAuth}
          balance={balance}
          currentPreview={currentPreview}
          onDismissPreview={() => setCurrentPreview(null)}
          onPublishCourse={handlePublishCourse}
          loadBalance={loadBalance}
          balanceLoading={balanceLoading}
        />
      </main>
      <SiteFooter onNavigate={handleNavigate} />
    </div>
  );
}

