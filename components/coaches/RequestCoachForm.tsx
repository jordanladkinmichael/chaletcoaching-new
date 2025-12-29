"use client";

import React from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { calcCoachRequestTokens, formatNumber } from "@/lib/tokens";
import { THEME } from "@/lib/theme";

interface RequestCoachFormProps {
  coachId: string;
  coachSlug: string;
  className?: string;
}

interface FormData {
  goal: string;
  level: string;
  trainingType: string;
  equipment: string;
  daysPerWeek: string;
  notes: string;
}

const GOAL_OPTIONS = [
  { value: "Strength", label: "Strength" },
  { value: "Fat loss", label: "Fat loss" },
  { value: "Mobility", label: "Mobility" },
  { value: "Endurance", label: "Endurance" },
  { value: "Posture", label: "Posture" },
];

const LEVEL_OPTIONS = [
  { value: "Beginner", label: "Beginner" },
  { value: "Intermediate", label: "Intermediate" },
  { value: "Advanced", label: "Advanced" },
];

const TRAINING_TYPE_OPTIONS = [
  { value: "Home", label: "Home" },
  { value: "Gym", label: "Gym" },
  { value: "Mixed", label: "Mixed" },
];

const EQUIPMENT_OPTIONS = [
  { value: "None", label: "None" },
  { value: "Basic", label: "Basic" },
  { value: "Full gym", label: "Full gym" },
];

const DAYS_PER_WEEK_OPTIONS = [
  { value: "2", label: "2 days" },
  { value: "3", label: "3 days" },
  { value: "4", label: "4 days" },
  { value: "5", label: "5 days" },
  { value: "6", label: "6 days" },
];

