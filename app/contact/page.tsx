"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import { Check, Copy, Mail, MapPin, Phone } from "lucide-react";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";
import { Button, Card, Container, H1, H2, Paragraph } from "@/components/ui";
import { cardHoverLift, fadeIn } from "@/lib/animations";
import { useLocale } from "@/lib/i18n/client";
import { getPublicPagesCopy } from "@/lib/public-pages-copy";
import { useCurrencyStore } from "@/lib/stores/currency-store";
import { THEME } from "@/lib/theme";
import ContactForm from "./ContactForm";
import type { Route } from "next";

type Region = "EU" | "UK" | "US";

export default function ContactPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { currency } = useCurrencyStore();
  const { locale } = useLocale();
  const copy = getPublicPagesCopy(locale).contact;
  const [balance, setBalance] = useState(0);
  const [balanceLoading, setBalanceLoading] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState(false);

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

  const openAuth = (mode: "signin" | "signup" = "signin") => {
    const currentPath = typeof window !== "undefined" ? window.location.pathname : "";
    const returnTo =
      currentPath !== "/auth/sign-in" &&
      currentPath !== "/auth/sign-up" &&
      currentPath !== "/auth/reset-password"
        ? currentPath
        : "/dashboard";
    const query = returnTo ? `?returnTo=${encodeURIComponent(returnTo)}` : "";
    const path = mode === "signin" ? "sign-in" : "sign-up";
    router.push(`/auth/${path}${query}` as Route);
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

  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(copy.cards.address.value);
      setCopiedAddress(true);
      setTimeout(() => setCopiedAddress(false), 2000);
    } catch {
      // Copy failure is non-critical.
    }
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

  const contactCards = [
    {
      key: "email",
      icon: Mail,
      title: copy.cards.email.title,
      value: copy.cards.email.value,
      action: (
        <Button variant="outline" asChild>
          <Link href="mailto:info@chaletcoaching.co.uk">{copy.cards.email.cta}</Link>
        </Button>
      ),
    },
    {
      key: "phone",
      icon: Phone,
      title: copy.cards.phone.title,
      value: copy.cards.phone.value,
      action: (
        <Button variant="outline" asChild>
          <Link href="tel:+44 7782 358363">{copy.cards.phone.cta}</Link>
        </Button>
      ),
    },
    {
      key: "address",
      icon: MapPin,
      title: copy.cards.address.title,
      value: copy.cards.address.value,
      action: (
        <Button variant="outline" onClick={copyAddress} className="flex items-center justify-center gap-2">
          {copiedAddress ? (
            <>
              <Check className="w-4 h-4" />
              {copy.cards.address.copied}
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              {copy.cards.address.copy}
            </>
          )}
        </Button>
      ),
    },
  ] as const;

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
            <motion.div initial="hidden" animate="visible" variants={sectionVariants} className="space-y-6">
              <div className="text-center space-y-4 max-w-3xl mx-auto">
                <H1>{copy.hero.title}</H1>
                <Paragraph className="text-lg">{copy.hero.subtitle}</Paragraph>
              </div>
              <div className="flex flex-wrap justify-center gap-4 text-sm">
                {[
                  ["/support", copy.hero.links[0]],
                  ["/faq", copy.hero.links[1]],
                  ["/payments-tokens", copy.hero.links[2]],
                ].map(([href, label]) => (
                  <Link key={href} href={href as Route} className="opacity-70 hover:opacity-100 transition-opacity underline">
                    {label}
                  </Link>
                ))}
              </div>
            </motion.div>
          </Container>
        </section>

        <section className="py-12 md:py-16">
          <Container>
            <motion.div initial="hidden" animate="visible" variants={sectionVariants}>
              <H2 className="mb-8 text-center">{copy.detailsTitle}</H2>
              <div className="grid md:grid-cols-3 gap-6">
                {contactCards.map((card) => {
                  const Icon = card.icon;
                  return (
                    <motion.div
                      key={card.key}
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
                            <Icon className="w-6 h-6" style={{ color: THEME.accent }} />
                          </div>
                          <H2 className="text-xl">{card.title}</H2>
                        </div>
                        <Paragraph className="mb-4 flex-1">{card.value}</Paragraph>
                        {card.action}
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
            <motion.div initial="hidden" animate="visible" variants={sectionVariants}>
              <div className="max-w-2xl mx-auto">
                <H2 className="mb-6 text-center">{copy.formTitle}</H2>
                <Card>
                  <Suspense fallback={null}>
                    <ContactForm />
                  </Suspense>
                </Card>
              </div>
            </motion.div>
          </Container>
        </section>

        <section className="py-12 md:py-16">
          <Container>
            <motion.div initial="hidden" animate="visible" variants={sectionVariants} className="max-w-2xl mx-auto">
              <H2 className="mb-6 text-center">{copy.before.title}</H2>
              <Card>
                <ul className="space-y-3">
                  {copy.before.items.map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <span className="text-accent font-semibold flex-shrink-0 mt-0.5">•</span>
                      <Paragraph className="mb-0">{item}</Paragraph>
                    </li>
                  ))}
                </ul>
              </Card>
            </motion.div>
          </Container>
        </section>
      </main>

      <SiteFooter onNavigate={handleNavigate} />
    </div>
  );
}
