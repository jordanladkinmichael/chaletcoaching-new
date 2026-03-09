"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

function PaymentFailedInner() {
  const params = useSearchParams();
  const reason = params.get("reason");
  const order = params.get("order");

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center p-8">
      <h1 className="text-3xl font-bold text-red-500 mb-4">Payment Failed</h1>
      <p className="text-gray-300 mb-2">
        Unfortunately, your payment could not be processed.
      </p>
      {reason && <p className="text-red-300 mb-2">Reason: {reason}</p>}
      {order && <p className="text-gray-400 mb-6">Order: {order}</p>}

      <div className="flex gap-4">
        <Link href="/pricing" className="text-yellow-400 underline">
          Try again
        </Link>
        <Link href="/" className="text-gray-300 underline">
          Back to Home
        </Link>
      </div>
    </div>
  );
}

export default function PaymentFailedPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
      <PaymentFailedInner />
    </Suspense>
  );
}
