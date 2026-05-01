"use client";

import * as React from "react";
import Image from "next/image";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import type { Route } from "next";
import { ChevronDown, Lock, LogIn, Menu, UserPlus, X } from "lucide-react";
import { Skeleton } from "@/components/ui";
import { CurrencyDropdown } from "@/components/ui/currency-dropdown";
import { LanguageDropdown } from "@/components/ui/language-dropdown";
import { useTranslations } from "@/lib/i18n/client";
import { formatNumber as formatNumberLocal } from "@/lib/tokens";
import { THEME } from "@/lib/theme";

type Region = "EU" | "UK" | "US";

type NavItem = {
  id: string;
  label: string;
  protected?: boolean;
};

type DropdownLink = {
  id: string;
  label: string;
  href: Route;
};

export default function SiteHeader({
  onOpenAuth,
  onNavigate,
  balance,
  balanceLoading,
  region,
  setRegion,
  formatNumber: formatNumberProp,
}: {
  onOpenAuth?: (mode: "signin" | "signup") => void;
  onNavigate: (page: string) => void;
  balance?: number | null;
  balanceLoading?: boolean;
  region: Region;
  setRegion: (region: Region) => void;
  formatNumber?: (n: number) => string;
}) {
  const { data: session } = useSession();
  const router = useRouter();
  const tHeader = useTranslations("header");
  const tCommon = useTranslations("common");
  const isAuthed = !!session?.user?.email;
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [linksDropdownOpen, setLinksDropdownOpen] = React.useState(false);
  const linksDropdownRef = React.useRef<HTMLDivElement>(null);

  const navItems = React.useMemo<NavItem[]>(
    () => [
      { id: "dashboard", label: tHeader("nav.dashboard"), protected: true },
      { id: "generator", label: tHeader("nav.generator") },
      { id: "coaches", label: tHeader("nav.coaches") },
      { id: "how-it-works", label: tHeader("nav.howItWorks") },
      { id: "pricing", label: tHeader("nav.pricing") },
    ],
    [tHeader]
  );

  const dropdownLinks = React.useMemo<DropdownLink[]>(
    () => [
      {
        id: "what-you-receive",
        label: tHeader("links.whatYouReceive"),
        href: "/what-you-receive" as Route,
      },
      {
        id: "trust-safety",
        label: tHeader("links.trustSafety"),
        href: "/trust-safety" as Route,
      },
      {
        id: "payments-tokens",
        label: tHeader("links.paymentsTokens"),
        href: "/payments-tokens" as Route,
      },
      {
        id: "contact",
        label: tHeader("links.contact"),
        href: "/contact" as Route,
      },
    ],
    [tHeader]
  );

  const navigateTo = React.useCallback(
    (page: string) => {
      switch (page) {
        case "coaches":
          router.push("/coaches");
          return;
        case "pricing":
          router.push("/pricing");
          return;
        case "generator":
          router.push("/generator");
          return;
        case "dashboard":
          router.push("/dashboard");
          return;
        case "how-it-works":
          router.push("/how-it-works");
          return;
        case "home":
          router.push("/");
          return;
        default:
          onNavigate(page);
      }
    },
    [onNavigate, router]
  );

  const handleOpenAuth = React.useCallback(
    (mode: "signin" | "signup") => {
      if (onOpenAuth) {
        onOpenAuth(mode);
        return;
      }

      const currentPath =
        typeof window !== "undefined"
          ? `${window.location.pathname}${window.location.search}`
          : "";
      const returnTo =
        currentPath !== "/auth/sign-in" &&
        currentPath !== "/auth/sign-up" &&
        currentPath !== "/auth/reset-password"
          ? currentPath
          : "/dashboard";
      const query = returnTo ? `?returnTo=${encodeURIComponent(returnTo)}` : "";
      const path = mode === "signin" ? "sign-in" : "sign-up";
      router.push(`/auth/${path}${query}` as Route);
    },
    [onOpenAuth, router]
  );

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        linksDropdownRef.current &&
        !linksDropdownRef.current.contains(event.target as Node)
      ) {
        setLinksDropdownOpen(false);
      }
    }

    if (linksDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [linksDropdownOpen]);

  return (
    <header
      className="sticky top-0 z-20 border-b backdrop-blur supports-[backdrop-filter]:bg-black/30"
      style={{ borderColor: THEME.cardBorder }}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <button
          onClick={() => navigateTo("home")}
          className="flex items-center gap-3 transition-opacity hover:opacity-80"
        >
          <Image
            src="/logo.webp"
            alt={tHeader("brandAlt")}
            width={28}
            height={28}
            className="h-7 w-7"
            priority
          />
          <div className="font-extrabold tracking-tight">
            Chalet<span style={{ color: THEME.accent }}>coaching</span>
          </div>
        </button>

        <nav className="hidden items-center gap-2 md:flex">
          {navItems.map((item) => {
            if (item.id === "dashboard" && !isAuthed) {
              return null;
            }

            return (
              <button
                key={item.id}
                onClick={() => navigateTo(item.id)}
                className="whitespace-nowrap rounded-lg px-3 py-2 text-sm opacity-70 transition-opacity hover:opacity-100"
              >
                <span className="inline-flex items-center gap-1">
                  {!isAuthed && item.protected ? <Lock size={14} /> : null}
                  {item.label}
                </span>
              </button>
            );
          })}

          <div className="relative" ref={linksDropdownRef}>
            <button
              onClick={() => setLinksDropdownOpen((open) => !open)}
              className="inline-flex items-center gap-1 whitespace-nowrap rounded-lg px-3 py-2 text-sm opacity-70 transition-opacity hover:opacity-100"
            >
              {tHeader("links.title")}
              <ChevronDown
                size={14}
                className={`transition-transform ${linksDropdownOpen ? "rotate-180" : ""}`}
              />
            </button>

            {linksDropdownOpen ? (
              <div
                className="absolute left-0 top-full z-30 mt-2 min-w-[200px] rounded-xl border shadow-lg backdrop-blur-sm"
                style={{
                  background: THEME.card,
                  borderColor: THEME.cardBorder,
                }}
              >
                {dropdownLinks.map((link) => (
                  <button
                    key={link.id}
                    onClick={() => {
                      setLinksDropdownOpen(false);
                      router.push(link.href);
                    }}
                    className="w-full px-4 py-3 text-left text-sm opacity-85 transition-colors first:rounded-t-xl last:rounded-b-xl hover:bg-surface-hover hover:opacity-100"
                  >
                    {link.label}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        </nav>

        <button
          onClick={() => setMobileMenuOpen((open) => !open)}
          aria-label={tHeader("mobileMenu")}
          className="rounded-lg border p-2 md:hidden"
          style={{ borderColor: THEME.cardBorder }}
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        <div className="hidden items-center gap-3 md:flex">
          {isAuthed ? (
            <div
              className="flex items-center gap-2 rounded-lg border px-3 py-2"
              style={{ borderColor: THEME.cardBorder }}
            >
              {balanceLoading ? (
                <>
                  <Skeleton className="h-5 w-12" />
                  <div className="text-xs opacity-60">{tCommon("loadingBalance")}</div>
                </>
              ) : (
                <>
                  <div
                    className="text-sm font-semibold"
                    style={{ color: THEME.accent }}
                  >
                    {(formatNumberProp || formatNumberLocal)(balance ?? 0)} ●
                  </div>
                  <div className="text-xs opacity-60">{tCommon("tokens")}</div>
                </>
              )}
            </div>
          ) : null}

          <LanguageDropdown />
          <CurrencyDropdown region={region} onChange={setRegion} />

          {isAuthed ? (
            <button
              onClick={() => void signOut()}
              className="inline-flex flex-shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-xl border px-4 py-2 text-sm font-semibold"
              style={{
                background: "transparent",
                color: THEME.text,
                borderColor: THEME.cardBorder,
              }}
            >
              {tHeader("signOut")}
            </button>
          ) : (
            <>
              <button
                onClick={() => handleOpenAuth("signin")}
                className="inline-flex flex-shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-xl border px-4 py-2 text-sm font-semibold"
                style={{
                  background: "transparent",
                  color: THEME.text,
                  borderColor: THEME.cardBorder,
                }}
              >
                <LogIn size={16} /> {tHeader("signIn")}
              </button>
              <button
                onClick={() => handleOpenAuth("signup")}
                className="inline-flex flex-shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-xl px-4 py-2 text-sm font-semibold shadow-[0_0_0_1px_rgba(0,0,0,0.6)]"
                style={{ background: THEME.accent, color: "#0E0E10" }}
              >
                <UserPlus size={16} /> {tHeader("createAccount")}
              </button>
            </>
          )}
        </div>
      </div>

      {mobileMenuOpen ? (
        <div className="border-t md:hidden" style={{ borderColor: THEME.cardBorder }}>
          <div className="space-y-3 px-4 py-4">
            {isAuthed ? (
              <div
                className="flex items-center justify-center gap-2 rounded-lg border px-3 py-2"
                style={{ borderColor: THEME.cardBorder }}
              >
                {balanceLoading ? (
                  <>
                    <Skeleton className="h-5 w-12" />
                    <div className="text-xs opacity-60">{tCommon("loadingBalance")}</div>
                  </>
                ) : (
                  <>
                    <div
                      className="text-sm font-semibold"
                      style={{ color: THEME.accent }}
                    >
                      {(formatNumberProp || formatNumberLocal)(balance ?? 0)} ●
                    </div>
                    <div className="text-xs opacity-60">{tCommon("tokens")}</div>
                  </>
                )}
              </div>
            ) : null}

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              <LanguageDropdown />
              <CurrencyDropdown region={region} onChange={setRegion} />
            </div>

            <nav className="space-y-2">
              {navItems.map((item) => {
                if (item.id === "dashboard" && !isAuthed) {
                  return null;
                }

                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setMobileMenuOpen(false);
                      navigateTo(item.id);
                    }}
                    className="w-full rounded-lg px-3 py-3 text-left text-sm opacity-70 transition-opacity hover:bg-white/5 hover:opacity-100"
                  >
                    <span className="inline-flex items-center gap-2">
                      {!isAuthed && item.protected ? <Lock size={14} /> : null}
                      {item.label}
                    </span>
                  </button>
                );
              })}

              <div className="border-t pt-2" style={{ borderColor: THEME.cardBorder }}>
                <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wider opacity-60">
                  {tHeader("linksSectionLabel")}
                </div>
                {dropdownLinks.map((link) => (
                  <button
                    key={link.id}
                    onClick={() => {
                      setMobileMenuOpen(false);
                      router.push(link.href);
                    }}
                    className="w-full rounded-lg px-3 py-3 text-left text-sm opacity-70 transition-opacity hover:bg-white/5 hover:opacity-100"
                  >
                    {link.label}
                  </button>
                ))}
              </div>
            </nav>

            <div className="border-t pt-3" style={{ borderColor: THEME.cardBorder }}>
              {isAuthed ? (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    void signOut();
                  }}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl border px-5 py-3 text-sm font-semibold"
                  style={{
                    background: "transparent",
                    color: THEME.text,
                    borderColor: THEME.cardBorder,
                  }}
                >
                  {tHeader("signOut")}
                </button>
              ) : (
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleOpenAuth("signin");
                    }}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl border px-5 py-3 text-sm font-semibold"
                    style={{
                      background: "transparent",
                      color: THEME.text,
                      borderColor: THEME.cardBorder,
                    }}
                  >
                    <LogIn size={16} /> {tHeader("signIn")}
                  </button>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleOpenAuth("signup");
                    }}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold shadow-[0_0_0_1px_rgba(0,0,0,0.6)]"
                    style={{ background: THEME.accent, color: "#0E0E10" }}
                  >
                    <UserPlus size={16} /> {tHeader("createAccount")}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
