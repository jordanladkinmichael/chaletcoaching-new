"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import {
  Coins,
  UserRound,
  Zap,
  LayoutDashboard,
  Wrench,
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
} from "@/components/ui";
import { useCurrencyStore } from "@/lib/stores/currency-store";
import { useDebounce } from "@/lib/hooks";
import { cardHoverLift, fadeIn } from "@/lib/animations";
import { THEME } from "@/lib/theme";
import {
  SUPPORT_ARTICLES,
  getArticleBySlug,
  getArticlesByCategory,
  searchArticles,
  getCategoryCount,
  getPopularArticles,
  CATEGORY_LABELS,
  type SupportCategory,
  type SupportArticle,
} from "@/lib/support-articles";
import type { Route } from "next";
import { SupportSearch } from "@/components/support/support-search";
import { ArticleList } from "@/components/support/article-list";
import { ArticleViewer } from "@/components/support/article-viewer";

type Region = "EU" | "UK" | "US";

function SupportPageContent() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { currency } = useCurrencyStore();
  const [balance, setBalance] = useState(0);
  const [balanceLoading, setBalanceLoading] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Determine region from currency
  const region: Region = currency === "USD" ? "US" : currency === "GBP" ? "UK" : "EU";

  const isAuthed = !!session?.user;

  // URL params
  const articleSlug = searchParams.get("article") || undefined;
  const categoryParam = searchParams.get("category") || undefined;
  const queryParam = searchParams.get("q") || "";

  // Local state
  const [searchQuery, setSearchQuery] = useState(queryParam);
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

  // Sync search query with URL
  useEffect(() => {
    if (debouncedSearch !== queryParam) {
      const params = new URLSearchParams(searchParams.toString());
      if (debouncedSearch) {
        params.set("q", debouncedSearch);
      } else {
        params.delete("q");
      }
      const target = `/support?${params.toString()}` as Route;
      router.replace(target, { scroll: false });
    }
  }, [debouncedSearch, queryParam, searchParams, router]);

  // Load article from URL on mount
  useEffect(() => {
    if (articleSlug) {
      const article = getArticleBySlug(articleSlug);
      if (!article) {
        // Slug not found - reset parameter
        const params = new URLSearchParams(searchParams.toString());
        params.delete("article");
        const target = `/support?${params.toString()}` as Route;
        router.replace(target, { scroll: false });
      } else {
        // Scroll to viewer on mobile
        if (window.innerWidth < 768) {
          const viewer = document.getElementById("article-viewer");
          if (viewer) {
            viewer.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        }
      }
    }
  }, [articleSlug, searchParams, router]);

  // Auth handler
  const openAuth = (mode: "signin" | "signup" = "signin") => {
    const currentPath = typeof window !== "undefined" ? window.location.pathname : "";
    const returnTo = currentPath !== "/auth/sign-in" && currentPath !== "/auth/sign-up" && currentPath !== "/auth/reset-password"
      ? currentPath
      : "/dashboard";
    const query = returnTo ? `?returnTo=${encodeURIComponent(returnTo)}` : "";
    router.push(`/auth/${mode}${query}` as Route);
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

  // Filter articles
  const activeCategory: SupportCategory | "all" = categoryParam ? (categoryParam as SupportCategory) : "all";
  const filteredArticles = useMemo(() => {
    let articles =
      activeCategory === "all"
        ? SUPPORT_ARTICLES
        : getArticlesByCategory(activeCategory);

    if (debouncedSearch) {
      articles = searchArticles(debouncedSearch).filter((article) =>
        activeCategory === "all"
          ? true
          : article.category === activeCategory
      );
    }

    return articles;
  }, [debouncedSearch, activeCategory]);

  // Selected article
  const selectedArticle: SupportArticle | null = articleSlug ? getArticleBySlug(articleSlug) ?? null : null;

  // Handle article selection
  const handleSelectArticle = (slug: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("article", slug);
    const target = `/support?${params.toString()}` as Route;
    router.push(target, { scroll: false });
    
    // Scroll to viewer on mobile
    if (window.innerWidth < 768) {
      setTimeout(() => {
        const viewer = document.getElementById("article-viewer");
        if (viewer) {
          viewer.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 100);
    }
  };

  // Handle category filter
  const handleCategoryFilter = (category: SupportCategory | "all") => {
    const params = new URLSearchParams(searchParams.toString());
    if (category === "all") {
      params.delete("category");
    } else {
      params.set("category", category);
    }
    params.delete("article"); // Clear selected article when changing category
    const target = `/support?${params.toString()}` as Route;
    router.push(target, { scroll: false });
    
    // Scroll to articles section
    setTimeout(() => {
      const articlesSection = document.getElementById("articles-section");
      if (articlesSection) {
        articlesSection.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 100);
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

  // Category cards data
  const categoryCards = [
    {
      category: "tokens_billing" as SupportCategory,
      icon: Coins,
      label: CATEGORY_LABELS.tokens_billing,
      description: "Rates, top-ups, receipts, and pricing",
    },
    {
      category: "coach_requests" as SupportCategory,
      icon: UserRound,
      label: CATEGORY_LABELS.coach_requests,
      description: "How to request a coach-built plan",
    },
    {
      category: "instant_ai" as SupportCategory,
      icon: Zap,
      label: CATEGORY_LABELS.instant_ai,
      description: "Preview, publish, and common issues",
    },
    {
      category: "account_dashboard" as SupportCategory,
      icon: LayoutDashboard,
      label: CATEGORY_LABELS.account_dashboard,
      description: "Sign-in, balance, and where to find plans",
    },
    {
      category: "troubleshooting" as SupportCategory,
      icon: Wrench,
      label: CATEGORY_LABELS.troubleshooting,
      description: "Fix common errors and loading issues",
    },
    {
      category: "trust_safety" as SupportCategory,
      icon: Shield,
      label: CATEGORY_LABELS.trust_safety,
      description: "Safe training guidance and disclaimers",
    },
  ];

  // Popular articles
  const popularArticles = getPopularArticles();

  // Common fixes data
  const commonFixes = {
    coach: [
      { slug: "coach-request-overview", text: "How coach requests work" },
      { slug: "coach-request-pricing", text: "Understanding pricing" },
      { slug: "coach-request-tips", text: "Tips for better requests" },
      { slug: "coach-profile-request", text: "Requesting from a profile" },
    ],
    instantAi: [
      { slug: "instant-ai-preview", text: "How previews work" },
      { slug: "instant-ai-publish", text: "Publishing your plan" },
      { slug: "instant-ai-costs", text: "What affects cost" },
      { slug: "generation-stuck", text: "Generation is stuck" },
    ],
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
                <H1>Support and help center</H1>
                <Paragraph className="text-lg">
                  Find quick answers about tokens, payments, coach requests, and Instant AI plans.
                </Paragraph>
              </div>

              <div className="max-w-2xl mx-auto">
                <SupportSearch
                  value={searchQuery}
                  onChange={setSearchQuery}
                  resultCount={filteredArticles.length}
                />
              </div>

              <div className="flex flex-wrap justify-center gap-4 text-sm">
                <Link
                  href="/payments-tokens"
                  className="opacity-70 hover:opacity-100 transition-opacity underline"
                >
                  Payments & tokens
                </Link>
                <Link
                  href="/how-it-works"
                  className="opacity-70 hover:opacity-100 transition-opacity underline"
                >
                  How it works
                </Link>
                <Link
                  href="/contact?topic=Tokens%20and%20billing"
                  className="opacity-70 hover:opacity-100 transition-opacity underline"
                >
                  Contact us
                </Link>
              </div>
            </motion.div>
          </Container>
        </section>

        {/* Browse by topic */}
        <section className="py-12 md:py-16">
          <Container>
            <motion.div
              initial="hidden"
              animate="visible"
              variants={sectionVariants}
            >
              <H2 className="mb-8 text-center">Browse by topic</H2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categoryCards.map((card) => {
                  const Icon = card.icon;
                  return (
                    <motion.div
                      key={card.category}
                      variants={prefersReducedMotion ? undefined : cardHoverLift}
                      whileHover="hover"
                    >
                      <Card
                        interactive
                        onClick={() => handleCategoryFilter(card.category)}
                        className="h-full cursor-pointer"
                      >
                        <div className="flex items-start gap-4">
                          <div
                            className="p-2 rounded-lg flex-shrink-0"
                            style={{ backgroundColor: THEME.accent + "20" }}
                          >
                            <Icon size={24} style={{ color: THEME.accent }} />
                          </div>
                          <div className="flex-1">
                            <H3 className="mb-2">{card.label}</H3>
                            <Paragraph className="text-sm opacity-85 mb-0">
                              {card.description}
                            </Paragraph>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </Container>
        </section>

        {/* Articles */}
        <section id="articles-section" className="py-12 md:py-16">
          <Container>
            <motion.div
              initial="hidden"
              animate="visible"
              variants={sectionVariants}
            >
              <H2 className="mb-6">Articles</H2>

              {/* Filter chips */}
              <div className="flex flex-wrap gap-2 mb-6">
                <button
                  onClick={() => handleCategoryFilter("all")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    activeCategory === "all"
                      ? "bg-accent text-black"
                      : "bg-surface-hover text-text border border-border hover:border-opacity-60"
                  }`}
                  style={
                    activeCategory === "all"
                      ? { backgroundColor: THEME.accent, color: "#0E0E10" }
                      : {}
                  }
                >
                  All ({getCategoryCount("all")})
                </button>
                {categoryCards.map((card) => (
                  <button
                    key={card.category}
                    onClick={() => handleCategoryFilter(card.category)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      activeCategory === card.category
                        ? "bg-accent text-black"
                        : "bg-surface-hover text-text border border-border hover:border-opacity-60"
                    }`}
                    style={
                      activeCategory === card.category
                        ? { backgroundColor: THEME.accent, color: "#0E0E10" }
                        : {}
                    }
                  >
                    {card.label} ({getCategoryCount(card.category)})
                  </button>
                ))}
              </div>

              {/* Articles grid */}
              {filteredArticles.length === 0 ? (
                <Card className="text-center py-12">
                  <H3 className="mb-2">No results</H3>
                  <Paragraph className="opacity-70 mb-4">
                    Try different keywords or browse by topic.
                  </Paragraph>
                  <Button variant="primary" asChild>
                    <Link href="/contact?topic=Other%20%2F%20Support">Contact support</Link>
                  </Button>
                </Card>
              ) : (
                <div className="grid md:grid-cols-2 gap-8">
                  {/* Left: Article list */}
                  <div>
                    <ArticleList
                      articles={filteredArticles}
                      selectedSlug={articleSlug}
                      onSelect={handleSelectArticle}
                    />
                  </div>

                  {/* Right: Article viewer (desktop) */}
                  <div className="hidden md:block sticky top-24 self-start">
                    <Card className="p-6">
                      <ArticleViewer article={selectedArticle} />
                    </Card>
                  </div>
                </div>
              )}

              {/* Mobile: Article viewer (below list) */}
              {articleSlug && (
                <div className="md:hidden mt-8">
                  <Card className="p-6">
                    <ArticleViewer article={selectedArticle} />
                  </Card>
                </div>
              )}
            </motion.div>
          </Container>
        </section>

        {/* Popular articles */}
        <section className="py-12 md:py-16">
          <Container>
            <motion.div
              initial="hidden"
              animate="visible"
              variants={sectionVariants}
            >
              <H2 className="mb-6 text-center">Popular articles</H2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
                {popularArticles.map((article) => (
                  <button
                    key={article.slug}
                    onClick={() => handleSelectArticle(article.slug)}
                    className="text-left p-4 rounded-lg border border-border bg-surface hover:border-opacity-60 transition-colors"
                  >
                    <Paragraph className="font-semibold mb-1">
                      {article.title}
                    </Paragraph>
                    <Paragraph className="text-sm opacity-70 mb-0 line-clamp-2">
                      {article.description}
                    </Paragraph>
                  </button>
                ))}
              </div>
            </motion.div>
          </Container>
        </section>

        {/* Common fixes */}
        <section className="py-12 md:py-16">
          <Container>
            <motion.div
              initial="hidden"
              animate="visible"
              variants={sectionVariants}
            >
              <H2 className="mb-6 text-center">Common fixes</H2>
              <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                {/* Coach requests */}
                <Card>
                  <H3 className="mb-4">Coach requests</H3>
                  <ul className="space-y-2">
                    {commonFixes.coach.map((fix) => (
                      <li key={fix.slug}>
                        <button
                          onClick={() => handleSelectArticle(fix.slug)}
                          className="text-left w-full p-2 rounded-lg hover:bg-surface-hover transition-colors text-sm opacity-85 hover:opacity-100"
                        >
                          {fix.text}
                        </button>
                      </li>
                    ))}
                  </ul>
                </Card>

                {/* Instant AI */}
                <Card>
                  <H3 className="mb-4">Instant AI</H3>
                  <ul className="space-y-2">
                    {commonFixes.instantAi.map((fix) => (
                      <li key={fix.slug}>
                        <button
                          onClick={() => handleSelectArticle(fix.slug)}
                          className="text-left w-full p-2 rounded-lg hover:bg-surface-hover transition-colors text-sm opacity-85 hover:opacity-100"
                        >
                          {fix.text}
                        </button>
                      </li>
                    ))}
                  </ul>
                </Card>
              </div>
            </motion.div>
          </Container>
        </section>

        {/* Still need help? */}
        <section className="py-12 md:py-16">
          <Container>
            <motion.div
              initial="hidden"
              animate="visible"
              variants={sectionVariants}
              className="max-w-3xl mx-auto text-center"
            >
              <H2 className="mb-4">Still need help?</H2>
              <Paragraph className="mb-6">
                If you can&apos;t find an answer, contact us and include as much detail as possible.
              </Paragraph>

              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                <Button variant="primary" asChild>
                  <Link href="/contact">Contact support</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/contact?topic=Other%20%2F%20Support">Report an issue</Link>
                </Button>
              </div>

              <Card className="text-left">
                <H3 className="mb-4">Checklist</H3>
                <ul className="space-y-2">
                  <li className="flex gap-3">
                    <div className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5" style={{ backgroundColor: THEME.accent + "20" }}>
                      <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: THEME.accent }} />
                    </div>
                    <Paragraph className="opacity-85 mb-0">What you were trying to do</Paragraph>
                  </li>
                  <li className="flex gap-3">
                    <div className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5" style={{ backgroundColor: THEME.accent + "20" }}>
                      <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: THEME.accent }} />
                    </div>
                    <Paragraph className="opacity-85 mb-0">Any error message</Paragraph>
                  </li>
                  <li className="flex gap-3">
                    <div className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5" style={{ backgroundColor: THEME.accent + "20" }}>
                      <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: THEME.accent }} />
                    </div>
                    <Paragraph className="opacity-85 mb-0">Screenshots if possible</Paragraph>
                  </li>
                  <li className="flex gap-3">
                    <div className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5" style={{ backgroundColor: THEME.accent + "20" }}>
                      <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: THEME.accent }} />
                    </div>
                    <Paragraph className="opacity-85 mb-0">Your account email (if signed in)</Paragraph>
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

export default function SupportPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <SupportPageContent />
    </Suspense>
  );
}
