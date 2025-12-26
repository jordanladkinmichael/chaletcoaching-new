"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function SkeletonCoachCard() {
  return (
    <Card className="h-full">
      <div className="flex flex-col h-full">
        {/* Avatar and Badge */}
        <div className="flex items-start justify-between mb-4">
          <Skeleton className="w-16 h-16 rounded-full" />
          <Skeleton className="w-20 h-6 rounded-full" />
        </div>

        {/* Name */}
        <Skeleton className="h-6 w-3/4 mb-2" />

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-20 rounded-full" />
          <Skeleton className="h-5 w-18 rounded-full" />
        </div>

        {/* Rating */}
        <Skeleton className="h-4 w-24 mb-4" />

        {/* Button */}
        <div className="mt-auto pt-4">
          <Skeleton className="h-10 w-full rounded-xl" />
        </div>
      </div>
    </Card>
  );
}

