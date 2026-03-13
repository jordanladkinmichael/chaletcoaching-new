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

type CheckoutFlow = "redirect" | "h2h";

type CardFormState = {
  cardNumber: string;
  expiry: string;
  cvv: string;
  name: string;
  address: string;
  city: string;
  postalCode: string;
  countryCode: string;
};

export default function CheckoutPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [checkout, setCheckout] = useState<CheckoutData | null>(null);
  const [message, setMessage] = useState("Preparing secure checkout...");
  const [loading, setLoading] = useState(false);
  const startedRef = useRef(false);
  const flow: CheckoutFlow =
    process.env.NEXT_PUBLIC_CARDSERV_FLOW === "h2h" ? "h2h" : "redirect";
  const [cardForm, setCardForm] = useState<CardFormState>({
    cardNumber: "",
    expiry: "",
    cvv: "",
    name: "",
    address: "",
    city: "",
    postalCode: "",
    countryCode: "DE",
  });

  async function resolvePublicIp() {
    try {
      const response = await fetch("https://api.ipify.org?format=json");
      if (!response.ok) return undefined;
      const data = (await response.json()) as { ip?: string };
      return data.ip;
    } catch {
      return undefined;
    }
  }

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
    if (!session?.user) return;
    setCardForm((current) => ({
      ...current,
      name: current.name || session.user.name || "",
    }));
  }, [session?.user]);

  const startPayment = React.useCallback(async (card?: CardFormState) => {
    if (!checkout || !session?.user) return;

    const publicIp = await resolvePublicIp();
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
          ipAddress: publicIp,
          acceptHeader: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
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
        ...(card
          ? {
              card: {
                cardNumber: card.cardNumber,
                expiry: card.expiry,
                cvv: card.cvv,
                name: card.name,
                address: card.address,
                city: card.city,
                postalCode: card.postalCode,
                countryCode: card.countryCode.toUpperCase(),
              },
            }
          : {}),
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

    window.location.href = `/api/cardserv/result/${encodeURIComponent(orderMerchantId)}`;
  }, [checkout, session?.user]);

  useEffect(() => {
    if (flow !== "redirect" || !checkout || status === "loading" || startedRef.current) {
      return;
    }

    if (!session?.user) {
      startedRef.current = true;
      router.push("/auth/sign-in?returnTo=/checkout");
      return;
    }

    startedRef.current = true;
    setLoading(true);
    setMessage("Redirecting to secure payment page...");

    void (async () => {
      try {
        await startPayment();
      } catch (error) {
        startedRef.current = false;
        setLoading(false);
        setMessage(error instanceof Error ? error.message : "Failed to start secure checkout.");
      }
    })();
  }, [checkout, flow, router, session?.user, startPayment, status]);

  async function handleH2hSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!checkout || !session?.user) return;

    setLoading(true);
    setMessage("Submitting card details securely...");

    try {
      await startPayment(cardForm);
    } catch (error) {
      setLoading(false);
      setMessage(error instanceof Error ? error.message : "Failed to start card payment.");
    }
  }

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
              <p className="text-sm opacity-90">{flow === "h2h" ? "CardServ H2H" : "CardServ Redirect"}</p>
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

              {flow === "redirect" ? (
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
              ) : (
                <form className="space-y-4" onSubmit={handleH2hSubmit}>
                  <h2 className="text-xl font-semibold">Enter card details</h2>
                  <p className="opacity-70">Card details will be sent directly to CardServ H2H.</p>
                  <input
                    className="w-full rounded-lg border px-4 py-3 bg-transparent"
                    style={{ borderColor: THEME.border }}
                    placeholder="Card number"
                    value={cardForm.cardNumber}
                    onChange={(event) => setCardForm((current) => ({ ...current, cardNumber: event.target.value }))}
                    required
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      className="w-full rounded-lg border px-4 py-3 bg-transparent"
                      style={{ borderColor: THEME.border }}
                      placeholder="MM/YY"
                      value={cardForm.expiry}
                      onChange={(event) => setCardForm((current) => ({ ...current, expiry: event.target.value }))}
                      required
                    />
                    <input
                      className="w-full rounded-lg border px-4 py-3 bg-transparent"
                      style={{ borderColor: THEME.border }}
                      placeholder="CVV"
                      value={cardForm.cvv}
                      onChange={(event) => setCardForm((current) => ({ ...current, cvv: event.target.value }))}
                      required
                    />
                  </div>
                  <input
                    className="w-full rounded-lg border px-4 py-3 bg-transparent"
                    style={{ borderColor: THEME.border }}
                    placeholder="Name on card"
                    value={cardForm.name}
                    onChange={(event) => setCardForm((current) => ({ ...current, name: event.target.value }))}
                    required
                  />
                  <input
                    className="w-full rounded-lg border px-4 py-3 bg-transparent"
                    style={{ borderColor: THEME.border }}
                    placeholder="Billing address"
                    value={cardForm.address}
                    onChange={(event) => setCardForm((current) => ({ ...current, address: event.target.value }))}
                    required
                  />
                  <div className="grid grid-cols-3 gap-4">
                    <input
                      className="w-full rounded-lg border px-4 py-3 bg-transparent"
                      style={{ borderColor: THEME.border }}
                      placeholder="City"
                      value={cardForm.city}
                      onChange={(event) => setCardForm((current) => ({ ...current, city: event.target.value }))}
                      required
                    />
                    <input
                      className="w-full rounded-lg border px-4 py-3 bg-transparent"
                      style={{ borderColor: THEME.border }}
                      placeholder="Postcode"
                      value={cardForm.postalCode}
                      onChange={(event) => setCardForm((current) => ({ ...current, postalCode: event.target.value }))}
                      required
                    />
                    <input
                      className="w-full rounded-lg border px-4 py-3 bg-transparent"
                      style={{ borderColor: THEME.border }}
                      placeholder="Country"
                      value={cardForm.countryCode}
                      onChange={(event) => setCardForm((current) => ({ ...current, countryCode: event.target.value }))}
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full rounded-lg px-4 py-3 font-semibold"
                    style={{ background: THEME.primary, color: THEME["on-primary"] }}
                    disabled={loading}
                  >
                    {loading ? "Processing..." : "Pay now"}
                  </button>
                  <p className="text-sm opacity-60">{message}</p>
                </form>
              )}
            </div>
          </div>
        </motion.div>
      </main>

      <SiteFooter />
    </div>
  );
}
