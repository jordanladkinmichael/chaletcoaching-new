"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Clock, Dumbbell, Target, Users } from "lucide-react";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";
import { getBlogArticle, getBlogCopy, type BlogArticleSlug } from "@/lib/blog-copy";
import { useLocale } from "@/lib/i18n/client";
import { THEME } from "@/lib/theme";

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="rounded-2xl border p-5 md:p-6"
      style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.08)" }}
    >
      {children}
    </div>
  );
}

export default function BlogArticleClient({ slug }: { slug: BlogArticleSlug }) {
  const { locale } = useLocale();
  const copy = getBlogCopy(locale);
  const article = getBlogArticle(locale, slug);
  const [region, setRegion] = React.useState<"EU" | "UK" | "US">("EU");

  const handleNavigate = (page: string) => {
    window.location.href = page === "home" ? "/" : `/${page}`;
  };

  const icons = [Clock, Target, Dumbbell, Users];

  return (
    <>
      <SiteHeader
        onOpenAuth={() => {}}
        onNavigate={handleNavigate}
        region={region}
        setRegion={setRegion}
      />

      <main className="mx-auto max-w-6xl px-4 py-8 md:py-12 space-y-8">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-sm opacity-70 hover:opacity-100 transition-opacity"
        >
          <ArrowLeft size={16} /> {copy.backToBlog}
        </Link>

        <div className="space-y-4">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            {article.title}
          </h1>
          <div className="flex flex-wrap gap-4 text-sm opacity-70">
            {article.meta.map((item, index) => {
              const Icon = icons[index] ?? Clock;
              return (
                <div key={item} className="flex items-center gap-2">
                  <Icon size={16} />
                  <span>{item}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div
          className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl border"
          style={{ borderColor: THEME.cardBorder }}
        >
          <Image
            src={article.image}
            alt={article.alt}
            fill
            sizes="100vw"
            className="object-cover"
          />
        </div>

        <div className="grid gap-4 md:gap-5 md:grid-cols-2">
          <Card>
            <h3 className="font-semibold mb-2">{copy.whoFor}</h3>
            <ul className="list-disc pl-5 space-y-1 opacity-85 text-sm">
              {article.who.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </Card>

          <Card>
            <h3 className="font-semibold mb-2">{copy.equipment}</h3>
            <ul className="list-disc pl-5 space-y-1 opacity-85 text-sm">
              {article.equipment.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </Card>
        </div>

        <Card>
          <h3 className="font-semibold mb-3">{article.sessionTitle}</h3>
          <div className="space-y-4">
            {article.blocks.map((block) => (
              <div key={block.title}>
                <h4 className="font-medium mb-2" style={{ color: THEME.accent }}>
                  {block.title}
                </h4>
                <p className="text-sm opacity-85">{block.body}</p>
                {block.items && (
                  <ul className="mt-2 list-disc pl-5 space-y-1 text-sm opacity-85">
                    {block.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h3 className="font-semibold mb-2">{article.progressionTitle}</h3>
          <p className="opacity-85 text-sm">{article.progression}</p>
        </Card>

        <div className="flex items-center justify-between gap-4 pt-4 border-t" style={{ borderColor: THEME.cardBorder }}>
          <div className="text-sm opacity-70">
            {article.previous ? (
              <Link href={`/blog/${article.previous}`} className="hover:opacity-100 transition-opacity">
                ← {copy.previous} {copy.articles[article.previous].title}
              </Link>
            ) : (
              <>← {copy.previous} {copy.noPrevious}</>
            )}
          </div>
          <div className="text-sm opacity-70">
            {article.next ? (
              <Link href={`/blog/${article.next}`} className="hover:opacity-100 transition-opacity">
                {copy.next} {copy.articles[article.next].title} →
              </Link>
            ) : (
              <Link href="/blog" className="hover:opacity-100 transition-opacity">
                {copy.backToBlog}
              </Link>
            )}
          </div>
        </div>
      </main>

      <SiteFooter onNavigate={handleNavigate} />
    </>
  );
}
