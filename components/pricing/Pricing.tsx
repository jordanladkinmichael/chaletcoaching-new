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
import { VAT_RATE } from "@/lib/exchange-rates";
import { getLocalizedCopy, type PricingContextKey } from "@/lib/copy-variants";
import { useLocale } from "@/lib/i18n/client";
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
  /** Renders different copy for home vs pricing page to reduce duplicate content. */
  context?: "home" | "pricing-page";
};

export function Pricing({
  requireAuth: _requireAuth,
  openAuth: _openAuth,
  onCustomTopUp: _onCustomTopUp,
  onTierBuy: _onTierBuy,
  loading,
  context = "pricing-page",
}: PricingProps) {
  const { locale } = useLocale();
  const { currency, formatPrice, formatPriceWithVat } = useCurrencyStore();

  // Custom Load collapsed state (collapsed on mobile by default)
  const [isCustomExpanded, setIsCustomExpanded] = React.useState(false);

  // Calculate net price in EUR for formatting helpers
  const getNetPriceEUR = (tokens: number): number => {
    return tokens / TOKEN_RATES.EUR;
  };

  // Custom Load state
  const [customAmount, setCustomAmount] = React.useState<string>("");
  const customAmountNum = Number(customAmount.replace(",", ".")) || 0;

  // Calculate tokens for custom amount using single source of truth
  const customTokens = calculateTokensFromAmount(
    customAmountNum,
    currency as TokenCurrency
  );
  const customWasRounded = wasRounded(
    customAmountNum,
    currency as TokenCurrency
  );

  const localizedCopy = getLocalizedCopy(locale);
  const copy = React.useMemo(() => {
    if (locale !== "tr") {
      return localizedCopy.pricingContext[context as PricingContextKey];
    }

    if (context === "home") {
      return {
        vatNotice:
          "Fiyatlara KDV dahildir. Token maliyeti KDV öncesi net tutara göre hesaplanır.",
        sectionHeading: "Tokenları şu için kullanın",
        leftCardTitle: "AI ile üretilen planlar",
        leftCardBullets:
          "50 token ile önizleme alın, sonra yayınlayın. Maliyet seçilen seçeneklere göre değişir.",
        leftCta: "Oluşturucuya gidin",
        rightCardTitle: "Koç talepleri",
        rightCta: "Bir koç bulun",
        cardMicrocopy: {
          starter: "Denemek için",
          momentum: "Tutarlı antrenman değeri",
          elite: "Ciddi hedefler için",
        },
        buyButton: "Token alın",
        signInButton: "Başlamak için giriş yapın",
        popularBadge: "Popüler seçim",
        customTitle: "Özel tutar",
        customBadge: "Herhangi bir tutar",
        customHelper: "Kendi tutarınızı seçin",
        customButton: "Token ekle",
        customSignIn: "Önce giriş yapın",
      };
    }

    return {
      vatNotice:
        "Gösterilen tüm paket fiyatlarına %20 KDV dahildir. Tokenlar KDV öncesi net fiyata göre hesaplanır.",
      sectionHeading: "Tokenlarla neler yapabilirsiniz",
      leftCardTitle: "Instant AI planları",
      leftCardBullets: "Önizleme: 50 token. Tam plan: seçeneklerinize bağlıdır.",
      leftCta: "Bir AI planı oluşturun",
      rightCardTitle: "Koç tarafından hazırlanan planlar",
      rightCta: "Bir koç planı isteyin",
      cardMicrocopy: {
        starter: "Hızlı bir başlangıç için",
        momentum: "Süreklilik için en iyi değer",
        elite: "Uzun vadeli gelişim için",
      },
      buyButton: "Token yükle",
      signInButton: "Token almak için giriş yapın",
      popularBadge: "En popüler",
      customTitle: "Özel Yükleme",
      customBadge: "Esnek",
      customHelper: "İhtiyacınız kadar yükleyin",
      customButton: "Token yükle",
      customSignIn: "Yükleme için giriş yapın",
    };
  }, [context, locale, localizedCopy]);
  const uiCopy =
    locale === "tr"
      ? {
          agreeTo: "Şunları kabul ediyorum:",
          terms: "Koşullar",
          net: "Net:",
          vatSuffix: "+ %20 KDV",
          vatLabel: "%20 KDV",
          tokens: "token",
          processing: "İşleniyor...",
          amountLabel: `Tutar (${currency}) - KDV öncesi net fiyat`,
          youGet: "Alacağınız:",
          rounded: "En yakın 10 tokena yuvarlandı.",
          vatAdded: "kasada eklenecek",
          bullet: "-",
          base: "Baz: 10,000 token",
          addons: "Ekler:",
          addonLines: [
            "Seviye: Orta +5,000, İleri +12,000",
            "Antrenman tipi: Karma +4,000",
            "Ekipman: Temel +3,000, Full gym +6,000",
            "Gün/hafta: 4 +4,000, 5 +8,000, 6 +12,000",
          ],
          example: "Örnek: Orta + Temel + haftada 4 gün = 22,000 token",
          fromPlan:
            "10,000 tokendan başlar. Seviye, ekipman ve haftalık gün sayısı için ekler uygulanır.",
          packTitles: {
            starter: "Başlangıç Paketi",
            momentum: "Momentum Paketi",
            elite: "Elite Performans",
          } as Record<UiPackId, string>,
        }
      : {
          agreeTo: "I agree to the",
          terms: "Terms",
          net: "Net:",
          vatSuffix: "+ 20% VAT",
          vatLabel: "20% VAT",
          tokens: "tokens",
          processing: "Processing...",
          amountLabel: `Amount (${currency}) - net price before VAT`,
          youGet: "You get:",
          rounded: "Rounded to nearest 10 tokens.",
          vatAdded: "will be added at checkout",
          bullet: "-",
          base: "Base: 10,000 tokens",
          addons: "Add-ons:",
          addonLines: [
            "Level: Intermediate +5,000, Advanced +12,000",
            "Training type: Mixed +4,000",
            "Equipment: Basic +3,000, Full gym +6,000",
            "Days/week: 4 +4,000, 5 +8,000, 6 +12,000",
          ],
          example: "Example: Intermediate + Basic + 4 days/week = 22,000 tokens",
          fromPlan:
            "From 10,000 tokens. Add-ons for level, equipment, and days per week.",
          packTitles: {
            starter: "Starter Spark",
            momentum: "Momentum Pack",
            elite: "Elite Performance",
          } as Record<UiPackId, string>,
        };

  // Track which action is creating
  const [creating, setCreating] = React.useState<string | null>(null);

  // Terms acceptance state (single global checkbox)
  const [termsAccepted, setTermsAccepted] = React.useState(false);

  // Handle package purchase
  const handleBuy = async (pack: (typeof TOKEN_PACKS)[number]) => {
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
            {uiCopy.agreeTo}{" "}
            <Link
              href="/legal/terms"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              {uiCopy.terms}
            </Link>
          </span>
        </label>
      </div>

      {/* Package cards - fixed heights to prevent CLS */}
      <div className="grid gap-6 md:grid-cols-3">
        {TOKEN_PACKS.map((pack) => {
          const netPriceEUR = getNetPriceEUR(pack.tokens);
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
                    {copy.popularBadge}
                  </Badge>
                )}

                <CardHeader>
                  <H3 className="text-xl">{uiCopy.packTitles[pack.uiId]}</H3>
                </CardHeader>

                <CardContent className="flex-1">
                  <div className="mt-3 text-3xl font-bold tracking-tight text-primary">
                    {formatPriceWithVat(netPriceEUR)}
                  </div>
                  <div className="mt-1 text-xs text-text-subtle">
                    {uiCopy.net} {formatPrice(netPriceEUR)} {uiCopy.vatSuffix}
                  </div>
                  <div className="mt-1 text-sm text-text-muted">
                    {pack.tokens.toLocaleString("en-US")} {uiCopy.tokens}
                  </div>
                  <p className="mt-4 text-sm text-text-subtle">
                    {copy.cardMicrocopy[pack.uiId as keyof typeof copy.cardMicrocopy]}
                  </p>
                </CardContent>

                <CardFooter>
                  <Button
                    variant="primary"
                    fullWidth
                    disabled={
                      !!loading ||
                      !!creating ||
                      _requireAuth ||
                      (!_requireAuth && !termsAccepted)
                    }
                    onClick={() => void handleBuy(pack)}
                  >
                    {_requireAuth ? (
                      <>{copy.signInButton}</>
                    ) : creating === pack.uiId ? (
                      <>{uiCopy.processing}</>
                    ) : (
                      <>{copy.buyButton}</>
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
            <H3>{copy.customTitle}</H3>
            <Badge variant="default">{copy.customBadge}</Badge>
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
                {uiCopy.amountLabel}
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
                    {currencySymbols[currency]}
                    {amount}
                  </button>
                ))}
              </div>

              <div className="mt-3">
                <div className="text-base font-semibold text-primary">
                  {uiCopy.youGet} {customTokens.toLocaleString("en-US")} {uiCopy.tokens}
                </div>
                {customWasRounded && (
                  <p className="mt-1 text-xs text-text-subtle">
                    {uiCopy.rounded}
                  </p>
                )}
                {customAmountNum > 0 && (
                  <p className="mt-1 text-xs text-text-subtle">
                    +{uiCopy.vatLabel} ({currencySymbols[currency]}
                    {(customAmountNum * VAT_RATE).toFixed(2)}) {uiCopy.vatAdded}
                  </p>
                )}
              </div>
              <p className="mt-2 text-xs text-text-subtle">
                {copy.customHelper}
              </p>
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
                <>{copy.customSignIn}</>
              ) : creating === "custom" ? (
                <>{uiCopy.processing}</>
              ) : (
                <>{copy.customButton}</>
              )}
            </Button>
          </div>
        )}
      </Card>

      {/* Prices include VAT notice — wording varies by context for SEO */}
      <p className="text-xs text-text-subtle text-center">
        {copy.vatNotice}
      </p>

      {/* What tokens unlock section — different headings and CTAs per context */}
      <section className="mt-8">
        <H3 className="mb-6">{copy.sectionHeading}</H3>
        <div className="grid md:grid-cols-2 gap-6">
          {/* Column A: Instant AI */}
          <Card>
            <CardHeader>
              <H3 className="text-lg">{copy.leftCardTitle}</H3>
            </CardHeader>
            <CardContent>
              {context === "pricing-page" ? (
                <ul className="space-y-2 text-sm text-text-muted mb-4">
                  <li>{uiCopy.bullet} {copy.leftCardBullets}</li>
                </ul>
              ) : (
                <ul className="space-y-2 text-sm text-text-muted mb-4">
                  <li>{uiCopy.bullet} {copy.leftCardBullets}</li>
                </ul>
              )}
              <Button variant="outline" asChild>
                <Link href="/generator">{copy.leftCta}</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Column B: Coach */}
          <Card>
            <CardHeader>
              <H3 className="text-lg">{copy.rightCardTitle}</H3>
            </CardHeader>
            <CardContent>
              {context === "pricing-page" ? (
                <div className="space-y-2 text-sm text-text-muted mb-4">
                  <div>{uiCopy.base}</div>
                  <div className="opacity-80 mt-2">{uiCopy.addons}</div>
                  <ul className="ml-4 space-y-1 text-xs opacity-70">
                    {uiCopy.addonLines.map((line) => (
                      <li key={line}>{uiCopy.bullet} {line}</li>
                    ))}
                  </ul>
                  <div className="mt-3 text-xs opacity-80">
                    {uiCopy.example}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-text-muted mb-4">
                  {uiCopy.fromPlan}
                </p>
              )}
              <Button variant="outline" asChild>
                <Link href="/coaches">{copy.rightCta}</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
