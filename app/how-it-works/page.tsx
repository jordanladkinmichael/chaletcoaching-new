"use client";

import React, { useState, useEffect } from "react";
import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import {
  Check,
  Shield,
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
  Accordion,
  type AccordionItem,
} from "@/components/ui";
import { useCurrencyStore } from "@/lib/stores/currency-store";
import { cardHoverLift, fadeIn } from "@/lib/animations";
import { THEME } from "@/lib/theme";
import type { Route } from "next";

type Region = "EU" | "UK" | "US";

export default function HowItWorksPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { currency } = useCurrencyStore();
  const [balance, setBalance] = useState(0);
  const [balanceLoading, setBalanceLoading] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

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
    void signIn("credentials", { callbackUrl: "/how-it-works" });
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

  // Region setter (simplified - just update currency store)
  const setRegion = (newRegion: Region) => {
    const currencyMap: Record<Region, "EUR" | "GBP" | "USD"> = {
      EU: "EUR",
      UK: "GBP",
      US: "USD",
    };
    useCurrencyStore.getState().setCurrency(currencyMap[newRegion]);
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

  // FAQ items
  const faqItems: AccordionItem[] = [
    {
      id: "coach-vs-ai",
      title: "What is the difference between Coach requests and Instant AI?",
      content: (
        <div className="space-y-2">
          <p>
            Coach requests are personalized plans created by certified coaches based on your specific goals and preferences. 
            Instant AI plans are generated automatically in minutes using AI technology.
          </p>
          <p>
            Both options use tokens from your balance, but coach requests offer human expertise and personalized guidance, 
            while Instant AI provides immediate results.
          </p>
        </div>
      ),
    },
    {
      id: "how-tokens-work",
      title: "How do tokens work?",
      content: (
        <p>
          100 tokens = €1.00 | £0.87 | $1.19. You top up your balance once and spend tokens on coach requests or Instant AI plans. 
          Tokens remain in your balance until used.
        </p>
      ),
    },
    {
      id: "tokens-expire",
      title: "Do tokens expire?",
      content: (
        <p>
          Tokens remain in your balance until used. There is no expiration date.
        </p>
      ),
    },
    {
      id: "both-flows",
      title: "Can I use both flows with the same balance?",
      content: (
        <p>
          Yes. Your token balance works for both coach requests and Instant AI plans. You can use the same balance across all features.
        </p>
      ),
    },
    {
      id: "insufficient-tokens",
      title: "What happens if I don't have enough tokens?",
      content: (
        <div className="space-y-2">
          <p>
            If you don&apos;t have enough tokens, you&apos;ll see a message indicating insufficient balance. 
            You can top up your tokens at any time from the Pricing page.
          </p>
          <p>
            For Instant AI, you can generate a preview (50 tokens) to see the plan before committing to the full cost.
          </p>
        </div>
      ),
    },
    {
      id: "where-find-plans",
      title: "Where do I find my plans?",
      content: (
        <p>
          All your plans, both coach requests and Instant AI plans, are available in your Dashboard. 
          You can view, download, and track your progress there.
        </p>
      ),
    },
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
        {/* Hero Section */}
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
                <H1>How it works</H1>
                <Paragraph className="text-lg">
                  Choose a coach-led request or generate an Instant AI plan. Tokens power both.
                </Paragraph>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button variant="primary" asChild>
                    <Link href="/coaches">Browse coaches</Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href="/generator">Open generator</Link>
                  </Button>
                </div>
              </div>

              {/* Hero Image */}
              <div className="relative aspect-video rounded-2xl overflow-hidden border" style={{ borderColor: THEME.cardBorder }}>
                <Image
                  src="/how_it_works_hero.webp"
                  alt="Coach-led and Instant AI training flows"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority
                />
              </div>
            </motion.div>
          </Container>
        </section>

        {/* Choose your path (2 cards) */}
        <section className="py-12 md:py-16">
          <Container>
            <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
              {/* Card A: Coach request */}
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={prefersReducedMotion ? fadeIn : cardHoverLift}
                whileHover={prefersReducedMotion ? undefined : { y: -2 }}
              >
                <Card className="h-full flex flex-col">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-3xl">🧑‍🏫</span>
                    <H3>Coach-built request</H3>
                  </div>
                  <Paragraph className="mb-6 flex-1">
                    Tell your coach your goal and preferences. Your plan is tailored to your request.
                  </Paragraph>
                  <div className="relative aspect-video rounded-xl overflow-hidden border mb-6" style={{ borderColor: THEME.cardBorder }}>
                    <Image
                      src="/how_it_works_path_coach.webp"
                      alt="Coach-built request"
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  </div>
                  <Button variant="primary" asChild>
                    <Link href="/coaches">Find a coach</Link>
                  </Button>
                </Card>
              </motion.div>

              {/* Card B: Instant AI */}
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={prefersReducedMotion ? fadeIn : cardHoverLift}
                whileHover={prefersReducedMotion ? undefined : { y: -2 }}
              >
                <Card className="h-full flex flex-col">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-3xl">⚡</span>
                    <H3>Instant AI plan</H3>
                  </div>
                  <Paragraph className="mb-6 flex-1">
                    Generate a plan in minutes. Preview first, then publish when ready.
                  </Paragraph>
                  <div className="relative aspect-video rounded-xl overflow-hidden border mb-6" style={{ borderColor: THEME.cardBorder }}>
                    <Image
                      src="/how_it_works_path_ai.webp"
                      alt="Instant AI plan generation"
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  </div>
                  <Button variant="ai" asChild>
                    <Link href="/generator">Generate now</Link>
                  </Button>
                </Card>
              </motion.div>
            </div>
          </Container>
        </section>

        {/* How Coach requests work (steps) */}
        <section className="py-12 md:py-16">
          <Container>
            <div className="max-w-4xl mx-auto">
              <H2 className="mb-8 text-center">How Coach requests work</H2>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { emoji: "🔎", title: "Pick a coach" },
                  { emoji: "📝", title: "Send your request" },
                  { emoji: "🧩", title: "Your plan is prepared" },
                  { emoji: "📊", title: "Track it in your dashboard" },
                ].map((step, idx) => (
                  <motion.div
                    key={idx}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={sectionVariants}
                    transition={{ delay: idx * 0.1 }}
                    className="text-center"
                  >
                    <div className="text-4xl mb-3">{step.emoji}</div>
                    <H3 className="text-lg mb-2">{step.title}</H3>
                  </motion.div>
                ))}
              </div>
            </div>
          </Container>
        </section>

        {/* How Instant AI works (steps) */}
        <section className="py-12 md:py-16">
          <Container>
            <div className="max-w-4xl mx-auto">
              <H2 className="mb-8 text-center">How Instant AI works</H2>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { emoji: "🎛️", title: "Choose training inputs" },
                  { emoji: "👀", title: "Generate a preview (50 tokens)" },
                  { emoji: "✅", title: "Publish your full plan" },
                  { emoji: "⬇️", title: "Download and train" },
                ].map((step, idx) => (
                  <motion.div
                    key={idx}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={sectionVariants}
                    transition={{ delay: idx * 0.1 }}
                    className="text-center"
                  >
                    <div className="text-4xl mb-3">{step.emoji}</div>
                    <H3 className="text-lg mb-2">{step.title}</H3>
                  </motion.div>
                ))}
              </div>
            </div>
          </Container>
        </section>

        {/* What you receive */}
        <section className="py-12 md:py-16">
          <Container>
            <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-center">
              <div className="relative aspect-video rounded-2xl overflow-hidden border" style={{ borderColor: THEME.cardBorder }}>
                <Image
                  src="/how_it_works_receive.webp"
                  alt="Example training plan output"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
              <div>
                <H2 className="mb-6">What you receive</H2>
                <ul className="space-y-4">
                  {[
                    "Clear weekly structure and progression",
                    "Session-by-session training plan",
                    "Exercise guidance and alternatives",
                    "Intensity and recovery recommendations",
                    "Equipment-aware options",
                    "Printable and downloadable format",
                  ].map((item, idx) => (
                    <motion.li
                      key={idx}
                      initial="hidden"
                      whileInView="visible"
                      viewport={{ once: true }}
                      variants={sectionVariants}
                      transition={{ delay: idx * 0.05 }}
                      className="flex items-start gap-3"
                    >
                      <Check className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>
            </div>
          </Container>
        </section>

        {/* Tokens & payments */}
        <section className="py-12 md:py-16">
          <Container>
            <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-center">
              <div>
                <H2 className="mb-4">Tokens and payments</H2>
                <Paragraph className="mb-6">
                  100 tokens = €1.00 | £0.87 | $1.19
                </Paragraph>
                <Button variant="outline" asChild>
                  <Link href="/pricing">See pricing</Link>
                </Button>
              </div>
              <div className="relative aspect-video rounded-2xl overflow-hidden border" style={{ borderColor: THEME.cardBorder }}>
                <Image
                  src="/how_it_works_tokens.webp"
                  alt="Tokens and secure payments"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            </div>
          </Container>
        </section>

        {/* Trust & Safety */}
        <section className="py-12 md:py-16">
          <Container>
            <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-center">
              <div className="relative aspect-video rounded-2xl overflow-hidden border" style={{ borderColor: THEME.cardBorder }}>
                <Image
                  src="/how_it_works_trust.webp"
                  alt="Trust and safety"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
              <div>
                <H2 className="mb-6">Trust and safety</H2>
                <ul className="space-y-4">
                  {[
                    "Training guidance is informational and not medical advice.",
                    "Stop if you feel pain and consult a professional if needed.",
                    "Beginner-friendly options are available.",
                  ].map((item, idx) => (
                    <motion.li
                      key={idx}
                      initial="hidden"
                      whileInView="visible"
                      viewport={{ once: true }}
                      variants={sectionVariants}
                      transition={{ delay: idx * 0.05 }}
                      className="flex items-start gap-3"
                    >
                      <Shield className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>
            </div>
          </Container>
        </section>

        {/* FAQ */}
        <section className="py-12 md:py-16">
          <Container>
            <div className="max-w-3xl mx-auto">
              <H2 className="mb-8 text-center">FAQ</H2>
              <Accordion items={faqItems} allowMultiple={false} />
            </div>
          </Container>
        </section>

        {/* CTA Strip */}
        <section className="py-12 md:py-16">
          <Container>
            <div className="max-w-2xl mx-auto text-center space-y-6">
              <H2>Ready to start?</H2>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button variant="primary" asChild>
                  <Link href="/coaches">Browse coaches</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/generator">Open generator</Link>
                </Button>
              </div>
            </div>
          </Container>
        </section>
      </main>

      <SiteFooter onNavigate={handleNavigate} />
    </div>
  );
}
