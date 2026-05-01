"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import { Activity, Calendar, Check, Download, Dumbbell, HelpCircle, Wrench } from "lucide-react";
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
import { cardHoverLift, fadeIn } from "@/lib/animations";
import { useLocale } from "@/lib/i18n/client";
import { getPublicPagesCopy } from "@/lib/public-pages-copy";
import { useCurrencyStore } from "@/lib/stores/currency-store";
import { THEME } from "@/lib/theme";
import type { Route } from "next";

type Region = "EU" | "UK" | "US";

const glanceIcons = [Calendar, Dumbbell, HelpCircle, Activity, Wrench, Download] as const;

export default function WhatYouReceivePage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { currency } = useCurrencyStore();
  const { locale } = useLocale();
  const copy = getPublicPagesCopy(locale).whatYouReceive;
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
    void signIn("credentials", { callbackUrl: "/what-you-receive" });
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

  const checkItem = (item: string) => (
    <li key={item} className="flex items-start gap-3">
      <Check className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
      <span className="text-text-muted">{item}</span>
    </li>
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
                    <Link href="/coaches">{copy.hero.coaches}</Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href="/generator">{copy.hero.generator}</Link>
                  </Button>
                </div>
                <Link href="/pricing" className="text-sm text-text-muted hover:text-accent transition-colors underline">
                  {copy.hero.pricing}
                </Link>
              </div>

              <div className="relative aspect-video rounded-2xl overflow-hidden border" style={{ borderColor: THEME.cardBorder }}>
                <Image
                  src="/what_you_receive_hero.webp"
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
            <H2 className="mb-8 text-center">{copy.atAGlance.title}</H2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {copy.atAGlance.items.map((label, idx) => {
                const Icon = glanceIcons[idx] ?? Calendar;
                return (
                  <motion.div
                    key={label}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={sectionVariants}
                    transition={{ delay: idx * 0.05 }}
                    className="flex items-start gap-4"
                  >
                    <div className="rounded-lg p-3 border" style={{ borderColor: THEME.cardBorder }}>
                      <Icon className="w-6 h-6 text-accent" />
                    </div>
                    <Paragraph className="font-medium">{label}</Paragraph>
                  </motion.div>
                );
              })}
            </div>
          </Container>
        </section>

        <section className="py-12 md:py-16">
          <Container>
            <H2 className="mb-8 text-center">{copy.inside.title}</H2>
            <div className="grid md:grid-cols-3 gap-6">
              {copy.inside.cards.map(([title, text]) => (
                <motion.div
                  key={title}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={prefersReducedMotion ? fadeIn : cardHoverLift}
                  whileHover={prefersReducedMotion ? undefined : { y: -2 }}
                >
                  <Card className="h-full">
                    <H3 className="mb-3">{title}</H3>
                    <Paragraph className="text-text-muted">{text}</Paragraph>
                  </Card>
                </motion.div>
              ))}
            </div>
          </Container>
        </section>

        <section className="py-12 md:py-16">
          <Container>
            <H2 className="mb-8 text-center">{copy.examples.title}</H2>
            <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-center mb-8">
              <div className="relative aspect-[3/2] rounded-2xl overflow-hidden border" style={{ borderColor: THEME.cardBorder }}>
                <Image
                  src="/what_you_receive_examples.webp"
                  alt={copy.examples.imageAlt}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
              <div className="space-y-4">
                {copy.examples.items.map(([title, description], idx) => (
                  <motion.div
                    key={title}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={sectionVariants}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <Card>
                      <H3 className="mb-2 text-lg">{title}</H3>
                      <Paragraph className="text-sm text-text-muted">{description}</Paragraph>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </Container>
        </section>

        <section className="py-12 md:py-16">
          <Container>
            <H2 className="mb-8 text-center">{copy.compare.title}</H2>
            <div className="relative aspect-[3/2] rounded-2xl overflow-hidden border mb-8" style={{ borderColor: THEME.cardBorder }}>
              <Image
                src="/what_you_receive_compare.webp"
                alt={copy.compare.imageAlt}
                fill
                className="object-cover"
                sizes="100vw"
              />
            </div>
            <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={sectionVariants}>
                <Card className="h-full">
                  <H3 className="mb-4">{copy.compare.coach.title}</H3>
                  <ul className="space-y-3 mb-6">{copy.compare.coach.items.map(checkItem)}</ul>
                  <Button variant="primary" asChild>
                    <Link href="/coaches">{copy.compare.coach.cta}</Link>
                  </Button>
                </Card>
              </motion.div>

              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={sectionVariants}
                transition={{ delay: 0.1 }}
              >
                <Card className="h-full">
                  <H3 className="mb-4">{copy.compare.ai.title}</H3>
                  <ul className="space-y-3 mb-6">{copy.compare.ai.items.map(checkItem)}</ul>
                  <Button variant="ai" asChild>
                    <Link href="/generator">{copy.compare.ai.cta}</Link>
                  </Button>
                </Card>
              </motion.div>
            </div>
          </Container>
        </section>

        <section className="py-12 md:py-16">
          <Container>
            <H2 className="mb-8 text-center">{copy.formats.title}</H2>
            <div className="max-w-2xl mx-auto">
              <Card>
                <ul className="space-y-4">
                  {copy.formats.items.map((item, idx) => (
                    <motion.li
                      key={item}
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

        <section className="py-12 md:py-16">
          <Container>
            <H2 className="mb-8 text-center">{copy.quality.title}</H2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {copy.quality.items.map((item, idx) => (
                <motion.div
                  key={item}
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

        <section className="py-12 md:py-16">
          <Container>
            <div className="max-w-3xl mx-auto">
              <H2 className="mb-8 text-center">{copy.faq.title}</H2>
              <Accordion items={faqItems} allowMultiple={false} />
            </div>
          </Container>
        </section>

        <section className="py-12 md:py-16">
          <Container>
            <div className="max-w-2xl mx-auto text-center space-y-6">
              <H2>{copy.cta.title}</H2>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button variant="primary" asChild>
                  <Link href="/coaches">{copy.cta.coaches}</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/generator">{copy.cta.generator}</Link>
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
