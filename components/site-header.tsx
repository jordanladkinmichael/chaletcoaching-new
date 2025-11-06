"use client";

import { useSession, signOut } from "next-auth/react";
import { THEME } from "@/lib/theme";
import { LogIn, UserPlus, Lock, Menu, X } from "lucide-react";
import * as React from "react";
import { formatNumber as formatNumberLocal } from "@/lib/tokens";
import { Skeleton } from "@/components/ui";
import Image from "next/image";

type Region = "EU" | "UK" | "US";

function cn(...cls: Array<string | false | undefined>) {
  return cls.filter(Boolean).join(" ");
}

function RegionToggle({
  region,
  onChange,
}: {
  region: Region;
  onChange: (r: Region) => void;
}) {
  const regions: Array<{ value: Region; label: string }> = [
    { value: "UK", label: "GBP" },
    { value: "EU", label: "EUR" },
    { value: "US", label: "USD" },
  ];

  return (
    <div className="inline-flex rounded-lg overflow-hidden border"
         style={{ borderColor: THEME.cardBorder }}>
      {regions.map((r) => (
        <button
          key={r.value}
          onClick={() => onChange(r.value)}
          className={cn("px-3 py-2 text-xs md:text-sm font-medium", region === r.value ? "font-semibold" : "opacity-60")}
          style={{ background: region === r.value ? THEME.accent : "transparent", color: region === r.value ? "#0E0E10" : THEME.text }}
        >
          {r.label}
        </button>
      ))}
    </div>
  );
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
  const isAuthed = !!session?.user?.email;
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  // Навигация (используем те же ID, что и в главном приложении)
  const NAV = [
    { id: "dashboard", label: "Dashboard", protected: true },
    { id: "generator", label: "Generator", protected: true },
    { id: "pricing", label: "Pricing", protected: false },
    { id: "consultations", label: "Consultations", protected: true },
    { id: "contact", label: "Contact Us", protected: false },
  ] as const;

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
            alt="AIFitWorld Logo" 
            width={24}
            height={24}
            className="h-6 w-6"
          />
          <div className="font-extrabold tracking-tight">
            AI<span style={{ color: THEME.accent }}>Fit</span>World
          </div>
        </button>

        {/* Нав */}
        <nav className="hidden md:flex items-center gap-2">
          {NAV.map((n) => (
            <button
              key={n.id}
              onClick={() => {
                if (n.id === "contact") {
                  window.location.href = "/contact";
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
          ))}
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
          
          <RegionToggle region={region} onChange={setRegion} />
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
              <RegionToggle region={region} onChange={setRegion} />
            </div>

            {/* Навигация */}
            <nav className="space-y-2">
              {NAV.map((n) => (
                <button
                  key={n.id}
                  onClick={() => {
                    setMobileMenuOpen(false);
                    if (n.id === "contact") {
                      window.location.href = "/contact";
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
              ))}
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
