"use client";

import React from "react";
import { Check } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useLocale } from "@/lib/i18n/client";
import { getCoachesCopy } from "@/lib/coaches-copy";

interface WhatYouReceiveListProps {
  className?: string;
}

export function WhatYouReceiveList({ className }: WhatYouReceiveListProps) {
  const { locale } = useLocale();
  const copy = getCoachesCopy(locale).coachProfile;

  return (
    <Card className={cn("p-6", className)}>
      <h2 className="text-xl font-semibold mb-4">{copy.whatYouReceiveTitle}</h2>
      <ul className="space-y-3">
        {copy.whatYouReceive.map((item, idx) => (
          <li key={idx} className="flex items-start gap-3">
            <Check size={20} className="text-primary shrink-0 mt-0.5" />
            <span className="text-text-muted">{item}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}

