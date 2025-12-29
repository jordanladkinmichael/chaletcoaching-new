"use client";

import React from "react";
import { useRouter } from "next/navigation";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";
import { Card, Container, H1, Paragraph } from "@/components/ui";
import { useCurrencyStore } from "@/lib/stores/currency-store";
import type { Route } from "next";

type Region = "EU" | "UK" | "US";

export default function AccountClient() {
  const router = useRouter();
  const { currency } = useCurrencyStore();
  const region: Region = currency === "USD" ? "US" : currency === "GBP" ? "UK" : "EU";

  const setRegion = (newRegion: Region) => {
    const currencyMap: Record<Region, "EUR" | "GBP" | "USD"> = {
      EU: "EUR",
      UK: "GBP",
      US: "USD",
    };
    useCurrencyStore.getState().setCurrency(currencyMap[newRegion]);
  };

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
        onNavigate={handleNavigate}
        region={region}
        setRegion={setRegion}
        balance={null}
        balanceLoading={false}
      />
      <main className="flex-1 py-8 md:py-12">
        <Container>
          <div className="space-y-4 max-w-2xl">
            <H1>Account</H1>
            <Card>
              <Paragraph>Account settings will appear here.</Paragraph>
            </Card>
          </div>
        </Container>
      </main>
      <SiteFooter onNavigate={handleNavigate} />
    </div>
  );
}
