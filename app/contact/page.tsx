"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import { Mail, Phone, MapPin, Copy, Check } from "lucide-react";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";
import { Container, H1, H2, Paragraph, Button, Card } from "@/components/ui";
import { useCurrencyStore } from "@/lib/stores/currency-store";
import { fadeIn, cardHoverLift } from "@/lib/animations";
import { THEME } from "@/lib/theme";
import ContactForm from "./ContactForm";
import type { Route } from "next";

type Region = "EU" | "UK" | "US";

export default function ContactPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { currency } = useCurrencyStore();
  const [balance, setBalance] = useState(0);
  const [balanceLoading, setBalanceLoading] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState(false);

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
  const openAuth = (mode: "signin" | "signup" = "signin") => {
    const currentPath = typeof window !== "undefined" ? window.location.pathname : "";
    const returnTo = currentPath !== "/auth/sign-in" && currentPath !== "/auth/sign-up" && currentPath !== "/auth/reset-password"
      ? currentPath
      : "/dashboard";
    const query = returnTo ? `?returnTo=${encodeURIComponent(returnTo)}` : "";
    // Map mode to correct path with hyphens
    const path = mode === "signin" ? "sign-in" : "sign-up";
    router.push(`/auth/${path}${query}` as Route);
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

  // Copy address to clipboard
  const copyAddress = async () => {
    const address = "20 Wenlock Road, London, England, N1 7GU";
    try {
      await navigator.clipboard.writeText(address);
      setCopiedAddress(true);
      setTimeout(() => setCopiedAddress(false), 2000);
    } catch {
      // swallow; copy failure is non-critical
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
              className="space-y-6"
            >
              <div className="text-center space-y-4 max-w-3xl mx-auto">
                <H1>Contact us</H1>
                <Paragraph className="text-lg">
                  Need help with tokens, coach requests, or Instant AI? We&apos;re here to help.
                </Paragraph>
              </div>

              <div className="flex flex-wrap justify-center gap-4 text-sm">
                <Link
                  href="/support"
                  className="opacity-70 hover:opacity-100 transition-opacity underline"
                >
                  Support
                </Link>
                <Link
                  href="/faq"
                  className="opacity-70 hover:opacity-100 transition-opacity underline"
                >
                  FAQ
                </Link>
                <Link
                  href="/payments-tokens"
                  className="opacity-70 hover:opacity-100 transition-opacity underline"
                >
                  Payments & tokens
                </Link>
              </div>
            </motion.div>
          </Container>
        </section>

        {/* Contact methods */}
        <section className="py-12 md:py-16">
          <Container>
            <motion.div
              initial="hidden"
              animate="visible"
              variants={sectionVariants}
            >
              <H2 className="mb-8 text-center">Contact details</H2>
              <div className="grid md:grid-cols-3 gap-6">
                {/* Email */}
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
                        <Mail className="w-6 h-6" style={{ color: THEME.accent }} />
                      </div>
                      <H2 className="text-xl">Email</H2>
                    </div>
                    <Paragraph className="mb-4 flex-1">
                      info@chaletcoaching.co.uk
                    </Paragraph>
                    <Button variant="outline" asChild>
                      <Link href="mailto:info@chaletcoaching.co.uk">Send email</Link>
                    </Button>
                  </Card>
                </motion.div>

                {/* Phone */}
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
                        <Phone className="w-6 h-6" style={{ color: THEME.accent }} />
                      </div>
                      <H2 className="text-xl">Phone</H2>
                    </div>
                    <Paragraph className="mb-4 flex-1">
                      +44 7441 392840
                    </Paragraph>
                    <Button variant="outline" asChild>
                      <Link href="tel:+447441392840">Call</Link>
                    </Button>
                  </Card>
                </motion.div>

                {/* Company address */}
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
                        <MapPin className="w-6 h-6" style={{ color: THEME.accent }} />
                      </div>
                      <H2 className="text-xl">Company address</H2>
                    </div>
                    <Paragraph className="mb-4 flex-1">
                      20 Wenlock Road, London, England, N1 7GU
                    </Paragraph>
                    <Button
                      variant="outline"
                      onClick={copyAddress}
                      className="flex items-center justify-center gap-2"
                    >
                      {copiedAddress ? (
                        <>
                          <Check className="w-4 h-4" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          Copy address
                        </>
                      )}
                    </Button>
                  </Card>
                </motion.div>
              </div>
            </motion.div>
          </Container>
        </section>

        {/* Contact form */}
        <section className="py-12 md:py-16">
          <Container>
            <motion.div
              initial="hidden"
              animate="visible"
              variants={sectionVariants}
            >
              <div className="max-w-2xl mx-auto">
                <H2 className="mb-6 text-center">Send a message</H2>
                <Card>
                  <Suspense fallback={null}>
                    <ContactForm />
                  </Suspense>
                </Card>
              </div>
            </motion.div>
          </Container>
        </section>

        {/* Before you send */}
        <section className="py-12 md:py-16">
          <Container>
            <motion.div
              initial="hidden"
              animate="visible"
              variants={sectionVariants}
              className="max-w-2xl mx-auto"
            >
              <H2 className="mb-6 text-center">Before you send</H2>
              <Card>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <span className="text-accent font-semibold flex-shrink-0 mt-0.5">•</span>
                    <Paragraph className="mb-0">Describe what you were trying to do</Paragraph>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-accent font-semibold flex-shrink-0 mt-0.5">•</span>
                    <Paragraph className="mb-0">Include any error message</Paragraph>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-accent font-semibold flex-shrink-0 mt-0.5">•</span>
                    <Paragraph className="mb-0">Add screenshots if possible</Paragraph>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-accent font-semibold flex-shrink-0 mt-0.5">•</span>
                    <Paragraph className="mb-0">Tell us which page you were on</Paragraph>
                  </li>
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
