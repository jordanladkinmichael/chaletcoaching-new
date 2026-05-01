"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import { Coins, Zap, Wallet, Info } from "lucide-react";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";
import {
  Accordion,
  Button,
  Card,
  Container,
  H1,
  H2,
  H3,
  Paragraph,
  type AccordionItem,
} from "@/components/ui";
import { buttonHoverLift, cardHoverLift, fadeIn } from "@/lib/animations";
import { useLocale } from "@/lib/i18n/client";
import { getPublicPagesCopy } from "@/lib/public-pages-copy";
import { useCurrencyStore } from "@/lib/stores/currency-store";
import { THEME } from "@/lib/theme";
import type { Route } from "next";

type Region = "EU" | "UK" | "US";

const basicIcons = [Coins, Zap, Wallet] as const;

export default function PaymentsTokensPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { currency } = useCurrencyStore();
  const { locale } = useLocale();
  const copy = getPublicPagesCopy(locale).paymentsTokens;
  const [balance, setBalance] = useState(0);
  const [balanceLoading, setBalanceLoading] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  const region: Region = currency === "USD" ? "US" : currency === "GBP" ? "UK" : "EU";
  const isAuthed = !!session?.user;

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);
    const handleChange = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

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

  const openAuth = () => {
    void signIn("credentials", { callbackUrl: "/payments-tokens" });
  };

  const handleNavigate = (page: string) => {
    const target = page === "home" ? "/" : page.startsWith("/") ? page : `/${page}`;
    router.push(target as Route);
  };

  const formatNumber = (n: number) => n.toLocaleString();

  const setRegion = (newRegion: Region) => {
    const currencyMap: Record<Region, "EUR" | "GBP" | "USD"> = {
      EU: "EUR",
      UK: "GBP",
      US: "USD",
    };
    useCurrencyStore.getState().setCurrency(currencyMap[newRegion]);
  };

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

  const faqItems = useMemo<AccordionItem[]>(
    () =>
      copy.faq.items.map(([id, title, text]) => ({
        id,
        title,
        content: <p>{text}</p>,
      })),
    [copy.faq.items]
  );

  const bullet = (item: string) => (
    <div className="flex gap-3" key={item}>
      <div
        className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center mt-0.5"
        style={{ backgroundColor: `${THEME.accent}20` }}
      >
        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: THEME.accent }} />
      </div>
      <Paragraph>{item}</Paragraph>
    </div>
  );

  const smallBullet = (item: string) => (
    <div className="flex gap-3" key={item}>
      <div
        className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5"
        style={{ backgroundColor: `${THEME.accent}20` }}
      >
        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: THEME.accent }} />
      </div>
      <Paragraph className="opacity-85 mb-0">{item}</Paragraph>
    </div>
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
        <section className="py-12 md:py-16">
          <Container>
            <motion.div
              initial="hidden"
              animate="visible"
              variants={sectionVariants}
              className="grid md:grid-cols-2 gap-8 lg:gap-12 items-center"
            >
              <div className="space-y-6">
                <H1>{copy.hero.title}</H1>
                <Paragraph className="text-lg">{copy.hero.subtitle}</Paragraph>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button variant="primary" asChild>
                    <Link href="/pricing">{copy.hero.pricing}</Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href="/coaches">{copy.hero.coaches}</Link>
                  </Button>
                </div>
                <Link
                  href="/how-it-works"
                  className="text-sm opacity-70 hover:opacity-100 transition-opacity inline-flex items-center gap-1"
                >
                  {copy.hero.howItWorks}
                </Link>
              </div>
              <div className="relative aspect-video rounded-2xl overflow-hidden border" style={{ borderColor: THEME.cardBorder }}>
                <Image
                  src="/payments_tokens_hero.webp"
                  alt={copy.hero.imageAlt}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority
                />
              </div>
            </motion.div>
          </Container>
        </section>

        <section className="py-12 md:py-16">
          <Container>
            <motion.div initial="hidden" animate="visible" variants={sectionVariants}>
              <H2 className="mb-8 text-center">{copy.basics.title}</H2>
              <div className="grid md:grid-cols-3 gap-6">
                {copy.basics.cards.map((card, idx) => {
                  const Icon = basicIcons[idx] ?? Coins;
                  return (
                    <motion.div
                      key={card.title}
                      variants={prefersReducedMotion ? undefined : cardHoverLift}
                      whileHover="hover"
                    >
                      <Card className="h-full">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="p-2 rounded-lg" style={{ backgroundColor: `${THEME.accent}20` }}>
                            <Icon size={24} style={{ color: THEME.accent }} />
                          </div>
                          <H3 className="mb-0">{card.title}</H3>
                        </div>
                        <Paragraph className="opacity-85">{card.text}</Paragraph>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </Container>
        </section>

        <section className="py-12 md:py-16">
          <Container>
            <motion.div initial="hidden" animate="visible" variants={sectionVariants} className="max-w-3xl mx-auto">
              <H2 className="mb-6 text-center">{copy.rates.title}</H2>
              <div className="text-center mb-6">
                <Paragraph className="text-lg font-semibold mb-2">{copy.rates.lead}</Paragraph>
                <Paragraph className="opacity-80">{copy.rates.body}</Paragraph>
              </div>
              <Card className="max-w-md mx-auto">
                <div className="space-y-3">
                  {copy.rates.rows.map((row, idx) => (
                    <div
                      key={row.code}
                      className={`flex justify-between items-center py-2 ${idx < copy.rates.rows.length - 1 ? "border-b" : ""}`}
                      style={{ borderColor: THEME.cardBorder }}
                    >
                      <span className="font-semibold">{row.code}</span>
                      <span className="opacity-85">{row.value}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>
          </Container>
        </section>

        <section className="py-12 md:py-16">
          <Container>
            <motion.div initial="hidden" animate="visible" variants={sectionVariants} className="max-w-3xl mx-auto">
              <H2 className="mb-6 text-center">{copy.topups.title}</H2>
              <div className="space-y-4 mb-6">{copy.topups.steps.map(bullet)}</div>
              <Card
                className="mb-6"
                style={{ borderLeftWidth: "4px", borderLeftColor: THEME.accent, backgroundColor: `${THEME.card}80` }}
              >
                <div className="flex gap-3">
                  <Info size={20} style={{ color: THEME.accent }} className="flex-shrink-0 mt-0.5" />
                  <div>
                    <H3 className="mb-2" style={{ fontSize: "1rem" }}>
                      {copy.topups.tipTitle}
                    </H3>
                    <Paragraph className="opacity-85 mb-0">{copy.topups.tip}</Paragraph>
                  </div>
                </div>
              </Card>
              <div className="text-center">
                <Button variant="primary" asChild>
                  <Link href="/pricing">{copy.topups.cta}</Link>
                </Button>
              </div>
            </motion.div>
          </Container>
        </section>

        <section className="py-12 md:py-16">
          <Container>
            <motion.div initial="hidden" animate="visible" variants={sectionVariants}>
              <H2 className="mb-8 text-center">{copy.spending.title}</H2>
              <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                <Card>
                  <H3 className="mb-4">{copy.spending.ai.title}</H3>
                  <div className="space-y-3 mb-6">{copy.spending.ai.items.map(smallBullet)}</div>
                  <Button variant="outline" asChild className="w-full">
                    <Link href="/generator">{copy.spending.ai.cta}</Link>
                  </Button>
                </Card>
                <Card>
                  <H3 className="mb-4">{copy.spending.coach.title}</H3>
                  <div className="space-y-3 mb-6">{copy.spending.coach.items.map(smallBullet)}</div>
                  <Button variant="outline" asChild className="w-full">
                    <Link href="/coaches">{copy.spending.coach.cta}</Link>
                  </Button>
                </Card>
              </div>
            </motion.div>
          </Container>
        </section>

        <section className="py-12 md:py-16">
          <Container>
            <motion.div initial="hidden" animate="visible" variants={sectionVariants} className="max-w-3xl mx-auto">
              <H2 className="mb-6 text-center">{copy.security.title}</H2>
              <div className="space-y-4">{copy.security.items.map(bullet)}</div>
            </motion.div>
          </Container>
        </section>

        <section className="py-12 md:py-16">
          <Container>
            <motion.div initial="hidden" animate="visible" variants={sectionVariants} className="max-w-3xl mx-auto text-center">
              <H2 className="mb-6">{copy.refunds.title}</H2>
              <div className="space-y-4 mb-6">
                {copy.refunds.paragraphs.map((text) => (
                  <Paragraph key={text}>{text}</Paragraph>
                ))}
              </div>
              <Button variant="outline" asChild>
                <Link href="/legal/refunds">{copy.refunds.cta}</Link>
              </Button>
            </motion.div>
          </Container>
        </section>

        <section className="py-12 md:py-16">
          <Container>
            <motion.div initial="hidden" animate="visible" variants={sectionVariants} className="max-w-3xl mx-auto">
              <H2 className="mb-8 text-center">{copy.faq.title}</H2>
              <Accordion items={faqItems} />
            </motion.div>
          </Container>
        </section>

        <section className="py-12 md:py-16">
          <Container>
            <motion.div initial="hidden" animate="visible" variants={sectionVariants} className="max-w-3xl mx-auto text-center">
              <H2 className="mb-6">{copy.cta.title}</H2>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <motion.div variants={prefersReducedMotion ? undefined : buttonHoverLift} whileHover="hover">
                  <Button variant="primary" asChild>
                    <Link href="/pricing">{copy.cta.pricing}</Link>
                  </Button>
                </motion.div>
                <motion.div variants={prefersReducedMotion ? undefined : buttonHoverLift} whileHover="hover">
                  <Button variant="outline" asChild>
                    <Link href="/generator">{copy.cta.generator}</Link>
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          </Container>
        </section>
      </main>

      <SiteFooter onNavigate={handleNavigate} />
    </div>
  );
}
