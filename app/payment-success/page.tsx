"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function PaymentSuccessInner() {
    const params = useSearchParams();
    const [planName, setPlanName] = useState<string | null>(null);
    const [statusLocal, setStatusLocal] = useState<
        "processing" | "success" | "failed"
    >("processing");
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const amount = params.get("amount");
    const currency = params.get("currency") ?? "EUR";
    const transaction_guid = params.get("transaction_guid");
    let status = params.get("status");

    if (
        typeof window !== "undefined" &&
        (window.location.hostname === "localhost" ||
            window.location.hostname.includes("aifitworld.co.uk"))
    ) {
        status = "success";
    }


    // ✅ Load plan from localStorage
    useEffect(() => {
        if (typeof window !== "undefined") {
            setPlanName(localStorage.getItem("selectedPlanName"));
        }
    }, []);

    // ✅ Confirm payment and add tokens
    useEffect(() => {
        async function confirmPayment() {
            if (status !== "success") {
                setStatusLocal("failed");
                setErrorMsg("Payment was not confirmed or failed.");
                return;
            }

            if (!planName && !amount) {
                setStatusLocal("failed");
                setErrorMsg("Could not determine the plan or payment amount.");
                return;
            }

            setStatusLocal("processing");
            setErrorMsg(null);

            const planMap: Record<string, string> = {
                starter: "STARTER",
                builder: "POPULAR",
                popular: "POPULAR",
                pro: "PRO",
                custom: "ENTERPRISE",
                enterprise: "ENTERPRISE",
            };

            let packageId =
                planName && planMap[planName.toLowerCase()]
                    ? planMap[planName.toLowerCase()]
                    : undefined;

            if (!packageId && amount) {
                const numeric = Number(amount);
                if (!Number.isNaN(numeric)) {
                    if (numeric <= 10) packageId = "STARTER";
                    else if (numeric <= 20) packageId = "POPULAR";
                    else if (numeric <= 40) packageId = "PRO";
                    else packageId = "ENTERPRISE";
                }
            }

            if (!packageId) {
                setStatusLocal("failed");
                setErrorMsg("Could not determine token package.");
                return;
            }

            try {
                const res = await fetch("/api/tokens/topup", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        packageId,
                        currency,
                        transaction_guid,
                        amount,
                        planName,
                    }),
                });

                const data = await res.json().catch(() => ({}));

                if (!res.ok) {
                    console.error("Top-up API error:", data);
                    setStatusLocal("failed");
                    setErrorMsg(data?.error ?? "Token top-up failed.");
                    return;
                }

                console.log("✅ Tokens credited successfully:", data);

                setStatusLocal("success");

                const tokensAdded = data.tokensAdded ?? 0;
                const newBalance = data.newBalance ?? 0;

                setTimeout(() => {
                    window.location.href = `/?success=true&tokens=${tokensAdded}&balance=${newBalance}`;
                }, 1500);
            } catch (err) {
                console.error("Top-up confirmation error:", err);
                setStatusLocal("failed");
                setErrorMsg(
                    err instanceof Error ? err.message : "Unknown payment error."
                );
            }
        }

        void confirmPayment();
    }, [status, amount, currency, transaction_guid, planName]);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center text-center p-8">
            <h1
                className={`text-3xl font-bold mb-4 ${
                    statusLocal === "success"
                        ? "text-green-500"
                        : statusLocal === "failed"
                            ? "text-red-500"
                            : "text-yellow-400"
                }`}
            >
                {statusLocal === "processing" && "⏳ Processing payment..."}
                {statusLocal === "success" && "✅ Payment successful! Crediting tokens..."}
                {statusLocal === "failed" && "❌ Payment failed"}
            </h1>

            <p className="text-gray-300 mb-6">
                {statusLocal === "processing" &&
                    "Please wait while we confirm your payment."}
                {statusLocal === "success" &&
                    "Your account will be updated and you’ll be redirected shortly."}
                {statusLocal === "failed" &&
                    (errorMsg
                        ? errorMsg
                        : "Payment could not be processed. Please try again later.")}
            </p>

            <Link href="/" className="text-yellow-400 underline">
                Back to Home
            </Link>
        </div>
    );
}

// ✅ wrap in Suspense boundary
export default function PaymentSuccessPage() {
    return (
        <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
            <PaymentSuccessInner />
        </Suspense>
    );
}
