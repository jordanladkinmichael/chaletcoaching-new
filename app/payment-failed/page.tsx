"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { getAppFlowCopy } from "@/lib/app-flow-copy";
import { useLocale } from "@/lib/i18n/client";

function PaymentStatusFallback() {
  const { locale } = useLocale();
  const copy = getAppFlowCopy(locale).paymentStatus;
  return <div className="p-8 text-center">{copy.loading}</div>;
}

function PaymentFailedInner() {
  const params = useSearchParams();
  const { locale } = useLocale();
  const copy = getAppFlowCopy(locale).paymentStatus;
  const reason = params.get("reason");
  const order = params.get("order");

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center p-8">
      <h1 className="text-3xl font-bold text-red-500 mb-4">{copy.failedTitle}</h1>
      <p className="text-gray-300 mb-2">
        {copy.failedBody}
      </p>
      {reason && <p className="text-red-300 mb-2">{copy.reason} {reason}</p>}
      {order && <p className="text-gray-400 mb-6">{copy.order} {order}</p>}

      <div className="flex gap-4">
        <Link href="/pricing" className="text-yellow-400 underline">
          {copy.tryAgain}
        </Link>
        <Link href="/" className="text-gray-300 underline">
          {copy.backHome}
        </Link>
      </div>
    </div>
  );
}

export default function PaymentFailedPage() {
  return (
    <Suspense fallback={<PaymentStatusFallback />}>
      <PaymentFailedInner />
    </Suspense>
  );
}
