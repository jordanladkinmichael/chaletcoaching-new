"use client";

import React from "react";
import { Paragraph, SearchInput } from "@/components/ui";
import { useTranslations } from "@/lib/i18n/client";

interface SupportSearchProps {
  value: string;
  onChange: (value: string) => void;
  resultCount: number;
}

export function SupportSearch({ value, onChange, resultCount }: SupportSearchProps) {
  const tSupport = useTranslations("support");

  return (
    <div className="space-y-3">
      <div className="relative">
        <label htmlFor="support-search" className="sr-only">
          {tSupport("searchPlaceholder")}
        </label>
        <SearchInput
          id="support-search"
          placeholder={tSupport("searchPlaceholder")}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full"
        />
      </div>
      
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <Paragraph className="text-sm opacity-70 mb-0">
          {tSupport("popular")}
        </Paragraph>
        
        {value && (
          <div
            aria-live="polite"
            className="text-sm opacity-70"
          >
            {tSupport("showing")} {resultCount}{" "}
            {resultCount === 1
              ? tSupport("articleSingular")
              : tSupport("articlePlural")}
          </div>
        )}
      </div>
    </div>
  );
}