export function RequestCoachForm({ coachId, coachSlug, className }: RequestCoachFormProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [formData, setFormData] = React.useState<FormData>({
    goal: "",
    level: "",
    trainingType: "",
    equipment: "",
    daysPerWeek: "",
    notes: "",
  });
  const [errors, setErrors] = React.useState<Partial<FormData>>({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState(false);
  const [balance, setBalance] = React.useState<number>(0);

  // Load draft from localStorage on mount
  React.useEffect(() => {
    const draftKey = `coachRequestDraft:${coachSlug}`;
    const draft = localStorage.getItem(draftKey);
    if (draft) {
      try {
        const parsed = JSON.parse(draft);
        setFormData(parsed);
        // Show toast that draft was restored (you can add toast component later)
        console.log("Draft restored");
      } catch (err) {
        console.error("Failed to parse draft:", err);
      }
    }

    // Check if we're returning from auth (URL has #request)
    if (window.location.hash === "#request") {
      const draftAfterAuth = localStorage.getItem(draftKey);
      if (draftAfterAuth) {
        try {
          const parsed = JSON.parse(draftAfterAuth);
          setFormData(parsed);
          // Scroll to form
          setTimeout(() => {
            document.getElementById("request-form")?.scrollIntoView({ behavior: "smooth" });
          }, 100);
        } catch (err) {
          console.error("Failed to parse draft:", err);
        }
      }
    }
  }, [coachSlug]);

  // Save draft to localStorage on change
  React.useEffect(() => {
    const draftKey = `coachRequestDraft:${coachSlug}`;
    const hasData = Object.values(formData).some((v) => v !== "");
    if (hasData) {
      localStorage.setItem(draftKey, JSON.stringify(formData));
    }
  }, [formData, coachSlug]);

  // Load balance for authenticated users
  React.useEffect(() => {
    if (session?.user) {
      setBalanceLoading(true);
      fetch("/api/tokens/balance")
        .then((res) => res.json())
        .then((data) => {
          setBalance(typeof data.balance === "number" ? data.balance : 0);
        })
        .catch((err) => {
          console.error("Error loading balance:", err);
          setBalance(0);
        })
        .finally(() => {
          setBalanceLoading(false);
        });
    }
  }, [session?.user]);

  // Calculate cost breakdown
  const costBreakdown = React.useMemo(() => {
    if (!formData.level || !formData.trainingType || !formData.equipment || !formData.daysPerWeek) {
      return null;
    }
    return calcCoachRequestTokens({
      level: formData.level,
      trainingType: formData.trainingType,
      equipment: formData.equipment,
      daysPerWeek: parseInt(formData.daysPerWeek, 10),
    });
  }, [formData.level, formData.trainingType, formData.equipment, formData.daysPerWeek]);

  const hasInsufficientBalance = Boolean(session?.user && costBreakdown && balance < costBreakdown.total);

  const validate = (): boolean => {
    const newErrors: Partial<FormData> = {};
    if (!formData.goal) newErrors.goal = "Required";
    if (!formData.level) newErrors.level = "Required";
    if (!formData.trainingType) newErrors.trainingType = "Required";
    if (!formData.equipment) newErrors.equipment = "Required";
    if (!formData.daysPerWeek) newErrors.daysPerWeek = "Required";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }

    // If not authenticated, save draft and redirect to login
    if (!session?.user) {
      const draftKey = `coachRequestDraft:${coachSlug}`;
      localStorage.setItem(draftKey, JSON.stringify(formData));
      router.push(`/api/auth/signin?callbackUrl=${encodeURIComponent(`/coaches/${coachSlug}#request`)}`);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/coach-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          coachId,
          coachSlug,
          goal: formData.goal,
          level: formData.level,
          trainingType: formData.trainingType,
          equipment: formData.equipment,
          daysPerWeek: parseInt(formData.daysPerWeek, 10),
          notes: formData.notes || undefined,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        // Handle insufficient tokens error
        if (error.error === "Insufficient tokens") {
          // Reload balance to show updated value
          const balanceRes = await fetch("/api/tokens/balance");
          if (balanceRes.ok) {
            const balanceData = await balanceRes.json();
            setBalance(typeof balanceData.balance === "number" ? balanceData.balance : 0);
          }
          throw new Error(error.error || "Not enough tokens to submit request");
        }
        throw new Error(error.error || "Failed to submit request");
      }

      // Clear draft
      const draftKey = `coachRequestDraft:${coachSlug}`;
      localStorage.removeItem(draftKey);

      setIsSuccess(true);
    } catch (error) {
      console.error("Error submitting request:", error);
      // You could show an error toast here
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <Card id="request-form" className={cn("p-6", className)}>
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Request received</h2>
          <p className="text-text-muted mb-6">
            Next: you can track it in your dashboard.
          </p>
          <Button variant="primary" size="lg" asChild>
            <a href="/dashboard">Go to dashboard</a>
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card id="request-form" className={cn("p-6", className)}>
      <h2 className="text-xl font-semibold mb-2">Tell your coach what you want</h2>
      <p className="text-sm text-text-muted mb-6">
        A few details help tailor your plan.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="goal" className="block text-sm font-medium mb-2">
            Goal
          </label>
          <Select
            id="goal"
            options={GOAL_OPTIONS}
            value={formData.goal}
            onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
            className={errors.goal ? "border-danger" : ""}
          />
          {errors.goal && (
            <p className="text-sm text-danger mt-1">{errors.goal}</p>
          )}
        </div>

        <div>
          <label htmlFor="level" className="block text-sm font-medium mb-2">
            Level
          </label>
          <Select
            id="level"
            options={LEVEL_OPTIONS}
            value={formData.level}
            onChange={(e) => setFormData({ ...formData, level: e.target.value })}
            className={errors.level ? "border-danger" : ""}
          />
          {errors.level && (
            <p className="text-sm text-danger mt-1">{errors.level}</p>
          )}
        </div>

        <div>
          <label htmlFor="trainingType" className="block text-sm font-medium mb-2">
            Training type
          </label>
          <Select
            id="trainingType"
            options={TRAINING_TYPE_OPTIONS}
            value={formData.trainingType}
            onChange={(e) => setFormData({ ...formData, trainingType: e.target.value })}
            className={errors.trainingType ? "border-danger" : ""}
          />
          {errors.trainingType && (
            <p className="text-sm text-danger mt-1">{errors.trainingType}</p>
          )}
        </div>

        <div>
          <label htmlFor="equipment" className="block text-sm font-medium mb-2">
            Equipment
          </label>
          <Select
            id="equipment"
            options={EQUIPMENT_OPTIONS}
            value={formData.equipment}
            onChange={(e) => setFormData({ ...formData, equipment: e.target.value })}
            className={errors.equipment ? "border-danger" : ""}
          />
          {errors.equipment && (
            <p className="text-sm text-danger mt-1">{errors.equipment}</p>
          )}
        </div>

        <div>
          <label htmlFor="daysPerWeek" className="block text-sm font-medium mb-2">
            Days per week
          </label>
          <Select
            id="daysPerWeek"
            options={DAYS_PER_WEEK_OPTIONS}
            value={formData.daysPerWeek}
            onChange={(e) => setFormData({ ...formData, daysPerWeek: e.target.value })}
            className={errors.daysPerWeek ? "border-danger" : ""}
          />
          {errors.daysPerWeek && (
            <p className="text-sm text-danger mt-1">{errors.daysPerWeek}</p>
          )}
        </div>

        <div>
          <label htmlFor="notes" className="block text-sm font-medium mb-2">
            Notes (optional)
          </label>
          <textarea
            id="notes"
            rows={4}
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            className="w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-focus focus:ring-offset-2 focus:ring-offset-bg resize-none"
            placeholder="Any specific preferences, injuries, or goals you'd like to mention..."
          />
        </div>

        {/* Cost breakdown panel */}
        {session?.user && (
          <div className="pt-4 border-t" style={{ borderColor: THEME.cardBorder }}>
            <div className="text-sm font-medium opacity-80 mb-3">Coach request cost</div>
            
            {costBreakdown ? (
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="opacity-80">Base</span>
                  <span className="font-mono">◎ {formatNumber(costBreakdown.base)}</span>
                </div>
                
                {costBreakdown.levelAdd > 0 && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="opacity-80">Level ({formData.level})</span>
                    <span className="font-mono">+◎ {formatNumber(costBreakdown.levelAdd)}</span>
                  </div>
                )}
                
                {costBreakdown.trainingTypeAdd > 0 && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="opacity-80">Training type ({formData.trainingType})</span>
                    <span className="font-mono">+◎ {formatNumber(costBreakdown.trainingTypeAdd)}</span>
                  </div>
                )}
                
                {costBreakdown.equipmentAdd > 0 && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="opacity-80">Equipment ({formData.equipment})</span>
                    <span className="font-mono">+◎ {formatNumber(costBreakdown.equipmentAdd)}</span>
                  </div>
                )}
                
                {costBreakdown.daysAdd > 0 && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="opacity-80">Days per week ({formData.daysPerWeek} days)</span>
                    <span className="font-mono">+◎ {formatNumber(costBreakdown.daysAdd)}</span>
                  </div>
                )}
                
                <div className="pt-2 border-t" style={{ borderColor: THEME.cardBorder }}>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Total cost</span>
                    <span className="font-mono font-semibold text-lg">◎ {formatNumber(costBreakdown.total)}</span>
                  </div>
                </div>

                {/* Insufficient balance error */}
                {hasInsufficientBalance && (
                  <div className="mt-3 p-3 rounded-lg border" style={{ borderColor: THEME.cardBorder, background: "#19191f" }}>
                    <div className="text-sm text-text-muted mb-2">Not enough tokens</div>
                    <div className="text-xs opacity-70 mb-2">
                      You have ◎ {formatNumber(balance)}, need ◎ {formatNumber(costBreakdown.total)}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      className="text-xs"
                    >
                      <Link href="/pricing">Top up tokens</Link>
                    </Button>
                  </div>
                )}

                <p className="text-xs opacity-70 mt-2">
                  Tokens are charged when you submit the request.
                </p>
              </div>
            ) : (
              <div className="text-sm opacity-70">
                Complete required fields to see total
              </div>
            )}
          </div>
        )}

        {/* Inline error for insufficient balance */}
        {hasInsufficientBalance && (
          <div className="p-3 rounded-lg border" style={{ borderColor: "#ef4444", background: "#19191f" }}>
            <div className="text-sm text-danger mb-2">Insufficient tokens</div>
            <div className="text-xs opacity-70">
              You need ◎ {formatNumber(costBreakdown!.total)} but only have ◎ {formatNumber(balance)}
            </div>
          </div>
        )}

        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          isLoading={isSubmitting}
          disabled={isSubmitting || hasInsufficientBalance}
        >
          {session?.user ? "Send request" : "Sign in to send your request"}
        </Button>
      </form>
    </Card>
  );
}

