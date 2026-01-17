"use client";

import React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: { value: string; label: string }[];
}

export function Select({ className, options, ...props }: SelectProps) {
  // Определяем, является ли первая опция placeholder (пустое значение)
  const firstOptionIsPlaceholder = options.length > 0 && options[0].value === "";
  
  return (
    <div className="relative">
      <select
        className={cn(
          "w-full appearance-none rounded-xl border border-border bg-surface px-4 py-2.5 pr-10 text-sm text-text",
          "focus:outline-none focus:ring-2 focus:ring-focus focus:ring-offset-2 focus:ring-offset-bg",
          "disabled:pointer-events-none disabled:opacity-50",
          "cursor-pointer",
          // Если выбрана первая опция (placeholder), применяем placeholder-стиль
          props.value === "" && firstOptionIsPlaceholder && "text-text-muted italic",
          className
        )}
        {...props}
      >
        {options.map((option, index) => {
          // Первая опция с пустым значением должна быть disabled (placeholder)
          const isPlaceholder = index === 0 && option.value === "";
          return (
            <option 
              key={option.value} 
              value={option.value}
              disabled={isPlaceholder}
              className={isPlaceholder ? "text-text-muted italic" : ""}
            >
              {option.label}
            </option>
          );
        })}
      </select>
      <ChevronDown
        size={18}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"
      />
    </div>
  );
}

