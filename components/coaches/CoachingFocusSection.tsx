"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface CoachingFocusSectionProps {
  goals: string[];
  focusAreas: string[];
  className?: string;
}

export function CoachingFocusSection({ goals, focusAreas, className }: CoachingFocusSectionProps) {
  return (
    <Card className={cn("p-6", className)}>
      <h2 className="text-xl font-semibold mb-4">Coaching focus</h2>
      
      {/* Goals */}
      {goals.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-medium text-text-muted mb-3">Goals</h3>
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
          <h3 className="text-sm font-medium text-text-muted mb-3">Focus areas</h3>
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

