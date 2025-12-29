"use client";

import React from "react";
import { Card } from "@/components/ui";
import { Paragraph } from "@/components/ui";
import { Badge } from "@/components/ui";
import { THEME } from "@/lib/theme";
import type { SupportArticle } from "@/lib/support-articles";
import { CATEGORY_LABELS } from "@/lib/support-articles";

interface ArticleListProps {
  articles: SupportArticle[];
  selectedSlug?: string;
  onSelect: (slug: string) => void;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function ArticleList({ articles, selectedSlug, onSelect }: ArticleListProps) {
  if (articles.length === 0) {
    return null;
  }

  return (
    <ul className="space-y-3">
      {articles.map((article) => {
        const isSelected = article.slug === selectedSlug;
        
        return (
          <li key={article.slug}>
            <button
              onClick={() => onSelect(article.slug)}
              className="w-full text-left"
              aria-current={isSelected ? "true" : undefined}
            >
              <Card
                className={`transition-all ${
                  isSelected
                    ? "ring-2"
                    : "hover:border-opacity-60"
                }`}
                style={{
                  ...(isSelected && {
                    borderColor: THEME.accent,
                    boxShadow: `0 0 0 2px ${THEME.accent}40`,
                  }),
                }}
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-semibold text-base">{article.title}</h3>
                    <Badge variant="default" className="flex-shrink-0">
                      {CATEGORY_LABELS[article.category]}
                    </Badge>
                  </div>
                  
                  <Paragraph className="text-sm opacity-85 mb-0 line-clamp-2">
                    {article.description}
                  </Paragraph>
                  
                  <div className="text-xs opacity-60">
                    Updated {formatDate(article.updatedAt)}
                  </div>
                </div>
              </Card>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

