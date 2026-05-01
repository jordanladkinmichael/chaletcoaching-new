"use client";

import React from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { getCoachesCopy, getCoachOptions, getCoachValueLabel } from "@/lib/coaches-copy";
import { useLocale } from "@/lib/i18n/client";
import { calcCoachRequestTokens, formatNumber } from "@/lib/tokens";
import { THEME } from "@/lib/theme";
import { cn } from "@/lib/utils";

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

const GOAL_VALUES = ["Strength", "Fat loss", "Mobility", "Endurance", "Posture"];
const LEVEL_VALUES = ["Beginner", "Intermediate", "Advanced"];
const TRAINING_TYPE_VALUES = ["Home", "Gym", "Mixed"];
const EQUIPMENT_VALUES = ["None", "Basic", "Full gym"];
const DAYS_PER_WEEK_VALUES = ["2", "3", "4", "5", "6"];

function formatTokens(value: number) {
  return `${formatNumber(value)} tokens`;
}

export function RequestCoachForm({ coachId, coachSlug, className }: RequestCoachFormProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const { locale } = useLocale();
  const copy = getCoachesCopy(locale).requestCoachForm;
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
  const [balanceLoading, setBalanceLoading] = React.useState(false);

  const goalOptions = React.useMemo(
    () => getCoachOptions(GOAL_VALUES, locale, copy.options.goal),
    [copy.options.goal, locale]
  );
  const levelOptions = React.useMemo(
    () => getCoachOptions(LEVEL_VALUES, locale, copy.options.level),
    [copy.options.level, locale]
  );
  const trainingTypeOptions = React.useMemo(
    () => getCoachOptions(TRAINING_TYPE_VALUES, locale, copy.options.trainingType),
    [copy.options.trainingType, locale]
  );
  const equipmentOptions = React.useMemo(
    () => getCoachOptions(EQUIPMENT_VALUES, locale, copy.options.equipment),
    [copy.options.equipment, locale]
  );
  const daysPerWeekOptions = React.useMemo(
    () => [
      { value: "", label: copy.options.daysPerWeek },
      ...DAYS_PER_WEEK_VALUES.map((value) => ({ value, label: copy.options.days(value) })),
    ],
    [copy.options]
  );

  React.useEffect(() => {
    const draftKey = `coachRequestDraft:${coachSlug}`;
    const restoreDraft = (raw: string | null) => {
      if (!raw) return;
      try {
        const parsed = JSON.parse(raw);
        setFormData({
          goal: parsed.goal || "",
          level: parsed.level || "",
          trainingType: parsed.trainingType || "",
          equipment: parsed.equipment || "",
          daysPerWeek: parsed.daysPerWeek || "",
          notes: parsed.notes || "",
        });
        setErrors({});
      } catch (err) {
        console.error("Failed to parse draft:", err);
      }
    };

    restoreDraft(localStorage.getItem(draftKey));

    if (window.location.hash === "#request") {
      restoreDraft(localStorage.getItem(draftKey));
      setTimeout(() => {
        document.getElementById("request-form")?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  }, [coachSlug]);

  React.useEffect(() => {
    const draftKey = `coachRequestDraft:${coachSlug}`;
    const hasData = Object.values(formData).some((value) => value !== "");
    if (hasData) {
      localStorage.setItem(draftKey, JSON.stringify(formData));
    }
  }, [formData, coachSlug]);

  React.useEffect(() => {
    if (!session?.user) return;

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
  }, [session?.user]);

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
  const displayValue = React.useCallback((value: string) => getCoachValueLabel(value, locale), [locale]);

  const updateField = (field: keyof FormData, value: string) => {
    setFormData((current) => ({ ...current, [field]: value }));
    if (errors[field]) {
      setErrors((current) => ({ ...current, [field]: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Partial<FormData> = {};
    if (!formData.goal.trim()) newErrors.goal = copy.required;
    if (!formData.level.trim()) newErrors.level = copy.required;
    if (!formData.trainingType.trim()) newErrors.trainingType = copy.required;
    if (!formData.equipment.trim()) newErrors.equipment = copy.required;
    if (!formData.daysPerWeek.trim()) newErrors.daysPerWeek = copy.required;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

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
        if (error.error === "Insufficient tokens") {
          const balanceRes = await fetch("/api/tokens/balance");
          if (balanceRes.ok) {
            const balanceData = await balanceRes.json();
            setBalance(typeof balanceData.balance === "number" ? balanceData.balance : 0);
          }
          throw new Error(error.error || copy.notEnoughSubmitError);
        }
        throw new Error(error.error || copy.submitError);
      }

      localStorage.removeItem(`coachRequestDraft:${coachSlug}`);
      setIsSuccess(true);
    } catch (error) {
      console.error("Error submitting request:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <Card id="request-form" className={cn("p-6", className)}>
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">{copy.successTitle}</h2>
          <p className="text-text-muted mb-6">{copy.successBody}</p>
          <Button variant="primary" size="lg" asChild>
            <a href="/dashboard">{copy.dashboard}</a>
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card id="request-form" className={cn("p-6", className)}>
      <h2 className="text-xl font-semibold mb-2">{copy.title}</h2>
      <p className="text-sm text-text-muted mb-6">{copy.subtitle}</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="goal" className="block text-sm font-medium mb-2">
            {copy.labels.goal}
          </label>
          <Select
            id="goal"
            options={goalOptions}
            value={formData.goal}
            onChange={(e) => updateField("goal", e.target.value)}
            className={errors.goal ? "border-danger" : ""}
          />
          {errors.goal && <p className="text-sm text-danger mt-1">{errors.goal}</p>}
        </div>

        <div>
          <label htmlFor="level" className="block text-sm font-medium mb-2">
            {copy.labels.level}
          </label>
          <Select
            id="level"
            options={levelOptions}
            value={formData.level}
            onChange={(e) => updateField("level", e.target.value)}
            className={errors.level ? "border-danger" : ""}
          />
          {errors.level && <p className="text-sm text-danger mt-1">{errors.level}</p>}
        </div>

        <div>
          <label htmlFor="trainingType" className="block text-sm font-medium mb-2">
            {copy.labels.trainingType}
          </label>
          <Select
            id="trainingType"
            options={trainingTypeOptions}
            value={formData.trainingType}
            onChange={(e) => updateField("trainingType", e.target.value)}
            className={errors.trainingType ? "border-danger" : ""}
          />
          {errors.trainingType && <p className="text-sm text-danger mt-1">{errors.trainingType}</p>}
        </div>

        <div>
          <label htmlFor="equipment" className="block text-sm font-medium mb-2">
            {copy.labels.equipment}
          </label>
          <Select
            id="equipment"
            options={equipmentOptions}
            value={formData.equipment}
            onChange={(e) => updateField("equipment", e.target.value)}
            className={errors.equipment ? "border-danger" : ""}
          />
          {errors.equipment && <p className="text-sm text-danger mt-1">{errors.equipment}</p>}
        </div>

        <div>
          <label htmlFor="daysPerWeek" className="block text-sm font-medium mb-2">
            {copy.labels.daysPerWeek}
          </label>
          <Select
            id="daysPerWeek"
            options={daysPerWeekOptions}
            value={formData.daysPerWeek}
            onChange={(e) => updateField("daysPerWeek", e.target.value)}
            className={errors.daysPerWeek ? "border-danger" : ""}
          />
          {errors.daysPerWeek && <p className="text-sm text-danger mt-1">{errors.daysPerWeek}</p>}
        </div>

        <div>
          <label htmlFor="notes" className="block text-sm font-medium mb-2">
            {copy.labels.notes}
          </label>
          <textarea
            id="notes"
            rows={4}
            value={formData.notes}
            onChange={(e) => updateField("notes", e.target.value)}
            className="w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-focus focus:ring-offset-2 focus:ring-offset-bg resize-none"
            placeholder={copy.placeholders.notes}
          />
        </div>

        {session?.user && (
          <div className="pt-4 border-t" style={{ borderColor: THEME.cardBorder }}>
            <div className="text-sm font-medium opacity-80 mb-3">{copy.costTitle}</div>

            {costBreakdown ? (
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="opacity-80">{copy.base}</span>
                  <span className="font-mono">{formatTokens(costBreakdown.base)}</span>
                </div>

                {costBreakdown.levelAdd > 0 && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="opacity-80">{copy.labels.level} ({displayValue(formData.level)})</span>
                    <span className="font-mono">+{formatTokens(costBreakdown.levelAdd)}</span>
                  </div>
                )}

                {costBreakdown.trainingTypeAdd > 0 && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="opacity-80">{copy.labels.trainingType} ({displayValue(formData.trainingType)})</span>
                    <span className="font-mono">+{formatTokens(costBreakdown.trainingTypeAdd)}</span>
                  </div>
                )}

                {costBreakdown.equipmentAdd > 0 && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="opacity-80">{copy.labels.equipment} ({displayValue(formData.equipment)})</span>
                    <span className="font-mono">+{formatTokens(costBreakdown.equipmentAdd)}</span>
                  </div>
                )}

                {costBreakdown.daysAdd > 0 && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="opacity-80">{copy.labels.daysPerWeek} ({copy.options.days(formData.daysPerWeek)})</span>
                    <span className="font-mono">+{formatTokens(costBreakdown.daysAdd)}</span>
                  </div>
                )}

                <div className="pt-2 border-t" style={{ borderColor: THEME.cardBorder }}>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">{copy.totalCost}</span>
                    <span className="font-mono font-semibold text-lg">{formatTokens(costBreakdown.total)}</span>
                  </div>
                </div>

                <div className="mt-2 text-xs opacity-70">
                  {balanceLoading ? copy.loadingBalance : `${copy.balance} ${formatTokens(balance)}`}
                </div>

                {hasInsufficientBalance && (
                  <div className="mt-3 p-3 rounded-lg border" style={{ borderColor: THEME.cardBorder, background: "#19191f" }}>
                    <div className="text-sm text-text-muted mb-2">{copy.notEnoughTokens}</div>
                    <div className="text-xs opacity-70 mb-2">
                      {copy.haveNeed(formatTokens(balance), formatTokens(costBreakdown.total))}
                    </div>
                    <Button variant="outline" size="sm" asChild className="text-xs">
                      <Link href="/pricing">{copy.topUp}</Link>
                    </Button>
                  </div>
                )}

                <p className="text-xs opacity-70 mt-2">{copy.chargedWhenSubmit}</p>
              </div>
            ) : (
              <div className="text-sm opacity-70">{copy.completeRequired}</div>
            )}
          </div>
        )}

        {hasInsufficientBalance && costBreakdown && (
          <div className="p-3 rounded-lg border" style={{ borderColor: "#ef4444", background: "#19191f" }}>
            <div className="text-sm text-danger mb-2">{copy.insufficientTokens}</div>
            <div className="text-xs opacity-70">
              {copy.needButHave(formatTokens(costBreakdown.total), formatTokens(balance))}
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
          {session?.user ? copy.sendRequest : copy.signInToSend}
        </Button>
      </form>
    </Card>
  );
}
