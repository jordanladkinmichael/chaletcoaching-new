"use client";

import React, { useState, useEffect } from "react";
import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Coins,
  Zap,
  Wallet,
  Info,
  CreditCard,
  Lock,
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
import { cardHoverLift, fadeIn, buttonHoverLift } from "@/lib/animations";
import { THEME } from "@/lib/theme";

type Region = "EU" | "UK" | "US";

export default function PaymentsTokensPage() {
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
    void signIn("credentials", { callbackUrl: "/payments-tokens" });
  };

  // Navigation handler
  const handleNavigate = (page: string) => {
    if (page === "home") {
      router.push("/");
    } else if (page === "dashboard") {
      router.push("/dashboard");
    } else if (page === "generator") {
      router.push("/generator");
    } else if (page === "coaches") {
      router.push("/coaches");
    } else if (page === "pricing") {
      router.push("/pricing");
    } else if (page === "contact") {
      router.push("/contact");
    } else if (page === "how-it-works") {
      router.push("/how-it-works");
    } else if (page === "what-you-receive") {
      router.push("/what-you-receive");
    } else if (page === "trust-safety") {
      router.push("/trust-safety");
    } else if (page === "payments-tokens") {
      router.push("/payments-tokens");
    } else if (page === "support") {
      router.push("/support");
    } else {
      router.push(`/${page}`);
    }
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
  const sectionVariants = prefersReducedMotion
    ? fadeIn
    : {
        hidden: { opacity: 0, y: 8 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.18, ease: [0.2, 0.8, 0.2, 1] },
        },
      };

  // FAQ items
  const faqItems: AccordionItem[] = [
    {
      id: "tokens-expire",
      title: "Do tokens expire?",
      content: (
        <p>
          Tokens remain in your balance until used.
        </p>
      ),
    },
    {
      id: "both-flows",
      title: "Can I use tokens for both flows?",
      content: (
        <p>
          Yes. The same token balance works across Instant AI and coach requests.
        </p>
      ),
    },
    {
      id: "eur-base",
      title: "Why is EUR the base currency?",
      content: (
        <p>
          It keeps pricing consistent. You can still view prices in your selected currency.
        </p>
      ),
    },
    {
      id: "insufficient-tokens",
      title: "What happens if I don't have enough tokens?",
      content: (
        <p>
          You will be prompted to top up before completing the action.
        </p>
      ),
    },
    {
      id: "when-deducted",
      title: "When are tokens deducted?",
      content: (
        <p>
          Tokens are deducted when you confirm an action that requires tokens.
        </p>
      ),
    },
    {
      id: "payment-secure",
      title: "Is my payment secure?",
      content: (
        <p>
          Yes. Payments are processed via secure checkout.
        </p>
      ),
    },
    {
      id: "refund",
      title: "Can I get a refund?",
      content: (
        <p>
          Please see our refund policy for details and eligibility.
        </p>
      ),
    },
    {
      id: "see-purchases",
      title: "Where can I see my purchases?",
      content: (
        <p>
          In your dashboard after signing in.
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
                <H1>Payments and tokens explained</H1>
                <Paragraph className="text-lg">
                  Tokens are a simple balance you use across Instant AI plans and coach-built requests.
                </Paragraph>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button variant="primary" asChild>
                    <Link href="/pricing">See pricing</Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href="/coaches">Browse coaches</Link>
                  </Button>
                </div>
                <div>
                  <Link
                    href="/how-it-works"
                    className="text-sm opacity-70 hover:opacity-100 transition-opacity inline-flex items-center gap-1"
                  >
                    How it works
                  </Link>
                </div>
              </div>
              {/* Image */}
              <div className="relative aspect-video rounded-2xl overflow-hidden border" style={{ borderColor: THEME.cardBorder }}>
                <Image
                  src="/payments_tokens_hero.webp"
                  alt="Tokens and secure payments"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority
                />
              </div>
            </motion.div>
          </Container>
        </section>

        {/* Token basics */}
        <section className="py-12 md:py-16">
          <Container>
            <motion.div
              initial="hidden"
              animate="visible"
              variants={sectionVariants}
            >
              <H2 className="mb-8 text-center">Token basics</H2>
              <div className="grid md:grid-cols-3 gap-6">
                {/* Card 1: What are tokens? */}
                <motion.div variants={prefersReducedMotion ? undefined : cardHoverLift} whileHover="hover">
                  <Card className="h-full">
                    <div className="flex items-center gap-3 mb-4">
                      <div
                        className="p-2 rounded-lg"
                        style={{ backgroundColor: THEME.accent + "20" }}
                      >
                        <Coins size={24} style={{ color: THEME.accent }} />
                      </div>
                      <H3 className="mb-0">What are tokens?</H3>
                    </div>
                    <Paragraph className="opacity-85">
                      Tokens are your training balance. You top up once and spend tokens on features.
                    </Paragraph>
                  </Card>
                </motion.div>

                {/* Card 2: Why tokens? */}
                <motion.div variants={prefersReducedMotion ? undefined : cardHoverLift} whileHover="hover">
                  <Card className="h-full">
                    <div className="flex items-center gap-3 mb-4">
                      <div
                        className="p-2 rounded-lg"
                        style={{ backgroundColor: THEME.accent + "20" }}
                      >
                        <Zap size={24} style={{ color: THEME.accent }} />
                      </div>
                      <H3 className="mb-0">Why tokens?</H3>
                    </div>
                    <Paragraph className="opacity-85">
                      They keep pricing consistent across different plan types and options.
                    </Paragraph>
                  </Card>
                </motion.div>

                {/* Card 3: Where do I see my balance? */}
                <motion.div variants={prefersReducedMotion ? undefined : cardHoverLift} whileHover="hover">
                  <Card className="h-full">
                    <div className="flex items-center gap-3 mb-4">
                      <div
                        className="p-2 rounded-lg"
                        style={{ backgroundColor: THEME.accent + "20" }}
                      >
                        <Wallet size={24} style={{ color: THEME.accent }} />
                      </div>
                      <H3 className="mb-0">Where do I see my balance?</H3>
                    </div>
                    <Paragraph className="opacity-85">
                      Your token balance is available in your dashboard when signed in.
                    </Paragraph>
                  </Card>
                </motion.div>
              </div>
            </motion.div>
          </Container>
        </section>

        {/* Rates and currencies */}
        <section className="py-12 md:py-16">
          <Container>
            <motion.div
              initial="hidden"
              animate="visible"
              variants={sectionVariants}
              className="max-w-3xl mx-auto"
            >
              <H2 className="mb-6 text-center">Rates and currencies</H2>
              <div className="text-center mb-6">
                <Paragraph className="text-lg font-semibold mb-2">
                  100 tokens = €1.00 | £0.87 | $1.35
                </Paragraph>
                <Paragraph className="opacity-80">
                  EUR is the base currency. Your selected currency is shown in the header.
                </Paragraph>
              </div>
              
              {/* Mini-table */}
              <Card className="max-w-md mx-auto">
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b" style={{ borderColor: THEME.cardBorder }}>
                    <span className="font-semibold">EUR</span>
                    <span className="opacity-85">€1.00 → 100 tokens</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b" style={{ borderColor: THEME.cardBorder }}>
                    <span className="font-semibold">GBP</span>
                    <span className="opacity-85">£0.87 → 100 tokens</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="font-semibold">USD</span>
                    <span className="opacity-85">$1.35 → 100 tokens</span>
                  </div>
                </div>
              </Card>
            </motion.div>
          </Container>
        </section>

        {/* How top-ups work */}
        <section className="py-12 md:py-16">
          <Container>
            <motion.div
              initial="hidden"
              animate="visible"
              variants={sectionVariants}
              className="max-w-3xl mx-auto"
            >
              <H2 className="mb-6 text-center">How top-ups work</H2>
              <div className="space-y-4 mb-6">
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center mt-0.5" style={{ backgroundColor: THEME.accent + "20" }}>
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: THEME.accent }} />
                  </div>
                  <Paragraph>Choose a pack or enter a custom amount.</Paragraph>
                </div>
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center mt-0.5" style={{ backgroundColor: THEME.accent + "20" }}>
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: THEME.accent }} />
                  </div>
                  <Paragraph>Tokens are added to your balance after a successful payment.</Paragraph>
                </div>
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center mt-0.5" style={{ backgroundColor: THEME.accent + "20" }}>
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: THEME.accent }} />
                  </div>
                  <Paragraph>You can use the same balance for both Instant AI and coach requests.</Paragraph>
                </div>
              </div>

              {/* Tip callout */}
              <Card
                className="mb-6"
                style={{
                  borderLeftWidth: "4px",
                  borderLeftColor: THEME.accent,
                  backgroundColor: THEME.card + "80",
                }}
              >
                <div className="flex gap-3">
                  <Info size={20} style={{ color: THEME.accent }} className="flex-shrink-0 mt-0.5" />
                  <div>
                    <H3 className="mb-2" style={{ fontSize: "1rem" }}>Tip</H3>
                    <Paragraph className="opacity-85 mb-0">
                      If you don&apos;t have enough tokens for an action, you&apos;ll be prompted to top up.
                    </Paragraph>
                  </div>
                </div>
              </Card>

              <div className="text-center">
                <Button variant="primary" asChild>
                  <Link href="/pricing">See pricing</Link>
                </Button>
              </div>
            </motion.div>
          </Container>
        </section>

        {/* How spending works */}
        <section className="py-12 md:py-16">
          <Container>
            <motion.div
              initial="hidden"
              animate="visible"
              variants={sectionVariants}
            >
              <H2 className="mb-8 text-center">How spending works</H2>
              <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                {/* Left: Instant AI */}
                <Card>
                  <H3 className="mb-4">Instant AI</H3>
                  <div className="space-y-3 mb-6">
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5" style={{ backgroundColor: THEME.accent + "20" }}>
                        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: THEME.accent }} />
                      </div>
                      <Paragraph className="opacity-85 mb-0">Preview plan: 50 tokens</Paragraph>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5" style={{ backgroundColor: THEME.accent + "20" }}>
                        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: THEME.accent }} />
                      </div>
                      <Paragraph className="opacity-85 mb-0">Publishing a full plan depends on selected options</Paragraph>
                    </div>
                  </div>
                  <Button variant="outline" asChild className="w-full">
                    <Link href="/generator">Open generator</Link>
                  </Button>
                </Card>

                {/* Right: Coach-built request */}
                <Card>
                  <H3 className="mb-4">Coach-built request</H3>
                  <div className="space-y-3 mb-6">
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5" style={{ backgroundColor: THEME.accent + "20" }}>
                        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: THEME.accent }} />
                      </div>
                      <Paragraph className="opacity-85 mb-0">Base request starts at 10,000 tokens</Paragraph>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5" style={{ backgroundColor: THEME.accent + "20" }}>
                        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: THEME.accent }} />
                      </div>
                      <Paragraph className="opacity-85 mb-0">Total cost depends on your selections (level, equipment, days per week)</Paragraph>
                    </div>
                  </div>
                  <Button variant="outline" asChild className="w-full">
                    <Link href="/coaches">Browse coaches</Link>
                  </Button>
                </Card>
              </div>
            </motion.div>
          </Container>
        </section>

        {/* Security and payments */}
        <section className="py-12 md:py-16">
          <Container>
            <motion.div
              initial="hidden"
              animate="visible"
              variants={sectionVariants}
              className="max-w-3xl mx-auto"
            >
              <H2 className="mb-6 text-center">Security and payments</H2>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center mt-0.5" style={{ backgroundColor: THEME.accent + "20" }}>
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: THEME.accent }} />
                  </div>
                  <Paragraph>Visa and Mastercard payments</Paragraph>
                </div>
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center mt-0.5" style={{ backgroundColor: THEME.accent + "20" }}>
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: THEME.accent }} />
                  </div>
                  <Paragraph>Secure checkout</Paragraph>
                </div>
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center mt-0.5" style={{ backgroundColor: THEME.accent + "20" }}>
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: THEME.accent }} />
                  </div>
                  <Paragraph>We do not store your full card details</Paragraph>
                </div>
              </div>
            </motion.div>
          </Container>
        </section>

        {/* Refunds */}
        <section className="py-12 md:py-16">
          <Container>
            <motion.div
              initial="hidden"
              animate="visible"
              variants={sectionVariants}
              className="max-w-3xl mx-auto text-center"
            >
              <H2 className="mb-6">Refunds</H2>
              <div className="space-y-4 mb-6">
                <Paragraph>
                  Refund eligibility depends on the situation and the service used.
                </Paragraph>
                <Paragraph>
                  Please review our refund policy for details and eligibility.
                </Paragraph>
              </div>
              <Button variant="outline" asChild>
                <Link href="/legal/refunds">Read refund policy</Link>
              </Button>
            </motion.div>
          </Container>
        </section>

        {/* FAQ */}
        <section className="py-12 md:py-16">
          <Container>
            <motion.div
              initial="hidden"
              animate="visible"
              variants={sectionVariants}
              className="max-w-3xl mx-auto"
            >
              <H2 className="mb-8 text-center">FAQ</H2>
              <Accordion items={faqItems} />
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
              <H2 className="mb-6">Ready to start?</H2>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <motion.div variants={prefersReducedMotion ? undefined : buttonHoverLift} whileHover="hover">
                  <Button variant="primary" asChild>
                    <Link href="/pricing">See pricing</Link>
                  </Button>
                </motion.div>
                <motion.div variants={prefersReducedMotion ? undefined : buttonHoverLift} whileHover="hover">
                  <Button variant="outline" asChild>
                    <Link href="/generator">Open generator</Link>
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

