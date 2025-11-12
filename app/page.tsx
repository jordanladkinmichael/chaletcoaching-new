"use client";

import React, { useEffect, useState } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import {
  Dumbbell, Wallet, Sparkles, ShieldAlert, Timer, FileDown, ArrowRight, ChevronRight, Settings2,
  Video, Image as ImageIcon, Info, Lock, LogIn, UserPlus, X, ChevronLeft, Mail, Quote,
  Eye, RefreshCw
} from "lucide-react";


import { THEME } from "@/lib/theme";
import {
  TOKENS_PER_UNIT,
  PREVIEW_COST,
  REGEN_DAY,
  REGEN_WEEK,
  calcFullCourseTokens,
  tokensToApproxWeeks,
  currencyForRegion,
  WORKOUT_TYPES,
  MUSCLE_GROUPS,
  generateCourseTitle,
} from "@/lib/tokens";

import type { GeneratorOpts } from "@/lib/tokens";
import { formatNumber } from "@/lib/tokens";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";
import { ToastContainer, Toast, ToastType } from "@/components/ui";


/* ============================== Types & helpers ============================== */
function downloadCSV(filename: string, rows: Array<Record<string, unknown>>) {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const esc = (v: unknown) => {
    const s = String(v ?? "");
    if (new RegExp('[",\\n]').test(s)) return `"${s.replace(new RegExp('"', 'g'), '""')}"`;
    return s;
  };
  const csv =
    headers.join(",") +
    "\n" +
    rows.map((r) => headers.map((h) => esc(r[h])).join(",")).join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

type Region = "EU" | "UK" | "US";

type NavItem = {
  id: NavId;
  label: string;
  protected?: boolean;
};

type NavId = "home" | "dashboard" | "generator" | "pricing" | "consultations" | "blog" | "faq" | "contact";

const NAV: NavItem[] = [
  { id: "dashboard",     label: "Dashboard",     protected: true },
  { id: "generator",     label: "Generator",     protected: true },
  { id: "pricing",       label: "Pricing" },
  { id: "consultations", label: "Consultations" },
] as const;

const cn = (...classes: Array<string | false | undefined>) =>
  classes.filter(Boolean).join(" ");

/* ============================== UI primitives ============================== */

function Card({
  className = "",
  children,
  interactive = false,
}: {
  className?: string;
  children?: React.ReactNode;
  interactive?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border p-5 md:p-6",
        interactive && "hover:border-opacity-60 transition-colors cursor-pointer",
        className
      )}
      style={{ borderColor: THEME.cardBorder }}
    >
      {children}
    </div>
  );
}

// Компонент спиннера для загрузки
function Spinner({ size = 16, className = "" }: { size?: number; className?: string }) {
  return (
    <div className={cn("animate-spin", className)}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray="31.416"
          strokeDashoffset="31.416"
          className="opacity-25"
        />
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray="31.416"
          strokeDashoffset="15.708"
          className="opacity-75"
        />
      </svg>
    </div>
  );
}

function Pill({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium",
        className
      )}
      style={{
        background: "#19191f",
        color: THEME.secondary,
        border: `1px solid ${THEME.cardBorder}`,
      }}
    >
      {children}
    </span>
  );
}

function AccentButton({
                          children,
                          className = "",
                          ...props
                      }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
    return (
        <button
            {...props}
            className={cn(
                "inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold shadow-[0_0_0_1px_rgba(0,0,0,0.6)]",
                className
            )}
            style={{ background: THEME.accent, color: "#0E0E10" }}
        >
            {children}
        </button>
    );
}


function GhostButton({
  children,
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold border",
        className
      )}
      style={{
        background: "transparent",
        color: THEME.text,
        borderColor: THEME.cardBorder,
      }}
    >
      {children}
    </button>
  );
}



/* ============================== Pricing ============================== */

type OpenAuthFn = (mode?: "signup" | "signin") => void;

type PricingProps = {
  region: Region;
  requireAuth: boolean;
  openAuth: OpenAuthFn;
  onTierBuy: (price: number, source?: "starter" | "builder" | "pro") => Promise<void>;
  onCustomTopUp: (amountCurrency: number) => Promise<void>;
  loading?: boolean;
};

type Tier = {
  name: "Starter" | "Builder" | "Pro";
  price: number;
  tokens: number;
  tag: string;
  bonus?: string; // optional
};


// File: `app/page.tsx` (updated Pricing function)
function Pricing({ region, requireAuth: _requireAuth, openAuth: _openAuth, onCustomTopUp: _onCustomTopUp, onTierBuy: _onTierBuy, loading }: PricingProps) {
    const { symbol, unitLabel } = currencyForRegion(region);
    
    // Курсы конвертации (базовая валюта - EUR)
    const CONVERSION_RATE_USD = 1.087; // 1 EUR = 1.087 USD
    const CONVERSION_RATE_GBP = 1 / 1.15; // 1 EUR = 0.87 GBP (для обратной совместимости)
    
    // Определяем курс для текущей валюты
    const getConversionRate = () => {
        if (region === "EU") return 1; // EUR - базовая валюта
        if (region === "US") return CONVERSION_RATE_USD; // USD
        return CONVERSION_RATE_GBP; // UK (для обратной совместимости)
    };
    
    const conversionRate = getConversionRate();
    
    // Базовые цены в EUR
    const basePrices = { Starter: 10, Builder: 20, Pro: 49 };
    
    const tiers: Tier[] = [
        {
            name: "Starter",
            price: region === "EU" ? basePrices.Starter : Math.round(basePrices.Starter * conversionRate * 100) / 100,
            tokens: 1000,
            tag: "Try & explore"
        },
        {
            name: "Builder",
            price: region === "EU" ? basePrices.Builder : Math.round(basePrices.Builder * conversionRate * 100) / 100,
            tokens: 2060, // 2000 + 3% bonus
            tag: "Most popular",
            bonus: "+3%"
        },
        {
            name: "Pro",
            price: region === "EU" ? basePrices.Pro : Math.round(basePrices.Pro * conversionRate * 100) / 100,
            tokens: 5390, // 4900 + 10% bonus
            tag: "Best value",
            bonus: "+10%"
        },
    ];

    const [custom, setCustom] = useState<string>("25.00");
    const customNumber = Number(custom.replace(",", "."));
    // Конвертируем введенную сумму в EUR для расчета токенов
    const customPriceInEUR = region === "EU" ? customNumber : customNumber / conversionRate;
    const customTokens = Math.max(0, Math.round(customPriceInEUR * TOKENS_PER_UNIT));
    const approxWeeks = tokensToApproxWeeks(customTokens);

    // new: track which action is creating (tier name or "custom")
    const [creating, setCreating] = useState<string | null>(null);

    // Terms acceptance state for each plan (only for authenticated users)
    const [termsAccepted, setTermsAccepted] = useState<Record<string, boolean>>({
        Starter: false,
        Builder: false,
        Pro: false,
        Custom: false,
    });

    // Removed unused saveAndGoToCheckout function

    const getCountryCode = () => {
        if (region === "UK") return "GB";
        if (region === "EU") return "DE"; // Используем DE как пример для EU
        return "US"; // US
    };

    const handleBuy = async (tier: Tier) => {
        if (_requireAuth) return _openAuth("signup");
        setCreating(tier.name);
        try {
            // Викликаємо бекенд Armenotech для створення ордеру
            const res = await fetch("/api/armenotech/create-transaction", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    amount: Number(tier.price),
                    fullName: "Digital Brain User", // можна підставити з контексту юзера
                    email: "client@example.com",
                    country: getCountryCode(),
                }),
            });

            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data.error || "Payment error");

            if (data.redirect) {
                window.location.href = data.redirect; // перекидаємо на Armenotech checkout
            } else {
                alert("No redirect URL received from gateway");
            }
        } catch (err) {
            console.error("Payment error:", err);
            alert("Payment failed: " + err);
        } finally {
            setCreating(null);
        }
    };


    const handleCustom = async () => {
        if (_requireAuth) return _openAuth("signup");
        if (!Number.isFinite(customNumber) || customNumber <= 0) return;

        setCreating("custom");
        try {
            const res = await fetch("/api/armenotech/create-transaction", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    amount: customNumber,
                    fullName: "Digital Brain User",
                    email: "client@example.com",
                    country: getCountryCode(),
                }),
            });

            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data.error || "Payment error");

            if (data.redirect) {
                window.location.href = data.redirect;
            } else {
                alert("No redirect URL received from gateway");
            }
        } catch (err) {
            console.error("Payment error:", err);
            alert("Payment failed: " + err);
        } finally {
            setCreating(null);
        }
    };


    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {tiers.map((t, i) => (
                <Card key={t.name} interactive className={cn("relative", i === 1 && "ring-1 ring-[#FFD60A]/50")}>
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">{t.name}</h3>
                        <Pill>{t.tag}</Pill>
                    </div>

                    <div className="mt-3 text-3xl font-bold tracking-tight" style={{ color: THEME.accent }}>
                        {symbol}{t.price.toFixed(2)}
                    </div>
                    <div className="mt-1 text-sm opacity-70">
                        {t.tokens.toLocaleString("en-US")} tokens {t.bonus && <span className="ml-2 opacity-90">({t.bonus})</span>}
                    </div>

                    <ul className="mt-4 space-y-2 text-sm opacity-90">
                        <li className="flex items-center gap-2"><Sparkles size={16}/> Good for ~{tokensToApproxWeeks(t.tokens)} weeks</li>
                        <li className="flex items-center gap-2"><Dumbbell size={16}/> Previews + full course</li>
                        <li className="flex items-center gap-2"><FileDown size={16}/> PDF export</li>
                    </ul>

                    {/* Terms checkbox - only for authenticated users */}
                    {!_requireAuth && (
                        <label className="flex items-center gap-2 cursor-pointer text-sm mt-4 mb-2">
                            <input
                                type="checkbox"
                                checked={termsAccepted[t.name]}
                                onChange={(e) => setTermsAccepted({...termsAccepted, [t.name]: e.target.checked})}
                                className="rounded"
                            />
                            <span className="opacity-85">
                                I agree to the{' '}
                                <a 
                                    href="/legal/terms" 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="underline hover:opacity-100 transition-opacity"
                                    style={{ color: THEME.accent }}
                                >
                                    Terms and Conditions
                                </a>
                            </span>
                        </label>
                    )}

                    <AccentButton
                        className="mt-5 w-full"
                        disabled={!!loading || !!creating || (!_requireAuth && !termsAccepted[t.name])}
                        onClick={() => void handleBuy(t)}
                    >
                        {_requireAuth ? (
                            <><Lock size={16}/> Sign in to buy</>
                        ) : creating === t.name ? (
                            <><Spinner size={16} className="mr-2"/> Processing…</>
                        ) : (loading ? "Processing…" : <>Buy {t.name} <ArrowRight size={16}/></>)}
                    </AccentButton>
                </Card>
            ))}

            <Card className="md:col-span-2 lg:col-span-2" interactive>
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Custom amount</h3>
                    <Pill>Flexible</Pill>
                </div>

                <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto] md:items-end">
                    <div>
                        <label className="text-sm opacity-80">Amount ({unitLabel})</label>
                        <div className="mt-1 flex items-center gap-2">
                            <span className="rounded-lg border px-3 py-2" style={{ borderColor: THEME.cardBorder }}>{symbol}</span>
                            <input
                                type="number"
                                inputMode="decimal"
                                step="0.01"
                                min="0.01"
                                placeholder="0.00"
                                value={custom}
                                onChange={(e) => setCustom(e.target.value)}
                                className="w-full rounded-lg border px-3 py-2 bg-transparent"
                                style={{ borderColor: THEME.cardBorder }}
                            />
                        </div>
                        <div className="mt-2 text-sm opacity-80">
                            = {customTokens.toLocaleString("en-US")} tokens
                        </div>
                        <div className="text-sm mt-1 opacity-90">≈ {approxWeeks} weeks (baseline)</div>
                    </div>

                    {/* Terms checkbox for Custom - only for authenticated users */}
                    {!_requireAuth && (
                        <div className="md:col-span-2">
                            <label className="flex items-center gap-2 cursor-pointer text-sm mt-3 mb-2">
                                <input
                                    type="checkbox"
                                    checked={termsAccepted.Custom}
                                    onChange={(e) => setTermsAccepted({...termsAccepted, Custom: e.target.checked})}
                                    className="rounded"
                                />
                                <span className="opacity-85">
                                    I agree to the{' '}
                                    <a 
                                        href="/legal/terms" 
                                        target="_blank" 
                                        rel="noopener noreferrer" 
                                        className="underline hover:opacity-100 transition-opacity"
                                        style={{ color: THEME.accent }}
                                    >
                                        Terms and Conditions
                                    </a>
                                </span>
                            </label>
                        </div>
                    )}

                    <AccentButton
                        className="w-full md:w-auto"
                        disabled={!!loading || !!creating || !(customNumber > 0) || (!_requireAuth && !termsAccepted.Custom)}
                        onClick={() => void handleCustom()}
                    >
                        {_requireAuth ? (
                            <><Lock size={16}/> Sign in to top up</>
                        ) : creating === "custom" ? (
                            <><Spinner size={16} className="mr-2"/> Processing…</>
                        ) : (loading ? "Processing…" : <>Top up</>)}
                    </AccentButton>
                </div>
            </Card>
        </div>
    );
}



