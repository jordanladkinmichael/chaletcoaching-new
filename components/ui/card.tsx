"use client";

import React from "react";
import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";
import { cardHoverLift } from "@/lib/animations";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  interactive?: boolean;
  children?: React.ReactNode;
}

export function Card({
  className = "",
  children,
  interactive = false,
  ...rest
}: CardProps) {
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
  
  if (interactive && !prefersReducedMotion) {
    const motionProps = rest as HTMLMotionProps<"div">;
    return (
      <motion.div
        {...motionProps}
        className={cn(
          "rounded-2xl border border-border bg-surface p-5 md:p-6 cursor-pointer",
          className
        )}
        variants={cardHoverLift}
        initial="rest"
        whileHover="hover"
      >
        {children}
      </motion.div>
    );
  }
  
  return (
    <div
      {...rest}
      className={cn(
        "rounded-2xl border border-border bg-surface p-5 md:p-6",
        interactive && "hover:bg-surface-hover transition-colors duration-fast cursor-pointer",
        className
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  className = "",
  children,
  ...rest
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("mb-4", className)}
      {...rest}
    >
      {children}
    </div>
  );
}

export function CardContent({
  className = "",
  children,
  ...rest
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("", className)}
      {...rest}
    >
      {children}
    </div>
  );
}

export function CardFooter({
  className = "",
  children,
  ...rest
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("mt-4 pt-4 border-t border-border", className)}
      {...rest}
    >
      {children}
    </div>
  );
}

