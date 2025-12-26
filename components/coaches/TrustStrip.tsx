"use client";

import React from "react";
import { Shield, Coins, Heart } from "lucide-react";
import { cn } from "@/lib/utils";

interface TrustStripProps {
  className?: string;
}

export function TrustStrip({ className }: TrustStripProps) {
  const items = [
    {
      icon: Shield,
      text: "Coach-led structure",
    },
    {
      icon: Coins,
      text: "Clear token pricing",
    },
    {
      icon: Heart,
      text: "Safety-first guidance",
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