/* ============================== Generator (stub) ============================== */

function Generator({
  region,
  requireAuth,
  openAuth,
  onGeneratePreview,
  onPublishCourse,
  balance,
  loading,
}: {
  region: Region;
  requireAuth: boolean;
  openAuth: () => void;
  onGeneratePreview: (opts: GeneratorOpts) => Promise<void> | void;
  onPublishCourse: (opts: GeneratorOpts) => Promise<void> | void;
  balance: number;
  loading: "preview" | "publish" | null;
}) {
  const [weeks, setWeeks] = useState<number>(4);
  const [sessions, setSessions] = useState<number>(4);
  const [injurySafe, setInjurySafe] = useState<boolean>(true);
  const [specEq, setSpecEq] = useState<boolean>(false);
  const [nutrition, setNutrition] = useState<boolean>(false);
  const [pdf, setPdf] = useState<"none" | "text" | "illustrated">("text");
  const [images, setImages] = useState<number>(12);
  const [videoPlan, setVideoPlan] = useState<boolean>(false);
  const [gender, setGender] = useState<"male" | "female">("male");
  const [workoutTypes, setWorkoutTypes] = useState<string[]>([]);
  const [targetMuscles, setTargetMuscles] = useState<string[]>([]);

  // Калькуляция стоимости через calcFullCourseTokens
  const courseCost = React.useMemo(() => {
    const opts: GeneratorOpts = {
      weeks,
      sessionsPerWeek: sessions,
      injurySafe,
      specialEquipment: specEq,
      nutritionTips: nutrition,
      pdf,
      images,
      videoPlan,
      gender,
      workoutTypes,
      targetMuscles,
    };
    return calcFullCourseTokens(opts);
  }, [weeks, sessions, injurySafe, specEq, nutrition, pdf, images, videoPlan, gender, workoutTypes, targetMuscles]);

  const buildOpts = React.useCallback(
    (): GeneratorOpts => {
      const opts = {
        weeks,
        sessionsPerWeek: sessions,
        injurySafe,
        specialEquipment: specEq,
        nutritionTips: nutrition,
        pdf,
        images,
        videoPlan,
        gender,
        workoutTypes,
        targetMuscles,
      };
      console.log("Building options:", opts);
      return opts;
    },
    [weeks, sessions, injurySafe, specEq, nutrition, pdf, images, videoPlan, gender, workoutTypes, targetMuscles]
  );

  const handlePreview = async () => {
    try {
      const opts = buildOpts();
      console.log("Sending preview options:", opts);
      await onGeneratePreview(opts);
    } catch (error) {
      console.error("Preview generation failed:", error);
    }
  };

  const handlePublish = async () => {
    try {
      const opts = buildOpts();
      console.log("Sending publish options:", opts);
      await onPublishCourse(opts);
    } catch (error) {
      console.error("Course publication failed:", error);
    }
  };

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <Card>
        <h3 className="text-xl font-semibold flex items-center gap-2">
          <Settings2 size={18} /> Generator
        </h3>

        {requireAuth ? (
          <div
            className="mt-3 rounded-xl p-4 flex items-start gap-3"
            style={{ background: "#19191f", border: `1px solid ${THEME.cardBorder}` }}
          >
            <Lock size={18} style={{ color: THEME.accent }} />
            <div>
              <div className="text-sm font-semibold">Sign in required</div>
              <p className="text-sm opacity-85">
                Create an account or log in to generate previews and full courses.
              </p>
              <div className="mt-3 flex gap-2">
                <AccentButton onClick={openAuth}>
                  <UserPlus size={16} /> Create account
                </AccentButton>
                <GhostButton onClick={openAuth}>
                  <LogIn size={16} /> Sign in
                </GhostButton>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="mt-4 space-y-6">
              {/* Основные параметры */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium opacity-80">Program Duration (1-12 weeks)</label>
                  <input
                    type="range"
                    min={1}
                    max={12}
                    value={weeks}
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      if (value >= 1 && value <= 12) {
                        setWeeks(value);
                      }
                    }}
                    className="w-full mt-2"
                  />
                  <div className="text-sm mt-1 opacity-70 flex justify-between">
                    <span>1 week</span>
                    <span><b>{weeks}</b> weeks</span>
                    <span>12 weeks</span>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium opacity-80">Training Frequency (2-6 sessions/week)</label>
                  <input
                    type="range"
                    min={2}
                    max={6}
                    value={sessions}
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      if (value >= 2 && value <= 6) {
                        setSessions(value);
                      }
                    }}
                    className="w-full mt-2"
                  />
                  <div className="text-sm mt-1 opacity-70 flex justify-between">
                    <span>2 sessions</span>
                    <span><b>{sessions}</b> sessions</span>
                    <span>6 sessions</span>
                  </div>
                </div>
              </div>

              {/* Выбор пола */}
              <div>
                <label className="text-sm font-medium opacity-80">Gender</label>
                <div className="flex items-center gap-4 mt-2">
                  {(["male", "female"] as const).map((g) => (
                    <label key={g} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="gender"
                        value={g}
                        checked={gender === g}
                        onChange={(e) => setGender(e.target.value as "male" | "female")}
                        className="rounded"
                      />
                      <span className="text-sm capitalize">{g}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Выбор типов тренировок */}
              <div>
                <label className="text-sm font-medium opacity-80">Workout Types</label>
                <div className="mt-2 max-h-48 overflow-y-auto border rounded-lg p-3" style={{ borderColor: THEME.cardBorder }}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {WORKOUT_TYPES.map((type) => (
                      <label key={type} className="flex items-center gap-2 cursor-pointer text-sm">
                        <input
                          type="checkbox"
                          checked={workoutTypes.includes(type)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setWorkoutTypes([...workoutTypes, type]);
                            } else {
                              setWorkoutTypes(workoutTypes.filter(t => t !== type));
                            }
                          }}
                          className="rounded"
                        />
                        <span className="opacity-85">{type}</span>
                      </label>
                    ))}
                  </div>
                </div>
                {workoutTypes.length > 0 && (
                  <div className="mt-2 text-xs opacity-70">
                    Selected: {workoutTypes.length} type{workoutTypes.length !== 1 ? 's' : ''}
                  </div>
                )}
              </div>

              {/* Выбор целевых мышц */}
              <div>
                <label className="text-sm font-medium opacity-80">Target Muscle Groups</label>
                <div className="mt-2 max-h-64 overflow-y-auto border rounded-lg p-3" style={{ borderColor: THEME.cardBorder }}>
                  {MUSCLE_GROUPS.map((group) => (
                    <div key={group.group} className="mb-4 last:mb-0">
                      <div className="font-medium text-sm mb-2 opacity-90" style={{ color: THEME.accent }}>
                        {group.group}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 ml-2">
                        {group.items.map((muscle) => (
                          <label key={muscle.id} className="flex items-center gap-2 cursor-pointer text-sm">
                            <input
                              type="checkbox"
                              checked={targetMuscles.includes(muscle.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setTargetMuscles([...targetMuscles, muscle.id]);
                                } else {
                                  setTargetMuscles(targetMuscles.filter(m => m !== muscle.id));
                                }
                              }}
                              className="rounded"
                            />
                            <span className="opacity-85">{muscle.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                {targetMuscles.length > 0 && (
                  <div className="mt-2 text-xs opacity-70">
                    Selected: {targetMuscles.length} muscle{targetMuscles.length !== 1 ? 's' : ''}
                  </div>
                )}
              </div>

              {/* Дополнительные опции */}
              <div className="space-y-3">
                <div className="text-sm font-medium opacity-80">Additional Features</div>
                
                <div className="flex items-center gap-3">
                  <input
                    id="injury"
                    type="checkbox"
                    checked={injurySafe}
                    onChange={(e) => setInjurySafe(e.target.checked)}
                    className="rounded"
                  />
                  <label htmlFor="injury" className="text-sm flex items-center gap-2 cursor-pointer">
                    <ShieldAlert size={16} style={{ color: THEME.accent }} /> 
                    Injury-safe modifications
                  </label>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    id="specEq"
                    type="checkbox"
                    checked={specEq}
                    onChange={(e) => setSpecEq(e.target.checked)}
                    className="rounded"
                  />
                  <label htmlFor="specEq" className="text-sm flex items-center gap-2 cursor-pointer">
                    Special equipment / rare sport
                  </label>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    id="nutrition"
                    type="checkbox"
                    checked={nutrition}
                    onChange={(e) => setNutrition(e.target.checked)}
                    className="rounded"
                  />
                  <label htmlFor="nutrition" className="text-sm flex items-center gap-2 cursor-pointer">
                    Nutrition tips & meal planning
                  </label>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    id="video"
                    type="checkbox"
                    checked={videoPlan}
                    onChange={(e) => setVideoPlan(e.target.checked)}
                    className="rounded"
                  />
                  <label htmlFor="video" className="text-sm flex items-center gap-2 cursor-pointer">
                    <Video size={16} style={{ color: THEME.accent }} /> 
                    Video exercise guide
                  </label>
                </div>
              </div>

              {/* PDF экспорт */}
              <div>
                <label className="text-sm font-medium opacity-80">PDF Export</label>
                <div className="flex items-center gap-2 mt-2">
                  {(["none", "text", "illustrated"] as const).map((p) => (
                    <button
                      key={p}
                      onClick={() => setPdf(p)}
                      className={cn(
                        "px-3 py-2 rounded-lg border text-sm transition-colors",
                        pdf === p ? "font-semibold" : "opacity-70 hover:opacity-100"
                      )}
                      style={{
                        borderColor: THEME.cardBorder,
                        background: pdf === p ? THEME.accent : "transparent",
                        color: pdf === p ? "#0E0E10" : THEME.text,
                      }}
                    >
                      {p === "none" ? "No PDF" : p === "text" ? "Text only" : "With images"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Количество изображений для иллюстрированного PDF */}
              {pdf === "illustrated" && (
                <div>
                  <label className="text-sm font-medium opacity-80 flex items-center gap-2">
                    <ImageIcon size={16} style={{ color: THEME.accent }} /> 
                    Number of illustrations (4-20 images)
                  </label>
                  <input
                    type="range"
                    min={4}
                    max={20}
                    value={images}
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      if (value >= 4 && value <= 20) {
                        setImages(value);
                      }
                    }}
                    className="w-full mt-2"
                  />
                  <div className="text-sm mt-1 opacity-70 flex justify-between">
                    <span>4 images</span>
                    <span><b>{images}</b> images</span>
                    <span>20 images</span>
                  </div>
                </div>
              )}
            </div>

            {/* Информация об обязательных полях */}
            <div className="mt-6 p-4 rounded-lg border" style={{ borderColor: THEME.cardBorder, background: "#19191f" }}>
              <div className="flex items-start gap-2">
                <Info size={16} style={{ color: THEME.accent }} />
                <div className="text-sm">
                  <div className="font-medium mb-2">Required Fields:</div>
                  <div className="space-y-1 opacity-80">
                    <div>• <span className={gender ? "text-green-400" : "text-red-400"}>Gender</span> - {gender ? "Selected" : "Please select"}</div>
                    <div>• <span className={workoutTypes.length > 0 ? "text-green-400" : "text-red-400"}>Workout Types</span> - {workoutTypes.length > 0 ? `${workoutTypes.length} selected` : "Please select at least one"}</div>
                    <div>• <span className={targetMuscles.length > 0 ? "text-green-400" : "text-red-400"}>Target Muscles</span> - {targetMuscles.length > 0 ? `${targetMuscles.length} selected` : "Please select at least one"}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Кнопки действий */}
            <div className="mt-8 space-y-3">
              <AccentButton 
                onClick={handlePreview}
                disabled={loading !== null || balance < PREVIEW_COST || !gender || workoutTypes.length === 0 || targetMuscles.length === 0}
                className="w-full justify-center"
              >
                {loading === "preview" ? (
                  <>
                    <Spinner size={16} className="text-current" />
                    <span>Generating preview...</span>
                  </>
                ) : !gender || workoutTypes.length === 0 || targetMuscles.length === 0 ? (
                  <>Fill required fields</>
                ) : balance < PREVIEW_COST ? (
                  <>Insufficient tokens ({balance}/{PREVIEW_COST})</>
                ) : (
                  <>Generate Preview (−{PREVIEW_COST} tokens)</>
                )}
              </AccentButton>
              
              <GhostButton 
                onClick={handlePublish}
                disabled={loading !== null || balance < courseCost || !gender || workoutTypes.length === 0 || targetMuscles.length === 0}
                className="w-full justify-center"
              >
                {loading === "publish" ? (
                  <>
                    <Spinner size={16} className="text-current" />
                    <span>Publishing course...</span>
                  </>
                ) : !gender || workoutTypes.length === 0 || targetMuscles.length === 0 ? (
                  <>Fill required fields</>
                ) : balance < courseCost ? (
                  <>Insufficient tokens ({balance}/{courseCost})</>
                ) : (
                  <>Publish Full Course (−{courseCost} tokens)</>
                )}
              </GhostButton>
            </div>

            <div className="mt-4 text-xs opacity-70 flex items-center gap-2">
              <Info size={14} /> 
              Regenerate: day −{REGEN_DAY} • week −{REGEN_WEEK}
            </div>
          </>
        )}
      </Card>

      <Card>
        <h3 className="text-xl font-semibold flex items-center gap-2">
          <Sparkles size={18} /> Cost Breakdown
        </h3>

        <div className="mt-4 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm opacity-80">Base cost ({weeks} weeks × {sessions} sessions)</span>
            <span className="font-mono text-sm">◎ {Math.round((400 + weeks * 120 + sessions * weeks * 8) * 1.3)}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm opacity-80">Gender selection</span>
            <span className="font-mono text-sm">◎ 0</span>
          </div>
          
          {workoutTypes.length > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-sm opacity-80">Workout types ({workoutTypes.length} selected)</span>
              <span className="font-mono text-sm">◎ {Math.round(workoutTypes.length * 15 * 1.3)}</span>
            </div>
          )}
          
          {targetMuscles.length > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-sm opacity-80">Target muscles ({targetMuscles.length} selected)</span>
              <span className="font-mono text-sm">◎ {Math.round(targetMuscles.length * 8 * 1.3)}</span>
            </div>
          )}
          
          {injurySafe && (
            <div className="flex justify-between items-center">
              <span className="text-sm opacity-80">Injury-safe modifications</span>
              <span className="font-mono text-sm">◎ {Math.round(120 * 1.3)}</span>
            </div>
          )}
          
          {specEq && (
            <div className="flex justify-between items-center">
              <span className="text-sm opacity-80">Special equipment</span>
              <span className="font-mono text-sm">◎ {Math.round(80 * 1.3)}</span>
            </div>
          )}
          
          {nutrition && (
            <div className="flex justify-between items-center">
              <span className="text-sm opacity-80">Nutrition tips</span>
              <span className="font-mono text-sm">◎ {Math.round(100 * 1.3)}</span>
            </div>
          )}
          
          {videoPlan && (
            <div className="flex justify-between items-center">
              <span className="text-sm opacity-80">Video exercise guide</span>
              <span className="font-mono text-sm">◎ {Math.round(250 * 1.3)}</span>
            </div>
          )}
          
          {pdf !== "none" && (
            <div className="flex justify-between items-center">
              <span className="text-sm opacity-80">
                PDF export {pdf === "illustrated" ? `(${images} images)` : ""}
              </span>
              <span className="font-mono text-sm">
                ◎ {pdf === "text" ? Math.round(60 * 1.3) : Math.round((60 + images * 10) * 1.3)}
              </span>
            </div>
          )}
          
          <div className="border-t pt-3 mt-3" style={{ borderColor: THEME.cardBorder }}>
            <div className="flex justify-between items-center">
              <span className="font-semibold">Total course cost</span>
              <span className="font-mono font-semibold text-lg">◎ {courseCost}</span>
            </div>
            <div className="text-xs opacity-70 mt-1">
              {currencyForRegion(region).symbol} {(courseCost / TOKENS_PER_UNIT).toFixed(2)}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}


/* ============================== Simple visuals ============================== */

function Consultations() {
  return (
    <div className="space-y-3">
      <h3 className="text-xl font-semibold">Consultations</h3>
      <Card>
        <div className="text-center py-8">
          <div className="text-lg font-medium">Coming Soon</div>
          <p className="text-sm opacity-70 mt-2">
            Personal fitness consultations will be available here.
          </p>
        </div>
      </Card>
    </div>
  );
}


function WhyChooseUsMosaic() {
  const items = [
    {
      title: "Smarter than templates",
      desc: "Personalized plans that adapt to your goals, time and equipment.",
      imgLabel: "Athlete + phone",
      image: "/images/smarter-than-templates.webp", // Умные шаблоны - спортсмен с телефоном
    },
    {
      title: "Safety-first programs",
      desc: "Knee-safe & back-safe options, alternatives and form cues.",
      imgLabel: "Coach demonstrating form",
      image: "/images/safety-first-programs.webp", // Безопасность - тренер показывает технику
    },
    {
      title: "Transparent tokens",
      desc: "1 EUR/GBP = 100 tokens. See costs before you generate.",
      imgLabel: "Macro hands + chalk",
      image: "/images/transparent-tokens.webp", // Прозрачные токены - руки с мелом
    },
    {
      title: "Yours to keep (PDF)",
      desc: "Your courses stay in your account. Export clean, printable PDFs.",
      imgLabel: "Laptop with PDF",
      image: "/images/yours-to-keep.webp", // PDF экспорт - ноутбук с PDF
    },
  ];
  return (
    <div className="space-y-3">
      <h3 className="text-xl font-semibold">Why choose us</h3>
      <div className="grid gap-6 md:grid-cols-2">
        {items.map((it: typeof items[number]) => (
          <Card key={it.title} className="grid gap-4 md:grid-cols-2 items-center" interactive>
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl border" style={{ borderColor: THEME.cardBorder }}>
              <img
                src={it.image}
                alt={it.imgLabel}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <div className="text-lg font-semibold">{it.title}</div>
              <p className="mt-2 text-sm opacity-85">{it.desc}</p>
              <div className="mt-3 text-xs opacity-70">Safety • Personalization • Clarity</div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function LiveSamplePreview({
  requireAuth,
  openAuth,
  onRegenerateDay,
}: {
  requireAuth: boolean;
  openAuth: () => void;
  onRegenerateDay: () => void;
}) {
  const [week, setWeek] = useState<number>(1);
  
  // Изображения для каждой недели
  const weekImages = [
    "/images/at-home-setup.webp",           // Week 1 - Home minimal
    "/images/dramatic-gym-setup.webp",      // Week 2 - Strength (Gym)
    "/images/dynamic-dumbbell-thruster.webp", // Week 3 - HIIT + Core (Mixed)
    "/images/serene-yoga-pose.webp",        // Week 4 - Deload & Mobility
  ];
  
  // Данные для каждой недели
  const weekData = [
    {
      title: "Foundations (Home minimal)",
      warmup: "Hip hinge, cat-camel, ankle rocks (6 min)",
      main: "Goblet squat 3×10, Push-ups 3×8–12, DB row 3×12/arm, Plank 3×30s (24 min)",
      finisher: "EMOM burpees ×5 (4 min)",
      cooldown: "Couch stretch, thoracic rotations (5 min)",
      alternatives: "Injury-safe alts: Goblet → Box squat; Push-ups → Incline push-ups; DB row → Chest-supported row; Burpees → Step-burpees."
    },
    {
      title: "Strength (Gym)",
      warmup: "Jump rope easy, band pull-aparts, world's greatest stretch (6 min)",
      main: "Front squat 4×6–8, Incline DB press 4×8–10, TRX row 4×10–12, Pallof press 3×12/side (24 min)",
      finisher: "Kettlebell swings — Tabata 20/10 × 8 (4 min)",
      cooldown: "Hip flexor stretch, calf stretch against wall (5 min)",
      alternatives: "Injury-safe alts: Front squat → Goblet squat; Incline DB press → Floor press; TRX row → Chest-supported row; KB swings → Fast step-ups."
    },
    {
      title: "HIIT + Core (Mixed)",
      warmup: "Skips, shoulder circles, glute bridges (6 min)",
      main: "DB thruster 4×8, Romanian deadlift 3×10, Pull-ups (or band-assisted) 3×AMRAP, Hollow hold 3×20–30s (24 min)",
      finisher: "Intervals 20/10 × 8 — high knees / bike / rower (4 min)",
      cooldown: "Hamstring stretch, child's pose rotations (5 min)",
      alternatives: "Injury-safe alts: Thruster → Split squat + light push press; RDL → Band hip hinge; Pull-ups → Assisted pulldown; Intervals → Brisk march."
    },
    {
      title: "Deload & Mobility",
      warmup: "Parasympathetic breathing, Cossack squat mobility, band external rotations (6 min)",
      main: "Tempo goblet squat 3×8 @ 3-1-3-0, Incline push-ups 3×10–12, 1-arm DB row 3×12/arm, Dead bug 3×8/side (24 min)",
      finisher: "Low-impact shadow boxing 4×30s on / 30s off (4 min)",
      cooldown: "Long spine decompression, 90/90 hip stretch (5 min)",
      alternatives: "Injury-safe alts: Tempo goblet → Sit-to-stand; Row → Chest-supported row; Shadow boxing → Marching in place."
    }
  ];
  
  const sample = weekData[week - 1];
  return (
    <div className="space-y-3">
      <h3 className="text-xl font-semibold">See a live sample</h3>
      <Card className="grid md:grid-cols-2 gap-6 items-center">
        <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl border" style={{ borderColor: THEME.cardBorder }}>
          <img
            src={weekImages[week - 1]}
            alt={`Training setup - Week ${week}`}
            className="w-full h-full object-cover"
          />
          {/* Оверлей с номером недели */}
          <div className="absolute top-3 right-3">
            <div className="bg-black/70 text-white px-3 py-1 rounded-full text-sm font-medium">
              Week {week}
            </div>
          </div>
        </div>
        <div>
          <div className="flex gap-2 mb-3">
            {[1, 2, 3, 4].map((n: number) => (
              <button
                key={n}
                onClick={() => setWeek(n)}
                className={cn(
                  "px-3 py-1.5 rounded-lg border text-sm",
                  week === n ? "font-semibold" : "opacity-70"
                )}
                style={{ borderColor: THEME.cardBorder }}
              >
                {`Week ${n}`}
              </button>
            ))}
          </div>
          
          {/* Заголовок недели */}
          <div className="mb-3">
            <h4 className="font-semibold text-base" style={{ color: THEME.accent }}>
              {sample.title}
            </h4>
          </div>
          
          <ul className="text-sm space-y-2">
            <li>
              <span className="font-medium">Warm-up:</span> {sample.warmup}
            </li>
            <li>
              <span className="font-medium">Main:</span> {sample.main}
            </li>
            <li>
              <span className="font-medium">Finisher:</span> {sample.finisher}
            </li>
            <li>
              <span className="font-medium">Cool-down:</span> {sample.cooldown}
            </li>
          </ul>
          
          {/* Альтернативы для травм */}
          <div className="mt-3 p-3 rounded-lg border text-xs" style={{ borderColor: THEME.cardBorder, background: THEME.card }}>
            <div className="opacity-80">{sample.alternatives}</div>
          </div>
          <div className="mt-4 flex gap-2">
            <AccentButton onClick={requireAuth ? openAuth : undefined}>
              {requireAuth ? (
                <>
                  <Lock size={16} /> Create account to generate
                </>
              ) : (
                <>Generate your preview</>
              )}
            </AccentButton>
            <GhostButton
              onClick={requireAuth ? openAuth : onRegenerateDay}
              title={requireAuth ? "Sign in to use" : undefined}
            >
              <Sparkles size={16}/> Regenerate day (−{REGEN_DAY} tokens)
            </GhostButton>
          </div>
          <div className="mt-2 text-xs opacity-70">
            Baseline cost preview: ~{PREVIEW_COST} tokens
          </div>
        </div>
      </Card>
    </div>
  );
}

function IntegrationsShowcase() {
  const rows = [
    {
      left: { 
        type: "img", 
        label: "Apple Health",
        image: "/images/apple.webp", // Apple Health интеграция
      },
      right: {
        type: "text",
        title: "Apple Health",
        body: "Sync workouts, heart rate and active energy to refine recovery and intensity.",
        cta: "Notify me",
      },
    },
    {
      left: {
        type: "text",
        title: "Google Fit",
        body: "Bring steps, cardio points and routines to improve weekly planning.",
        cta: "Notify me",
      },
      right: { 
        type: "img", 
        label: "Google Fit",
        image: "/images/google.webp", // Google Fit интеграция
      },
    },
    {
      left: { 
        type: "img", 
        label: "Garmin",
        image: "/images/garmin.webp", // Garmin интеграция
      },
      right: {
        type: "text",
        title: "Garmin",
        body: "Use training load and HRV insights to balance intensity over time.",
        cta: "Notify me",
      },
    },
  ] as const;
  return (
    <div className="space-y-3">
      <h3 className="text-xl font-semibold">Integrations</h3>
      <div className="space-y-6">
        {rows.map((row, idx: number) => (
          <div key={idx} className="grid gap-6 md:grid-cols-2 items-stretch">
            {row.left.type === "img" ? (
              <Card className="flex items-center justify-center" interactive>
                <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl border" style={{ borderColor: THEME.cardBorder }}>
                  <img
                    src={row.left.image}
                    alt={row.left.label}
                    className="w-full h-full object-cover"
                  />
                  {/* Оверлей с названием интеграции */}
                  <div className="absolute bottom-3 left-3">
                    <div className="bg-black/70 text-white px-3 py-1 rounded-full text-sm font-medium">
                      {row.left.label}
                    </div>
                  </div>
                </div>
              </Card>
            ) : (
              <Card className="flex flex-col justify-center">
                <div className="flex items-center gap-2 mb-2">
                  <Pill>Coming soon</Pill>
                </div>
                <div className="text-lg font-semibold">{row.left.title}</div>
                <p className="mt-2 text-sm opacity-85">{row.left.body}</p>
                <div className="mt-4">
                  <GhostButton>{row.left.cta}</GhostButton>
                </div>
              </Card>
            )}
            {row.right.type === "img" ? (
              <Card className="flex items-center justify-center" interactive>
                <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl border" style={{ borderColor: THEME.cardBorder }}>
                  <img
                    src={row.right.image}
                    alt={row.right.label}
                    className="w-full h-full object-cover"
                  />
                  {/* Оверлей с названием интеграции */}
                  <div className="absolute bottom-3 left-3">
                    <div className="bg-black/70 text-white px-3 py-1 rounded-full text-sm font-medium">
                      {row.right.label}
                    </div>
                  </div>
                </div>
              </Card>
            ) : (
              <Card className="flex flex-col justify-center">
                <div className="flex items-center gap-2 mb-2">
                  <Pill>Coming soon</Pill>
                </div>
                <div className="text-lg font-semibold">{row.right.title}</div>
                <p className="mt-2 text-sm opacity-85">{row.right.body}</p>
                <div className="mt-4">
                  <GhostButton>{row.right.cta}</GhostButton>
                </div>
              </Card>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function Testimonials() {
  const items = [
    {
      name: "Marta K., Berlin",
      title: "Stronger knees in 6 weeks",
      quote: "Loved the knee-safe options. Could finally squat without pain.",
      image: "/images/marta.webp", // Marta из Берлина
    },
    {
      name: "Oliver P., London",
      title: "Lost 4 kg, kept my routine",
      quote: "Short sessions fit my work. PDFs made it easy to follow.",
      image: "/images/oliver.webp", // Oliver из Лондона
    },
    {
      name: "Sofia D., Barcelona",
      title: "Fitter and more flexible",
      quote: "The plan adapted to my gym days. The cool-downs are gold.",
      image: "/images/sofia.webp", // Sofia из Барселоны
    },
  ] as const;
  return (
    <div className="space-y-3">
      <h3 className="text-xl font-semibold">What people say</h3>
      <div className="grid gap-6 md:grid-cols-3">
        {items.map((t) => (
          <Card key={t.name} interactive>
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full overflow-hidden border-2" style={{ borderColor: THEME.accent }}>
                <img
                  src={t.image}
                  alt={t.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <div className="font-semibold">{t.title}</div>
                <div className="text-xs opacity-70">{t.name}</div>
              </div>
            </div>
            <div className="mt-3 text-sm opacity-85 flex gap-2">
              <Quote size={16} /> <span>“{t.quote}”</span>
            </div>
            <div className="mt-3 text-xs opacity-60">Results vary. Always train safely.</div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function FeedbackForm() {
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [ok, setOk] = React.useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setOk(false);

    if (!name.trim() || !email.trim() || !message.trim()) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      const r = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          message: message.trim(),
          page: "home",
        }),
      });

      if (!r.ok) {
        const j = await r.json().catch(() => ({}));
        throw new Error(j.error ?? "Failed to send");
      }

      setOk(true);
      setName(""); 
      setEmail(""); 
      setMessage("");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      <h3 className="text-xl font-semibold">Tell us what you need</h3>
      <form onSubmit={onSubmit}>
        <Card>
          <div className="grid md:grid-cols-2 gap-4">
            <input
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="rounded-lg border px-3 py-2 bg-transparent"
              style={{ borderColor: THEME.cardBorder }}
              required
            />
            <input
              placeholder="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-lg border px-3 py-2 bg-transparent"
              style={{ borderColor: THEME.cardBorder }}
              required
            />
          </div>
          <textarea
            placeholder="Message"
            rows={5}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="mt-4 w-full rounded-lg border px-3 py-2 bg-transparent"
            style={{ borderColor: THEME.cardBorder }}
            required
          />
          <div className="mt-3 text-xs opacity-70">We typically respond within 24–48h.</div>
          
          {error && <div className="mt-3 text-xs text-red-400">{error}</div>}
          {ok && <div className="mt-3 text-xs text-green-400">Thanks! We&apos;ll get back to you soon.</div>}
          
          <div className="mt-4 flex items-center gap-2">
            <AccentButton type="submit" disabled={loading}>
              {loading ? (
                <>
                  <RefreshCw size={16} className="animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Mail size={16} /> Send message
                </>
              )}
            </AccentButton>
            <div className="text-xs opacity-60">By sending you agree to our Privacy.</div>
          </div>
        </Card>
      </form>
    </div>
  );
}

/* ============================== Hero slider ============================== */

function HeroSlider({
  onPrimary,
  requireAuth,
  openAuth,
  generating,
}: {
  onPrimary: () => void;
  requireAuth: boolean;
  openAuth: () => void;
  generating: "preview" | "publish" | null;
}) {
  const slides = [
    {
      id: 1,
      title: "Generate your personal fitness course in 30 seconds",
      desc: "Answer a few questions, preview your plan, then publish a full course with safety checks, illustrations or short videos.",
      tag: "AI-powered + human coaches",
      image: "/images/strength-portrait.webp", // Первый слайд - генерация курса
    },
    {
      id: 2,
      title: "Big visuals. Clear structure.",
      desc: "Beautiful hero imagery, week-by-week layout and PDF you can keep forever.",
      tag: "Designed for focus",
      image: "/images/hiit-motion.webp", // Второй слайд - визуализация и структура
    },
    {
      id: 3,
      title: "Tokens that make sense",
      desc: "Only pay for what you use. Previews, full courses, PDFs — fully transparent.",
      tag: "1 EUR/GBP = 100 tokens",
      image: "/images/mobility-yoga.webp", // Третий слайд - токены и прозрачность
    },
  ] as const;
  const [i, setI] = useState<number>(0);
  useEffect(() => {
    const t = setInterval(() => setI((p) => (p + 1) % slides.length), 5000);
    return () => clearInterval(t);
  }, [slides.length]);
  const s = slides[i];
  return (
    <Card className="relative overflow-hidden">
      <div
        className="pointer-events-none absolute -right-12 -top-16 h-64 w-64 rounded-full blur-2xl opacity-25"
        style={{ background: THEME.accent }}
      />
      <div
        className="pointer-events-none absolute -left-10 bottom-0 h-56 w-56 rounded-full blur-3xl opacity-15"
        style={{ background: THEME.accent }}
      />

      <div className="grid md:grid-cols-2 gap-6 items-center">
        <div>
          <Pill className="mb-3 inline-flex">
            <Sparkles size={14} /> {s.tag}
          </Pill>
          <h1 className="text-3xl md:text-5xl font-extrabold leading-tight">{s.title}</h1>
          <p className="mt-3 max-w-xl text-sm md:text-base opacity-85">{s.desc}</p>
          <div className="mt-5 flex flex-wrap gap-3">
            <AccentButton onClick={requireAuth ? openAuth : onPrimary}>
              {requireAuth ? (
                <>
                  <Lock size={16} /> Create account to generate
                </>
              ) : generating === "preview" ? (
                <>
                  <Spinner size={16} className="text-current" />
                  <span>Generating preview...</span>
                </>
              ) : generating === "publish" ? (
                <>
                  <Spinner size={16} className="text-current" />
                  <span>Publishing course...</span>
                </>
              ) : (
                <>Generate preview (−{PREVIEW_COST} tokens)</>
              )}
            </AccentButton>
            <GhostButton onClick={openAuth}>
              <UserPlus size={16} /> Create account
            </GhostButton>
          </div>
        </div>
        <div
          className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl border"
          style={{ borderColor: THEME.cardBorder }}
        >
          {/* Фоновое изображение для каждого слайда */}
          <img
            src={s.image}
            alt={`Slide ${i + 1} - ${s.title}`}
            className="absolute inset-0 w-full h-full object-cover"
          />
          
          {/* Градиентный оверлей для лучшей читаемости текста */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(60% 80% at 70% 40%, rgba(255,214,10,0.14) 0%, rgba(255,214,10,0.05) 30%, transparent 60%), linear-gradient(180deg, rgba(20,20,24,0.7), rgba(20,20,24,0.7))",
            }}
          />
          
          {/* Текст поверх изображения */}
          <div className="absolute inset-0 grid place-items-center text-center p-6">
            <div>
              <div className="text-sm opacity-70">
                Slide {i + 1} / {slides.length}
              </div>
              <div className="mt-1 text-lg font-semibold">{s.title}</div>
              <div className="text-sm opacity-80">
                {s.desc}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="flex gap-2">
          {slides.map((_, idx: number) => (
            <button
              key={idx}
              onClick={() => setI(idx)}
              className={cn("h-1.5 w-6 rounded-full", idx === i ? "" : "opacity-50")}
              style={{ background: THEME.accent }}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
        <div className="flex gap-2">
          <GhostButton onClick={() => setI((i - 1 + slides.length) % slides.length)} aria-label="Previous">
            <ChevronLeft size={16} />
          </GhostButton>
          <GhostButton onClick={() => setI((i + 1) % slides.length)} aria-label="Next">
            <ChevronRight size={16} />
          </GhostButton>
        </div>
      </div>
    </Card>
  );
}

/* ============================== Sections ============================== */

function Home({
  region,
  goTo,
  requireAuth,
  openAuth,
  onRegenerateDay,
  onTopUp,
  generating,
}: {
  region: Region;
  goTo: (page: NavId) => void;
  requireAuth: boolean;
  openAuth: () => void;
  onRegenerateDay: () => void;
  onTopUp: (amount: number, source?: "starter" | "builder" | "pro" | "custom") => Promise<void>;
  generating: "preview" | "publish" | null;
}) {
  return (
    <div className="space-y-8">
      <HeroSlider onPrimary={() => goTo("generator")} requireAuth={requireAuth} openAuth={openAuth} generating={generating} />

      <WhyChooseUsMosaic />

      <LiveSamplePreview
        requireAuth={requireAuth}
        openAuth={openAuth}
        onRegenerateDay={onRegenerateDay}
      />

      <div className="space-y-3">
        <h3 className="text-xl font-semibold">Pricing</h3>
        <Pricing
          region={region}
          requireAuth={requireAuth}
          openAuth={openAuth}
          onCustomTopUp={(amt: number) => onTopUp(amt, "custom")}
          onTierBuy={async (price, source) => onTopUp(price, source)}
          loading={false}
        />
      </div>

      <IntegrationsShowcase />

      <Testimonials />

      <FeedbackForm />
    </div>
  );
}

function Dashboard({ requireAuth, openAuth, balance, currentPreview, onDismissPreview, onPublishCourse, loadBalance, balanceLoading }: { 
  requireAuth: boolean; 
  openAuth: () => void;
  balance: number;
  currentPreview?: {
    title: string;
    description: string;
    images?: string[];
    originalOpts: GeneratorOpts;
  } | null;
  onDismissPreview?: () => void;
  onPublishCourse: (opts: GeneratorOpts) => Promise<void>;
  loadBalance: () => Promise<void>;
  balanceLoading: boolean;
}) {
  // Типы должны быть определены вне компонента или в начале
  type CourseItem = {
    id: string;
    title: string;
    tokensSpent: number;
    pdfUrl: string | null;
    createdAt: string;
    options: string;
  };

  type TxItem = {
    id: string;
    type: "topup" | "spend";
    amount: number;
    createdAt: string;
    meta?: {
      reason?: string;
      source?: string;
      currency?: string;
      money?: number;
      [key: string]: unknown;
    };
  };

  // Все хуки должны быть в начале компонента
  const [loading, setLoading] = React.useState(true);
  const [courses, setCourses] = React.useState<CourseItem[]>([]);
  const [transactions, setTransactions] = React.useState<TxItem[]>([]);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [hasMore, setHasMore] = React.useState(true);
  const [loadingMore, setLoadingMore] = React.useState(false);
  const [generatingPDF, setGeneratingPDF] = React.useState<string | null>(null);
  const [selectedCourse, setSelectedCourse] = React.useState<CourseItem | null>(null);
  const [showCourseModal, setShowCourseModal] = React.useState(false);
  const [regeneratingDay, setRegeneratingDay] = React.useState(false);
  const [selectedWeek, setSelectedWeek] = React.useState(1);
  const [selectedDay, setSelectedDay] = React.useState(1);
  const [publishingCourse, setPublishingCourse] = React.useState(false);
  const ITEMS_PER_PAGE = 20;

  // Все хуки должны быть здесь, до условного возврата
  // Загрузка начальных данных
  React.useEffect(() => {
    let cancelled = false;

    async function fetchCoursesAndTx() {
      try {
        setLoading(true);
        const [cRes, tRes] = await Promise.all([
          fetch("/api/courses/list"),
          fetch(`/api/tokens/history?limit=${ITEMS_PER_PAGE}`),
        ]);
        if (cancelled) return;
        const cJson = await cRes.json().catch(() => ({ items: [] }));
        const tJson = await tRes.json().catch(() => ({ items: [] }));
        const coursesData = Array.isArray(cJson.items) ? cJson.items : [];
        const transactionsData = Array.isArray(tJson.items) ? tJson.items : [];
        console.log("Loaded courses:", coursesData);
        console.log("Loaded transactions:", transactionsData);
        setCourses(coursesData);
        setTransactions(transactionsData);
        setHasMore(transactionsData?.length === ITEMS_PER_PAGE);
      } catch (error) {
        console.error("Failed to load dashboard data:", error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchCoursesAndTx();

    // Подписка на событие публикации курса
    const onCoursePublished = () => {
      console.log("Detected course:published event – refreshing courses");
      fetch("/api/courses/list").then(r => r.json()).then(j => {
        const coursesData = Array.isArray(j.items) ? j.items : [];
        setCourses(coursesData);
      }).catch(err => console.error("Failed to refresh courses after publish:", err));
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('course:published', onCoursePublished as EventListener);
    }

    return () => {
      cancelled = true;
      if (typeof window !== 'undefined') {
        window.removeEventListener('course:published', onCoursePublished as EventListener);
      }
    };
  }, []);

  // Загрузка дополнительных транзакций
  const loadMoreTransactions = React.useCallback(async () => {
    if (loadingMore || !hasMore) return;
    
    try {
      setLoadingMore(true);
      const nextPage = currentPage + 1;
      const offset = (nextPage - 1) * ITEMS_PER_PAGE;
      
      const res = await fetch(`/api/tokens/history?limit=${ITEMS_PER_PAGE}&offset=${offset}`);
      const data = await res.json().catch(() => ({ items: [] }));
      
      if (Array.isArray(data.items)) {
        setTransactions(prev => [...prev, ...data.items]);
        setHasMore(data.items.length === ITEMS_PER_PAGE);
        setCurrentPage(nextPage);
      }
    } catch (error) {
      console.error("Failed to load more transactions:", error);
    } finally {
      setLoadingMore(false);
    }
  }, [currentPage, hasMore, loadingMore]);

  // Функция регенерации дня
  const regenerateDay = React.useCallback(async (courseId: string, weekNumber: number, dayNumber: number) => {
    if (regeneratingDay) return;
    
    try {
      setRegeneratingDay(true);
      
      const response = await fetch("/api/courses/regenerate-day", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId, weekNumber, dayNumber }),
      });
      
      if (response.ok) {
        const data = await response.json();
        alert(`Successfully regenerated Week ${weekNumber}, Day ${dayNumber}! Cost: ${formatNumber(data.tokensSpent)} tokens`);
        
        // Обновляем локальное состояние курса
        setCourses(prev => prev.map(course => 
          course.id === courseId 
            ? { ...course, tokensSpent: data.newTotalSpent }
            : course
        ));
        
        // Обновляем выбранный курс
        if (selectedCourse?.id === courseId) {
          setSelectedCourse(prev => prev ? { ...prev, tokensSpent: data.newTotalSpent } : null);
        }
        
        // Обновляем транзакции
        setTransactions(prev => [{
          id: `regenerate-${Date.now()}`,
          type: "spend" as const,
          amount: data.tokensSpent,
          createdAt: new Date().toISOString(),
          meta: {
            reason: `Regenerated Week ${weekNumber}, Day ${dayNumber}`,
            courseId: courseId,
            operation: "regenerate_day"
          }
        }, ...prev]);
        
      } else {
        const error = await response.json();
        if (error.error === "Insufficient tokens") {
          alert(`Insufficient tokens! Required: ${formatNumber(error.required)}, Balance: ${formatNumber(error.balance)}`);
        } else {
          alert(`Failed to regenerate day: ${error.error}`);
        }
      }
    } catch (error) {
      console.error("Day regeneration failed:", error);
      alert("Failed to regenerate day. Please try again.");
    } finally {
      setRegeneratingDay(false);
    }
  }, [regeneratingDay, selectedCourse]);

  // Условный возврат после всех хуков
  if (requireAuth) {
    return (
      <Card>
        <div className="flex items-start gap-3">
          <Lock size={18} style={{ color: THEME.accent }} />
          <div>
            <div className="text-sm font-semibold">Sign in required</div>
            <p className="text-sm opacity-85">Log in to view your courses, history and PDFs.</p>
            <div className="mt-3 flex gap-2">
              <AccentButton onClick={openAuth}><UserPlus size={16}/> Create account</AccentButton>
              <GhostButton onClick={openAuth}><LogIn size={16}/> Sign in</GhostButton>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  function exportTransactionsCSV() {
    const rows = transactions.map((t) => ({
      id: t.id,
      type: t.type,
      amount_tokens: t.amount,
      created_at: t.createdAt,
      reason: t.meta?.reason || "",
      source: t.meta?.source || "",
    }));
    downloadCSV("tokens-history.csv", rows);
  }

  const formatAmount = (amount: number) => {
    const sign = amount >= 0 ? "+" : "";
    const color = amount >= 0 ? "text-green-400" : "text-red-400";
    return (
      <span className={`font-mono ${color}`}>
        {sign}{formatNumber(amount)} ◎
      </span>
    );
  };

  const getTransactionIcon = (type: "topup" | "spend") => {
    return type === "topup" ? (
      <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
        <span className="text-green-400 text-sm">+</span>
      </div>
    ) : (
      <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center">
        <span className="text-red-400 text-sm">−</span>
      </div>
    );
  };

  const getTransactionDescription = (tx: TxItem) => {
    if (tx.type === "topup") {
      const source = tx.meta?.source || "Unknown";
      const currency = tx.meta?.currency || "";
      const money = tx.meta?.money;
      if (money && currency) {
        return `Top-up via ${source} (${currency} ${money})`;
      }
      return `Top-up via ${source}`;
    } else {
      const reason = tx.meta?.reason || "Unknown";
      return reason.charAt(0).toUpperCase() + reason.slice(1);
    }
  };

  return (
    <div className="space-y-6">
      {/* Баланс и общая статистика */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold flex items-center gap-2">
              <Wallet size={18} /> Token Balance
            </h3>
            <div className="flex gap-2">
              <button
                onClick={() => void loadBalance()}
                disabled={balanceLoading}
                className="p-2 rounded-lg hover:bg-opacity-10 transition-colors"
                style={{ backgroundColor: THEME.accent + '20' }}
                title="Refresh balance"
              >
                <RefreshCw size={16} className={balanceLoading ? "animate-spin" : ""} />
              </button>

            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-bold" style={{ color: THEME.accent }}>
              {formatNumber(balance)} ◎
            </div>
            <div className="text-sm opacity-70 mt-1">
              ≈ {(balance / TOKENS_PER_UNIT).toFixed(2)} EUR
            </div>
          </div>
        </Card>

        <Card>
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <Dumbbell size={18} /> Courses Created
          </h3>
          <div className="mt-4">
            <div className="text-3xl font-bold" style={{ color: THEME.accent }}>
              {courses.length}
            </div>
            <div className="text-sm opacity-70 mt-1">
              Total courses in your account
            </div>
          </div>
        </Card>

        <Card>
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <Timer size={18} /> Total Spent
          </h3>
          <div className="mt-4">
            <div className="text-3xl font-bold" style={{ color: THEME.accent }}>
              {formatNumber(transactions.filter(t => t.type === "spend").reduce((sum, t) => sum + Math.abs(t.amount), 0))} ◎
            </div>
            <div className="text-sm opacity-70 mt-1">
              Tokens spent on courses
            </div>
          </div>
        </Card>
      </div>



      {/* Preview (если есть) */}
      {currentPreview && (
        <Card className="border-2 border-yellow-400/30 bg-yellow-50/10">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold flex items-center gap-2">
              <Eye size={18} style={{ color: THEME.accent }} /> Latest Preview
            </h3>
            <div className="text-xs px-2 py-1 bg-yellow-400/20 rounded-full text-yellow-700">
              Preview
            </div>
          </div>
          
          <div className="mt-4">
            <div className="font-semibold text-lg">{currentPreview.title}</div>
            <p className="text-sm opacity-70 mt-1">{currentPreview.description}</p>
            
            {currentPreview.images && currentPreview.images.length > 0 && (
              <div className="mt-3">
                <div className="text-sm font-medium mb-2">Generated Images:</div>
                <div className="grid grid-cols-2 gap-2">
                  {currentPreview.images.map((imageUrl: string, index: number) => (
                    <img 
                      key={index}
                      src={imageUrl} 
                      alt={`Fitness image ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg"
                    />
                  ))}
                </div>
              </div>
            )}
            
            <div className="mt-4 flex gap-2">
              <GhostButton 
                onClick={async () => {
                  console.log("Publish Full Course button clicked in Latest Preview");
                  console.log("currentPreview:", currentPreview);
                  console.log("currentPreview.originalOpts:", currentPreview?.originalOpts);
                  
                  if (currentPreview.originalOpts) {
                    console.log("Starting course publication with opts:", currentPreview.originalOpts);
                    setPublishingCourse(true);
                    try {
                      console.log("Calling onPublishCourse...");
                      await onPublishCourse(currentPreview.originalOpts);
                      console.log("onPublishCourse completed successfully");
                    } catch (error) {
                      console.error("Failed to publish course:", error);
                      alert(`Failed to publish course: ${error instanceof Error ? error.message : 'Unknown error'}`);
                    } finally {
                      setPublishingCourse(false);
                    }
                  } else {
                    console.error("No original options found in preview");
                    console.log("currentPreview structure:", JSON.stringify(currentPreview, null, 2));
                    alert("Cannot publish course: missing options data");
                  }
                }}
                disabled={publishingCourse}
                className="text-sm"
              >
                {publishingCourse ? (
                  <>
                    <Spinner size={16} />
                    Publishing...
                  </>
                ) : (
                  <>
                    <Dumbbell size={16} /> Publish Full Course
                  </>
                )}
              </GhostButton>
              <GhostButton 
                onClick={onDismissPreview}
                className="text-sm"
              >
                <X size={16} /> Dismiss
              </GhostButton>
            </div>
          </div>
        </Card>
      )}

      {/* Курсы пользователя */}
      <Card>
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <Dumbbell size={18} /> Your Courses
          </h3>
          {courses.length > 0 && (
            <GhostButton onClick={() => {
              const rows = courses.map((c) => ({
                id: c.id,
                title: c.title,
                tokens_spent: c.tokensSpent,
                created_at: c.createdAt,
                has_pdf: !!c.pdfUrl,
              }));
              downloadCSV("courses.csv", rows);
            }} className="text-sm">
              <FileDown size={16} /> Export CSV
            </GhostButton>
          )}
        </div>
        
        {loading ? (
          <div className="mt-4 text-sm opacity-80">Loading courses...</div>
        ) : courses.length === 0 ? (
          <div className="mt-8 text-center py-8">
            <Dumbbell size={48} className="mx-auto opacity-40 mb-4" />
            <div className="text-lg font-medium">No courses yet</div>
            <p className="text-sm opacity-70 mt-2">
              Publish a full course from the Generator to see it here.
            </p>
          </div>
        ) : (
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {courses.map((c) => (
              <Card key={c.id} className="border-dashed" interactive>
                <div className="text-xs opacity-70">
                  {new Date(c.createdAt).toLocaleDateString()}
                </div>
                <div className="mt-1 text-lg font-semibold">
                  {c.title || (() => {
                    try {
                      const options = typeof c.options === 'string' ? JSON.parse(c.options) : c.options;
                      const generatedTitle = generateCourseTitle(options);
                      console.log('Generated title for course:', c.id, ':', generatedTitle, 'from options:', options);
                      return generatedTitle;
                    } catch (error) {
                      console.error('Failed to generate title for course:', c.id, error);
                      return 'Untitled Course';
                    }
                  })()}
                </div>
                <div className="mt-1 text-sm opacity-80">
                  Spent: {formatNumber(c.tokensSpent)} tokens
                </div>
                <div className="mt-3 flex gap-2">
                  <AccentButton onClick={() => {
                    setSelectedCourse(c);
                    setShowCourseModal(true);
                  }}>
                    Open
                  </AccentButton>
                  <GhostButton onClick={() => {
                    setSelectedCourse(c);
                    setShowCourseModal(true);
                  }}>
                    Regenerate day
                  </GhostButton>
                  <GhostButton
                    onClick={async () => {
                      console.log("PDF button clicked for course:", c.id);
                      console.log("Course pdfUrl:", c.pdfUrl);
                      
                      if (c.pdfUrl) {
                        // PDF уже существует - проверяем тип и обрабатываем соответственно
                        console.log("Opening existing PDF:", c.pdfUrl);
                        if (c.pdfUrl.startsWith('data:text/html')) {
                          // Это HTML файл - открываем в новой вкладке
                          window.open(c.pdfUrl, "_blank");
                        } else {
                          // Это обычный URL - открываем как есть
                          window.open(c.pdfUrl, "_blank");
                        }
                      } else {
                        // Генерируем PDF
                        console.log("Starting PDF generation for course:", c.id);
                        setGeneratingPDF(c.id);
                        try {
                          // Используем OpenAI API для генерации PDF
                          const apiEndpoint = "/api/courses/generate-pdf";
                          
                          console.log("Calling API:", apiEndpoint);
                          const response = await fetch(apiEndpoint, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ courseId: c.id }),
                          });
                          
                          console.log("API response status:", response.status);
                          
                          if (response.ok) {
                            const data = await response.json();
                            console.log("PDF generated successfully:", data);
                            // Обновляем локальное состояние
                            setCourses(prev => prev.map(course => 
                              course.id === c.id 
                                ? { ...course, pdfUrl: data.pdfUrl }
                                : course
                            ));
                            
                            // Обрабатываем PDF
                            if (data.pdfUrl) {
                              const pdfUrl = data.pdfUrl;
                              
                              // Проверяем тип файла
                              if (pdfUrl.startsWith('data:application/pdf')) {
                                // Это PDF - создаем blob и скачиваем
                                try {
                                  const base64Data = pdfUrl.split(',')[1];
                                  const pdfBlob = new Blob([Uint8Array.from(atob(base64Data), c => c.charCodeAt(0))], {
                                    type: 'application/pdf'
                                  });
                                  
                                  // Создаем ссылку для скачивания
                                  const downloadUrl = URL.createObjectURL(pdfBlob);
                                  const link = document.createElement('a');
                                  link.href = downloadUrl;
                                  link.download = data.filename || 'fitness-course.pdf';
                                  link.style.display = 'none';
                                  document.body.appendChild(link);
                                  link.click();
                                  document.body.removeChild(link);
                                  URL.revokeObjectURL(downloadUrl);
                                  
                                  console.log('PDF скачан успешно!');
                                } catch (downloadError) {
                                  console.error('Ошибка при скачивании PDF:', downloadError);
                                  // Альтернативный способ: создаем временную ссылку
                                  try {
                                    const base64Data = pdfUrl.split(',')[1];
                                    const pdfBlob = new Blob([Uint8Array.from(atob(base64Data), c => c.charCodeAt(0))], {
                                      type: 'application/pdf'
                                    });
                                    
                                    const tempUrl = URL.createObjectURL(pdfBlob);
                                    const tempLink = document.createElement('a');
                                    tempLink.href = tempUrl;
                                    tempLink.target = '_blank';
                                    tempLink.textContent = 'Открыть PDF';
                                    tempLink.style.cssText = 'position: fixed; top: 20px; right: 20px; z-index: 9999; padding: 10px; background: #667eea; color: white; border-radius: 5px; text-decoration: none;';
                                    
                                    document.body.appendChild(tempLink);
                                    
                                    // Убираем ссылку через 5 секунд
                                    setTimeout(() => {
                                      document.body.removeChild(tempLink);
                                      URL.revokeObjectURL(tempUrl);
                                    }, 5000);
                                    
                                    console.log('Создана временная ссылка для PDF');
                                  } catch (fallbackError) {
                                    console.error('Все способы скачивания PDF не удались:', fallbackError);
                                    alert('PDF сгенерирован, но не удалось скачать. Попробуйте открыть в новой вкладке.');
                                    window.open(pdfUrl, '_blank');
                                  }
                                }
                              } else if (pdfUrl.startsWith('data:text/html')) {
                                // Это HTML - открываем в новой вкладке
                                window.open(pdfUrl, '_blank');
                                console.log('HTML файл открыт в новой вкладке');
                              } else {
                                // Обычный URL
                                window.open(pdfUrl, '_blank');
                                console.log('Файл открыт в новой вкладке');
                              }
                            }
                          } else {
                            const error = await response.json();
                            console.error("PDF generation failed:", error);
                            alert(`Failed to generate PDF: ${error.error}`);
                          }
                        } catch (error) {
                          console.error("PDF generation failed:", error);
                          alert("Failed to generate PDF. Please try again.");
                        } finally {
                          setGeneratingPDF(null);
                        }
                      }
                    }}
                    disabled={generatingPDF === c.id}
                    className={cn(
                      "min-w-[140px] transition-all duration-200",
                      generatingPDF === c.id && "opacity-80 cursor-not-allowed"
                    )}
                  >
                    {generatingPDF === c.id ? (
                      <>
                        <Spinner size={16} className="text-current" />
                        <span>Generating...</span>
                      </>
                    ) : c.pdfUrl ? (
                      <>
                        <FileDown size={16} />
                        <span>Download PDF</span>
                      </>
                    ) : (
                      <>
                        <FileDown size={16} />
                        <span>Generate PDF</span>
                      </>
                    )}
                  </GhostButton>
                </div>
              </Card>
            ))}
          </div>
        )}
      </Card>

      {/* История транзакций */}
      <Card>
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <Timer size={18} /> Transaction History
          </h3>
          {transactions.length > 0 && (
            <GhostButton onClick={exportTransactionsCSV} className="text-sm">
              <FileDown size={16} /> Export CSV
            </GhostButton>
          )}
        </div>
        
        {loading ? (
          <div className="mt-4 text-sm opacity-80">Loading transactions...</div>
        ) : transactions.length === 0 ? (
          <div className="mt-8 text-center py-8">
            <Timer size={48} className="mx-auto opacity-40 mb-4" />
            <div className="text-lg font-medium">No transactions yet</div>
            <p className="text-sm opacity-70 mt-2">
              Your token transactions will appear here.
            </p>
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            {transactions.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center gap-3 p-3 rounded-lg border"
                style={{ borderColor: THEME.cardBorder }}
              >
                {getTransactionIcon(tx.type)}
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm">
                    {getTransactionDescription(tx)}
                  </div>
                  <div className="text-xs opacity-70 mt-1">
                    {new Date(tx.createdAt).toLocaleString()}
                  </div>
                </div>
                <div className="text-right">
                  {formatAmount(tx.amount)}
                </div>
              </div>
            ))}
            
            {/* Кнопка "Загрузить еще" */}
            {hasMore && (
              <div className="pt-4 text-center">
                <GhostButton
                  onClick={loadMoreTransactions}
                  disabled={loadingMore}
                  className="w-full"
                >
                  {loadingMore ? (
                    <>Loading more transactions...</>
                  ) : (
                    <>Load More Transactions</>
                  )}
                </GhostButton>
              </div>
            )}
          </div>
        )}
      </Card>
      
      {/* Модальное окно просмотра курса */}
      {showCourseModal && selectedCourse && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto border" style={{ backgroundColor: THEME.card, color: THEME.text, borderColor: THEME.cardBorder }}>
            <div className="sticky top-0 border-b p-4 flex items-center justify-between" style={{ backgroundColor: THEME.card, color: THEME.text, borderColor: THEME.cardBorder }}>
              <h2 className="text-xl font-semibold" style={{ color: THEME.text }}>Course Details</h2>
              <button
                onClick={() => setShowCourseModal(false)}
                className="text-2xl"
                style={{ color: THEME.secondary }}
              >
                ×
              </button>
            </div>
            
            <div className="p-6">
              <div className="mb-6">
                <h3 className="text-2xl font-bold mb-2" style={{ color: THEME.text }}>
                   {selectedCourse.title || 'Untitled Course'}
                 </h3>
                <div className="flex items-center gap-4 text-sm" style={{ color: THEME.secondary }}>
                  <span>Created: {new Date(selectedCourse.createdAt).toLocaleDateString()}</span>
                  <span>Tokens spent: {formatNumber(selectedCourse.tokensSpent)}</span>
                  {selectedCourse.pdfUrl && <span style={{ color: '#22c55e' }}>✓ PDF available</span>}
                </div>
              </div>
               
               <div className="mb-6">
                 <h4 className="text-lg font-semibold mb-3" style={{ color: THEME.text }}>Course Options</h4>
                 <div className="p-4 rounded-lg border" style={{ backgroundColor: THEME.card, borderColor: THEME.cardBorder }}>
                    {(() => {
                      try {
                        const options = JSON.parse(selectedCourse.options);
                        return (
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm" style={{ color: THEME.text }}>
                            <div><strong>Duration:</strong> {options.weeks || 'N/A'} weeks</div>
                            <div><strong>Sessions:</strong> {options.sessionsPerWeek || 'N/A'}/week</div>
                            <div><strong>Injury Safe:</strong> {options.injurySafe ? 'Yes' : 'No'}</div>
                            <div><strong>Equipment:</strong> {options.specialEquipment ? 'Required' : 'No'}</div>
                            <div><strong>Nutrition:</strong> {options.nutritionTips ? 'Included' : 'Not included'}</div>
                            <div><strong>Images:</strong> {options.imageCount || 'N/A'}</div>
                          </div>
                        );
                      } catch {
                        return <div style={{ color: '#ef4444' }}>Failed to parse course options</div>;
                      }
                    })()}
                  </div>
                </div>
                
                <div className="mb-6">
                  <h4 className="text-lg font-semibold mb-3" style={{ color: THEME.text }}>Actions</h4>
                  
                  {/* Выбор недели и дня для регенерации */}
                  <div className="mb-4 p-4 rounded-lg border" style={{ backgroundColor: THEME.card, borderColor: THEME.cardBorder }}>
                    <h5 className="font-medium mb-3" style={{ color: THEME.accent }}>Regenerate Specific Day</h5>
                    <div className="flex gap-4 items-center">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Week:</label>
                        <select 
                          value={selectedWeek} 
                          onChange={(e) => setSelectedWeek(Number(e.target.value))}
                          className="border rounded px-3 py-2 text-sm"
                          style={{ borderColor: THEME.cardBorder }}
                        >
                          {Array.from({ length: (() => {
                            try {
                              const options = JSON.parse(selectedCourse.options);
                              return options.weeks || 4;
                            } catch {
                              return 4;
                            }
                          })() }, (_, i) => i + 1).map(week => (
                            <option key={week} value={week}>Week {week}</option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Day:</label>
                        <select 
                          value={selectedDay} 
                          onChange={(e) => setSelectedDay(Number(e.target.value))}
                          className="border rounded px-3 py-2 text-sm"
                          style={{ borderColor: THEME.cardBorder }}
                        >
                          {Array.from({ length: (() => {
                            try {
                              const options = JSON.parse(selectedCourse.options);
                              return options.sessionsPerWeek || 4;
                            } catch {
                              return 4;
                            }
                          })() }, (_, i) => i + 1).map(day => (
                            <option key={day} value={day}>Day {day}</option>
                          ))}
                        </select>
                      </div>
                      
                      <GhostButton
                        onClick={() => regenerateDay(selectedCourse.id, selectedWeek, selectedDay)}
                        disabled={regeneratingDay}
                        className="flex items-center gap-2"
                        style={{ backgroundColor: THEME.accent, color: 'black' }}
                      >
                        {regeneratingDay ? (
                          <>
                            <Spinner size={16} />
                            Regenerating...
                          </>
                        ) : (
                          <>
                            <RefreshCw size={16} />
                            Regenerate Day
                          </>
                        )}
                      </GhostButton>
                    </div>
                     
                     <div className="mt-3 text-sm" style={{ color: THEME.accent }}>
                       <strong>Cost:</strong> {formatNumber(selectedCourse.tokensSpent)} tokens (same as full course)
                     </div>
                   </div>
                   
                   <div className="flex gap-3">
                      
                      {selectedCourse.pdfUrl ? (
                        <AccentButton
                          onClick={() => {
                            setShowCourseModal(false);
                            if (selectedCourse.pdfUrl?.startsWith('data:application/pdf')) {
                              // Скачиваем PDF
                              const base64Data = selectedCourse.pdfUrl.split(',')[1];
                              const pdfBlob = new Blob([Uint8Array.from(atob(base64Data), c => c.charCodeAt(0))], {
                                type: 'application/pdf'
                              });
                              const downloadUrl = URL.createObjectURL(pdfBlob);
                              const link = document.createElement('a');
                              link.href = downloadUrl;
                              link.download = `course-${selectedCourse.id}.pdf`;
                              link.click();
                              URL.revokeObjectURL(downloadUrl);
                            } else if (selectedCourse.pdfUrl) {
                              window.open(selectedCourse.pdfUrl, '_blank');
                            }
                          }}
                          className="flex items-center gap-2"
                          style={{ backgroundColor: THEME.accent, color: 'black' }}
                        >
                          <FileDown size={16} />
                          Download PDF
                        </AccentButton>
                      ) : (
                        <GhostButton
                          onClick={() => {
                            setShowCourseModal(false);
                            // Генерируем PDF
                            alert(`Generate PDF for course ${selectedCourse.id} (use button below)`);
                          }}
                          className="flex items-center gap-2"
                          style={{ backgroundColor: THEME.card, borderColor: THEME.cardBorder, color: THEME.text }}
                        >
                          <FileDown size={16} />
                          Generate PDF
                        </GhostButton>
                      )}
                    </div>
                  </div>
                </div>
            </div>
          </div>
        )}
     </div>
   );
 }

/* ============================== Page (App Shell) ============================== */
/* ---- Auth Modal ---- */
function AuthModal({
  open,
  mode,
  onModeChange,
  onClose,
  onRegister,
  onSignIn,
  onAuthed: _onAuthed,
}: {
  open: boolean;
  mode: "signup" | "signin";
  onModeChange: (m: "signup" | "signin") => void;
  onClose: () => void;
  onRegister: (email: string, password: string) => Promise<void>;
  onSignIn: (email: string, password: string) => Promise<void>;
  onAuthed?: () => void;
}) {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [termsAccepted, setTermsAccepted] = React.useState(false);

  // Reset terms acceptance when switching modes
  React.useEffect(() => {
    if (mode === "signin") {
      setTermsAccepted(false);
    }
  }, [mode]);

  if (!open) return null;

  async function submit() {
    setError(null);
    
    // Check terms acceptance for signup mode
    if (mode === "signup" && !termsAccepted) {
      setError("Please confirm that you have read and agree to the Terms and Conditions.");
      return;
    }
    
    setLoading(true);
    try {
      if (mode === "signup") {
        await onRegister(email.trim(), password);
      } else {
        await onSignIn(email.trim(), password);
      }
      onClose();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-40 grid place-items-center p-4" style={{ background: "rgba(0,0,0,0.5)" }}>
      <div className="w-full max-w-md rounded-2xl border p-6 relative" style={{ background: THEME.card, borderColor: THEME.cardBorder }}>
        <button className="absolute right-3 top-3 opacity-70" onClick={onClose} aria-label="Close">
          <X size={18} />
        </button>
        <div className="text-2xl font-extrabold">
          {mode === "signup" ? "Create your account" : "Welcome back"}
        </div>
        <p className="mt-1 text-sm opacity-80">
          Use your email to {mode === "signup" ? "create an account" : "sign in"}.
        </p>

        <div className="mt-4 space-y-3">
          <input
            placeholder="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border px-3 py-2 bg-transparent"
            style={{ borderColor: THEME.cardBorder }}
          />
          <input
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border px-3 py-2 bg-transparent"
            style={{ borderColor: THEME.cardBorder }}
          />

          {error && <div className="text-xs text-red-400">{error}</div>}

          {mode === "signup" && (
            <label className="flex items-center gap-2 cursor-pointer text-xs">
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="rounded"
              />
              <span className="opacity-85">
                I have read and agree to the{' '}
                <a 
                  href="/legal/terms" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="underline hover:opacity-100 transition-opacity"
                  style={{ color: THEME.accent }}
                >
                  Terms and Conditions
                </a>
              </span>
            </label>
          )}

          <AccentButton 
            className="w-full" 
            onClick={submit} 
            disabled={loading || (mode === "signup" && !termsAccepted)}
          >
            {loading ? "Please wait…" : mode === "signup" ? "Create account" : "Sign in"}
          </AccentButton>

          <button
            className="text-xs underline opacity-80"
            onClick={() => onModeChange(mode === "signup" ? "signin" : "signup")}
          >
            {mode === "signup" ? "Have an account? Sign in" : "New here? Create account"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AIFitWorldPrototype() {
  const { data: session } = useSession();
  type AuthMode = "signup" | "signin";

  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>("signup");

  const openAuth = React.useCallback((mode: AuthMode = "signup") => {
    setAuthMode(mode);
    setAuthOpen(true);
  }, []);

  async function handleRegister(email: string, password: string) {
    const r = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(j?.error ?? "Registration failed");

    const res = await signIn("credentials", { email, password, redirect: false });
    if (res?.error) throw new Error(res.error);
  }

  async function handleSignIn(email: string, password: string) {
    const res = await signIn("credentials", { email, password, redirect: false });
    if (res?.error) throw new Error(res.error);
  }

  const isAuthed = !!(session?.user as { id?: string })?.id;
  const [region, setRegion] = useState<Region>("EU");
  const [active, setActive] = useState<NavId>("home");
  const { unitLabel } = currencyForRegion(region);
  const [balance, setBalance] = React.useState<number>(0);
  const [balanceLoading, setBalanceLoading] = React.useState(false);
  const [generating, setGenerating] = React.useState<"preview" | "publish" | null>(null);
  const [topUpLoading, setTopUpLoading] = React.useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Создаем стабильную функцию для setActive
  const setActiveStable = React.useCallback((navId: NavId) => {
    setActive(navId);
  }, []);
  
  // Добавляем недостающие переменные для preview
  const [currentPreview, setCurrentPreview] = useState<{
    title: string;
    description: string;
    images?: string[];
    originalOpts: GeneratorOpts;
  } | null>(null);

  const loadBalance = React.useCallback(async () => {
    if (!isAuthed) { setBalance(0); return; }
    try {
      setBalanceLoading(true);
      const res = await fetch("/api/tokens/balance", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setBalance(typeof data.balance === "number" ? data.balance : 0);
      }
    } finally {
      setBalanceLoading(false);
    }
  }, [isAuthed]);

  // C: загружаем баланс при изменении авторизации
  React.useEffect(() => {
    void loadBalance();
  }, [loadBalance]);

  const spendTokens = React.useCallback(
    async (amount: number, reason: "regen_day" | "regen_week") => {
      if (!isAuthed) { openAuth("signin"); return; }
      const res = await fetch("/api/tokens/spend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, reason }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.error ?? "Spend failed");
      }
      setBalance(typeof data.balance === "number" ? data.balance : 0);
    },
    [isAuthed, openAuth]
  );

  const onRegenerateDay = React.useCallback(() => {
    return spendTokens(REGEN_DAY, "regen_day");
  }, [spendTokens]);

  const _onRegenerateWeek = React.useCallback(() => {
    return spendTokens(REGEN_WEEK, "regen_week");
  }, [spendTokens]);

  // Функции для управления тостами
  const addToast = React.useCallback((type: ToastType, title: string, message?: string) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast: Toast = { id, type, title, message };
    setToasts(prev => [...prev, newToast]);
  }, []);

  // Обработка URL параметров для успешных операций
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const success = urlParams.get('success');
      const tokens = urlParams.get('tokens');

      if (success === 'true' && tokens) {
        addToast("success", "Tokens Added!", `Successfully added ${tokens} tokens to your account!`);
        
        // Очищаем URL параметры
        window.history.replaceState({}, document.title, window.location.pathname);
        // Перезагружаем баланс
        void loadBalance();
        // Автоматически переключаемся на Dashboard
        setActiveStable("dashboard");
      }
    }
  }, [addToast, loadBalance, setActiveStable]);

  const removeToast = React.useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const _generatePreview = React.useCallback(
    async (opts: GeneratorOpts) => {
      if (!isAuthed) { openAuth("signup"); return; }
      setGenerating("preview");
      try {
        const res = await fetch("/api/generator/preview", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ options: opts }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data?.error ?? "Preview failed");
        setBalance(typeof data.balance === "number" ? data.balance : 0);
        addToast("success", "Preview Generated", "Your fitness preview has been created successfully!");
      } catch (error) {
        console.error("Preview generation failed:", error);
        addToast("error", "Generation Failed", error instanceof Error ? error.message : "Failed to generate preview");
      } finally {
        setGenerating(null);
      }
    },
    [isAuthed, openAuth, addToast]
  );

  const _publishCourse = React.useCallback(
    async (opts: GeneratorOpts) => {
      if (!isAuthed) { openAuth("signup"); return; }
      setGenerating("publish");
      try {
        const res = await fetch("/api/generator/publish", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ options: opts }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data?.error ?? "Publish failed");
        setBalance(typeof data.balance === "number" ? data.balance : 0);
        addToast("success", "Course Published", "Your fitness course has been published successfully!");
      } catch (error) {
        console.error("Course publication failed:", error);
        addToast("error", "Publication Failed", error instanceof Error ? error.message : "Failed to publish course");
      } finally {
        setGenerating(null);
      }
    },
    [isAuthed, openAuth, addToast]
  );

  // Top up helper used across pages (sends amount in currency units)
  // Единый хендлер пополнения
  const onTopUp = React.useCallback(
    async (amountCurrency: number, source: "starter" | "builder" | "pro" | "custom" = "custom") => {
      console.log("onTopUp called with:", { amountCurrency, source, isAuthed });

      if (!isAuthed) {
        console.log("User not authenticated, opening auth");
        openAuth("signup");
        return;
      }

      setTopUpLoading(true);
      try {
        console.log("Processing token topup");

        // Определяем пакет на основе суммы
        let packageId: "starter" | "builder" | "pro" | "custom" = "custom";
        if (amountCurrency <= 10) packageId = "starter";
        else if (amountCurrency <= 20) packageId = "builder";
        else if (amountCurrency <= 40) packageId = "pro";

        const res = await fetch("/api/tokens/topup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            packageId: packageId.toUpperCase(),
            currency: region === "US" ? "USD" : "EUR"
          }),
        });

        const data = await res.json().catch(() => ({}));
        console.log("Topup API response:", { status: res.status, data });

        if (!res.ok) {
          throw new Error(data?.error ?? "Failed to process token topup");
        }

        addToast("success", "Tokens Added!", `Successfully added ${data.tokensAdded.toLocaleString()} tokens! Your new balance is ${data.newBalance.toLocaleString()} tokens.`);

        // Перезагружаем баланс
        void loadBalance();

      } catch (error) {
        console.error("Top-up failed:", error);
        addToast("error", "Top-up Failed", error instanceof Error ? error.message : "Failed to process token topup");
      } finally {
        setTopUpLoading(false);
      }
    },
    [isAuthed, openAuth, region, addToast, loadBalance]
  );

  const handleGeneratePreview = React.useCallback(async (opts: GeneratorOpts) => {
    if (!isAuthed) return openAuth("signin");

    // Проверяем баланс
    if (balance < PREVIEW_COST) {
      alert(`Insufficient tokens. You need ${PREVIEW_COST} tokens, but have ${balance}.`);
      return;
    }

    setGenerating("preview");
    try {
      // 1) списание за превью
      const spend = await fetch("/api/tokens/spend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tokens: PREVIEW_COST,
          reason: "preview",
          meta: { opts },
        }),
      });
      
      if (!spend.ok) {
        const err = await spend.json().catch(() => ({}));
        throw new Error(err?.error ?? "Failed to spend tokens");
      }
      
      const { balance: newBalance } = await spend.json();
      setBalance(newBalance);

      // 2) запись превью
      const res = await fetch("/api/generator/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ opts }),
      });
      
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error ?? "Failed to create preview");
      }

      const previewData = await res.json();
      
      // Сохраняем результат preview в локальное состояние
      if (previewData.success && previewData.course) {
        console.log("Preview generated successfully:", previewData.course);
        setCurrentPreview({
          ...previewData.course,
          originalOpts: opts // Сохраняем оригинальные опции для публикации
        });
      }

      // Успех
      addToast("success", "Preview Generated!", "Your preview has been saved to your account.");
      
    } catch (error) {
      console.error("Preview generation failed:", error);
      addToast("error", "Generation Failed", error instanceof Error ? error.message : "Failed to generate preview");
    } finally {
      setGenerating(null);
    }
  }, [isAuthed, openAuth, balance, setBalance, setGenerating, addToast]);

  const handlePublishCourse = async (opts: GeneratorOpts) => {
    console.log("handlePublishCourse called with opts:", opts);
    if (!isAuthed) return openAuth("signin");

    const cost = calcFullCourseTokens(opts);
    console.log("Calculated cost:", cost, "Current balance:", balance);

    if (balance < cost) {
      alert(`Insufficient tokens. You need ${cost} tokens, but have ${balance}.`);
      return;
    }

    setGenerating("publish");
    try {
      console.log("Calling /api/courses/publish ...");
      const res = await fetch("/api/courses/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ opts }),
      });
      
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error ?? "Failed to publish course");
      }

      const data = await res.json();
      console.log("Course published successfully:", data);

      if (typeof data.balance === 'number') {
        setBalance(data.balance);
      }

      // Закрываем превью и уведомляем Dashboard обновить список
      setCurrentPreview(null);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('course:published', { detail: { courseId: data.courseId } }));
      }

      addToast("success", "Course Published!", "Your course has been saved to your account.");
      setActive("dashboard");
      
    } catch (error) {
      console.error("Course publication failed:", error);
      addToast("error", "Publication Failed", error instanceof Error ? error.message : "Failed to publish course");
    } finally {
      setGenerating(null);
    }
  };

  const _onAuthed = React.useCallback(() => {
    setAuthOpen(false);
  }, []);

  async function _handleSignOut() {
    await signOut({ redirect: false });
  }

  // Load balance when authed
  useEffect(() => {
    async function load() {
      if (!isAuthed) return;
      try {
        const res: Response = await fetch("/api/tokens/balance");
        if (!res.ok) return;
        const j: { balance?: number } = await res.json();
        setBalance(j.balance ?? 0);
      } catch {
        // ignore
      }
    }
    void load();
  }, [isAuthed]);

  const requireAuthFor = (pageId: NavId): boolean => {
    const navItem = NAV.find((n) => n.id === pageId);
    return !isAuthed && !!navItem?.protected;
  };

  const goTo = (pageId: NavId) => {
    if (requireAuthFor(pageId)) {
      openAuth("signin");
      return;
    }
    setActive(pageId);
  };

  return (
    <div
      className="min-h-screen"
      style={{
        color: THEME.text,
        background: `radial-gradient(60% 80% at 85% -10%, rgba(255,214,10,0.10) 0%, rgba(255,214,10,0.02) 40%, transparent 60%),
                   radial-gradient(60% 80% at 0% 100%, rgba(255,214,10,0.06) 0%, rgba(255,214,10,0.02) 30%, transparent 60%),
                   linear-gradient(180deg, #0E0E10 0%, #0E0E10 100%)`,
      }}
    >
      <SiteHeader
          onOpenAuth={openAuth} 
          onNavigate={(page: string) => goTo(page as NavId)}
        balance={balance}
        formatNumber={formatNumber}
        region={region}
        setRegion={setRegion}
        />
      
      <main className="mx-auto max-w-6xl px-4 py-8 md:py-12 space-y-8">

        {active === "home" && (
          <Home
            region={region}
            goTo={goTo}
            requireAuth={!isAuthed}
            openAuth={() => openAuth("signup")}
            onRegenerateDay={onRegenerateDay}
            onTopUp={onTopUp}
            generating={generating}
          />
        )}
        {active === "generator" && (
          <Generator
            region={region}
            requireAuth={!isAuthed}
            openAuth={() => openAuth("signup")}
            onGeneratePreview={handleGeneratePreview}
            onPublishCourse={handlePublishCourse}
            balance={balance}
            loading={generating}
          />
        )}

        {active === "pricing" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl md:text-3xl font-extrabold">Pricing</h2>
              <div className="text-sm opacity-70">1 {unitLabel} = {TOKENS_PER_UNIT} tokens</div>
              </div>
            <Pricing
              region={region}
              requireAuth={!isAuthed}
              openAuth={openAuth}
              onTierBuy={onTopUp}
              onCustomTopUp={(amt) => onTopUp(amt, "custom")}
              loading={topUpLoading}
            />
            </div>
        )}
        {active === "dashboard" && (
          <Dashboard
            requireAuth={!isAuthed}
            openAuth={() => openAuth("signup")}
            balance={balance}
            currentPreview={currentPreview}
            onDismissPreview={() => setCurrentPreview(null)}
            onPublishCourse={handlePublishCourse}
            loadBalance={loadBalance}
            balanceLoading={balanceLoading}
          />
        )}
        {active === "consultations" && <Consultations />}
        
        {active === "contact" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl md:text-3xl font-extrabold">Contact Us</h2>
            </div>
            <p className="text-lg opacity-80">
              Redirecting to contact page...
              </p>
            </div>
        )}
        
        {active === "blog" && (
          <div className="grid gap-4 md:grid-cols-2">
            {[1, 2, 3, 4].map((i: number) => (
              <Card key={i} interactive>
                <div className="text-xs opacity-60">3–5 min read</div>
                <div className="mt-1 text-lg font-semibold">Knee-safe lower body session #{i}</div>
                <p className="mt-2 text-sm opacity-85">
                  Practical tips and alternatives to keep your knees happy while training legs at home or in the gym.
                </p>
                <GhostButton className="mt-3">
                  Read <ChevronRight size={16} />
                </GhostButton>
              </Card>
            ))}
            </div>
        )}

        {active === "faq" && (
          <div className="space-y-3">
            {[
              {
                q: "How do tokens work?",
                a: "1 EUR/USD equals 100 tokens. You spend tokens when generating previews, full courses and exporting PDFs.",
              },
              {
                q: "Is there a refund policy?",
                a: "You can request token refunds for unused balances. Full policy will be available at checkout and in your account.",
              },
              {
                q: "Is it safe?",
                a: "We include injury-safe options and alternatives, but this is not medical advice. Consult a healthcare professional before starting.",
              },
            ].map((it) => (
              <Card key={it.q}>
                <div className="font-semibold">{it.q}</div>
                <p className="mt-1 text-sm opacity-85">{it.a}</p>
              </Card>
            ))}
          </div>
        )}
      </main>

      <SiteFooter />

      {/* --- Auth modal mount --- */}
        <AuthModal
        open={authOpen}
          mode={authMode}
        onModeChange={setAuthMode}
        onClose={() => setAuthOpen(false)}
        onRegister={handleRegister}
        onSignIn={handleSignIn}
        onAuthed={_onAuthed}
      />
      {/* --- Toast notifications --- */}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  );
}