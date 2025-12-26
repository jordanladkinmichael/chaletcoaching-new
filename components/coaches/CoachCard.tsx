"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Star, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { cardHoverLift } from "@/lib/animations";

export interface CoachCardData {
  id: string;
  slug: string;
  name: string;
  avatar: string;
  bio: string;
  rating?: number;
  coursesCount?: number;
  featured?: boolean;
  specialties: string[];
}

interface CoachCardProps {
  coach: CoachCardData;
  className?: string;
}

export function CoachCard({ coach, className }: CoachCardProps) {
  const [prefersReducedMotion, setPrefersReducedMotion] = React.useState(false);

  React.useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Show "Top coach" badge if featured=true OR (rating>=4.8 AND coursesCount>=50)
  const showTopCoachBadge = coach.featured === true || 
    (coach.rating >= 4.8 && coach.coursesCount >= 50);

  // Show 2-3 tags max
  const tags = coach.specialties.slice(0, 3);

  const cardContent = (
    <div className="flex flex-col h-full">
      {/* Avatar and Badge */}
      <div className="flex items-start justify-between mb-4">
        <Avatar
          src={coach.avatar}
          alt={coach.name}
          name={coach.name}
          size="lg"
        />
        {showTopCoachBadge && (
          <Badge variant="primary" className="shrink-0">
            Top coach
          </Badge>
        )}
      </div>

      {/* Name */}
      <h3 className="text-lg font-semibold text-text mb-2">{coach.name}</h3>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-4">
        {tags.map((tag, idx) => (
          <Badge key={idx} variant="default" className="text-xs">
            {tag}
          </Badge>
        ))}
      </div>

      {/* Rating (if available) */}
      {coach.rating && (
        <div className="flex items-center gap-1 mb-4 text-sm text-text-muted">
          <Star size={14} className="fill-primary text-primary" />
          <span>{coach.rating.toFixed(1)}</span>
          {coach.coursesCount && (
            <span className="text-text-subtle">({coach.coursesCount} courses)</span>
          )}
        </div>
      )}

      {/* CTA Indicator */}
      <div className="mt-auto pt-4 flex items-center gap-2 text-sm font-medium text-primary">
        <span>View profile</span>
        <ArrowRight size={16} />
      </div>
    </div>
  );

  if (!prefersReducedMotion) {
    return (
      <motion.div
        className={cn("h-full", className)}
        variants={cardHoverLift}
        initial="rest"
        whileHover="hover"
      >
        <Card interactive className="h-full">
          <Link 
            href={`/coaches/${coach.slug}`} 
            className="block h-full cursor-pointer"
            aria-label={`View ${coach.name}'s profile`}
          >
            {cardContent}
          </Link>
        </Card>
      </motion.div>
    );
  }

  return (
    <div className={cn("h-full", className)}>
      <Card interactive className="h-full">
        <Link 
          href={`/coaches/${coach.slug}`} 
          className="block h-full cursor-pointer"
          aria-label={`View ${coach.name}'s profile`}
        >
          {cardContent}
        </Link>
      </Card>
    </div>
  );
}

