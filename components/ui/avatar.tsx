import React from "react";
import { cn } from "@/lib/utils";
import Image from "next/image";

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string | null;
  alt?: string;
  name?: string;
  size?: "sm" | "md" | "lg";
  fallback?: string;
}

function getInitials(name?: string): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}

export function Avatar({
  src,
  alt,
  name,
  size = "md",
  fallback,
  className,
  ...props
}: AvatarProps) {
  const sizeClasses = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-16 h-16 text-lg",
  };

  const initials = fallback || getInitials(name || alt);

  return (
    <div
      className={cn(
        "relative flex items-center justify-center rounded-full bg-surface-hover border border-border overflow-hidden",
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {src ? (
        <Image
          src={src}
          alt={alt || name || "Avatar"}
          fill
          className="object-cover"
          quality={90}
          sizes={`${size === "sm" ? "64px" : size === "md" ? "80px" : "128px"}`}
        />
      ) : (
        <span className="text-text-muted font-semibold">{initials}</span>
      )}
    </div>
  );
}

