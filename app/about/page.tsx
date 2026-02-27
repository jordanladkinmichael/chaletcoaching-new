"use client";

import React, { useState, useEffect } from "react";
import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import {
  Users,
  Zap,
  Coins,
  UserRound,
  AlignLeft,
  Shield,
  BadgeCheck,
  Clock,
  Copy,
  Check,
} from "lucide-react";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";
import {
  Container,
  H1,
  H2,
  H3,
  Paragraph,
  Button,
  Card,
  ToastContainer,
  type Toast,
  type ToastType,
} from "@/components/ui";
import { useCurrencyStore } from "@/lib/stores/currency-store";
import { cardHoverLift, fadeIn } from "@/lib/animations";
import { THEME } from "@/lib/theme";
import type { Route } from "next";

type Region = "EU" | "UK" | "US";

export default function AboutPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { currency } = useCurrencyStore();
  const [balance, setBalance] = useState(0);
  const [balanceLoading, setBalanceLoading] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [heroImageExists, setHeroImageExists] = useState(true);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Determine region from currency
  const region: Region = currency === "USD" ? "US" : currency === "GBP" ? "UK" : "EU";

  const isAuthed = !!session?.user;

  // Check for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);
    const handleChange = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  // Check if hero image exists
  useEffect(() => {
    const checkImage = async () => {
      try {
        const response = await fetch("/about_hero.webp", { method: "HEAD" });
        setHeroImageExists(response.ok);
      } catch {
        setHeroImageExists(false);
      }
    };
    void checkImage();
  }, []);

  // Load balance
  useEffect(() => {
    async function load() {
      if (!isAuthed) {
        setBalance(0);
        return;
      }
      setBalanceLoading(true);
      try {
        const res = await fetch("/api/tokens/balance");
        if (!res.ok) {
          setBalance(0);
          return;
        }
        const data: { balance?: number } = await res.json();
        setBalance(data.balance ?? 0);
      } catch {
        setBalance(0);
      } finally {
        setBalanceLoading(false);
      }
    }
    void load();
  }, [isAuthed]);

  // Auth handler
  const openAuth = () => {
    void signIn("credentials", { callbackUrl: "/about" });
  };

  // Navigation handler
  const handleNavigate = (page: string) => {
    const target =
      page === "home"
        ? "/"
        : page.startsWith("/")
          ? page
          : `/${page}`;
    router.push(target as Route);
  };

  // Format number helper
  const formatNumber = (n: number) => n.toLocaleString();

  // Region setter
  const setRegion = (newRegion: Region) => {
    const currencyMap: Record<Region, "EUR" | "GBP" | "USD"> = {
      EU: "EUR",
      UK: "GBP",
      US: "USD",
    };
    useCurrencyStore.getState().setCurrency(currencyMap[newRegion]);
  };

  // Toast helpers
  const addToast = (type: ToastType, title: string, message?: string, duration?: number) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, type, title, message, duration }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Copy to clipboard
  const copyToClipboard = async (text: string, fieldId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldId);
      addToast("success", "Copied", undefined, 2000);
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      addToast("error", "Failed to copy", "Please try again", 3000);
    }
  };

  // Animation variants
  const sectionVariants: Variants = prefersReducedMotion
    ? fadeIn
    : {
        hidden: { opacity: 0, y: 8 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.18, ease: [0.2, 0.8, 0.2, 1] as const },
        },
      };

  // Company details
  const companyDetails = [
    { id: "name", label: "Company name", value: "CHALET AQUARIUS LTD" },
    { id: "number", label: "Company number", value: "15587263" },
    { id: "address", label: "Address", value: "20 Wenlock Road, London, England, N1 7GU" },
    { id: "phone", label: "Phone", value: "+44 7441 392840" },
    { id: "email", label: "Email", value: "info@chaletcoaching.co.uk" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-bg text-text">
      <SiteHeader
        onOpenAuth={openAuth}
        onNavigate={handleNavigate}
        balance={balance}
        balanceLoading={balanceLoading}
        formatNumber={formatNumber}
        region={region}
        setRegion={setRegion}
      />

      <main className="flex-1">
        {/* Hero */}
        <section className="py-12 md:py-16">
          <Container>
            <motion.div
              initial="hidden"
              animate="visible"
              variants={sectionVariants}
              className="grid md:grid-cols-2 gap-8 lg:gap-12 items-center"
            >
              {/* Content */}
              <div className="space-y-6">
                <H1>About Chalet Coaching</H1>
                <Paragraph className="text-lg">
                  Coach-led training plans with an optional Instant AI flow. Clear, structured, and built for real progress.
                </Paragraph>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button variant="primary" asChild>
                    <Link href="/coaches">Meet our coaches</Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href="/how-it-works">How it works</Link>
                  </Button>
                </div>
              </div>

              {/* Hero Image or Placeholder */}
              {heroImageExists ? (
                <div className="relative aspect-video rounded-2xl overflow-hidden border" style={{ borderColor: THEME.cardBorder }}>
                  <Image
                    src="/about_hero.webp"
                    alt="Coach-led training, enhanced by smart tooling"
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                    priority
                  />
                </div>
              ) : (
                <Card className="aspect-video flex flex-col items-center justify-center p-8 text-center border-2 border-dashed" style={{ borderColor: THEME.cardBorder }}>
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
                    style={{
                      background: `linear-gradient(135deg, ${THEME.accent}20, ${THEME.accent}10)`,
                    }}
                  >
                    <Shield className="w-8 h-8" style={{ color: THEME.accent }} />
                  </div>
                  <H3 className="mb-2">Coach-first platform</H3>
                  <Paragraph className="text-sm opacity-70 mb-0">
                    Add /public/about_hero.webp to replace this visual.
                  </Paragraph>
                </Card>
              )}
            </motion.div>
          </Container>
        </section>

        {/* What we do */}
        <section className="py-12 md:py-16">
          <Container>
            <motion.div
              initial="hidden"
              animate="visible"
              variants={sectionVariants}
            >
              <H2 className="mb-8 text-center">What we do</H2>
              <div className="grid md:grid-cols-3 gap-6">
                {/* Coach-first plans */}
                <motion.div
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={prefersReducedMotion ? fadeIn : cardHoverLift}
                  whileHover={prefersReducedMotion ? undefined : { y: -2 }}
                >
                  <Card className="h-full flex flex-col">
                    <div className="flex items-center gap-3 mb-4">
                      <div
                        className="w-12 h-12 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${THEME.accent}20` }}
                      >
                        <Users className="w-6 h-6" style={{ color: THEME.accent }} />
                      </div>
                      <H3>Coach-first plans</H3>
                    </div>
                    <Paragraph className="mb-0">
                      Choose a coach and submit your training request.
                    </Paragraph>
                  </Card>
                </motion.div>

                {/* Instant AI option */}
                <motion.div
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={prefersReducedMotion ? fadeIn : cardHoverLift}
                  whileHover={prefersReducedMotion ? undefined : { y: -2 }}
                >
                  <Card className="h-full flex flex-col">
                    <div className="flex items-center gap-3 mb-4">
                      <div
                        className="w-12 h-12 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${THEME.accent}20` }}
                      >
                        <Zap className="w-6 h-6" style={{ color: THEME.accent }} />
                      </div>
                      <H3>Instant AI option</H3>
                    </div>
                    <Paragraph className="mb-0">
                      Generate a plan in minutes when you need speed.
                    </Paragraph>
                  </Card>
                </motion.div>

                {/* Tokens power everything */}
                <motion.div
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={prefersReducedMotion ? fadeIn : cardHoverLift}
                  whileHover={prefersReducedMotion ? undefined : { y: -2 }}
                >
                  <Card className="h-full flex flex-col">
                    <div className="flex items-center gap-3 mb-4">
                      <div
                        className="w-12 h-12 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${THEME.accent}20` }}
                      >
                        <Coins className="w-6 h-6" style={{ color: THEME.accent }} />
                      </div>
                      <H3>Tokens power everything</H3>
                    </div>
                    <Paragraph className="mb-0">
                      One balance you can use across both flows.
                    </Paragraph>
                  </Card>
                </motion.div>
              </div>
            </motion.div>
          </Container>
        </section>

        {/* How the platform works */}
        <section className="py-12 md:py-16">
          <Container>
            <motion.div
              initial="hidden"
              animate="visible"
              variants={sectionVariants}
            >
              <H2 className="mb-8 text-center">How the platform works</H2>
              <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
                {/* Coach-built requests */}
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <UserRound className="w-6 h-6" style={{ color: THEME.accent }} />
                    <H3>Coach-built requests</H3>
                  </div>
                  <ol className="space-y-4 mb-6">
                    <li className="flex gap-3">
                      <span className="font-semibold text-accent flex-shrink-0">1.</span>
                      <Paragraph className="mb-0">Pick a coach</Paragraph>
                    </li>
                    <li className="flex gap-3">
                      <span className="font-semibold text-accent flex-shrink-0">2.</span>
                      <Paragraph className="mb-0">Send your request</Paragraph>
                    </li>
                    <li className="flex gap-3">
                      <span className="font-semibold text-accent flex-shrink-0">3.</span>
                      <Paragraph className="mb-0">Receive and track your plan in your dashboard</Paragraph>
                    </li>
                  </ol>
                  <Button variant="outline" asChild>
                    <Link href="/coaches">Explore coaches</Link>
                  </Button>
                </div>

                {/* Instant AI generator */}
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <Zap className="w-6 h-6" style={{ color: THEME.accent }} />
                    <H3>Instant AI generator</H3>
                  </div>
                  <ol className="space-y-4 mb-6">
                    <li className="flex gap-3">
                      <span className="font-semibold text-accent flex-shrink-0">1.</span>
                      <Paragraph className="mb-0">Choose inputs</Paragraph>
                    </li>
                    <li className="flex gap-3">
                      <span className="font-semibold text-accent flex-shrink-0">2.</span>
                      <Paragraph className="mb-0">Preview</Paragraph>
                    </li>
                    <li className="flex gap-3">
                      <span className="font-semibold text-accent flex-shrink-0">3.</span>
                      <Paragraph className="mb-0">Publish and download</Paragraph>
                    </li>
                  </ol>
                  <Button variant="outline" asChild>
                    <Link href="/generator">Try the AI generator</Link>
                  </Button>
                </div>
              </div>
            </motion.div>
          </Container>
        </section>

        {/* Our principles */}
        <section className="py-12 md:py-16">
          <Container>
            <motion.div
              initial="hidden"
              animate="visible"
              variants={sectionVariants}
            >
              <H2 className="mb-8 text-center">Our principles</H2>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Clarity over hype */}
                <motion.div
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={prefersReducedMotion ? fadeIn : cardHoverLift}
                  whileHover={prefersReducedMotion ? undefined : { y: -2 }}
                >
                  <Card className="h-full">
                    <div className="flex items-start gap-3 mb-3">
                      <AlignLeft className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: THEME.accent }} />
                      <H3 className="text-lg">Clarity over hype</H3>
                    </div>
                    <Paragraph className="text-sm mb-0">
                      We focus on clear, actionable guidance instead of marketing fluff.
                    </Paragraph>
                  </Card>
                </motion.div>

                {/* Safety first */}
                <motion.div
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={prefersReducedMotion ? fadeIn : cardHoverLift}
                  whileHover={prefersReducedMotion ? undefined : { y: -2 }}
                >
                  <Card className="h-full">
                    <div className="flex items-start gap-3 mb-3">
                      <Shield className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: THEME.accent }} />
                      <H3 className="text-lg">Safety first</H3>
                    </div>
                    <Paragraph className="text-sm mb-0">
                      Training guidance is informational and should be used responsibly.
                    </Paragraph>
                  </Card>
                </motion.div>

                {/* Coach-led accountability */}
                <motion.div
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={prefersReducedMotion ? fadeIn : cardHoverLift}
                  whileHover={prefersReducedMotion ? undefined : { y: -2 }}
                >
                  <Card className="h-full">
                    <div className="flex items-start gap-3 mb-3">
                      <BadgeCheck className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: THEME.accent }} />
                      <H3 className="text-lg">Coach-led accountability</H3>
                    </div>
                    <Paragraph className="text-sm mb-0">
                      Coaches provide personalized guidance and help you stay on track.
                    </Paragraph>
                  </Card>
                </motion.div>

                {/* Respect for your time */}
                <motion.div
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={prefersReducedMotion ? fadeIn : cardHoverLift}
                  whileHover={prefersReducedMotion ? undefined : { y: -2 }}
                >
                  <Card className="h-full">
                    <div className="flex items-start gap-3 mb-3">
                      <Clock className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: THEME.accent }} />
                      <H3 className="text-lg">Respect for your time</H3>
                    </div>
                    <Paragraph className="text-sm mb-0">
                      We value efficiency and deliver plans that fit your schedule.
                    </Paragraph>
                  </Card>
                </motion.div>
              </div>
            </motion.div>
          </Container>
        </section>

        {/* Trust & safety callout */}
        <section className="py-12 md:py-16">
          <Container>
            <motion.div
              initial="hidden"
              animate="visible"
              variants={sectionVariants}
              className="max-w-3xl mx-auto"
            >
              <Card className="text-center">
                <H2 className="mb-4">Trust and safety</H2>
                <Paragraph className="mb-6">
                  Training guidance is informational and should be used responsibly. If you have a condition or injury, consult a qualified professional.
                </Paragraph>
                <Button variant="outline" asChild>
                  <Link href="/trust-safety">Read trust and safety</Link>
                </Button>
              </Card>
            </motion.div>
          </Container>
        </section>

        {/* Company details */}
        <section className="py-12 md:py-16">
          <Container>
            <motion.div
              initial="hidden"
              animate="visible"
              variants={sectionVariants}
              className="max-w-2xl mx-auto"
            >
              <H2 className="mb-6 text-center">Company details</H2>
              <Card>
                <div className="space-y-4">
                  {companyDetails.map((detail) => (
                    <div
                      key={detail.id}
                      className="flex items-center justify-between gap-4 py-2 border-b last:border-b-0"
                      style={{ borderColor: THEME.cardBorder }}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="text-sm opacity-70 mb-1">{detail.label}</div>
                        <div className="font-medium break-words">
                          {detail.id === "email" ? (
                            <Link
                              href={`mailto:${detail.value}`}
                              className="hover:opacity-80 transition-opacity underline"
                            >
                              {detail.value}
                            </Link>
                          ) : (
                            detail.value
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => copyToClipboard(detail.value, detail.id)}
                        className="flex-shrink-0 p-2 rounded-lg hover:bg-surface-hover transition-colors"
                        aria-label={`Copy ${detail.label}`}
                      >
                        {copiedField === detail.id ? (
                          <Check className="w-4 h-4 text-accent" />
                        ) : (
                          <Copy className="w-4 h-4 opacity-70" />
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>
          </Container>
        </section>

        {/* CTA strip */}
        <section className="py-12 md:py-16">
          <Container>
            <motion.div
              initial="hidden"
              animate="visible"
              variants={sectionVariants}
              className="max-w-3xl mx-auto text-center"
            >
              <H2 className="mb-4">Get started today</H2>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button variant="primary" asChild>
                  <Link href="/coaches">Meet our coaches</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/pricing">See pricing</Link>
                </Button>
              </div>
            </motion.div>
          </Container>
        </section>
      </main>

      <SiteFooter onNavigate={handleNavigate} />
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  );
}
