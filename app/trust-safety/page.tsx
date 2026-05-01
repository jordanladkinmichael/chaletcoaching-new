"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import { AlertCircle, AlertTriangle, GraduationCap, Info, Shield, User } from "lucide-react";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";
import {
  Accordion,
  Button,
  Card,
  Container,
  H1,
  H2,
  Paragraph,
  type AccordionItem,
} from "@/components/ui";
import { fadeIn } from "@/lib/animations";
import { useLocale } from "@/lib/i18n/client";
import { getPublicPagesCopy } from "@/lib/public-pages-copy";
import { useCurrencyStore } from "@/lib/stores/currency-store";
import { THEME } from "@/lib/theme";
import type { Route } from "next";

type Region = "EU" | "UK" | "US";

const sectionIcons = [Shield, Info, User, AlertCircle, GraduationCap] as const;

export default function TrustSafetyPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { currency } = useCurrencyStore();
  const { locale } = useLocale();
  const copy = getPublicPagesCopy(locale).trustSafety;
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
    void signIn("credentials", { callbackUrl: "/trust-safety" });
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

  const BulletList = ({
    items,
    icon: Icon,
  }: {
    items: readonly string[];
    icon: React.ComponentType<{ className?: string }>;
  }) => (
    <ul className="space-y-3">
      {items.map((item, idx) => (
        <motion.li
          key={item}
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
                <Link
                  href="/how-it-works"
                  className="text-sm text-text-muted hover:text-accent transition-colors underline"
                >
                  {copy.hero.howItWorks}
                </Link>
              </div>

              <div className="relative aspect-video rounded-2xl overflow-hidden border" style={{ borderColor: THEME.cardBorder }}>
                <Image
                  src="/trust_safety_hero.webp"
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

        {copy.sections.map((section, idx) => {
          const Icon = sectionIcons[idx] ?? Shield;
          const content = <BulletList items={section.items} icon={Icon} />;

          return (
            <section className="py-12 md:py-16" key={section.title}>
              <Container>
                <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={sectionVariants}>
                  {idx === 0 ? (
                    <Card>
                      <H2 className="mb-6">{section.title}</H2>
                      {content}
                    </Card>
                  ) : (
                    <>
                      <H2 className="mb-6">{section.title}</H2>
                      {content}
                    </>
                  )}
                </motion.div>
              </Container>
            </section>
          );
        })}

        <section className="py-12 md:py-16">
          <Container>
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={sectionVariants}>
              <Card className="border-l-4" style={{ borderLeftColor: THEME.accent, backgroundColor: THEME.card }}>
                <div className="flex items-start gap-3 mb-4">
                  <AlertTriangle className="w-6 h-6 text-accent flex-shrink-0 mt-0.5" />
                  <H2>{copy.stop.title}</H2>
                </div>
                <ul className="space-y-2 ml-9">
                  {copy.stop.items.map((item) => (
                    <li key={item} className="text-text-muted">
                      {item}
                    </li>
                  ))}
                </ul>
              </Card>
            </motion.div>
          </Container>
        </section>

        <section className="py-12 md:py-16">
          <Container>
            <div className="max-w-3xl mx-auto">
              <H2 className="mb-8 text-center">{copy.faq.title}</H2>
              <Accordion items={faqItems} allowMultiple={false} />
              <div className="mt-6 text-center">
                <Link href="/contact" className="text-sm text-text-muted hover:text-accent transition-colors underline">
                  {copy.faq.contact}
                </Link>
              </div>
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
