"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { THEME } from "@/lib/theme";
import { LogIn, UserPlus, Lock, Menu, X, ChevronDown } from "lucide-react";
import * as React from "react";
import { formatNumber as formatNumberLocal } from "@/lib/tokens";
import { Skeleton } from "@/components/ui";
import { CurrencyDropdown } from "@/components/ui/currency-dropdown";
import Image from "next/image";
import type { Route } from "next";

type Region = "EU" | "UK" | "US";

function cn(...cls: Array<string | false | undefined>) {
  return cls.filter(Boolean).join(" ");
}

export default function SiteHeader({ 
  onOpenAuth,
  onNavigate,
  balance,
  balanceLoading,
  region,
  setRegion,
  formatNumber: formatNumberProp,
}: { 
  onOpenAuth: (mode: "signin" | "signup") => void;
  onNavigate: (page: string) => void;
  balance?: number | null;
  balanceLoading?: boolean;
  region: Region;
  setRegion: (region: Region) => void;
  formatNumber?: (n: number) => string;
}) {
  const { data: session } = useSession();
  const router = useRouter();
  const isAuthed = !!session?.user?.email;
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [linksDropdownOpen, setLinksDropdownOpen] = React.useState(false);
  const linksDropdownRef = React.useRef<HTMLDivElement>(null);

  // Навигация (используем те же ID, что и в главном приложении)
  const NAV: Array<{ id: string; label: string; protected?: boolean }> = [
    { id: "dashboard", label: "Dashboard", protected: true },
    { id: "generator", label: "Course", protected: false }, // Changed to false - guests can view Course page
    { id: "coaches", label: "Coaches", protected: false },
    { id: "how-it-works", label: "How it Works", protected: false },
    { id: "pricing", label: "Pricing", protected: false },
  ];

  // Links dropdown items
  const LINKS: Array<{ id: string; label: string }> = [
    { id: "what-you-receive", label: "What you receive" },
    { id: "trust-safety", label: "Trust & safety" },
    { id: "payments-tokens", label: "Payments & tokens" },
    { id: "contact", label: "Contact Us" },
  ];

  // Close dropdown when clicking outside
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (linksDropdownRef.current && !linksDropdownRef.current.contains(event.target as Node)) {
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
      <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between">
        {/* Лого → на главную */}
        <button 
          onClick={() => onNavigate("home")} 
          className="flex items-center gap-3 hover:opacity-80 transition-opacity"
        >
          <Image 
            src="/images/logo.svg" 
            alt="Chaletcoaching Logo" 
            width={24}
            height={24}
            className="h-6 w-6"
          />
          <div className="font-extrabold tracking-tight">
            Chalet<span style={{ color: THEME.accent }}>coaching</span>
          </div>
        </button>

        {/* Нав */}
        <nav className="hidden md:flex items-center gap-2">
          {NAV.map((n) => {
            // Показывать Dashboard только если пользователь авторизован
            if (n.id === "dashboard" && !isAuthed) {
              return null;
            }
            return (
              <button
                key={n.id}
                onClick={() => {
              if (n.id === "coaches") {
                router.push("/coaches");
              } else if (n.id === "pricing") {
                router.push("/pricing");
              } else if (n.id === "generator") {
                router.push("/generator");
              } else if (n.id === "dashboard") {
                router.push("/dashboard" as Route);
              } else if (n.id === "how-it-works") {
                router.push("/how-it-works");
              } else if (n.id === "home") {
                router.push("/");
              } else {
                    onNavigate(n.id);
                  }
                }}
                className="rounded-lg px-3 py-2 text-sm opacity-70 hover:opacity-100 transition-opacity whitespace-nowrap"
              >
                <span className="inline-flex items-center gap-1">
                  {!isAuthed && n.protected && <Lock size={14} />} {n.label}
                </span>
              </button>
            );
          })}
          
          {/* Links Dropdown */}
          <div className="relative" ref={linksDropdownRef}>
            <button
              onClick={() => setLinksDropdownOpen(!linksDropdownOpen)}
              className="rounded-lg px-3 py-2 text-sm opacity-70 hover:opacity-100 transition-opacity whitespace-nowrap inline-flex items-center gap-1"
            >
              Links
              <ChevronDown 
                size={14} 
                className={`transition-transform ${linksDropdownOpen ? "rotate-180" : ""}`}
              />
            </button>
            
            {linksDropdownOpen && (
              <div
                className="absolute top-full left-0 mt-2 rounded-xl border shadow-lg backdrop-blur-sm min-w-[200px] z-30"
                style={{
                  background: THEME.card,
                  borderColor: THEME.cardBorder,
                }}
              >
                {LINKS.map((link) => (
                  <button
                    key={link.id}
                    onClick={() => {
                      setLinksDropdownOpen(false);
                      if (link.id === "contact") {
                        router.push("/contact");
                      } else if (link.id === "what-you-receive") {
                        router.push("/what-you-receive");
                      } else if (link.id === "trust-safety") {
                        router.push("/trust-safety");
                      } else if (link.id === "payments-tokens") {
                        router.push("/payments-tokens");
                      }
                    }}
                    className="w-full text-left px-4 py-3 text-sm opacity-85 hover:opacity-100 hover:bg-surface-hover transition-colors first:rounded-t-xl last:rounded-b-xl"
                  >
                    {link.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </nav>

        {/* Мобильное меню кнопка */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-lg border"
          style={{ borderColor: THEME.cardBorder }}
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        {/* Правый блок - скрыт на мобильных */}
        <div className="hidden md:flex items-center gap-3">
          {/* Индикатор токенов для авторизованных пользователей */}
          {isAuthed && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg border" style={{ borderColor: THEME.cardBorder }}>
              {balanceLoading ? (
                <Skeleton className="h-5 w-12" />
              ) : (
                <>
                  <div
                    className="text-sm font-semibold"
                    style={{ color: THEME.accent }}
                  >
                    {(formatNumberProp || formatNumberLocal)(balance ?? 0)} ◎
                  </div>
                  <div className="text-xs opacity-60">tokens</div>
                </>
              )}
            </div>
          )}
          
          <CurrencyDropdown region={region} onChange={setRegion} />
          {isAuthed ? (
            <button
              onClick={() => void signOut()}
              className="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold border whitespace-nowrap flex-shrink-0"
              style={{ background: "transparent", color: THEME.text, borderColor: THEME.cardBorder }}
            >
              Sign out
            </button>
          ) : (
            <>
              <button
                onClick={() => onOpenAuth("signin")}
                className="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold border whitespace-nowrap flex-shrink-0"
                style={{ background: "transparent", color: THEME.text, borderColor: THEME.cardBorder }}
              >
                <LogIn size={16} /> Sign in
              </button>
              <button
                onClick={() => onOpenAuth("signup")}
                className="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold shadow-[0_0_0_1px_rgba(0,0,0,0.6)] whitespace-nowrap flex-shrink-0"
                style={{ background: THEME.accent, color: "#0E0E10" }}
              >
                <UserPlus size={16} /> Create account
              </button>
            </>
          )}
        </div>
      </div>

      {/* Мобильное меню */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t" style={{ borderColor: THEME.cardBorder }}>
          <div className="px-4 py-4 space-y-3">
            {/* Токены для авторизованных пользователей */}
            {isAuthed && (
              <div className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg border" style={{ borderColor: THEME.cardBorder }}>
                {balanceLoading ? (
                  <Skeleton className="h-5 w-12" />
                ) : (
                  <>
                    <div
                      className="text-sm font-semibold"
                      style={{ color: THEME.accent }}
                    >
                      {(formatNumberProp || formatNumberLocal)(balance ?? 0)} ◎
                    </div>
                    <div className="text-xs opacity-60">tokens</div>
                  </>
                )}
              </div>
            )}

            {/* Переключатель валют */}
            <div className="flex justify-center">
              <CurrencyDropdown region={region} onChange={setRegion} />
            </div>

            {/* Навигация */}
            <nav className="space-y-2">
              {NAV.map((n) => {
                // Показывать Dashboard только если пользователь авторизован
                if (n.id === "dashboard" && !isAuthed) {
                  return null;
                }
                return (
                  <button
                    key={n.id}
                    onClick={() => {
                      setMobileMenuOpen(false);
                      if (n.id === "coaches") {
                        router.push("/coaches");
                      } else if (n.id === "pricing") {
                        router.push("/pricing");
                      } else if (n.id === "generator") {
                        router.push("/generator");
                      } else if (n.id === "dashboard") {
                        router.push("/dashboard" as Route);
                      } else if (n.id === "how-it-works") {
                        router.push("/how-it-works");
                      } else if (n.id === "home") {
                        router.push("/");
                      } else {
                        onNavigate(n.id);
                      }
                    }}
                    className="w-full text-left rounded-lg px-3 py-3 text-sm opacity-70 hover:opacity-100 transition-opacity hover:bg-white/5"
                  >
                    <span className="inline-flex items-center gap-2">
                      {!isAuthed && n.protected && <Lock size={14} />} {n.label}
                    </span>
                  </button>
                );
              })}
              
              {/* Links section in mobile menu */}
              <div className="pt-2 border-t" style={{ borderColor: THEME.cardBorder }}>
                <div className="text-xs font-semibold opacity-60 px-3 py-2 uppercase tracking-wider">Links</div>
                {LINKS.map((link) => (
                  <button
                    key={link.id}
                    onClick={() => {
                      setMobileMenuOpen(false);
                      if (link.id === "contact") {
                        router.push("/contact");
                      } else if (link.id === "what-you-receive") {
                        router.push("/what-you-receive");
                      } else if (link.id === "trust-safety") {
                        router.push("/trust-safety");
                      } else if (link.id === "payments-tokens") {
                        router.push("/payments-tokens");
                      }
                    }}
                    className="w-full text-left rounded-lg px-3 py-3 text-sm opacity-70 hover:opacity-100 transition-opacity hover:bg-white/5"
                  >
                    {link.label}
                  </button>
                ))}
              </div>
            </nav>

            {/* Разделитель */}
            <div className="border-t pt-3" style={{ borderColor: THEME.cardBorder }}>
              {/* Кнопки авторизации для мобильных */}
              {isAuthed ? (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    void signOut();
                  }}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold border"
                  style={{ background: "transparent", color: THEME.text, borderColor: THEME.cardBorder }}
                >
                  Sign out
                </button>
              ) : (
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenAuth("signin");
                    }}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold border"
                    style={{ background: "transparent", color: THEME.text, borderColor: THEME.cardBorder }}
                  >
                    <LogIn size={16} /> Sign in
                  </button>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenAuth("signup");
                    }}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold shadow-[0_0_0_1px_rgba(0,0,0,0.6)]"
                    style={{ background: THEME.accent, color: "#0E0E10" }}
                  >
                    <UserPlus size={16} /> Create account
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
