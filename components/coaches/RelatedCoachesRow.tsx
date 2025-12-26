"use client";

import React from "react";
import { CoachCard, type CoachCardData } from "./CoachCard";
import { SkeletonCoachCard } from "./SkeletonCoachCard";
import { Container, H3 } from "@/components/ui";
import { cn } from "@/lib/utils";

interface RelatedCoachesRowProps {
  currentCoachSlug: string;
  goal?: string;
  trainingType?: string;
  className?: string;
}

export function RelatedCoachesRow({ 
  currentCoachSlug, 
  goal, 
  trainingType, 
  className 
}: RelatedCoachesRowProps) {
  const [coaches, setCoaches] = React.useState<CoachCardData[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (!goal && !trainingType) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const params = new URLSearchParams();
    if (goal) params.append("goal", goal);
    if (trainingType) params.append("trainingType", trainingType);
    params.append("excludeSlug", currentCoachSlug);
    params.append("limit", "3");

    fetch(`/api/coaches?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        setCoaches(data.coaches || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching related coaches:", err);
        setLoading(false);
      });
  }, [currentCoachSlug, goal, trainingType]);

  if (loading) {
    return (
      <div className={cn("mb-12", className)}>
        <H3 className="mb-6">Related coaches</H3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonCoachCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (coaches.length === 0) {
    return null;
  }

  return (
    <div className={cn("mb-12", className)}>
      <H3 className="mb-6">Related coaches</H3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {coaches.map((coach) => (
          <CoachCard key={coach.id} coach={coach} />
        ))}
      </div>
    </div>
  );
}

