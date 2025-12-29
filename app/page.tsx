"use client";

import React, { useEffect, useState } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dumbbell, Wallet, Sparkles, ShieldAlert, Timer, FileDown, ArrowRight, ChevronRight, Settings2,
  Video, Image as ImageIcon, Info, Lock, LogIn, UserPlus, X, ChevronLeft, Mail, Quote,
  Eye, RefreshCw, Calendar, Target, Coins, Ban, Repeat, User
} from "lucide-react";

import { THEME } from "@/lib/theme";
import { useDebounce } from "@/lib/hooks";
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
import { Dashboard } from "@/components/dashboard/Dashboard";
import { ToastContainer, Toast, ToastType, Container, CardHeader, CardContent, CardFooter, Button, H1, H2, H3, Paragraph, CurrencyToggle, Badge, Accordion, SearchInput } from "@/components/ui";
import { useCurrencyStore } from "@/lib/stores/currency-store";
import { TOKEN_PACKS, TOKEN_RATES, QUICK_AMOUNTS, calculateTokensFromAmount, wasRounded, type UiPackId, type Currency as TokenCurrency } from "@/lib/token-packages";
import { cardHoverLift } from "@/lib/animations";
import type { Route } from "next";


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
  { id: "generator",     label: "Generator",     protected: false }, // Changed to false - guests can view Course page
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

import { Pricing } from "@/components/pricing/Pricing";
import { Generator } from "@/components/generator/Generator";


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

/* ============================== New Home Page Sections ============================== */

