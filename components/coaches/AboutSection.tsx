"use client";

import React from "react";
import { Paragraph } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useLocale } from "@/lib/i18n/client";
import { getCoachesCopy } from "@/lib/coaches-copy";

interface AboutSectionProps {
  bio: string;
  className?: string;
}

export function AboutSection({ bio, className }: AboutSectionProps) {
  const { locale } = useLocale();
  const copy = getCoachesCopy(locale).coachProfile;
  const [isExpanded, setIsExpanded] = React.useState(false);
  
  // Estimate if bio is longer than 4-6 lines (roughly 200-300 characters)
  const shouldShowReadMore = bio.length > 250;
  const displayBio = isExpanded || !shouldShowReadMore ? bio : `${bio.slice(0, 250)}...`;

  return (
    <Card className={cn("p-6", className)}>
      <h2 className="text-xl font-semibold mb-4">{copy.about}</h2>
      <Paragraph className="mb-4 whitespace-pre-line">{displayBio}</Paragraph>
      {shouldShowReadMore && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? copy.readLess : copy.readMore}
        </Button>
      )}
    </Card>
  );
}

