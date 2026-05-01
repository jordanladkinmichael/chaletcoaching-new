"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { getAppFlowCopy, formatTokenAmount } from "@/lib/app-flow-copy";
import { useLocale } from "@/lib/i18n/client";

type UiStatus = "processing" | "success" | "failed";

function PaymentStatusFallback() {
  const { locale } = useLocale();
  const copy = getAppFlowCopy(locale).paymentStatus;
  return <div className="p-8 text-center">{copy.loading}</div>;
}

function PaymentSuccessInner() {
  const params = useSearchParams();
  const { locale } = useLocale();
  const copy = getAppFlowCopy(locale).paymentStatus;
  const [uiStatus, setUiStatus] = useState<UiStatus>("processing");
  const [message, setMessage] = useState<string>(copy.waiting);
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
      setMessage(copy.missingOrder);
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
            throw new Error(data?.error || copy.statusFailed);
          }

          const state = String(data?.state || "PROCESSING").toUpperCase();

          if (state === "APPROVED") {
            const added = Number(data?.tokensAdded || 0);
            if (!cancelled) {
              setTokensAdded(added);
              setUiStatus("success");
              setMessage(copy.approved);
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

          setMessage(copy.processingMessage);
        } catch (error) {
          if (!cancelled) {
            setUiStatus("failed");
            setMessage(error instanceof Error ? error.message : copy.pollingFailed);
          }
          return;
        }

        await new Promise((resolve) => setTimeout(resolve, 2000));
      }

      if (!cancelled) {
        setUiStatus("failed");
        setMessage(copy.timedOut);
      }
    };

    void poll();

    return () => {
      cancelled = true;
    };
  }, [copy, orderMerchantId]);

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
        {uiStatus === "processing" && copy.processingTitle}
        {uiStatus === "success" && copy.successTitle}
        {uiStatus === "failed" && copy.failedTitle}
      </h1>

      <p className="text-gray-300 mb-6">{message}</p>
      {uiStatus === "success" && tokensAdded > 0 && (
        <p className="text-green-300 mb-6">{copy.tokensAdded(formatTokenAmount(tokensAdded, locale))}</p>
      )}

      <Link href="/pricing" className="text-yellow-400 underline">
        {copy.backPricing}
      </Link>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<PaymentStatusFallback />}>
      <PaymentSuccessInner />
    </Suspense>
  );
}
