"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";
import { getBlogCopy } from "@/lib/blog-copy";
import { useLocale } from "@/lib/i18n/client";
import { THEME } from "@/lib/theme";

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="rounded-2xl border p-5 md:p-6 hover:shadow-lg hover:shadow-black/30 transition"
      style={{ background: THEME.card, borderColor: THEME.cardBorder }}
    >
      {children}
    </div>
  );
}

function GhostButton({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium border transition-colors hover:opacity-100"
      style={{ borderColor: THEME.cardBorder, color: THEME.text }}
    >
      {children}
    </span>
  );
}

export default function BlogIndexClient() {
  const { locale } = useLocale();
  const copy = getBlogCopy(locale);
  const [region, setRegion] = React.useState<"EU" | "UK" | "US">("EU");

  const handleNavigate = (page: string) => {
    window.location.href = page === "home" ? "/" : `/${page}`;
  };

  return (
    <>
      <SiteHeader
        onOpenAuth={() => {}}
        onNavigate={handleNavigate}
        region={region}
        setRegion={setRegion}
      />

      <main className="mx-auto max-w-6xl px-4 py-8 md:py-12 space-y-8">
        <div className="space-y-4">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">{copy.indexTitle}</h1>
          <p className="text-lg opacity-80">{copy.indexSubtitle}</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {Object.values(copy.articles).map((article) => (
            <Card key={article.slug}>
              <div
                className="relative aspect-[4/3] w-full overflow-hidden rounded-xl border mb-3"
                style={{ borderColor: THEME.cardBorder }}
              >
                <Image
                  src={article.image}
                  alt={article.alt}
                  fill
                  sizes="(min-width: 768px) 50vw, 100vw"
                  className="object-cover"
                />
                <div className="absolute top-2 left-2">
                  <div className="bg-black/70 text-white px-2 py-1 rounded-full text-xs font-medium">
                    {article.category}
                  </div>
                </div>
              </div>

              <div className="text-xs opacity-60">{article.readTime}</div>
              <div className="mt-1 text-lg font-semibold">{article.title}</div>
              <p className="mt-2 text-sm opacity-85">{article.description}</p>
              <Link href={`/blog/${article.slug}`} className="mt-3 inline-block">
                <GhostButton>
                  {copy.read} <ChevronRight size={16} />
                </GhostButton>
              </Link>
            </Card>
          ))}
        </div>
      </main>

      <SiteFooter onNavigate={handleNavigate} />
    </>
  );
}
