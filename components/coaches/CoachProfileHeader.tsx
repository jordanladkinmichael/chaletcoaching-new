"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Share2, Bookmark, BookmarkCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CoachProfileHeaderProps {
  coachSlug: string;
  coachName: string;
  className?: string;
}

export function CoachProfileHeader({ coachSlug, coachName, className }: CoachProfileHeaderProps) {
  const [isSaved, setIsSaved] = React.useState(false);

  React.useEffect(() => {
    // Check if coach is saved
    const savedCoaches = JSON.parse(localStorage.getItem("savedCoaches") || "[]");
    setIsSaved(savedCoaches.includes(coachSlug));

  }, [coachSlug]);

  const handleSave = () => {
    const savedCoaches = JSON.parse(localStorage.getItem("savedCoaches") || "[]");
    if (isSaved) {
      const updated = savedCoaches.filter((slug: string) => slug !== coachSlug);
      localStorage.setItem("savedCoaches", JSON.stringify(updated));
      setIsSaved(false);
    } else {
      savedCoaches.push(coachSlug);
      localStorage.setItem("savedCoaches", JSON.stringify(savedCoaches));
      setIsSaved(true);
    }
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/coaches/${coachSlug}`;
    
    // Try native share on mobile
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${coachName} - Chaletcoaching`,
          text: `Check out ${coachName} on Chaletcoaching`,
          url,
        });
        return;
      } catch {
        // User cancelled or error, fall back to copy
      }
    }
    
    // Fall back to copy link
    try {
      await navigator.clipboard.writeText(url);
      // You could show a toast here
    } catch {
      console.error("Failed to copy link");
    }
  };

  return (
    <div className={cn("flex items-center justify-between mb-6", className)}>
      <Button variant="ghost" size="sm" asChild>
        <Link href="/coaches" className="flex items-center gap-2">
          <ArrowLeft size={18} />
          Back to coaches
        </Link>
      </Button>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleShare}
          className="flex items-center gap-2"
        >
          <Share2 size={18} />
          Share
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleSave}
          className="flex items-center gap-2"
        >
          {isSaved ? (
            <>
              <BookmarkCheck size={18} />
              Saved
            </>
          ) : (
            <>
              <Bookmark size={18} />
              Save coach
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

