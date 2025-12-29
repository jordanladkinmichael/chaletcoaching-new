"use client";

import React, { useState, useEffect } from "react";
import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import {
  Check,
  Calendar,
  Dumbbell,
  HelpCircle,
  Activity,
  Wrench,
  Download,
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

export default function WhatYouReceivePage() {
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
    void signIn("credentials", { callbackUrl: "/what-you-receive" });
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

  // "At a glance" items with icons
  const atAGlanceItems = [
    { icon: Calendar, label: "Weekly structure and progression" },
    { icon: Dumbbell, label: "Session-by-session workouts" },
    { icon: HelpCircle, label: "Exercise guidance and alternatives" },
    { icon: Activity, label: "Intensity and recovery recommendations" },
    { icon: Wrench, label: "Equipment-aware options" },
    { icon: Download, label: "Printable and downloadable format" },
  ];

  // FAQ items
  const faqItems: AccordionItem[] = [
    {
      id: "what-included",
      title: "What's included in a plan?",
      content: (
        <div className="space-y-2">
          <p>
            Each plan includes a weekly structure with clear progression, session-by-session workouts, 
            exercise guidance with alternatives, intensity and recovery recommendations, equipment-aware options, 
            and a printable format you can download.
          </p>
        </div>
      ),
    },
    {
      id: "suitable-beginners",
      title: "Is this suitable for beginners?",
      content: (
        <p>
          Yes. Plans include beginner-friendly defaults and you can choose your level when requesting a coach course 
          or generating an Instant AI plan. The structure adapts to your experience level.
        </p>
      ),
    },
    {
      id: "choose-equipment",
      title: "Can I choose equipment and training type?",
      content: (
        <p>
          Yes. You can select your equipment setup (none, basic, or full gym) and training type (home, gym, or mixed) 
          when creating your request or generating your plan.
        </p>
      ),
    },
    {
      id: "instant-ai-previews",
      title: "How do Instant AI previews work?",
      content: (
        <p>
          Instant AI previews cost 50 tokens. You can generate a preview to see the plan structure before committing 
          to the full plan cost. If you&apos;re satisfied, you can publish the full plan.
        </p>
      ),
    },
    {
      id: "same-tokens",
      title: "Can I use the same tokens for both flows?",
      content: (
        <p>
          Yes. Your token balance works for both coach requests and Instant AI plans. You can use the same balance 
          across all features on the platform.
        </p>
      ),
    },
    {
      id: "access-plans",
      title: "Where can I access my plans?",
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
                <H1>What you receive</H1>
                <Paragraph className="text-lg">
                  A clear training plan you can follow. Built by a coach or generated instantly with AI.
                </Paragraph>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button variant="primary" asChild>
                    <Link href="/coaches">Browse coaches</Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href="/generator">Open generator</Link>
                  </Button>
                </div>
                <div>
                  <Link
                    href="/pricing"
                    className="text-sm text-text-muted hover:text-accent transition-colors underline"
                  >
                    See pricing
                  </Link>
                </div>
              </div>

              {/* Hero Image */}
              <div className="relative aspect-video rounded-2xl overflow-hidden border" style={{ borderColor: THEME.cardBorder }}>
                <Image
                  src="/what_you_receive_hero.webp"
                  alt="Training plan outputs overview"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority
                />
              </div>
            </motion.div>
          </Container>
        </section>

        {/* At a glance (6 items) */}
        <section className="py-12 md:py-16">
          <Container>
            <H2 className="mb-8 text-center">At a glance</H2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {atAGlanceItems.map((item, idx) => {
                const IconComponent = item.icon;
                return (
                  <motion.div
                    key={idx}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={sectionVariants}
                    transition={{ delay: idx * 0.05 }}
                    className="flex items-start gap-4"
                  >
                    <div className="rounded-lg p-3 border" style={{ borderColor: THEME.cardBorder }}>
                      <IconComponent className="w-6 h-6 text-accent" />
                    </div>
                    <div className="flex-1">
                      <Paragraph className="font-medium">{item.label}</Paragraph>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </Container>
        </section>

        {/* What's inside the plan (3 cards) */}
        <section className="py-12 md:py-16">
          <Container>
            <H2 className="mb-8 text-center">What&apos;s inside the plan</H2>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  title: "Structure",
                  text: "A weekly plan with progression that matches your goal and level.",
                },
                {
                  title: "Sessions",
                  text: "Warm-up, main work, accessories, and cooldown.",
                },
                {
                  title: "Progression",
                  text: "Clear progression rules so you always know what to increase next.",
                },
              ].map((card, idx) => (
                <motion.div
                  key={idx}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={prefersReducedMotion ? fadeIn : cardHoverLift}
                  whileHover={prefersReducedMotion ? undefined : { y: -2 }}
                >
                  <Card className="h-full">
                    <H3 className="mb-3">{card.title}</H3>
                    <Paragraph className="text-text-muted">{card.text}</Paragraph>
                  </Card>
                </motion.div>
              ))}
            </div>
          </Container>
        </section>

        {/* Examples of outputs */}
        <section className="py-12 md:py-16">
          <Container>
            <H2 className="mb-8 text-center">Examples of outputs</H2>
            <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-center mb-8">
              <div className="relative aspect-[3/2] rounded-2xl overflow-hidden border" style={{ borderColor: THEME.cardBorder }}>
                <Image
                  src="/what_you_receive_examples.webp"
                  alt="Examples of weekly and session views"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
              <div className="space-y-4">
                {[
                  {
                    title: "Week view",
                    description: "Overview of your weekly schedule with progression indicators and session distribution.",
                  },
                  {
                    title: "Session view",
                    description: "Detailed breakdown of each workout including warm-up, main exercises, and cooldown.",
                  },
                  {
                    title: "Exercise alternatives",
                    description: "Equipment-aware alternatives for each exercise to match your setup and preferences.",
                  },
                ].map((preview, idx) => (
                  <motion.div
                    key={idx}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={sectionVariants}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <Card>
                      <H3 className="mb-2 text-lg">{preview.title}</H3>
                      <Paragraph className="text-sm text-text-muted">{preview.description}</Paragraph>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </Container>
        </section>

        {/* Coach-built vs Instant AI */}
        <section className="py-12 md:py-16">
          <Container>
            <H2 className="mb-8 text-center">Coach-built vs Instant AI</H2>
            <div className="relative aspect-[3/2] rounded-2xl overflow-hidden border mb-8" style={{ borderColor: THEME.cardBorder }}>
              <Image
                src="/what_you_receive_compare.webp"
                alt="Coach-built and Instant AI comparison"
                fill
                className="object-cover"
                sizes="100vw"
              />
            </div>
            <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
              {/* Coach-built */}
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={sectionVariants}
              >
                <Card className="h-full">
                  <H3 className="mb-4">Coach-built request</H3>
                  <ul className="space-y-3 mb-6">
                    {[
                      "Tailored to your preferences",
                      "Structured progression based on your inputs",
                      "Great when you want a coach-led approach",
                    ].map((item, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                        <span className="text-text-muted">{item}</span>
                      </li>
                    ))}
                  </ul>
                  <Button variant="primary" asChild>
                    <Link href="/coaches">Find a coach</Link>
                  </Button>
                </Card>
              </motion.div>

              {/* Instant AI */}
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={sectionVariants}
                transition={{ delay: 0.1 }}
              >
                <Card className="h-full">
                  <H3 className="mb-4">Instant AI</H3>
                  <ul className="space-y-3 mb-6">
                    {[
                      "Generate in minutes",
                      "Preview first, then publish",
                      "Perfect for quick iteration",
                    ].map((item, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                        <span className="text-text-muted">{item}</span>
                      </li>
                    ))}
                  </ul>
                  <Button variant="ai" asChild>
                    <Link href="/generator">Generate now</Link>
                  </Button>
                </Card>
              </motion.div>
            </div>
          </Container>
        </section>

        {/* Formats and access */}
        <section className="py-12 md:py-16">
          <Container>
            <H2 className="mb-8 text-center">Formats and access</H2>
            <div className="max-w-2xl mx-auto">
              <Card>
                <ul className="space-y-4">
                  {[
                    "Available in your dashboard",
                    "Downloadable and printable",
                    "Easy to revisit and regenerate",
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
                      <span className="text-text-muted">{item}</span>
                    </motion.li>
                  ))}
                </ul>
              </Card>
            </div>
          </Container>
        </section>

        {/* Quality promise */}
        <section className="py-12 md:py-16">
          <Container>
            <H2 className="mb-8 text-center">Quality promise</H2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {[
                "Clear structure",
                "Progressive overload guidance",
                "Equipment-aware options",
                "Beginner-friendly defaults",
              ].map((item, idx) => (
                <motion.div
                  key={idx}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={sectionVariants}
                  transition={{ delay: idx * 0.05 }}
                >
                  <Card>
                    <Paragraph className="font-medium">{item}</Paragraph>
                  </Card>
                </motion.div>
              ))}
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
