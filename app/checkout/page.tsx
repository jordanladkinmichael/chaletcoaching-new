"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import type { Route } from "next";

import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";
import { THEME } from "@/lib/theme";
import { formatNumber } from "@/lib/tokens";

interface CheckoutData {
  packageId: string;
  amount: number;
  grossAmount?: number;
  vatAmount?: number;
  currency: "EUR" | "GBP" | "USD";
  tokens: number;
  description: string;
  email?: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [checkout, setCheckout] = useState<CheckoutData | null>(null);
  const [message, setMessage] = useState("Preparing secure checkout...");
  const [loading, setLoading] = useState(false);
  const startedRef = useRef(false);

  useEffect(() => {
    const data = localStorage.getItem("checkoutData");
    if (!data) {
      router.push("/pricing");
      return;
    }

    try {
      setCheckout(JSON.parse(data) as CheckoutData);
    } catch {
      router.push("/pricing");
    }
  }, [router]);

  useEffect(() => {
    if (!checkout || status === "loading" || startedRef.current) {
      return;
    }

    if (!session?.user) {
      startedRef.current = true;
      router.push("/auth/sign-in?returnTo=/checkout");
      return;
    }

    startedRef.current = true;
    setLoading(true);
    setMessage("Redirecting to CardServ secure payment page...");

    void (async () => {
      try {
        const res = await fetch("/api/cardserv/sale", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            packageId: checkout.packageId,
            currency: checkout.currency,
            amount: checkout.amount,
            grossAmount: checkout.amount,
            vatAmount: 0,
            tokens: checkout.tokens,
            description: checkout.description,
            email: session.user.email || checkout.email,
            browser: {
              colorDepth: window.screen?.colorDepth || 24,
              screenHeight: window.screen?.height || 0,
              screenWidth: window.screen?.width || 0,
              timeZone: new Date().getTimezoneOffset(),
              javaEnabled:
                typeof navigator.javaEnabled === "function" ? navigator.javaEnabled() : false,
              javascriptEnabled: true,
              acceptLanguage: navigator.language,
              userAgent: navigator.userAgent,
            },
          }),
        });

        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data?.ok) {
          throw new Error(data?.error || "Payment initialization failed");
        }

        const orderMerchantId = data.orderMerchantId as string;
        localStorage.setItem("pendingOrderMerchantId", orderMerchantId);
        localStorage.removeItem("checkoutData");

        if (data.redirectUrl) {
          window.location.href = data.redirectUrl as string;
          return;
        }

        window.location.href = `/api/cardserv/result?order=${encodeURIComponent(orderMerchantId)}`;
      } catch (error) {
        startedRef.current = false;
        setLoading(false);
        setMessage(error instanceof Error ? error.message : "Failed to start secure checkout.");
      }
    })();
  }, [checkout, router, session?.user, status]);

  if (!checkout) return null;

  const region = checkout.currency === "USD" ? "US" : checkout.currency === "GBP" ? "UK" : "EU";

  return (
    <div className="min-h-screen flex flex-col bg-bg text-text">
      <SiteHeader
        onOpenAuth={(mode) => {
          const currentPath = typeof window !== "undefined" ? window.location.pathname : "";
          const returnTo =
            currentPath !== "/auth/sign-in" &&
            currentPath !== "/auth/sign-up" &&
            currentPath !== "/auth/reset-password"
              ? currentPath
              : "/dashboard";
          const query = returnTo ? `?returnTo=${encodeURIComponent(returnTo)}` : "";
          const path = mode === "signin" ? "sign-in" : "sign-up";
          router.push(`/auth/${path}${query}` as Route);
        }}
        onNavigate={(page) => {
          if (page === "home") router.push("/");
          else if (page === "pricing") router.push("/pricing");
          else if (page === "dashboard") router.push("/dashboard");
          else router.push(`/${page}` as Route);
        }}
        balance={null}
        balanceLoading={false}
        region={region}
        setRegion={() => {}}
        formatNumber={formatNumber}
      />

      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mx-auto max-w-3xl"
        >
          <div
            className="rounded-2xl border overflow-hidden"
            style={{
              background: THEME.surface,
              borderColor: THEME.border,
            }}
          >
            <div
              className="border-b px-8 py-6 flex justify-between items-center"
              style={{
                borderColor: THEME.border,
                background: `linear-gradient(to right, ${THEME.primary}, ${THEME.accent})`,
                color: THEME["on-primary"],
              }}
            >
              <h1 className="text-2xl font-semibold">Secure Checkout</h1>
              <p className="text-sm opacity-90">CardServ Redirect</p>
            </div>

            <div className="p-8 space-y-8">
              <div
                className="rounded-xl border p-5 space-y-4"
                style={{
                  background: THEME.surface,
                  borderColor: THEME.border,
                }}
              >
                <div className="flex justify-between">
                  <div>
                    <p className="font-medium">
                      {checkout.packageId === "ENTERPRISE" ? "Custom top-up" : checkout.description}
                    </p>
                    <p className="text-sm opacity-70">{formatNumber(checkout.tokens)} tokens</p>
                  </div>
                  <p className="font-semibold">
                    {checkout.amount.toFixed(2)} {checkout.currency}
                  </p>
                </div>
              </div>

              <div className="text-center space-y-3">
                <div
                  className={`mx-auto h-12 w-12 rounded-full border-4 border-t-transparent ${
                    loading ? "animate-spin" : ""
                  }`}
                  style={{ borderColor: `${THEME.primary} transparent ${THEME.primary} ${THEME.primary}` }}
                />
                <h2 className="text-xl font-semibold">Redirecting to secure payment</h2>
                <p className="opacity-70">
                  Card details will be entered and processed on CardServ&apos;s hosted checkout page.
                </p>
                <p className="text-sm opacity-60">{message}</p>
              </div>
            </div>
          </div>
        </motion.div>
      </main>

      <SiteFooter />
    </div>
  );
}
