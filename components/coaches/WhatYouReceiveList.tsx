"use client";

import React from "react";
import { Check } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface WhatYouReceiveListProps {
  className?: string;
}

const items = [
  "Weekly structure with clear progression",
  "Session plan with exercises and guidance",
  "Intensity and recovery recommendations",
  "Equipment-aware alternatives",
  "Simple checkpoints to track progress",
  "Warm-up and cooldown guidance",
];

export function WhatYouReceiveList({ className }: WhatYouReceiveListProps) {
  return (
    <Card className={cn("p-6", className)}>
      <h2 className="text-xl font-semibold mb-4">What you receive</h2>
      <ul className="space-y-3">
        {items.map((item, idx) => (
          <li key={idx} className="flex items-start gap-3">
            <Check size={20} className="text-primary shrink-0 mt-0.5" />
            <span className="text-text-muted">{item}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}

