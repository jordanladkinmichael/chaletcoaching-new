"use client";

import React from "react";
import { GhostButton, AccentButton, Card } from "@/app/components/ui";
import { useLocale } from "@/lib/i18n/client";

const STORAGE_KEY = "fa_cookie_consent_v1";
const COPY = {
  en: {
    body: "We use cookies to improve your experience and analyze traffic. By clicking \"Accept\", you agree to our use of cookies.",
    privacy: "Privacy",
    terms: "Terms",
    accept: "Accept",
  },
  tr: {
    body: "Deneyiminizi iyileştirmek ve trafiği analiz etmek için çerezler kullanıyoruz. \"Kabul et\" düğmesine tıklayarak çerez kullanımımızı kabul edersiniz.",
    privacy: "Gizlilik",
    terms: "Şartlar",
    accept: "Kabul et",
  },
} as const;

export default function CookieBanner() {
  const { locale } = useLocale();
  const copy = COPY[locale] ?? COPY.en;
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    try {
      const value = localStorage.getItem(STORAGE_KEY);
      if (!value) setVisible(true);
    } catch {
      // If localStorage is unavailable, do not show the banner.
    }
  }, []);

  function accept() {
    try {
      localStorage.setItem(STORAGE_KEY, "accepted");
    } catch {}
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 px-3 pb-3">
      <div className="mx-auto max-w-6xl">
        <Card className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 border">
          <div className="text-sm opacity-85">{copy.body}</div>
          <div className="flex gap-2 shrink-0">
            <GhostButton onClick={() => (window.location.href = "/legal/privacy")}>
              {copy.privacy}
            </GhostButton>
            <GhostButton onClick={() => (window.location.href = "/legal/terms")}>
              {copy.terms}
            </GhostButton>
            <AccentButton onClick={accept}>{copy.accept}</AccentButton>
          </div>
        </Card>
      </div>
    </div>
  );
}
