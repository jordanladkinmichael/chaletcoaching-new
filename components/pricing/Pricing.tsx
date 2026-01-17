"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  Button,
  H3,
  Badge,
} from "@/components/ui";
import { useCurrencyStore } from "@/lib/stores/currency-store";
import {
  TOKEN_PACKS,
  TOKEN_RATES,
  QUICK_AMOUNTS,
  calculateTokensFromAmount,
  wasRounded,
  type UiPackId,
  type Currency as TokenCurrency,
} from "@/lib/token-packages";
import { cardHoverLift } from "@/lib/animations";
import { cn } from "@/lib/utils";

type Region = "EU" | "UK" | "US";

type OpenAuthFn = (mode?: "signup" | "signin") => void;

export type PricingProps = {
  region: Region;
  requireAuth: boolean;
  openAuth: OpenAuthFn;
  onTierBuy: (pack: UiPackId) => Promise<void>;
  onCustomTopUp: (amountCurrency: number) => Promise<void>;
  loading?: boolean;
};

export function Pricing({
  requireAuth: _requireAuth,
  openAuth: _openAuth,
  onCustomTopUp: _onCustomTopUp,
  onTierBuy: _onTierBuy,
  loading,
}: PricingProps) {
  const { currency, formatPrice, convertPrice } = useCurrencyStore();

  // Custom Load collapsed state (collapsed on mobile by default)
  const [isCustomExpanded, setIsCustomExpanded] = React.useState(false);

  // Calculate prices for each package in current currency
  const getPackagePrice = (tokens: number): number => {
    // Base price in EUR
    const priceInEUR = tokens / TOKEN_RATES.EUR;
    // Convert to current currency
    return convertPrice(priceInEUR);
  };

  // Custom Load state
  const [customAmount, setCustomAmount] = React.useState<string>("");
  const customAmountNum = Number(customAmount.replace(",", ".")) || 0;

  // Calculate tokens for custom amount using single source of truth
  const customTokens = calculateTokensFromAmount(customAmountNum, currency as TokenCurrency);
  const customWasRounded = wasRounded(customAmountNum, currency as TokenCurrency);

  // Track which action is creating
  const [creating, setCreating] = React.useState<string | null>(null);

  // Terms acceptance state (single global checkbox)
  const [termsAccepted, setTermsAccepted] = React.useState(false);

  // Handle package purchase
  const handleBuy = async (pack: typeof TOKEN_PACKS[number]) => {
    if (_requireAuth) return _openAuth("signup");
    setCreating(pack.uiId);
    try {
      await _onTierBuy(pack.uiId);
    } catch (err) {
      console.error("Payment error:", err);
    } finally {
      setCreating(null);
    }
  };

  // Handle custom top-up
  const handleCustom = async () => {
    if (_requireAuth) return _openAuth("signup");
    if (!Number.isFinite(customAmountNum) || customAmountNum <= 0) return;

    setCreating("custom");
    try {
      await _onCustomTopUp(customAmountNum);
    } catch (err) {
      console.error("Payment error:", err);
    } finally {
      setCreating(null);
    }
  };

  // Currency symbols
  const currencySymbols: Record<typeof currency, string> = {
    EUR: "€",
    GBP: "£",
    USD: "$",
  };

  return (
    <div className="space-y-6">
      {/* Global Terms checkbox (always visible) */}
      <div className="mb-4">
        <label className="flex items-center gap-2 cursor-pointer text-sm">
          <input
            type="checkbox"
            checked={termsAccepted}
            onChange={(e) => setTermsAccepted(e.target.checked)}
            className="rounded border-border bg-surface text-primary focus:ring-2 focus:ring-focus focus:ring-offset-2 focus:ring-offset-bg cursor-pointer"
          />
          <span className="text-text-muted">
            I agree to the{" "}
            <Link 
              href="/legal/terms" 
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              Terms
            </Link>
          </span>
        </label>
      </div>

      {/* Package cards - fixed heights to prevent CLS */}
      <div className="grid gap-6 md:grid-cols-3">
        {TOKEN_PACKS.map((pack) => {
          const price = getPackagePrice(pack.tokens);
          return (
            <motion.div
              key={pack.uiId}
              variants={cardHoverLift}
              initial="rest"
              whileHover="hover"
              className="h-full"
            >
              <Card
                className={cn(
                  "relative flex flex-col h-full",
                  pack.highlight && "ring-2 ring-primary"
                )}
              >
                {pack.highlight && (
                  <Badge variant="primary" className="absolute top-4 right-4">
                    Most popular
                  </Badge>
                )}

                <CardHeader>
                  <H3 className="text-xl">{pack.title}</H3>
                </CardHeader>

                <CardContent className="flex-1">
                  <div className="mt-3 text-3xl font-bold tracking-tight text-primary">
                    {formatPrice(price)}
                  </div>
                  <div className="mt-1 text-sm text-text-muted">
                    {pack.tokens.toLocaleString("en-US")} tokens
                  </div>
                  <p className="mt-4 text-sm text-text-subtle">{pack.microcopy}</p>
                </CardContent>

                <CardFooter>
                  <Button
                    variant="primary"
                    fullWidth
                    disabled={!!loading || !!creating || _requireAuth || (!_requireAuth && !termsAccepted)}
                    onClick={() => void handleBuy(pack)}
                  >
                    {_requireAuth ? (
                      <>Sign in to buy tokens</>
                    ) : creating === pack.uiId ? (
                      <>Processing…</>
                    ) : (
                      <>Top up tokens</>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Custom Load - collapsed on mobile by default */}
      <Card>
        <button
          onClick={() => setIsCustomExpanded(!isCustomExpanded)}
          className="flex items-center justify-between w-full"
        >
          <div className="flex items-center gap-3">
            <H3>Custom Load</H3>
            <Badge variant="default">Flexible</Badge>
          </div>
          <ChevronRight
            size={20}
            className={cn(
              "text-text-muted transition-transform",
              isCustomExpanded && "rotate-90"
            )}
          />
        </button>

        {isCustomExpanded && (
          <div className="mt-6 space-y-4">
            <div>
              <label className="text-sm font-medium text-text-muted mb-2 block">
                Amount ({currency})
              </label>
              <div className="flex items-center gap-2">
                <span className="rounded-lg border border-border px-3 py-2 bg-surface text-text-muted">
                  {currencySymbols[currency]}
                </span>
                <input
                  type="number"
                  inputMode="decimal"
                  step="0.01"
                  min="0.01"
                  placeholder="0.00"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  className="flex-1 rounded-lg border border-border px-3 py-2 bg-surface text-text focus:outline-none focus:ring-2 focus:ring-focus"
                />
              </div>

              {/* Quick amount chips */}
              <div className="mt-3 flex flex-wrap gap-2">
                {QUICK_AMOUNTS[currency as TokenCurrency].map((amount) => (
                  <button
                    key={amount}
                    type="button"
                    onClick={() => setCustomAmount(amount.toString())}
                    className="px-3 py-1.5 text-xs rounded-lg border border-border bg-surface hover:bg-surface-hover text-text-muted hover:text-text transition-colors"
                  >
                    {currencySymbols[currency]}{amount}
                  </button>
                ))}
              </div>

              <div className="mt-3">
                <div className="text-base font-semibold text-primary">
                  You get: {customTokens.toLocaleString("en-US")} tokens
                </div>
                {customWasRounded && (
                  <p className="mt-1 text-xs text-text-subtle">
                    Rounded to nearest 10 tokens.
                  </p>
                )}
              </div>
              <p className="mt-2 text-xs text-text-subtle">Load exactly what you need</p>
            </div>

            <Button
              variant="primary"
              fullWidth
              disabled={
                !!loading ||
                !!creating ||
                customAmountNum <= 0 ||
                _requireAuth ||
                (!_requireAuth && !termsAccepted)
              }
              onClick={() => void handleCustom()}
            >
              {_requireAuth ? (
                <>Sign in to top up</>
              ) : creating === "custom" ? (
                <>Processing…</>
              ) : (
                <>Top up tokens</>
              )}
            </Button>
          </div>
        )}
      </Card>

      {/* What tokens unlock section */}
      <section className="mt-8">
        <H3 className="mb-6">What tokens unlock</H3>
        <div className="grid md:grid-cols-2 gap-6">
          {/* Column A: Instant AI Generator */}
          <Card>
            <CardHeader>
              <H3 className="text-lg">Instant AI Generator</H3>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-text-muted mb-4">
                <li>• Preview plan: 50 tokens</li>
                <li>• Publish full plan: calculated based on selected options</li>
              </ul>
              <Button variant="outline" asChild>
                <Link href="/generator">Open generator</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Column B: Coach-built request */}
          <Card>
            <CardHeader>
              <H3 className="text-lg">Coach-built request</H3>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm text-text-muted mb-4">
                <div>Base: 10,000 tokens</div>
                <div className="opacity-80 mt-2">Add-ons:</div>
                <ul className="ml-4 space-y-1 text-xs opacity-70">
                  <li>• Level: Intermediate +5,000, Advanced +12,000</li>
                  <li>• Training type: Mixed +4,000</li>
                  <li>• Equipment: Basic +3,000, Full gym +6,000</li>
                  <li>• Days/week: 4 +4,000, 5 +8,000, 6 +12,000</li>
                </ul>
                <div className="mt-3 text-xs opacity-80">
                  Example: Intermediate + Basic + 4 days/week = 22,000 tokens
                </div>
              </div>
              <Button variant="outline" asChild>
                <Link href="/coaches">Browse coaches</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}

