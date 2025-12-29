"use client";

import React from "react";
import { Card } from "@/components/ui";
import { H2, H3, Paragraph } from "@/components/ui";
import type { SupportArticle } from "@/lib/support-articles";

interface ArticleViewerProps {
  article: SupportArticle | null;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function parseMarkdownLinks(text: string): React.ReactNode {
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;

  while ((match = linkRegex.exec(text)) !== null) {
    // Add text before the link
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }
    
    // Add the link
    parts.push(
      <a
        key={match.index}
        href={match[2]}
        className="underline opacity-80 hover:opacity-100 transition-opacity"
      >
        {match[1]}
      </a>
    );
    
    lastIndex = match.index + match[0].length;
  }
  
  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }
  
  return parts.length > 0 ? <>{parts}</> : text;
}

export function ArticleViewer({ article }: ArticleViewerProps) {
  if (!article) {
    return (
      <Card className="text-center py-12">
        <Paragraph className="opacity-70 mb-0">
          Select an article to view its content.
        </Paragraph>
      </Card>
    );
  }

  return (
    <div
      id="article-viewer"
      aria-labelledby="article-title"
      className="space-y-6"
    >
      <div>
        <H2 id="article-title" className="mb-2">{article.title}</H2>
        <div className="text-sm opacity-60">
          Updated {formatDate(article.updatedAt)}
        </div>
      </div>

      <div className="space-y-6">
        {article.body.map((section, index) => {
          // Skip empty sections (no paragraphs and no bullets)
          if (!section.paragraphs?.length && !section.bullets?.length) {
            return null;
          }

          return (
            <div key={index} className="space-y-3">
              {section.heading && (
                <H3 className="text-lg">{section.heading}</H3>
              )}
              
              {section.paragraphs?.map((para, paraIndex) => (
                <Paragraph key={paraIndex} className="opacity-90">
                  {parseMarkdownLinks(para)}
                </Paragraph>
              ))}
              
              {section.bullets && section.bullets.length > 0 && (
                <ul className="space-y-2 pl-6 list-disc">
                  {section.bullets.map((bullet, bulletIndex) => (
                    <li key={bulletIndex} className="opacity-90">
                      <Paragraph className="mb-0">
                        {parseMarkdownLinks(bullet)}
                      </Paragraph>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

