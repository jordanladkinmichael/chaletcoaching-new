"use client";

import React from "react";
import { Star } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { CoachCardData } from "./CoachCard";

interface CoachHeroProps {
  coach: CoachCardData & {
    level: string;
    trainingType: string;
    languages: string[];
    goals: string[];
    focusAreas: string[];
  };
  onRequestClick: () => void;
  className?: string;
}

export function CoachHero({ coach, onRequestClick, className }: CoachHeroProps) {
  // Show "Top coach" badge if featured=true OR (rating>=4.8 AND coursesCount>=50)
  const showTopCoachBadge = coach.featured === true || 
    ((coach.rating ?? 0) >= 4.8 && (coach.coursesCount ?? 0) >= 50);

  // Show "New coach" if no rating
  const isNewCoach = !coach.rating;

  // Show 2-3 tags max
  const tags = coach.specialties.slice(0, 3);

  return (
    <div className={cn("grid md:grid-cols-2 gap-8 mb-12", className)}>
      {/* Left: Avatar + Meta + Tags */}
      <div className="space-y-6">
        <div className="flex items-start gap-6">
          <Avatar
            src={coach.avatar}
            alt={coach.name}
            name={coach.name}
            size="lg"
            className="h-24 w-24"
          />
          <div className="flex-1">
            <div className="flex items-start justify-between mb-2">
              <h1 className="text-3xl font-bold text-text">{coach.name}</h1>
              {showTopCoachBadge && (
                <Badge variant="primary" className="shrink-0">
                  Top coach
                </Badge>
              )}
              {isNewCoach && (
                <Badge variant="default" className="shrink-0">
                  New coach
                </Badge>
              )}
            </div>

            {/* Rating + Course count */}
            {coach.rating && (
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center gap-1">
                  <Star size={16} className="fill-primary text-primary" />
                  <span className="font-semibold">{coach.rating.toFixed(1)}</span>
                </div>
                {coach.coursesCount && (
                  <span className="text-sm text-text-muted">
                    ({coach.coursesCount} {coach.coursesCount === 1 ? "course" : "courses"})
                  </span>
                )}
              </div>
            )}

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-4">
              {tags.map((tag, idx) => (
                <Badge key={idx} variant="default" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>

            {/* Meta row: Level, Training type, Languages */}
            <div className="flex flex-wrap gap-4 text-sm text-text-muted">
              <div>
                <span className="font-medium">Level:</span> {coach.level}
              </div>
              <div>
                <span className="font-medium">Training:</span> {coach.trainingType}
              </div>
              <div>
                <span className="font-medium">Languages:</span> {coach.languages.join(", ")}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right: CTA Card */}
      <div className="flex flex-col">
        <Card className="p-6 mb-4">
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={onRequestClick}
            className="mb-4"
          >
            Request a coach course
          </Button>
          <div className="text-sm text-text-muted text-center">
            Get a personalized training plan tailored to your goals
          </div>
        </Card>
      </div>
    </div>
  );
}

