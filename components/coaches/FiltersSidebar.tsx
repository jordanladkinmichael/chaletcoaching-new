"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { getCoachOptions } from "@/lib/coaches-copy";
import type { Locale } from "@/lib/i18n/config";
import { cn } from "@/lib/utils";

export interface FilterState {
  goals: string[];
  level: string[];
  trainingType: string[];
  languages: string[];
  focusAreas: string[];
}

interface FiltersSidebarProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  copy: {
    clearFilters: string;
    sections: {
      goals: string;
      level: string;
      trainingType: string;
      languages: string;
      focusAreas: string;
    };
  };
  locale: Locale;
  className?: string;
}

const FILTER_OPTIONS = {
  goals: ["Strength", "Fat loss", "Mobility", "Endurance", "Posture"],
  level: ["Beginner", "Intermediate", "Advanced"],
  trainingType: ["Home", "Gym", "Mixed"],
  languages: ["EN", "DE", "FR"],
  focusAreas: ["Back-friendly", "Mobility", "HIIT", "Pilates-inspired", "Calisthenics", "Running"],
};

export function FiltersSidebar({ filters, onFiltersChange, copy, locale, className }: FiltersSidebarProps) {
  const toggleFilter = (category: keyof FilterState, value: string) => {
    const current = filters[category];
    const isSelected = current.includes(value);
    
    if (category === "level" || category === "trainingType") {
      // Single select for level and trainingType
      onFiltersChange({
        ...filters,
        [category]: isSelected ? [] : [value],
      });
    } else {
      // Multi select for others
      onFiltersChange({
        ...filters,
        [category]: isSelected
          ? current.filter((v) => v !== value)
          : [...current, value],
      });
    }
  };

  const clearFilters = () => {
    onFiltersChange({
      goals: [],
      level: [],
      trainingType: [],
      languages: [],
      focusAreas: [],
    });
  };

  const hasActiveFilters = Object.values(filters).some((arr) => arr.length > 0);

  return (
    <div className={cn("space-y-6", className)}>
      {/* Goals */}
      <div>
        <h3 className="text-sm font-semibold text-text mb-3">{copy.sections.goals}</h3>
        <div className="space-y-2">
          {getCoachOptions(FILTER_OPTIONS.goals, locale).map((option) => {
            const isSelected = filters.goals.includes(option.value);
            return (
              <label
                key={option.value}
                className="flex items-center gap-2 cursor-pointer group"
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggleFilter("goals", option.value)}
                  className="w-4 h-4 rounded border-border bg-surface text-primary focus:ring-2 focus:ring-focus focus:ring-offset-2 focus:ring-offset-bg cursor-pointer"
                />
                <span className={cn(
                  "text-sm text-text-muted group-hover:text-text transition-colors duration-fast",
                  isSelected && "text-text font-medium"
                )}>
                  {option.label}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Level */}
      <div>
        <h3 className="text-sm font-semibold text-text mb-3">{copy.sections.level}</h3>
        <div className="space-y-2">
          {getCoachOptions(FILTER_OPTIONS.level, locale).map((option) => {
            const isSelected = filters.level.includes(option.value);
            return (
              <label
                key={option.value}
                className="flex items-center gap-2 cursor-pointer group"
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggleFilter("level", option.value)}
                  className="w-4 h-4 rounded border-border bg-surface text-primary focus:ring-2 focus:ring-focus focus:ring-offset-2 focus:ring-offset-bg cursor-pointer"
                />
                <span className={cn(
                  "text-sm text-text-muted group-hover:text-text transition-colors duration-fast",
                  isSelected && "text-text font-medium"
                )}>
                  {option.label}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Training Type */}
      <div>
        <h3 className="text-sm font-semibold text-text mb-3">{copy.sections.trainingType}</h3>
        <div className="space-y-2">
          {getCoachOptions(FILTER_OPTIONS.trainingType, locale).map((option) => {
            const isSelected = filters.trainingType.includes(option.value);
            return (
              <label
                key={option.value}
                className="flex items-center gap-2 cursor-pointer group"
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggleFilter("trainingType", option.value)}
                  className="w-4 h-4 rounded border-border bg-surface text-primary focus:ring-2 focus:ring-focus focus:ring-offset-2 focus:ring-offset-bg cursor-pointer"
                />
                <span className={cn(
                  "text-sm text-text-muted group-hover:text-text transition-colors duration-fast",
                  isSelected && "text-text font-medium"
                )}>
                  {option.label}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Languages */}
      <div>
        <h3 className="text-sm font-semibold text-text mb-3">{copy.sections.languages}</h3>
        <div className="space-y-2">
          {FILTER_OPTIONS.languages.map((lang) => {
            const isSelected = filters.languages.includes(lang);
            return (
              <label
                key={lang}
                className="flex items-center gap-2 cursor-pointer group"
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggleFilter("languages", lang)}
                  className="w-4 h-4 rounded border-border bg-surface text-primary focus:ring-2 focus:ring-focus focus:ring-offset-2 focus:ring-offset-bg cursor-pointer"
                />
                <span className={cn(
                  "text-sm text-text-muted group-hover:text-text transition-colors duration-fast",
                  isSelected && "text-text font-medium"
                )}>
                  {lang}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Focus Areas */}
      <div>
        <h3 className="text-sm font-semibold text-text mb-3">{copy.sections.focusAreas}</h3>
        <div className="space-y-2">
          {getCoachOptions(FILTER_OPTIONS.focusAreas, locale).map((option) => {
            const isSelected = filters.focusAreas.includes(option.value);
            return (
              <label
                key={option.value}
                className="flex items-center gap-2 cursor-pointer group"
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggleFilter("focusAreas", option.value)}
                  className="w-4 h-4 rounded border-border bg-surface text-primary focus:ring-2 focus:ring-focus focus:ring-offset-2 focus:ring-offset-bg cursor-pointer"
                />
                <span className={cn(
                  "text-sm text-text-muted group-hover:text-text transition-colors duration-fast",
                  isSelected && "text-text font-medium"
                )}>
                  {option.label}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Clear Filters Button */}
      {hasActiveFilters && (
        <Button
          variant="outline"
          size="sm"
          fullWidth
          onClick={clearFilters}
        >
          {copy.clearFilters}
        </Button>
      )}
    </div>
  );
}

