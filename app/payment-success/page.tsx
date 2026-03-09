"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

type UiStatus = "processing" | "success" | "failed";

function PaymentSuccessInner() {
  const params = useSearchParams();
  const [uiStatus, setUiStatus] = useState<UiStatus>("processing");
  const [message, setMessage] = useState("Waiting for payment confirmation...");
  const [tokensAdded, setTokensAdded] = useState<number>(0);

  const orderMerchantId = useMemo(() => {
    const fromQuery = params.get("order");
    if (fromQuery) return fromQuery;
    if (typeof window !== "undefined") {
      return localStorage.getItem("pendingOrderMerchantId");
    }
    return null;
  }, [params]);

  useEffect(() => {
    if (!orderMerchantId) {
      setUiStatus("failed");
      setMessage("Order ID is missing. Please retry payment from checkout.");
      return;
    }

    let cancelled = false;

    const poll = async () => {
      for (let attempt = 0; attempt < 25; attempt += 1) {
        if (cancelled) return;

        try {
          const res = await fetch("/api/cardserv/status", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ orderMerchantId }),
          });

          const data = await res.json().catch(() => ({}));
          if (!res.ok) {
            throw new Error(data?.error || "Status check failed");
          }

          const state = String(data?.state || "PROCESSING").toUpperCase();

          if (state === "APPROVED") {
            const added = Number(data?.tokensAdded || 0);
            if (!cancelled) {
              setTokensAdded(added);
              setUiStatus("success");
              setMessage("Payment approved. Crediting tokens...");
              localStorage.removeItem("pendingOrderMerchantId");
              localStorage.removeItem("checkoutData");
              setTimeout(() => {
                window.location.href = `/dashboard?topup=success&order=${encodeURIComponent(orderMerchantId)}&tokens=${added}`;
              }, 1300);
            }
            return;
          }

          if (state === "DECLINED" || state === "ERROR") {
            const reason = data?.errorMessage || state;
            window.location.href = `/payment-failed?order=${encodeURIComponent(orderMerchantId)}&reason=${encodeURIComponent(reason)}`;
            return;
          }

          setMessage("Payment is still processing. Please wait...");
        } catch (error) {
          if (!cancelled) {
            setUiStatus("failed");
            setMessage(error instanceof Error ? error.message : "Payment status polling failed.");
          }
          return;
        }

        await new Promise((resolve) => setTimeout(resolve, 2000));
      }

      if (!cancelled) {
        setUiStatus("failed");
        setMessage("Payment confirmation timed out. Please refresh this page.");
      }
    };

    void poll();

    return () => {
      cancelled = true;
    };
  }, [orderMerchantId]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center p-8">
      <h1
        className={`text-3xl font-bold mb-4 ${
          uiStatus === "success"
            ? "text-green-500"
            : uiStatus === "failed"
              ? "text-red-500"
              : "text-yellow-400"
        }`}
      >
        {uiStatus === "processing" && "Processing payment..."}
        {uiStatus === "success" && "Payment successful"}
        {uiStatus === "failed" && "Payment failed"}
      </h1>

      <p className="text-gray-300 mb-6">{message}</p>
      {uiStatus === "success" && tokensAdded > 0 && (
        <p className="text-green-300 mb-6">{tokensAdded.toLocaleString()} tokens added.</p>
      )}

      <Link href="/pricing" className="text-yellow-400 underline">
        Back to pricing
      </Link>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
      <PaymentSuccessInner />
    </Suspense>
  );
}