// Hero section (video background)
function HeroSection() {
  const [shouldAutoplay, setShouldAutoplay] = React.useState(true);

  React.useEffect(() => {
    // Check for prefers-reduced-motion
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setShouldAutoplay(!mediaQuery.matches);
    
    const handleChange = (e: MediaQueryListEvent) => {
      setShouldAutoplay(!e.matches);
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return (
    <section className="relative py-12 md:py-16">
      <Container>
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Content */}
          <div className="space-y-6">
            <H1>Find Your Coach. Powered by AI.</H1>
            <Paragraph className="text-lg sm:text-xl max-w-xl">
              Choose a coach that matches your goal. Get a structured plan you can follow. Use AI anytime for instant options.
            </Paragraph>
            
            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button variant="primary" size="lg" asChild>
                <Link href="/coaches">Find a Coach</Link>
              </Button>
              <Button variant="ai" size="lg" asChild>
                <Link href="/generator">Generate Instantly (AI)</Link>
              </Button>
            </div>

            {/* Value bullets */}
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 text-sm text-text-subtle">
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-primary shrink-0" />
                <span>Structured weekly plan</span>
              </div>
              <div className="flex items-center gap-2">
                <Target size={16} className="text-primary shrink-0" />
                <span>Built around your goal and schedule</span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-primary shrink-0" />
                <span>Instant AI when you need it</span>
              </div>
            </div>
          </div>

          {/* Video Hero (side visual desktop, background mobile) */}
          <div className="relative aspect-video md:aspect-square max-w-md mx-auto">
            <div className="relative w-full h-full rounded-2xl overflow-hidden border border-border bg-surface">
              {shouldAutoplay ? (
                <video
                  src="/hero_video.mp4"
                  poster="/hero_poster.webp"
                  autoPlay
                  loop
                  muted
                  playsInline
                  preload="metadata"
                  className="w-full h-full object-cover"
                  onError={() => {
                    // Fallback if video fails to load
                    const fallback = document.querySelector('.hero-video-fallback') as HTMLElement;
                    if (fallback) fallback.style.display = 'block';
                  }}
                />
              ) : null}
              {/* Fallback gradient if poster missing or reduced motion */}
              <div 
                className="hero-video-fallback absolute inset-0 bg-gradient-to-br from-primary/20 via-surface to-ai-soft/10"
                style={{
                  display: shouldAutoplay ? 'none' : 'block'
                }}
              />
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

// Marquee Advantages section (calm marquee, CSS keyframes)
function MarqueeAdvantagesSection() {
  const items = [
    { text: "Coach-led approach", icon: User },
    { text: "Instant AI option", icon: Sparkles },
    { text: "Clear token pricing", icon: Coins },
    { text: "No subscriptions", icon: Ban },
    { text: "Secure checkout", icon: Lock },
    { text: "Built for consistency", icon: Repeat },
  ];

  return (
    <section className="border-t border-b border-border py-8 overflow-hidden">
      <Container>
        <div className="relative overflow-hidden">
          <div className="flex animate-marquee group hover:pause-animation">
            {[...items, ...items].map((item, idx) => {
              const Icon = item.icon;
              return (
                <span
                  key={`marquee-${item.text}-${idx}`}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-surface border border-border text-sm text-text-muted whitespace-nowrap mx-2 shrink-0"
                >
                  <Icon size={14} className="shrink-0" />
                  {item.text}
                </span>
              );
            })}
          </div>
          {/* Gradient fade edges */}
          <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-bg to-transparent pointer-events-none" />
          <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-bg to-transparent pointer-events-none" />
        </div>
      </Container>
    </section>
  );
}

// Live Activity section (split layout: video left, cards right)
function LiveFeedSection() {
  const sectionRef = React.useRef<HTMLElement>(null);
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const [isInView, setIsInView] = React.useState(false);
  const [isHovered, setIsHovered] = React.useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = React.useState(false);
  
  // Card slots: A1, A2 (top row), B1, B2 (bottom row)
  const [slots, setSlots] = React.useState<{
    A1: string | null;
    A2: string | null;
    B1: string | null;
    B2: string | null;
  }>({
    A1: "e01",
    A2: "e02",
    B1: "e03",
    B2: "e04",
  });

  // Dataset from polish_home.md
  const events = [
    { id: "e01", flag: "🇩🇪", name: "Emma", action: "requested a coach course", goal: "Strength goal", badge: "Coach" },
    { id: "e02", flag: "🇫🇷", name: "Lukas", action: "generated an AI course", goal: "Home workout setup", badge: "AI" },
    { id: "e03", flag: "🇮🇹", name: "Sofia", action: "found a coach", goal: "Mobility focus", badge: "Coach" },
    { id: "e04", flag: "🇪🇸", name: "Noah", action: "generated an AI course", goal: "Cardio endurance", badge: "AI" },
    { id: "e05", flag: "🇳🇱", name: "Mia", action: "requested a coach course", goal: "Fat loss program", badge: "Coach" },
    { id: "e06", flag: "🇸🇪", name: "Leon", action: "topped up tokens", goal: "Ready for a new program", badge: "Coach" },
    { id: "e07", flag: "🇫🇮", name: "Hanna", action: "generated an AI course", goal: "Core stability", badge: "AI" },
    { id: "e08", flag: "🇵🇱", name: "Elias", action: "requested a coach course", goal: "Beginner strength", badge: "Coach" },
    { id: "e09", flag: "🇨🇿", name: "Lina", action: "found a coach", goal: "Posture improvement", badge: "Coach" },
    { id: "e10", flag: "🇦🇹", name: "Jonas", action: "generated an AI course", goal: "HIIT routine", badge: "AI" },
    { id: "e11", flag: "🇧🇪", name: "Clara", action: "requested a coach course", goal: "Glutes & legs", badge: "Coach" },
    { id: "e12", flag: "🇮🇪", name: "Mateo", action: "generated an AI course", goal: "Flexibility reset", badge: "AI" },
    { id: "e13", flag: "🇵🇹", name: "Anna", action: "requested a coach course", goal: "Upper body focus", badge: "Coach" },
    { id: "e14", flag: "🇬🇷", name: "David", action: "generated an AI course", goal: "Running plan", badge: "AI" },
    { id: "e15", flag: "🇭🇺", name: "Julia", action: "found a coach", goal: "Mobility + strength", badge: "Coach" },
    { id: "e16", flag: "🇸🇰", name: "Oskar", action: "generated an AI course", goal: "Kettlebell basics", badge: "AI" },
    { id: "e17", flag: "🇷🇴", name: "Laura", action: "requested a coach course", goal: "Back-friendly training", badge: "Coach" },
    { id: "e18", flag: "🇧🇬", name: "Felix", action: "generated an AI course", goal: "Pull-up progression", badge: "AI" },
    { id: "e19", flag: "🇱🇻", name: "Elena", action: "requested a coach course", goal: "Desk worker routine", badge: "Coach" },
    { id: "e20", flag: "🇱🇹", name: "Tomas", action: "generated an AI course", goal: "Cycling support", badge: "AI" },
    { id: "e21", flag: "🇪🇪", name: "Nina", action: "found a coach", goal: "Beginner mobility", badge: "Coach" },
    { id: "e22", flag: "🇩🇪", name: "Adrian", action: "generated an AI course", goal: "Muscle gain plan", badge: "AI" },
    { id: "e23", flag: "🇫🇷", name: "Paula", action: "requested a coach course", goal: "Pilates-inspired strength", badge: "Coach" },
    { id: "e24", flag: "🇳🇱", name: "Viktor", action: "generated an AI course", goal: "Calisthenics start", badge: "AI" },
  ];

  // Store events in ref to avoid dependency issues (must be at top level, not inside useEffect)
  const eventsRef = React.useRef(events);

  // Check prefers-reduced-motion
  React.useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // IntersectionObserver for video and rotation
  React.useEffect(() => {
    if (!sectionRef.current) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsInView(entry.isIntersecting);
        });
      },
      { threshold: 0.1 }
    );
    
    observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  // Video autoplay control
  React.useEffect(() => {
    if (!videoRef.current) return;
    
    if (isInView && !prefersReducedMotion) {
      videoRef.current.play().catch(() => {
        // Autoplay failed, ignore
      });
    } else {
      videoRef.current.pause();
    }
  }, [isInView, prefersReducedMotion]);

  // Rotation logic (client-only, every 5s) - infinite rotation
  React.useEffect(() => {
    if (prefersReducedMotion || !isInView || isHovered) return;

    // Update ref with current events (ref is declared at top level)
    eventsRef.current = events;

    const interval = setInterval(() => {
      setSlots((prev) => {
        const currentEvents = [prev.A1, prev.A2, prev.B1, prev.B2].filter(Boolean) as string[];
        const currentNames = currentEvents.map(id => eventsRef.current.find(e => e.id === id)?.name).filter(Boolean) as string[];
        
        // Get available events (not currently visible, different id, unique name)
        let available = eventsRef.current.filter(
          (e) => !currentEvents.includes(e.id) && !currentNames.includes(e.name)
        );
        
        // If not enough available, allow any event except current slot ids (but prefer unique names)
        if (available.length < 2) {
          const fallback = eventsRef.current.filter((e) => !currentEvents.includes(e.id));
          available = fallback.length >= 2 ? fallback : eventsRef.current;
        }
        
        // Always ensure we have at least 2 events to choose from
        const pool = available.length >= 2 ? available : eventsRef.current;
        
        // Pick 2 random events
        const shuffled = [...pool].sort(() => Math.random() - 0.5);
        const new1 = shuffled[0];
        const new2 = shuffled[1] || shuffled[Math.floor(Math.random() * shuffled.length)] || shuffled[0];
        
        // Pick random slots: 1 from top row (A1 or A2), 1 from bottom row (B1 or B2)
        const topSlots: Array<"A1" | "A2"> = ["A1", "A2"];
        const bottomSlots: Array<"B1" | "B2"> = ["B1", "B2"];
        const topSlot = topSlots[Math.floor(Math.random() * topSlots.length)];
        const bottomSlot = bottomSlots[Math.floor(Math.random() * bottomSlots.length)];
        
        return {
          ...prev,
          [topSlot]: new1.id,
          [bottomSlot]: new2.id,
        };
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [prefersReducedMotion, isInView, isHovered]);

  const getEvent = (id: string | null) => events.find((e) => e.id === id);

  return (
    <section
      ref={sectionRef}
      className="border-t border-border pt-8"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsHovered(true)}
      onBlur={() => setIsHovered(false)}
    >
      <Container>
        <H3 className="mb-6">Live Activity</H3>
        <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
          {/* Left: Video */}
          <div className="relative aspect-video rounded-xl overflow-hidden border border-border bg-surface">
            <video
              ref={videoRef}
              src="/live_activity.mp4"
              poster="/live_activity_poster.webp"
              loop
              muted
              playsInline
              preload="metadata"
              className="w-full h-full object-cover"
            />
            {/* Fallback gradient if poster missing */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-surface to-ai-soft/10 pointer-events-none" />
          </div>

          {/* Right: Activity Cards (2x2 grid) */}
          <div className="grid grid-cols-2 gap-4">
            {/* Top row: A1, A2 */}
            <AnimatePresence mode="wait">
              {slots.A1 && (
                <motion.div
                  key={slots.A1}
                  initial={{ opacity: 0, y: -10, filter: "blur(2px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: 10, filter: "blur(2px)" }}
                  transition={{ duration: 0.2 }}
                  className="bg-surface border border-border rounded-xl p-4 h-[120px]"
                >
                  {(() => {
                    const event = getEvent(slots.A1);
                    if (!event) return null;
                    return (
                      <>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-base">{event.flag}</span>
                          <span className="text-sm font-medium text-text">{event.name}</span>
                          <span className="text-sm text-text-muted truncate">{event.action}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-text-subtle">{event.goal}</span>
                          {event.badge && (
                            <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${
                              event.badge === "AI" 
                                ? "bg-ai-soft text-ai" 
                                : "bg-surface-hover text-text-muted"
                            }`}>
                              {event.badge}
                            </span>
                          )}
                        </div>
                      </>
                    );
                  })()}
                </motion.div>
              )}
            </AnimatePresence>
            <AnimatePresence mode="wait">
              {slots.A2 && (
                <motion.div
                  key={slots.A2}
                  initial={{ opacity: 0, y: -10, filter: "blur(2px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: 10, filter: "blur(2px)" }}
                  transition={{ duration: 0.2 }}
                  className="bg-surface border border-border rounded-xl p-4 h-[120px]"
                >
                  {(() => {
                    const event = getEvent(slots.A2);
                    if (!event) return null;
                    return (
                      <>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-base">{event.flag}</span>
                          <span className="text-sm font-medium text-text">{event.name}</span>
                          <span className="text-sm text-text-muted truncate">{event.action}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-text-subtle">{event.goal}</span>
                          {event.badge && (
                            <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${
                              event.badge === "AI" 
                                ? "bg-ai-soft text-ai" 
                                : "bg-surface-hover text-text-muted"
                            }`}>
                              {event.badge}
                            </span>
                          )}
                        </div>
                      </>
                    );
                  })()}
                </motion.div>
              )}
            </AnimatePresence>
            {/* Bottom row: B1, B2 */}
            <AnimatePresence mode="wait">
              {slots.B1 && (
                <motion.div
                  key={slots.B1}
                  initial={{ opacity: 0, y: -10, filter: "blur(2px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: 10, filter: "blur(2px)" }}
                  transition={{ duration: 0.2 }}
                  className="bg-surface border border-border rounded-xl p-4 h-[120px]"
                >
                  {(() => {
                    const event = getEvent(slots.B1);
                    if (!event) return null;
                    return (
                      <>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-base">{event.flag}</span>
                          <span className="text-sm font-medium text-text">{event.name}</span>
                          <span className="text-sm text-text-muted truncate">{event.action}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-text-subtle">{event.goal}</span>
                          {event.badge && (
                            <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${
                              event.badge === "AI" 
                                ? "bg-ai-soft text-ai" 
                                : "bg-surface-hover text-text-muted"
                            }`}>
                              {event.badge}
                            </span>
                          )}
                        </div>
                      </>
                    );
                  })()}
                </motion.div>
              )}
            </AnimatePresence>
            <AnimatePresence mode="wait">
              {slots.B2 && (
                <motion.div
                  key={slots.B2}
                  initial={{ opacity: 0, y: -10, filter: "blur(2px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: 10, filter: "blur(2px)" }}
                  transition={{ duration: 0.2 }}
                  className="bg-surface border border-border rounded-xl p-4 h-[120px]"
                >
                  {(() => {
                    const event = getEvent(slots.B2);
                    if (!event) return null;
                    return (
                      <>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-base">{event.flag}</span>
                          <span className="text-sm font-medium text-text">{event.name}</span>
                          <span className="text-sm text-text-muted truncate">{event.action}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-text-subtle">{event.goal}</span>
                          {event.badge && (
                            <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${
                              event.badge === "AI" 
                                ? "bg-ai-soft text-ai" 
                                : "bg-surface-hover text-text-muted"
                            }`}>
                              {event.badge}
                            </span>
                          )}
                        </div>
                      </>
                    );
                  })()}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </Container>
    </section>
  );
}

// The Hybrid Protocol section
function HybridProtocolSection() {
  return (
    <section>
      <Container>
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <div>
            <H2 className="mb-3">The Hybrid Protocol</H2>
            <Paragraph className="text-lg">
              A coach-led process with smart support — built for consistency.
            </Paragraph>
          </div>

          {/* Animated SVG Characters */}
          <div className="flex items-center justify-center gap-8 py-8">
            {/* Coach - Premium badge with ring pulse */}
            <div className="flex flex-col items-center gap-2">
              <motion.div
                className="relative w-16 h-16"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3 }}
              >
                <motion.div
                  className="absolute inset-0 rounded-full border-2 border-primary"
                  animate={{
                    scale: [1, 1.08, 1],
                    opacity: [0.5, 0, 0.5],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  style={{
                    animationPlayState: typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'paused' : 'running'
                  }}
                />
                <div className="relative w-16 h-16 rounded-full bg-surface border-2 border-primary flex items-center justify-center">
                  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="16" cy="12" r="6" fill="currentColor" className="text-primary" />
                    <path d="M8 28c0-4.418 3.582-8 8-8s8 3.582 8 8" stroke="currentColor" strokeWidth="2" className="text-primary" />
                    <circle cx="22" cy="10" r="3" fill="currentColor" className="text-primary" />
                  </svg>
                </div>
              </motion.div>
              <span className="text-sm text-text-muted">Coach</span>
            </div>
            {/* Connection line Coach → You with energy flow */}
            <div className="flex-1 h-0.5 bg-border relative flex items-center">
              {/* Energy pulse from Coach to You */}
              <motion.div
                className="absolute h-1 w-8 rounded-full bg-gradient-to-r from-primary via-primary/80 to-transparent"
                animate={{
                  left: ["0%", "calc(100% - 1rem)"],
                  opacity: [1, 0.8, 0],
                }}
                transition={{
                  duration: 3.5,
                  repeat: Infinity,
                  ease: "linear",
                }}
                style={{
                  animationPlayState: typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'paused' : 'running',
                }}
              />
            </div>
            {/* You - Runner with improved SVG animation inside circle */}
            <div className="flex flex-col items-center gap-2">
              <div className="w-16 h-16 rounded-full bg-surface border border-border flex items-center justify-center overflow-hidden relative">
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Runner body - smooth up/down motion */}
                  <motion.g
                    animate={{
                      y: [0, -2.5, 0],
                    }}
                    transition={{
                      duration: 0.6,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    style={{
                      animationPlayState: typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'paused' : 'running',
                      transformOrigin: "16px 16px"
                    }}
                  >
                    {/* Head */}
                    <circle cx="16" cy="10" r="3" fill="currentColor" className="text-text" />
                    {/* Body */}
                    <rect x="14" y="13" width="4" height="6" rx="1" fill="currentColor" className="text-text" />
                    {/* Arms - subtle forward/back motion */}
                    <motion.g
                      animate={{
                        rotate: [-8, 8, -8],
                      }}
                      transition={{
                        duration: 0.6,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                      style={{
                        animationPlayState: typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'paused' : 'running',
                        transformOrigin: "16px 13px"
                      }}
                    >
                      <line x1="12" y1="13" x2="10" y2="9" stroke="currentColor" strokeWidth="1.5" className="text-text" strokeLinecap="round" />
                      <line x1="20" y1="13" x2="22" y2="9" stroke="currentColor" strokeWidth="1.5" className="text-text" strokeLinecap="round" />
                    </motion.g>
                  </motion.g>
                  {/* Legs - running motion synchronized with body */}
                  <motion.g
                    animate={{
                      rotate: [-15, 15, -15],
                    }}
                    transition={{
                      duration: 0.6,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    style={{
                      animationPlayState: typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'paused' : 'running',
                      transformOrigin: "16px 19px"
                    }}
                  >
                    <line x1="15" y1="19" x2="13" y2="24" stroke="currentColor" strokeWidth="2" className="text-text" strokeLinecap="round" />
                    <line x1="17" y1="19" x2="19" y2="24" stroke="currentColor" strokeWidth="2" className="text-text" strokeLinecap="round" />
                    <line x1="13" y1="24" x2="12" y2="28" stroke="currentColor" strokeWidth="2" className="text-text" strokeLinecap="round" />
                    <line x1="19" y1="24" x2="20" y2="28" stroke="currentColor" strokeWidth="2" className="text-text" strokeLinecap="round" />
                  </motion.g>
                  {/* Speed lines - subtle dynamic effect */}
                  <motion.g
                    animate={{
                      x: [0, 2, 0],
                      opacity: [0.3, 0.6, 0.3],
                    }}
                    transition={{
                      duration: 0.6,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    style={{
                      animationPlayState: typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'paused' : 'running'
                    }}
                  >
                    <line x1="22" y1="8" x2="24" y2="7" stroke="currentColor" strokeWidth="1" className="text-text-muted" strokeLinecap="round" />
                    <line x1="23" y1="12" x2="25" y2="11" stroke="currentColor" strokeWidth="1" className="text-text-muted" strokeLinecap="round" />
                    <line x1="24" y1="16" x2="26" y2="15" stroke="currentColor" strokeWidth="1" className="text-text-muted" strokeLinecap="round" />
                  </motion.g>
                </svg>
              </div>
              <span className="text-sm text-text-muted">You</span>
            </div>
            {/* Connection line AI → You with energy flow */}
            <div className="flex-1 h-0.5 bg-border relative flex items-center">
              {/* Energy pulse from AI to You */}
              <motion.div
                className="absolute h-1 w-8 rounded-full bg-gradient-to-l from-ai via-ai/80 to-transparent"
                animate={{
                  left: ["calc(100% - 1rem)", "0%"],
                  opacity: [1, 0.8, 0],
                }}
                transition={{
                  duration: 3.5,
                  repeat: Infinity,
                  ease: "linear",
                }}
                style={{
                  animationPlayState: typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'paused' : 'running',
                }}
              />
            </div>
            {/* AI - Robot face with blinking eyes + subtle eye shift */}
            <div className="flex flex-col items-center gap-2">
              <motion.div
                className="w-16 h-16 rounded-full bg-ai-soft border border-ai flex items-center justify-center"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3 }}
              >
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="8" y="8" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="2" className="text-ai" />
                  <motion.g
                    animate={{
                      x: [0, 0.5, 0],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    style={{
                      animationPlayState: typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'paused' : 'running'
                    }}
                  >
                    <motion.circle
                      cx="13"
                      cy="14"
                      r="2"
                      fill="currentColor"
                      className="text-ai"
                      animate={{
                        scaleY: [1, 0.1, 1],
                      }}
                      transition={{
                        duration: 0.3,
                        repeat: Infinity,
                        repeatDelay: 2.5,
                        ease: "easeInOut",
                      }}
                      style={{
                        animationPlayState: typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'paused' : 'running'
                      }}
                    />
                    <motion.circle
                      cx="19"
                      cy="14"
                      r="2"
                      fill="currentColor"
                      className="text-ai"
                      animate={{
                        scaleY: [1, 0.1, 1],
                      }}
                      transition={{
                        duration: 0.3,
                        repeat: Infinity,
                        repeatDelay: 2.5,
                        ease: "easeInOut",
                      }}
                      style={{
                        animationPlayState: typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'paused' : 'running'
                      }}
                    />
                  </motion.g>
                  <path d="M12 20h8" stroke="currentColor" strokeWidth="2" className="text-ai" />
                </svg>
              </motion.div>
              <span className="text-sm text-text-muted">AI</span>
            </div>
          </div>

          {/* Bullets - 6 items in 2 columns, centered */}
          <div className="flex justify-center">
            <ul className="grid md:grid-cols-2 gap-4 text-center max-w-3xl w-full">
              {[
                "Clear training structure",
                "Progression that makes sense",
                "Routine you can stick to",
                "Simple weekly checkpoints",
                "Instant explanations on demand",
                "Smart summaries and guidance",
              ].map((bullet, idx) => (
                <motion.li
                  key={idx}
                  className="flex items-center gap-3"
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.2, delay: idx * 0.05 }}
                >
                  <motion.span
                    className="text-primary shrink-0"
                    animate={{
                      opacity: [0.4, 1, 0.4],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    style={{
                      animationPlayState: typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'paused' : 'running'
                    }}
                  >
                    •
                  </motion.span>
                  <span>{bullet}</span>
                </motion.li>
              ))}
            </ul>
          </div>
        </div>
      </Container>
    </section>
  );
}

// Become a Coach section (mini CTA block, position #5)
function BecomeACoachSection() {
  return (
    <section>
      <Container>
        <div className="max-w-2xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3 }}
            className="bg-surface border border-border rounded-2xl p-8 md:p-12"
          >
            <H3 className="mb-3">Are you a coach?</H3>
            <Paragraph className="mb-6">
              Apply to join and build coach-led courses with AI support.
            </Paragraph>
            <Button variant="primary" size="lg" asChild>
              <Link href="/become-a-coach">Become a Coach</Link>
            </Button>
          </motion.div>
        </div>
      </Container>
    </section>
  );
}

// How it Works section (mini block + CTA)
function HowItWorksSection() {
  const steps = [
    { number: "1", title: "Choose your path", desc: "Find a coach or generate instantly with AI" },
    { number: "2", title: "Get your course", desc: "Receive a structured plan tailored to your goals" },
    { number: "3", title: "Start training", desc: "Follow your program with clear guidance" },
  ];

  return (
    <section>
      <Container>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <H2 className="mb-3">How it Works</H2>
            <Paragraph>Simple steps to get started</Paragraph>
          </div>
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {steps.map((step, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: idx * 0.1 }}
                className="text-center"
              >
                <div className="w-12 h-12 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold text-lg mx-auto mb-4">
                  {step.number}
                </div>
                <h3 className="font-semibold mb-2">{step.title}</h3>
                <p className="text-sm text-text-muted">{step.desc}</p>
              </motion.div>
            ))}
          </div>
          <div className="text-center">
            <Button variant="outline" asChild>
              <Link href="/how-it-works">Learn how it works</Link>
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}

// Coach Spotlight section (swiper on mobile, grid on desktop)
interface SpotlightCoach {
  id: string;
  slug: string;
  name: string;
  avatar: string;
  specialties: string[];
  rating?: number;
  coursesCount?: number;
  bio: string;
}

function CoachSpotlightSection() {
  const [coaches, setCoaches] = React.useState<SpotlightCoach[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetch("/api/spotlight/top-coaches")
      .then((res) => res.json())
      .then((data) => {
        setCoaches(data.coaches || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <section>
        <Container>
          <div className="text-center">
            <p className="text-text-muted">Loading coaches...</p>
          </div>
        </Container>
      </section>
    );
  }

  if (coaches.length === 0) {
    return (
      <section>
        <Container>
          <div className="text-center space-y-4">
            <H2>Coach Spotlight</H2>
            <Paragraph>Coaches coming soon</Paragraph>
            <Button variant="outline" asChild>
              <Link href="/contact">Contact Us</Link>
            </Button>
          </div>
        </Container>
      </section>
    );
  }

  return (
    <section>
      <Container>
        <div className="flex items-center justify-between mb-8">
          <div>
            <H2 className="mb-2">Coach Spotlight</H2>
            <Paragraph>Pick a coach that matches your style.</Paragraph>
          </div>
          <Link
            href="/coaches"
            className="text-sm text-primary hover:text-primary-hover transition-colors duration-fast"
          >
            See all coaches →
          </Link>
        </div>

        {/* Coach cards - grid on desktop, swiper on mobile (simplified for now) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {coaches.slice(0, 6).map((coach, idx) => (
            <Link key={coach.id} href={`/coaches/${coach.slug}`}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: idx * 0.1 }}
                whileHover={{ y: -4 }}
                className="bg-surface border border-border rounded-2xl p-6 hover:bg-surface-hover transition-colors duration-fast cursor-pointer h-full flex flex-col"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-surface-hover border border-border overflow-hidden shrink-0">
                    {coach.avatar ? (
                      <img 
                        src={coach.avatar} 
                        alt={coach.name} 
                        className="w-full h-full object-cover" 
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-text-muted">
                        {coach.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold truncate">{coach.name}</h3>
                    {coach.rating && (
                      <p className="text-sm text-text-muted">⭐ {coach.rating.toFixed(1)}</p>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {coach.specialties.slice(0, 3).map((tag: string) => (
                    <span
                      key={tag}
                      className="px-2.5 py-0.5 rounded-lg text-xs font-medium bg-surface-hover text-text-muted border border-border"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <p className="text-sm text-text-muted mb-4 line-clamp-2 flex-1">{coach.bio}</p>

                <div className="flex items-center justify-between mt-auto">
                  {coach.coursesCount && (
                    <span className="text-xs text-text-subtle">
                      {coach.coursesCount} {coach.coursesCount === 1 ? "course" : "courses"}
                    </span>
                  )}
                  {!coach.coursesCount && <span></span>}
                  <span className="text-sm font-medium text-primary hover:text-primary-hover transition-colors duration-fast">
                    View Profile →
                  </span>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}

// Quality Promise section (F3 - no modals, no adjustments window)
function QualityPromiseSection() {
  return (
    <section>
      <Container>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <H2 className="mb-3">Quality Promise</H2>
            <Paragraph className="text-lg">
              Clear outcomes, clear terms — so you always know what to expect.
            </Paragraph>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-surface border border-border rounded-2xl p-6">
              <h3 className="font-semibold mb-2">Structured Delivery</h3>
              <p className="text-sm text-text-muted">
                A complete course plan with modules, sessions, and clear weekly progression.
              </p>
            </div>
            <div className="bg-surface border border-border rounded-2xl p-6">
              <h3 className="font-semibold mb-2">Coach-led Standards</h3>
              <p className="text-sm text-text-muted">
                Consistent quality checklist across coach deliveries.
              </p>
            </div>
            <div className="bg-surface border border-border rounded-2xl p-6">
              <h3 className="font-semibold mb-2">Token Clarity</h3>
              <p className="text-sm text-text-muted">
                Transparent token pricing with predictable top-ups.
              </p>
            </div>
            <div className="bg-surface border border-border rounded-2xl p-6">
              <h3 className="font-semibold mb-2">Safety First</h3>
              <p className="text-sm text-text-muted">
                Clear training safety guidance and responsible use.
              </p>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

// Mini FAQ section (2 columns, animated accordion)
function MiniFAQSection() {
  const [faqs, setFaqs] = React.useState<import("@/lib/faq-data").FAQItem[]>([]);

  React.useEffect(() => {
    // Import MINI_FAQS from lib/faq-data
    import("@/lib/faq-data").then((module) => {
      setFaqs(module.MINI_FAQS);
    });
  }, []);

  if (faqs.length === 0) return null;

  // Convert to Accordion format
  const accordionItems = faqs.map((faq) => ({
    id: faq.id,
    title: faq.question,
    content: (
      <p className="text-sm text-text-muted">
        {faq.answer}
        {faq.id === "refund-policy" && (
          <> {' '}
            <Link href="/legal/refunds" className="text-primary hover:underline">
              Read our Refund Policy
            </Link>
            .
          </>
        )}
      </p>
    ),
  }));

  // Split into 2 columns
  const leftColumn = accordionItems.slice(0, Math.ceil(accordionItems.length / 2));
  const rightColumn = accordionItems.slice(Math.ceil(accordionItems.length / 2));

  return (
    <section>
      <Container>
        <div className="max-w-6xl mx-auto">
          <H2 className="mb-8 text-center">FAQ</H2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <Accordion items={leftColumn} allowMultiple />
            </div>
            <div>
              <Accordion items={rightColumn} allowMultiple />
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

/* ============================== Sections ============================== */

function Home({
  region,
  onTopUp,
}: {
  region: Region;
  onTopUp: (pack: UiPackId | "custom", customAmount?: number) => Promise<void>;
}) {
  // New Home page structure according to homepage_improvements.md
  return (
    <div className="space-y-16 md:space-y-24">
      {/* 1. Hero (video) */}
      <HeroSection />

      {/* 2. Marquee Advantages */}
      <MarqueeAdvantagesSection />

      {/* 3. Live Activity */}
      <LiveFeedSection />

      {/* 4. The Hybrid Protocol */}
      <HybridProtocolSection />

      {/* 5. Become a Coach */}
      <BecomeACoachSection />

      {/* 6. How it Works */}
      <HowItWorksSection />

      {/* 7. Coach Spotlight */}
      <CoachSpotlightSection />

      {/* 8. Quality Promise */}
      <QualityPromiseSection />

      {/* 6. Tokens & Pricing */}
      <section>
        <Container>
          <div className="space-y-6">
            <div>
              <H2 className="mb-2">Tokens & Pricing</H2>
              <Paragraph className="text-lg">Top up once — spend tokens on coach courses or instant AI.</Paragraph>
            </div>
            <Pricing
              region={region}
              requireAuth={false}
              openAuth={() => {}}
              onCustomTopUp={async (amt: number) => onTopUp("custom", amt)}
              onTierBuy={async (pack) => onTopUp(pack)}
              loading={false}
            />
          </div>
        </Container>
      </section>

      {/* 7. Mini FAQ */}
      <MiniFAQSection />
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

export default function ChaletcoachingPrototype() {
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
  
  // Убрали логику hash - теперь используем обычные роуты
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

  // Top up helper used across pages
  // Единый хендлер пополнения
  const { currency: currentCurrency, convertPrice } = useCurrencyStore();
  const onTopUp = React.useCallback(
    async (pack: UiPackId | "custom", customAmount?: number) => {
      console.log("onTopUp called with:", { pack, customAmount, isAuthed });

      if (!isAuthed) {
        console.log("User not authenticated, opening auth");
        openAuth("signup");
        return;
      }

      setTopUpLoading(true);
      try {
        console.log("Processing token topup");

        let packageId: string;
        let amount: number | undefined;
        const currency: "EUR" | "GBP" | "USD" = currentCurrency;

        if (pack === "custom") {
          // Custom Load: send ENTERPRISE with explicit amount
          packageId = "ENTERPRISE";
          amount = customAmount;
        } else {
          // Tier pack: get pack info and calculate amount
          const packInfo = TOKEN_PACKS.find(p => p.uiId === pack);
          if (!packInfo) {
            throw new Error("Invalid pack");
          }
          packageId = packInfo.apiId;
          // Calculate amount from tokens using current currency
          const priceInEUR = packInfo.tokens / TOKEN_RATES.EUR;
          // Convert to current currency
          amount = convertPrice(priceInEUR);
        }

        const res = await fetch("/api/tokens/topup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            packageId,
            currency,
            amount: amount?.toString(),
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
    [isAuthed, openAuth, currentCurrency, convertPrice, addToast, loadBalance]
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

  const router = useRouter();
  
  // Redirect handler for old hash routes (backward compatibility)
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.slice(1);
      if (hash === 'generator') {
        router.replace('/generator');
        return;
      } else if (hash === 'pricing') {
        router.replace('/pricing');
        return;
      }
    }
  }, [router]);
  
  const goTo = (pageId: NavId) => {
    if (requireAuthFor(pageId)) {
      openAuth("signin");
      return;
    }
    
    // Используем обычные роуты вместо hash
    if (pageId === 'generator') {
      router.push('/generator' as Route);
    } else if (pageId === 'pricing') {
      router.push('/pricing' as Route);
    } else if (pageId === 'home') {
      router.push('/' as Route);
    } else if (pageId === 'dashboard') {
      router.push('/dashboard' as Route);
    } else {
      setActive(pageId);
    }
  };

  return (
    <div className="min-h-screen bg-bg text-text">
      <SiteHeader
          onOpenAuth={openAuth} 
          onNavigate={(page: string) => goTo(page as NavId)}
        balance={balance}
        formatNumber={formatNumber}
        region={region}
        setRegion={setRegion}
        />
      
      <main className="py-8 md:py-12">

        {active === "home" && (
          <Home
            region={region}
            onTopUp={onTopUp}
          />
        )}
        {/* Generator and Pricing are now separate routes: /generator and /pricing */}
        {/* These sections are removed - redirect happens via useEffect */}
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
