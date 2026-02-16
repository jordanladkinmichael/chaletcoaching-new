"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
// confetti removed - not in dependencies
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";
import { Button } from "@/components/ui/button";
import { THEME } from "@/lib/theme";
import { formatNumber } from "@/lib/tokens";
import type { Route } from "next";

interface CheckoutData {
  packageId: string;
  amount: number; // net price (before VAT)
  grossAmount?: number; // net + VAT
  vatAmount?: number; // VAT amount
  currency: "EUR" | "GBP" | "USD";
  tokens: number;
  description: string;
  email?: string;
}

interface FormData {
  cardNumber: string;
  expiry: string;
  cvv: string;
  name: string;
  address: string;
  city: string;
  postalCode: string;
}

interface FormErrors {
  cardNumber?: string;
  expiry?: string;
  cvv?: string;
  name?: string;
  address?: string;
  city?: string;
  postalCode?: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [checkout, setCheckout] = useState<CheckoutData | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    cardNumber: "",
    expiry: "",
    cvv: "",
    name: "",
    address: "",
    city: "",
    postalCode: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    const data = localStorage.getItem("checkoutData");
    if (!data) {
      router.push("/pricing");
      return;
    }
    try {
      const parsed = JSON.parse(data);
      setCheckout(parsed);
    } catch {
      router.push("/pricing");
    }
  }, [router]);

  if (!checkout) return null;

  const vatRate = 0.2;
  const subtotal = checkout.amount; // net price
  const vatAmt =
    checkout.vatAmount ?? Math.round(subtotal * vatRate * 100) / 100;
  const total =
    checkout.grossAmount ?? Math.round((subtotal + vatAmt) * 100) / 100;

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Card number: 16 digits, formatted as XXXX XXXX XXXX XXXX
    const cardNumberClean = formData.cardNumber.replace(/\s/g, "");
    if (!cardNumberClean || cardNumberClean.length !== 16 || !/^\d+$/.test(cardNumberClean)) {
      newErrors.cardNumber = "Card number must be 16 digits";
    }

    // Expiry: MM/YY format
    if (!formData.expiry || !/^(0[1-9]|1[0-2])\/\d{2}$/.test(formData.expiry)) {
      newErrors.expiry = "Format must be MM/YY";
    }

    // CVV: 3 digits
    if (!formData.cvv || formData.cvv.length !== 3 || !/^\d+$/.test(formData.cvv)) {
      newErrors.cvv = "CVV must be 3 digits";
    }

    // Name
    if (!formData.name.trim()) {
      newErrors.name = "Cardholder name is required";
    }

    // Address
    if (!formData.address.trim()) {
      newErrors.address = "Billing address is required";
    }

    // City
    if (!formData.city.trim()) {
      newErrors.city = "City is required";
    }

    // Postal code
    if (!formData.postalCode.trim()) {
      newErrors.postalCode = "Postal code is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCardNumberFormat = (value: string): string => {
    return value
      .replace(/\D/g, "")
      .slice(0, 16)
      .replace(/(\d{4})(?=\d)/g, "$1 ")
      .trim();
  };

  const handleExpiryFormat = (value: string): string => {
    const v = value.replace(/\D/g, "").slice(0, 4);
    if (v.length >= 3) return `${v.slice(0, 2)}/${v.slice(2)}`;
    return v;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (!session?.user) {
      router.push("/auth/sign-in?returnTo=/checkout");
      return;
    }

    setLoading(true);
    try {
      // Call topup API directly (no 3DS)
      const res = await fetch("/api/tokens/topup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          packageId: checkout.packageId,
          currency: checkout.currency,
          amount: checkout.amount.toString(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Payment failed");
      }

      // Success!
      setSuccess(true);
      
      // Clear checkout data from localStorage
      localStorage.removeItem("checkoutData");

      // Redirect to dashboard after 3 seconds
      setTimeout(() => {
        router.push("/dashboard");
      }, 3000);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Payment failed. Please try again.";
      alert(message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof FormData, value: string) => {
    let formattedValue = value;

    if (field === "cardNumber") {
      formattedValue = handleCardNumberFormat(value);
    } else if (field === "expiry") {
      formattedValue = handleExpiryFormat(value);
    } else if (field === "cvv") {
      formattedValue = value.replace(/\D/g, "").slice(0, 3);
    }

    setFormData((prev) => ({ ...prev, [field]: formattedValue }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const isAuthed = !!session?.user;
  const region = checkout.currency === "USD" ? "US" : checkout.currency === "GBP" ? "UK" : "EU";

  return (
    <div className="min-h-screen flex flex-col bg-bg text-text">
      <SiteHeader
        onOpenAuth={(mode) => {
          const currentPath = typeof window !== "undefined" ? window.location.pathname : "";
          const returnTo = currentPath !== "/auth/sign-in" && currentPath !== "/auth/sign-up" && currentPath !== "/auth/reset-password"
            ? currentPath
            : "/dashboard";
          const query = returnTo ? `?returnTo=${encodeURIComponent(returnTo)}` : "";
          // Map mode to correct path with hyphens
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
          className="mx-auto max-w-4xl"
        >
          <div
            className="rounded-2xl border overflow-hidden"
            style={{
              background: THEME.surface,
              borderColor: THEME.border,
            }}
          >
            {/* Header */}
            <div
              className="border-b px-8 py-6 flex justify-between items-center"
              style={{
                borderColor: THEME.border,
                background: `linear-gradient(to right, ${THEME.primary}, ${THEME.accent})`,
                color: THEME["on-primary"],
              }}
            >
              <h1 className="text-2xl font-semibold">
                {success ? "Thank You!" : "Checkout"}
              </h1>
              {!success && <p className="text-sm opacity-90">Secure Payment</p>}
            </div>

            <div className="p-8">
              {/* Success Message */}
              {success ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                  className="text-center py-20"
                >
                  <h2
                    className="text-3xl font-bold mb-4"
                    style={{ color: THEME.primary }}
                  >
                    Payment successful!
                  </h2>
                  <p className="opacity-80 max-w-md mx-auto">
                    Your tokens have been added to your account balance. You can now use them to generate courses and access premium features.
                  </p>
                  <p className="mt-4 text-sm opacity-60">
                    Redirecting to dashboard...
                  </p>
                </motion.div>
              ) : (
                // Payment Form + Summary
                <div className="grid lg:grid-cols-2 gap-8">
                  {/* Summary */}
                  <div>
                    <h2 className="text-xl font-semibold mb-4">Order Summary</h2>

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
                            {checkout.packageId === "ENTERPRISE"
                              ? "Custom top-up"
                              : checkout.description}
                          </p>
                          <p className="text-sm opacity-70">
                            {formatNumber(checkout.tokens)} tokens
                          </p>
                        </div>
                        <p className="font-semibold">
                          {subtotal.toFixed(2)} {checkout.currency}
                        </p>
                      </div>

                      <div className="h-px" style={{ background: THEME.border }} />

                      <div className="flex justify-between text-sm">
                        <span className="opacity-70">Subtotal</span>
                        <span className="font-medium">
                          {subtotal.toFixed(2)} {checkout.currency}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="opacity-70">VAT (20%)</span>
                        <span className="font-medium">
                          {vatAmt.toFixed(2)} {checkout.currency}
                        </span>
                      </div>
                      <div
                        className="flex justify-between text-lg font-semibold border-t pt-3"
                        style={{ borderColor: THEME.border }}
                      >
                        <span>Total</span>
                        <span>
                          {total.toFixed(2)} {checkout.currency}
                        </span>
                      </div>
                    </div>

                    <div className="mt-6 text-sm opacity-70 leading-relaxed">
                      <p>
                        You are purchasing <strong>{formatNumber(checkout.tokens)} tokens</strong>.
                        Tokens will be credited to your account immediately after payment.
                      </p>
                      {checkout.email && (
                        <p className="mt-2">
                          A confirmation email will be sent to{" "}
                          <strong>{checkout.email}</strong>.
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Payment Form */}
                  <div>
                    <h2 className="text-xl font-semibold mb-4">Payment Details</h2>

                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <input
                          type="text"
                          placeholder="Card number"
                          value={formData.cardNumber}
                          onChange={(e) => handleChange("cardNumber", e.target.value)}
                          className="w-full rounded-lg border px-3 py-2 bg-transparent"
                          style={{ borderColor: THEME.border }}
                        />
                        {errors.cardNumber && (
                          <div className="text-xs mt-1" style={{ color: THEME.danger }}>
                            {errors.cardNumber}
                          </div>
                        )}
                      </div>

                      <div className="flex gap-3">
                        <div className="w-1/2">
                          <input
                            type="text"
                            placeholder="MM/YY"
                            value={formData.expiry}
                            onChange={(e) => handleChange("expiry", e.target.value)}
                            className="w-full rounded-lg border px-3 py-2 bg-transparent"
                            style={{ borderColor: THEME.border }}
                          />
                          {errors.expiry && (
                            <div className="text-xs mt-1" style={{ color: THEME.danger }}>
                              {errors.expiry}
                            </div>
                          )}
                        </div>
                        <div className="w-1/2">
                          <input
                            type="text"
                            placeholder="CVV"
                            value={formData.cvv}
                            onChange={(e) => handleChange("cvv", e.target.value)}
                            className="w-full rounded-lg border px-3 py-2 bg-transparent"
                            style={{ borderColor: THEME.border }}
                          />
                          {errors.cvv && (
                            <div className="text-xs mt-1" style={{ color: THEME.danger }}>
                              {errors.cvv}
                            </div>
                          )}
                        </div>
                      </div>

                      <div>
                        <input
                          type="text"
                          placeholder="Cardholder name"
                          value={formData.name}
                          onChange={(e) => handleChange("name", e.target.value)}
                          className="w-full rounded-lg border px-3 py-2 bg-transparent"
                          style={{ borderColor: THEME.border }}
                        />
                        {errors.name && (
                          <div className="text-xs mt-1" style={{ color: THEME.danger }}>
                            {errors.name}
                          </div>
                        )}
                      </div>

                      <div>
                        <input
                          type="text"
                          placeholder="Billing address"
                          value={formData.address}
                          onChange={(e) => handleChange("address", e.target.value)}
                          className="w-full rounded-lg border px-3 py-2 bg-transparent"
                          style={{ borderColor: THEME.border }}
                        />
                        {errors.address && (
                          <div className="text-xs mt-1" style={{ color: THEME.danger }}>
                            {errors.address}
                          </div>
                        )}
                      </div>

                      <div className="flex gap-3">
                        <div className="w-2/3">
                          <input
                            type="text"
                            placeholder="City"
                            value={formData.city}
                            onChange={(e) => handleChange("city", e.target.value)}
                            className="w-full rounded-lg border px-3 py-2 bg-transparent"
                            style={{ borderColor: THEME.border }}
                          />
                          {errors.city && (
                            <div className="text-xs mt-1" style={{ color: THEME.danger }}>
                              {errors.city}
                            </div>
                          )}
                        </div>
                        <div className="w-1/3">
                          <input
                            type="text"
                            placeholder="Postal code"
                            value={formData.postalCode}
                            onChange={(e) => handleChange("postalCode", e.target.value)}
                            className="w-full rounded-lg border px-3 py-2 bg-transparent"
                            style={{ borderColor: THEME.border }}
                          />
                          {errors.postalCode && (
                            <div className="text-xs mt-1" style={{ color: THEME.danger }}>
                              {errors.postalCode}
                            </div>
                          )}
                        </div>
                      </div>

                      <Button
                        className="w-full mt-6"
                        size="lg"
                        type="submit"
                        disabled={loading || !isAuthed}
                        isLoading={loading}
                      >
                        {loading ? (
                          <>
                            <Loader2 className="h-5 w-5 animate-spin" />
                            Processing...
                          </>
                        ) : !isAuthed ? (
                          "Please sign in to continue"
                        ) : (
                          `Pay ${total.toFixed(2)} ${checkout.currency}`
                        )}
                      </Button>
                    </form>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </main>

      <SiteFooter />
    </div>
  );
}

