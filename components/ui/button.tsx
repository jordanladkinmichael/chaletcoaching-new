"use client";

import React from "react";
import { motion, type HTMLMotionProps } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";
import { buttonHover, buttonHoverLift } from "@/lib/animations";

export type ButtonVariant = "primary" | "outline" | "ghost" | "ai" | "danger";

export interface ButtonProps extends HTMLMotionProps<"button"> {
  variant?: ButtonVariant;
  isLoading?: boolean;
  icon?: LucideIcon;
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  asChild?: boolean;
  children: React.ReactNode;
}

export function Button({
  variant = "primary",
  isLoading = false,
  icon: Icon,
  size = "md",
  fullWidth = false,
  asChild = false,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-5 py-2.5 text-sm",
    lg: "px-6 py-3 text-base",
  };

  const variantClasses = {
    primary: "bg-primary text-on-primary hover:bg-primary-hover border-none",
    outline: "bg-transparent text-text border border-border hover:bg-surface-hover",
    ghost: "bg-transparent text-text border-none hover:bg-surface-hover",
    ai: "bg-transparent text-ai border border-ai hover:bg-ai-soft",
    danger: "bg-transparent text-danger border border-danger hover:bg-danger/10",
  };

  // When asChild is true, Slot expects a single child element
  // If we have icon or loading, we need to wrap everything in a span
  // Otherwise, just render children directly
  const hasExtraContent = isLoading || Icon;
  
  const content = asChild ? (
    hasExtraContent ? (
      <span className="contents">
        {isLoading ? (
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        ) : Icon ? (
          <Icon size={size === "sm" ? 16 : size === "lg" ? 20 : 18} />
        ) : null}
        {children}
      </span>
    ) : (
      children
    )
  ) : (
    <>
      {isLoading ? (
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : Icon ? (
        <Icon size={size === "sm" ? 16 : size === "lg" ? 20 : 18} />
      ) : null}
      {children}
    </>
  );

  const baseClassName = cn(
    "inline-flex items-center justify-center gap-2 rounded-xl font-semibold",
    "transition-colors duration-fast",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
    "disabled:pointer-events-none disabled:opacity-50",
    sizeClasses[size],
    variantClasses[variant],
    fullWidth && "w-full",
    className
  );

  const { style, ...restProps } = props;

  if (asChild) {
    return (
      <Slot
        className={baseClassName}
        aria-disabled={disabled || isLoading}
        {...(restProps as React.ButtonHTMLAttributes<HTMLButtonElement>)}
      >
        {content}
      </Slot>
    );
  }

  const shouldReduceMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  return (
    <motion.button
      className={baseClassName}
      disabled={disabled || isLoading}
      variants={shouldReduceMotion ? { rest: {}, hover: {}, tap: {} } : buttonHoverLift}
      initial="rest"
      whileHover="hover"
      whileTap="tap"
      style={style}
      {...restProps}
    >
      {content}
    </motion.button>
  );
}
