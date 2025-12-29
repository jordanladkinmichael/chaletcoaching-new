"use client";

import React from "react";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";
import { Container } from "@/components/ui";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useCurrencyStore } from "@/lib/stores/currency-store";
import type { Route } from "next";

type Region = "EU" | "UK" | "US";

interface AuthShellProps {
  children: React.ReactNode;
  title?: string;
}

export function AuthShell({ children, title }: AuthShellProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const { currency } = useCurrencyStore();
  const [balance, setBalance] = React.useState(0);
  const [balanceLoading, setBalanceLoading] = React.useState(false);

  // Determine region from currency
  const region: Region = currency === "USD" ? "US" : currency === "GBP" ? "UK" : "EU";

  const isAuthed = !!session?.user;

  // Load balance
  React.useEffect(() => {
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

  // Auth handler - redirect to sign-in page
  const openAuth = React.useCallback((mode?: "signup" | "signin") => {
    const currentPath = typeof window !== "undefined" ? window.location.pathname : "";
    const returnTo = currentPath !== "/auth/sign-in" && currentPath !== "/auth/sign-up" && currentPath !== "/auth/reset-password"
      ? currentPath
      : "/dashboard";
    const query = returnTo ? `?returnTo=${encodeURIComponent(returnTo)}` : "";
    const target = `/auth/${mode || "signin"}${query}`;
    router.push(target as Route);
  }, [router]);

  // Navigation handler
  const handleNavigate = React.useCallback((page: string) => {
    const target =
      page === "home"
        ? "/"
        : page.startsWith("/")
          ? page
          : `/${page}`;
    router.push(target as Route);
  }, [router]);

  // Format number helper
  const formatNumber = React.useCallback((n: number) => n.toLocaleString(), []);

  // Region setter
  const setRegion = React.useCallback((newRegion: Region) => {
    const currencyMap: Record<Region, "EUR" | "GBP" | "USD"> = {
      EU: "EUR",
      UK: "GBP",
      US: "USD",
    };
    useCurrencyStore.getState().setCurrency(currencyMap[newRegion]);
  }, []);

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
        <Container>
          {title && (
            <h1 className="sr-only">{title}</h1>
          )}
          {children}
        </Container>
      </main>
      <SiteFooter onNavigate={handleNavigate} />
    </div>
  );
}

