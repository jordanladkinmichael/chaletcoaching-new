"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";
import { useCurrencyStore } from "@/lib/stores/currency-store";
import { Generator } from "@/components/generator/Generator";
import {
  PREVIEW_COST,
  calcFullCourseTokens,
  type GeneratorOpts,
} from "@/lib/tokens";
import type { Route } from "next";

type Region = "EU" | "UK" | "US";

export default function GeneratorPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { currency } = useCurrencyStore();
  const [balance, setBalance] = useState(0);
  const [balanceLoading, setBalanceLoading] = useState(false);
  const [generating, setGenerating] = useState<"preview" | "publish" | null>(null);
  
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
        const data: { balance?: number } = await res.json();
        setBalance(data.balance ?? 0);
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

  // Generate preview handler
  const handleGeneratePreview = async (opts: GeneratorOpts) => {
    if (!isAuthed) {
      openAuth("signin");
      return;
    }

    if (balance < PREVIEW_COST) {
      alert(`Insufficient tokens. You need ${PREVIEW_COST} tokens, but have ${balance}.`);
      return;
    }

    setGenerating("preview");
    try {
      const res = await fetch("/api/generator/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ options: opts }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error ?? "Preview failed");
      
      // Reload balance
      if (isAuthed) {
        const balanceRes = await fetch("/api/tokens/balance");
        if (balanceRes.ok) {
          const balanceData: { balance?: number } = await balanceRes.json();
          setBalance(balanceData.balance ?? 0);
        }
      }
      
      alert("Preview generated successfully!");
    } catch (error) {
      console.error("Preview generation failed:", error);
      alert(error instanceof Error ? error.message : "Failed to generate preview");
    } finally {
      setGenerating(null);
    }
  };

  // Publish course handler
  const handlePublishCourse = async (opts: GeneratorOpts) => {
    if (!isAuthed) {
      openAuth("signup");
      return;
    }

    const cost = calcFullCourseTokens(opts);
    if (balance < cost) {
      alert(`Insufficient tokens. You need ${cost} tokens, but have ${balance}.`);
      return;
    }

    setGenerating("publish");
    try {
      const res = await fetch("/api/generator/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ options: opts }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error ?? "Publish failed");
      
      // Reload balance
      if (isAuthed) {
        const balanceRes = await fetch("/api/tokens/balance");
        if (balanceRes.ok) {
          const balanceData: { balance?: number } = await balanceRes.json();
          setBalance(balanceData.balance ?? 0);
        }
      }
      
      alert("Course published successfully!");
    } catch (error) {
      console.error("Course publication failed:", error);
      alert(error instanceof Error ? error.message : "Failed to publish course");
    } finally {
      setGenerating(null);
    }
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

  return (
    <div className="min-h-screen flex flex-col bg-bg text-text">
      <SiteHeader
        onOpenAuth={openAuth}
        onNavigate={handleNavigate}
        balance={balance}
        balanceLoading={balanceLoading}
        formatNumber={(n) => n.toLocaleString()}
        region={region}
        setRegion={() => {}}
      />
      <main className="flex-1 py-8 md:py-12">
        <Generator
          region={region}
          requireAuth={!isAuthed}
          openAuth={openAuth}
          onGeneratePreview={handleGeneratePreview}
          onPublishCourse={handlePublishCourse}
          balance={balance}
          loading={generating}
        />
      </main>
      <SiteFooter onNavigate={handleNavigate} />
    </div>
  );
}
