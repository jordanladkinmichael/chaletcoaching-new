"use client";

import React from "react";
import { Paragraph } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface AboutSectionProps {
  bio: string;
  className?: string;
}

export function AboutSection({ bio, className }: AboutSectionProps) {
  const [isExpanded, setIsExpanded] = React.useState(false);
  
  // Estimate if bio is longer than 4-6 lines (roughly 200-300 characters)
  const shouldShowReadMore = bio.length > 250;
  const displayBio = isExpanded || !shouldShowReadMore ? bio : `${bio.slice(0, 250)}...`;

  return (
    <Card className={cn("p-6", className)}>
      <h2 className="text-xl font-semibold mb-4">About</h2>
      <Paragraph className="mb-4 whitespace-pre-line">{displayBio}</Paragraph>
      {shouldShowReadMore && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? "Read less" : "Read more"}
        </Button>
      )}
    </Card>
  );
}

