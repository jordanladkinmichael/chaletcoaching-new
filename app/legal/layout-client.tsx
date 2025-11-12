"use client";

import React from "react";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";
import { RegionProvider, useRegion } from "./region-context";

function LegalLayoutContent({ children }: { children: React.ReactNode }) {
  const { region, setRegion } = useRegion();
  
  // Функции для хедера
  const handleOpenAuth = (mode: "signin" | "signup") => {
    // Здесь можно добавить логику для открытия модального окна
    console.log("Open auth:", mode);
  };

  const handleNavigate = (page: string) => {
    if (page === "home") {
      window.location.href = "/";
    } else if (page === "contact") {
      window.location.href = "/contact";
    } else if (page === "blog") {
      window.location.href = "/blog";
    } else if (page === "faq") {
      window.location.href = "/faq";
    } else if (page.startsWith("legal/")) {
      // Обрабатываем пути к политикам
      window.location.href = `/${page}`;
    } else {
      // Для других страниц можно добавить логику
      console.log("Navigate to:", page);
    }
  };

  return (
    <div
      className="min-h-screen"
      style={{
        color: "#ffffff",
        background: `radial-gradient(60% 80% at 85% -10%, rgba(255,214,10,0.10) 0%, rgba(255,214,10,0.02) 40%, transparent 60%),
                   radial-gradient(60% 80% at 0% 100%, rgba(255,214,10,0.06) 0%, rgba(255,214,10,0.02) 30%, transparent 60%),
                   linear-gradient(180deg, #0E0E10 0%, #0E0E10 100%)`,
      }}
    >
      <SiteHeader onOpenAuth={handleOpenAuth} onNavigate={handleNavigate} region={region} setRegion={setRegion} />
      
      <main className="mx-auto max-w-6xl px-4 py-8 md:py-12">{children}</main>

      <SiteFooter onNavigate={handleNavigate} />
    </div>
  );
}

export default function LegalLayoutClient({ children }: { children: React.ReactNode }) {
  return (
    <RegionProvider>
      <LegalLayoutContent>{children}</LegalLayoutContent>
    </RegionProvider>
  );
}
