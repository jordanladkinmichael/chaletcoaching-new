"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useLocale } from "@/lib/i18n/client";
import { getCoachesCopy } from "@/lib/coaches-copy";

interface CoachingFocusSectionProps {
  goals: string[];
  focusAreas: string[];
  className?: string;
}

export function CoachingFocusSection({ goals, focusAreas, className }: CoachingFocusSectionProps) {
  const { locale } = useLocale();
  const copy = getCoachesCopy(locale).coachProfile;

  return (
    <Card className={cn("p-6", className)}>
      <h2 className="text-xl font-semibold mb-4">{copy.focusTitle}</h2>
      
      {/* Goals */}
      {goals.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-medium text-text-muted mb-3">{copy.goals}</h3>
          <div className="flex flex-wrap gap-2">
            {goals.map((goal, idx) => (
              <Badge key={idx} variant="default">
                {goal}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Focus Areas */}
      {focusAreas.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-text-muted mb-3">{copy.focusAreas}</h3>
          <div className="flex flex-wrap gap-2">
            {focusAreas.map((focus, idx) => (
              <Badge key={idx} variant="default">
                {focus}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}

