"use client";

import React, { useState, useEffect } from "react";
import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import {
  Shield,
  Info,
  User,
  AlertCircle,
  AlertTriangle,
  GraduationCap,
} from "lucide-react";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";
import {
  Container,
  H1,
  H2,
  Paragraph,
  Button,
  Card,
  Accordion,
  type AccordionItem,
} from "@/components/ui";
import { useCurrencyStore } from "@/lib/stores/currency-store";
import { fadeIn } from "@/lib/animations";
import { THEME } from "@/lib/theme";
import type { Route } from "next";

type Region = "EU" | "UK" | "US";

export default function TrustSafetyPage() {
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
  const openAuth = (mode?: "signup" | "signin") => {
    void signIn("credentials", { callbackUrl: "/trust-safety" });
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
      id: "medical-advice",
      title: "Is this medical advice?",
      content: (
        <p>
          No. The content is informational and not a substitute for licensed medical care.
        </p>
      ),
    },
    {
      id: "beginners-safe",
      title: "Can beginners use the plans safely?",
      content: (
        <p>
          Yes. Choose beginner-friendly options and progress gradually. If unsure, work with a coach.
        </p>
      ),
    },
    {
      id: "injury-condition",
      title: "What if I have an injury or condition?",
      content: (
        <p>
          Consult a qualified professional before training and avoid movements that cause pain.
        </p>
      ),
    },
    {
      id: "results-guaranteed",
      title: "Are results guaranteed?",
      content: (
        <p>
          No. Results vary and depend on consistency, recovery, and individual factors.
        </p>
      ),
    },
    {
      id: "report-unsafe",
      title: "Can I report unsafe content?",
      content: (
        <p>
          Yes. Contact support and include details so we can review the issue.
        </p>
      ),
    },
    {
      id: "who-responsible",
      title: "Who is responsible for how I train?",
      content: (
        <p>
          You are responsible for your training decisions and execution. Use guidance responsibly.
        </p>
      ),
    },
  ];

  // Bullet list component
  const BulletList = ({ items, icon: Icon }: { items: string[]; icon: React.ComponentType<{ className?: string }> }) => (
    <ul className="space-y-3">
      {items.map((item, idx) => (
        <motion.li
          key={idx}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={sectionVariants}
          transition={{ delay: idx * 0.05 }}
          className="flex items-start gap-3"
        >
          <Icon className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
          <span className="text-text-muted">{item}</span>
        </motion.li>
      ))}
    </ul>
  );

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
                <H1>Trust and safety</H1>
                <Paragraph className="text-lg">
                  Training guidance is informational and should be used with common sense. If you&apos;re unsure, consult a qualified professional.
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
                    href="/how-it-works"
                    className="text-sm text-text-muted hover:text-accent transition-colors underline"
                  >
                    How it works
                  </Link>
                </div>
              </div>

              {/* Hero Image */}
              <div className="relative aspect-video rounded-2xl overflow-hidden border" style={{ borderColor: THEME.cardBorder }}>
                <Image
                  src="/trust_safety_hero.webp"
                  alt="Trust and safety guidelines"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority
                />
              </div>
            </motion.div>
          </Container>
        </section>

        {/* Safety first */}
        <section className="py-12 md:py-16">
          <Container>
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={sectionVariants}
            >
              <Card>
                <H2 className="mb-6">Safety first</H2>
                <BulletList
                  items={[
                    "Warm up before training and progress gradually.",
                    "Choose loads you can control with proper technique.",
                    "Prioritize recovery, sleep, and hydration.",
                    "Use equipment safely and train in a suitable environment.",
                    "Stop if you feel sharp pain, dizziness, or numbness.",
                    "If you have a medical condition, consult a professional first.",
                  ]}
                  icon={Shield}
                />
              </Card>
            </motion.div>
          </Container>
        </section>

        {/* Not medical advice */}
        <section className="py-12 md:py-16">
          <Container>
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={sectionVariants}
            >
              <H2 className="mb-6">Not medical advice</H2>
              <BulletList
                items={[
                  "We do not provide medical advice, diagnosis, or treatment.",
                  "Our content is not a substitute for a doctor, physiotherapist, or licensed professional.",
                  "If you are pregnant, recovering from injury, or have chronic conditions, seek professional guidance before training.",
                ]}
                icon={Info}
              />
            </motion.div>
          </Container>
        </section>

        {/* Your responsibility */}
        <section className="py-12 md:py-16">
          <Container>
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={sectionVariants}
            >
              <H2 className="mb-6">Your responsibility</H2>
              <BulletList
                items={[
                  "You are responsible for your training choices and how you perform exercises.",
                  "Adjust intensity based on your experience, form, and recovery.",
                  "Use safety measures such as spotters, proper footwear, and appropriate surfaces.",
                  "If something feels wrong, stop and reassess.",
                ]}
                icon={User}
              />
            </motion.div>
          </Container>
        </section>

        {/* Platform limitations */}
        <section className="py-12 md:py-16">
          <Container>
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={sectionVariants}
            >
              <H2 className="mb-6">Platform limitations</H2>
              <BulletList
                items={[
                  "Coach-built and AI-generated plans may contain errors or may not fit your unique situation.",
                  "Always verify exercise technique and suitability for your body and equipment.",
                  "Progress is not guaranteed and depends on consistency, recovery, and individual differences.",
                  "Do not use the platform for emergency situations.",
                ]}
                icon={AlertCircle}
              />
            </motion.div>
          </Container>
        </section>

        {/* When to stop */}
        <section className="py-12 md:py-16">
          <Container>
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={sectionVariants}
            >
              <Card
                className="border-l-4"
                style={{
                  borderLeftColor: THEME.accent,
                  backgroundColor: THEME.card,
                }}
              >
                <div className="flex items-start gap-3 mb-4">
                  <AlertTriangle className="w-6 h-6 text-accent flex-shrink-0 mt-0.5" />
                  <H2>When to stop</H2>
                </div>
                <ul className="space-y-2 ml-9">
                  {[
                    "Sharp or worsening pain",
                    "Dizziness or fainting",
                    "Chest pain or unusual shortness of breath",
                    "Numbness or tingling",
                    "Any symptom that feels unsafe",
                  ].map((item, idx) => (
                    <li key={idx} className="text-text-muted">
                      {item}
                    </li>
                  ))}
                </ul>
              </Card>
            </motion.div>
          </Container>
        </section>

        {/* For coaches */}
        <section className="py-12 md:py-16">
          <Container>
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={sectionVariants}
            >
              <H2 className="mb-6">For coaches</H2>
              <BulletList
                items={[
                  "Coaches must provide clear, safe guidance and avoid medical claims.",
                  "Coaches should recommend professional help when appropriate.",
                  "Coaches are responsible for the advice they provide within the platform.",
                ]}
                icon={GraduationCap}
              />
            </motion.div>
          </Container>
        </section>

        {/* FAQ */}
        <section className="py-12 md:py-16">
          <Container>
            <div className="max-w-3xl mx-auto">
              <H2 className="mb-8 text-center">FAQ</H2>
              <Accordion items={faqItems} allowMultiple={false} />
              <div className="mt-6 text-center">
                <Link
                  href="/contact"
                  className="text-sm text-text-muted hover:text-accent transition-colors underline"
                >
                  Contact support
                </Link>
              </div>
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
