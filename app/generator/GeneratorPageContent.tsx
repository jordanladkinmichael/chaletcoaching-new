"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
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

export default function GeneratorPageContent() {
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { currency } = useCurrencyStore();
  const [balance, setBalance] = useState(0);
  const [balanceLoading, setBalanceLoading] = useState(false);
  const [generating, setGenerating] = useState<"preview" | "publish" | null>(
    null
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<
    "insufficient_tokens" | "api_error" | null
  >(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Determine region from currency
  const region: Region = currency === "USD" ? "US" : currency === "GBP" ? "UK" : "EU";

  const isAuthed = !!session?.user;

  // Helper to build returnTo URL with query params
  function buildReturnTo(): string {
    const search = searchParams?.toString();
    return search ? `${pathname}?${search}` : pathname;
  }

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

  // Auth handler - redirect to auth pages with returnTo
  const openAuth = (mode: "signup" | "signin" = "signin") => {
    const returnTo = buildReturnTo();
    router.push(`/auth/${mode}?returnTo=${encodeURIComponent(returnTo)}` as Route);
  };

  // Generate preview handler
  const handleGeneratePreview = async (opts: GeneratorOpts) => {
    if (!isAuthed) {
      openAuth();
      return;
    }

    // Clear previous errors/success
    setErrorMsg(null);
    setErrorType(null);
    setSuccessMsg(null);

    if (balance < PREVIEW_COST) {
      setErrorType("insufficient_tokens");
      setErrorMsg(
        `Not enough tokens to continue. You need ${PREVIEW_COST} tokens, but you have ${balance}.`
      );
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

      // Preview doesn't show success message - just updates balance
    } catch (error) {
      console.error("Preview generation failed:", error);
      setErrorType("api_error");
      setErrorMsg("Something went wrong. Please try again.");
    } finally {
      setGenerating(null);
    }
  };

  // Publish course handler
  const handlePublishCourse = async (opts: GeneratorOpts) => {
    if (!isAuthed) {
      openAuth();
      return;
    }

    // Clear previous errors/success
    setErrorMsg(null);
    setErrorType(null);
    setSuccessMsg(null);

    const cost = calcFullCourseTokens(opts);
    if (balance < cost) {
      setErrorType("insufficient_tokens");
      setErrorMsg(
        `Not enough tokens to continue. You need ${cost} tokens, but you have ${balance}.`
      );
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

      setSuccessMsg("Course published successfully.");
    } catch (error) {
      console.error("Course publication failed:", error);
      setErrorType("api_error");
      setErrorMsg("Something went wrong. Please try again.");
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
          errorMsg={errorMsg}
          errorType={errorType}
          successMsg={successMsg}
          onClearError={() => {
            setErrorMsg(null);
            setErrorType(null);
          }}
          onClearSuccess={() => setSuccessMsg(null)}
        />
      </main>
      <SiteFooter onNavigate={handleNavigate} />
    </div>
  );
}

