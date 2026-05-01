"use client";

import React from "react";
import { Shield, Coins, Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocale } from "@/lib/i18n/client";
import { getCoachesCopy } from "@/lib/coaches-copy";

interface TrustStripProps {
  className?: string;
}

export function TrustStrip({ className }: TrustStripProps) {
  const { locale } = useLocale();
  const copy = getCoachesCopy(locale).coachProfile;
  const items = [
    {
      icon: Shield,
      text: copy.trust[0],
    },
    {
      icon: Coins,
      text: copy.trust[1],
    },
    {
      icon: Heart,
      text: copy.trust[2],
    },
  ];

  return (
    <div className={cn("flex flex-wrap gap-6 justify-center md:justify-start mb-12", className)}>
      {items.map((item, idx) => (
        <div key={idx} className="flex items-center gap-2 text-sm text-text-muted">
          <item.icon size={16} className="text-primary" />
          <span>{item.text}</span>
        </div>
      ))}
    </div>
  );
}

