"use client";

import React, { useEffect, useState } from "react";
import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import { Check, Shield } from "lucide-react";
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
import { useCurrencyStore } from "@/lib/stores/currency-store";
import { cardHoverLift, fadeIn } from "@/lib/animations";
import { THEME } from "@/lib/theme";
import { useLocale } from "@/lib/i18n/client";
import { getPhaseTwoCopy } from "@/lib/phase-two-copy";
import type { Route } from "next";

type Region = "EU" | "UK" | "US";

export default function HowItWorksPage() {
  const { locale } = useLocale();
  const copy = React.useMemo(() => getPhaseTwoCopy(locale).howItWorks, [locale]);
  const { data: session } = useSession();
  const router = useRouter();
  const { currency } = useCurrencyStore();
  const [balance, setBalance] = useState(0);
  const [balanceLoading, setBalanceLoading] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  const region: Region =
    currency === "USD" ? "US" : currency === "GBP" ? "UK" : "EU";

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
    void signIn("credentials", { callbackUrl: "/how-it-works" });
  };

  const handleNavigate = (page: string) => {
    const target =
      page === "home" ? "/" : page.startsWith("/") ? page : `/${page}`;
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

  const faqItems: AccordionItem[] = copy.faq.items.map((item) => ({
    id: item.id,
    title: item.title,
    content:
      item.paragraphs.length === 1 ? (
        <p>{item.paragraphs[0]}</p>
      ) : (
        <div className="space-y-2">
          {item.paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      ),
  }));

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
                    <Link href="/coaches">{copy.hero.coachCta}</Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href="/generator">{copy.hero.generatorCta}</Link>
                  </Button>
                </div>
              </div>

              <div
                className="relative aspect-video rounded-2xl overflow-hidden border"
                style={{ borderColor: THEME.cardBorder }}
              >
                <Image
                  src="/how_it_works_hero.webp"
                  alt={copy.hero.heroAlt}
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
            <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
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
                    <H3>{copy.paths.coach.title}</H3>
                  </div>
                  <Paragraph className="mb-6 flex-1">{copy.paths.coach.body}</Paragraph>
                  <div
                    className="relative aspect-video rounded-xl overflow-hidden border mb-6"
                    style={{ borderColor: THEME.cardBorder }}
                  >
                    <Image
                      src="/how_it_works_path_coach.webp"
                      alt={copy.paths.coach.imageAlt}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  </div>
                  <Button variant="primary" asChild>
                    <Link href="/coaches">{copy.paths.coach.cta}</Link>
                  </Button>
                </Card>
              </motion.div>

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
                    <H3>{copy.paths.ai.title}</H3>
                  </div>
                  <Paragraph className="mb-6 flex-1">{copy.paths.ai.body}</Paragraph>
                  <div
                    className="relative aspect-video rounded-xl overflow-hidden border mb-6"
                    style={{ borderColor: THEME.cardBorder }}
                  >
                    <Image
                      src="/how_it_works_path_ai.webp"
                      alt={copy.paths.ai.imageAlt}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  </div>
                  <Button variant="ai" asChild>
                    <Link href="/generator">{copy.paths.ai.cta}</Link>
                  </Button>
                </Card>
              </motion.div>
            </div>
          </Container>
        </section>

        <section className="py-12 md:py-16">
          <Container>
            <div className="max-w-4xl mx-auto">
              <H2 className="mb-8 text-center">{copy.coachFlow.title}</H2>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {copy.coachFlow.emojis.map((emoji, idx) => (
                  <motion.div
                    key={idx}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={sectionVariants}
                    transition={{ delay: idx * 0.1 }}
                    className="text-center"
                  >
                    <div className="text-4xl mb-3">{emoji}</div>
                    <H3 className="text-lg mb-2">{copy.coachFlow.steps[idx]}</H3>
                  </motion.div>
                ))}
              </div>
            </div>
          </Container>
        </section>

        <section className="py-12 md:py-16">
          <Container>
            <div className="max-w-4xl mx-auto">
              <H2 className="mb-8 text-center">{copy.aiFlow.title}</H2>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {copy.aiFlow.emojis.map((emoji, idx) => (
                  <motion.div
                    key={idx}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={sectionVariants}
                    transition={{ delay: idx * 0.1 }}
                    className="text-center"
                  >
                    <div className="text-4xl mb-3">{emoji}</div>
                    <H3 className="text-lg mb-2">{copy.aiFlow.steps[idx]}</H3>
                  </motion.div>
                ))}
              </div>
            </div>
          </Container>
        </section>

        <section className="py-12 md:py-16">
          <Container>
            <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-center">
              <div
                className="relative aspect-video rounded-2xl overflow-hidden border"
                style={{ borderColor: THEME.cardBorder }}
              >
                <Image
                  src="/how_it_works_receive.webp"
                  alt={copy.receive.imageAlt}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
              <div>
                <H2 className="mb-6">{copy.receive.title}</H2>
                <ul className="space-y-4">
                  {copy.receive.items.map((item, idx) => (
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
                      <span>{item}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>
            </div>
          </Container>
        </section>

        <section className="py-12 md:py-16">
          <Container>
            <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-center">
              <div>
                <H2 className="mb-4">{copy.tokens.title}</H2>
                <Paragraph className="mb-6">{copy.tokens.body}</Paragraph>
                <Button variant="outline" asChild>
                  <Link href="/pricing">{copy.tokens.cta}</Link>
                </Button>
              </div>
              <div
                className="relative aspect-video rounded-2xl overflow-hidden border"
                style={{ borderColor: THEME.cardBorder }}
              >
                <Image
                  src="/how_it_works_tokens.webp"
                  alt={copy.tokens.imageAlt}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            </div>
          </Container>
        </section>

        <section className="py-12 md:py-16">
          <Container>
            <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-center">
              <div
                className="relative aspect-video rounded-2xl overflow-hidden border"
                style={{ borderColor: THEME.cardBorder }}
              >
                <Image
                  src="/how_it_works_trust.webp"
                  alt={copy.safety.imageAlt}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
              <div>
                <H2 className="mb-6">{copy.safety.title}</H2>
                <ul className="space-y-4">
                  {copy.safety.items.map((item, idx) => (
                    <motion.li
                      key={item}
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
                  <Link href="/coaches">{copy.cta.coach}</Link>
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
