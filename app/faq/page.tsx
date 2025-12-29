"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, type Variants } from "framer-motion";
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
  SearchInput,
} from "@/components/ui";
import { useCurrencyStore } from "@/lib/stores/currency-store";
import { useDebounce } from "@/lib/hooks";
import { fadeIn } from "@/lib/animations";
import { THEME } from "@/lib/theme";
import {
  FAQ_ITEMS,
  getFaqItemsByCategory,
  searchFaqItems,
  getCategoryCount,
  CATEGORY_LABELS,
  type FaqCategory,
} from "@/lib/faq-data";
import type { Route } from "next";

type Region = "EU" | "UK" | "US";

export default function FAQPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { currency } = useCurrencyStore();
  const [balance, setBalance] = useState(0);
  const [balanceLoading, setBalanceLoading] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Determine region from currency
  const region: Region = currency === "USD" ? "US" : currency === "GBP" ? "UK" : "EU";

  const isAuthed = !!session?.user;

  // Local state
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<FaqCategory | "all">("all");
  const debouncedSearch = useDebounce(searchQuery, 150);

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
    void signIn("credentials", { callbackUrl: "/faq" });
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

  // Filter FAQ items
  const filteredItems = useMemo(() => {
    let items = activeCategory === "all"
      ? FAQ_ITEMS
      : getFaqItemsByCategory(activeCategory);

    if (debouncedSearch) {
      items = searchFaqItems(debouncedSearch).filter((item) =>
        activeCategory === "all" || item.category === activeCategory
      );
    }

    return items;
  }, [debouncedSearch, activeCategory]);

  // Convert to Accordion format
  const accordionItems: AccordionItem[] = useMemo(() => {
    return filteredItems.map((item) => {
      // Parse answer for links
      let answerContent: React.ReactNode = item.answer;
      
      // Handle refund policy links
      if (item.id === "can-get-refund") {
        // "Refund eligibility depends on the situation and service used. See our refund policy for details."
        const match = item.answer.match(/^(.*?)(refund policy)(.*)$/i);
        if (match) {
          answerContent = (
            <>
              {match[1]}
              <Link
                href="/legal/refunds"
                className="underline opacity-80 hover:opacity-100 transition-opacity"
              >
                {match[2]}
              </Link>
              {match[3]}
            </>
          );
        }
      } else if (item.id === "where-read-refund-policy") {
        // "You can read it on our refunds page."
        const match = item.answer.match(/^(.*?)(refunds page)(.*)$/i);
        if (match) {
          answerContent = (
            <>
              {match[1]}
              <Link
                href="/legal/refunds"
                className="underline opacity-80 hover:opacity-100 transition-opacity"
              >
                {match[2]}
              </Link>
              {match[3]}
            </>
          );
        }
      }

      return {
        id: item.id,
        title: item.question,
        content: (
          <Paragraph className="opacity-90 mb-0">
            {answerContent}
          </Paragraph>
        ),
      };
    });
  }, [filteredItems]);

  // Split into 2 columns
  const leftColumn = accordionItems.slice(0, Math.ceil(accordionItems.length / 2));
  const rightColumn = accordionItems.slice(Math.ceil(accordionItems.length / 2));

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

  // Category options
  const categories: Array<{ value: FaqCategory | "all"; label: string }> = [
    { value: "all", label: "All" },
    { value: "getting_started", label: CATEGORY_LABELS.getting_started },
    { value: "coaches", label: CATEGORY_LABELS.coaches },
    { value: "instant_ai", label: CATEGORY_LABELS.instant_ai },
    { value: "tokens_payments", label: CATEGORY_LABELS.tokens_payments },
    { value: "account", label: CATEGORY_LABELS.account },
    { value: "safety", label: CATEGORY_LABELS.safety },
    { value: "refunds", label: CATEGORY_LABELS.refunds },
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
        {/* Hero + Search */}
        <section className="py-12 md:py-16">
          <Container>
            <motion.div
              initial="hidden"
              animate="visible"
              variants={sectionVariants}
              className="space-y-6"
            >
              <div className="text-center space-y-4 max-w-3xl mx-auto">
                <H1>Frequently asked questions</H1>
                <Paragraph className="text-lg">
                  Quick answers about coaches, Instant AI plans, tokens, and safety.
                </Paragraph>
              </div>

              <div className="max-w-2xl mx-auto">
                <div className="space-y-3">
                  <div className="relative">
                    <label htmlFor="faq-search" className="sr-only">
                      Search
                    </label>
                    <SearchInput
                      id="faq-search"
                      placeholder="Search questions..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
                    <Paragraph className="text-sm opacity-70 mb-0">
                      Popular: tokens, preview, refunds, dashboard
                    </Paragraph>
                    
                    {searchQuery && (
                      <div
                        aria-live="polite"
                        className="text-sm opacity-70"
                      >
                        Showing {filteredItems.length} {filteredItems.length === 1 ? "question" : "questions"}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap justify-center gap-4 text-sm">
                <Link
                  href="/support"
                  className="opacity-70 hover:opacity-100 transition-opacity underline"
                >
                  Support
                </Link>
                <Link
                  href="/payments-tokens"
                  className="opacity-70 hover:opacity-100 transition-opacity underline"
                >
                  Payments & tokens
                </Link>
                <Link
                  href="/trust-safety"
                  className="opacity-70 hover:opacity-100 transition-opacity underline"
                >
                  Trust & safety
                </Link>
              </div>
            </motion.div>
          </Container>
        </section>

        {/* Category chips */}
        <section className="py-6">
          <Container>
            <motion.div
              initial="hidden"
              animate="visible"
              variants={sectionVariants}
            >
              <div className="flex flex-wrap gap-2 justify-center">
                {categories.map((cat) => (
                  <button
                    key={cat.value}
                    onClick={() => setActiveCategory(cat.value)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      activeCategory === cat.value
                        ? "bg-accent text-black"
                        : "bg-surface-hover text-text border border-border hover:border-opacity-60"
                    }`}
                    style={
                      activeCategory === cat.value
                        ? { backgroundColor: THEME.accent, color: "#0E0E10" }
                        : {}
                    }
                  >
                    {cat.label} ({getCategoryCount(cat.value)})
                  </button>
                ))}
              </div>
            </motion.div>
          </Container>
        </section>

        {/* FAQ content */}
        <section className="py-12 md:py-16">
          <Container>
            <motion.div
              initial="hidden"
              animate="visible"
              variants={sectionVariants}
            >
              {filteredItems.length === 0 ? (
                <Card className="text-center py-12">
                  <H2 className="mb-2">No results</H2>
                  <Paragraph className="opacity-70 mb-4">
                    Try different keywords or browse by category.
                  </Paragraph>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button variant="primary" asChild>
                      <Link href="/support">Open support</Link>
                    </Button>
                    <Button variant="outline" asChild>
                      <Link href="/contact">Contact us</Link>
                    </Button>
                  </div>
                </Card>
              ) : (
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Accordion items={leftColumn} allowMultiple />
                  </div>
                  <div>
                    <Accordion items={rightColumn} allowMultiple />
                  </div>
                </div>
              )}
            </motion.div>
          </Container>
        </section>

        {/* Still have questions? CTA */}
        <section className="py-12 md:py-16">
          <Container>
            <motion.div
              initial="hidden"
              animate="visible"
              variants={sectionVariants}
              className="max-w-3xl mx-auto"
            >
              <Card className="text-center">
                <H2 className="mb-4">Still have questions?</H2>
                <Paragraph className="mb-6">
                  Browse support articles or contact us for help.
                </Paragraph>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button variant="primary" asChild>
                    <Link href="/support">Open support</Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href="/contact">Contact us</Link>
                  </Button>
                </div>
              </Card>
            </motion.div>
          </Container>
        </section>
      </main>

      <SiteFooter onNavigate={handleNavigate} />
    </div>
  );
}
