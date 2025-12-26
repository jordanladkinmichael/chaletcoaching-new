"use client";

import React from "react";
import { Button } from "@/components/ui/button";
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
  className?: string;
}

const FILTER_OPTIONS = {
  goals: ["Strength", "Fat loss", "Mobility", "Endurance", "Posture"],
  level: ["Beginner", "Intermediate", "Advanced"],
  trainingType: ["Home", "Gym", "Mixed"],
  languages: ["EN", "DE", "FR"],
  focusAreas: ["Back-friendly", "Mobility", "HIIT", "Pilates-inspired", "Calisthenics", "Running"],
};

export function FiltersSidebar({ filters, onFiltersChange, className }: FiltersSidebarProps) {
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
        <h3 className="text-sm font-semibold text-text mb-3">Goals</h3>
        <div className="space-y-2">
          {FILTER_OPTIONS.goals.map((goal) => {
            const isSelected = filters.goals.includes(goal);
            return (
              <label
                key={goal}
                className="flex items-center gap-2 cursor-pointer group"
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggleFilter("goals", goal)}
                  className="w-4 h-4 rounded border-border bg-surface text-primary focus:ring-2 focus:ring-focus focus:ring-offset-2 focus:ring-offset-bg cursor-pointer"
                />
                <span className={cn(
                  "text-sm text-text-muted group-hover:text-text transition-colors duration-fast",
                  isSelected && "text-text font-medium"
                )}>
                  {goal}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Level */}
      <div>
        <h3 className="text-sm font-semibold text-text mb-3">Level</h3>
        <div className="space-y-2">
          {FILTER_OPTIONS.level.map((level) => {
            const isSelected = filters.level.includes(level);
            return (
              <label
                key={level}
                className="flex items-center gap-2 cursor-pointer group"
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggleFilter("level", level)}
                  className="w-4 h-4 rounded border-border bg-surface text-primary focus:ring-2 focus:ring-focus focus:ring-offset-2 focus:ring-offset-bg cursor-pointer"
                />
                <span className={cn(
                  "text-sm text-text-muted group-hover:text-text transition-colors duration-fast",
                  isSelected && "text-text font-medium"
                )}>
                  {level}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Training Type */}
      <div>
        <h3 className="text-sm font-semibold text-text mb-3">Training Type</h3>
        <div className="space-y-2">
          {FILTER_OPTIONS.trainingType.map((type) => {
            const isSelected = filters.trainingType.includes(type);
            return (
              <label
                key={type}
                className="flex items-center gap-2 cursor-pointer group"
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggleFilter("trainingType", type)}
                  className="w-4 h-4 rounded border-border bg-surface text-primary focus:ring-2 focus:ring-focus focus:ring-offset-2 focus:ring-offset-bg cursor-pointer"
                />
                <span className={cn(
                  "text-sm text-text-muted group-hover:text-text transition-colors duration-fast",
                  isSelected && "text-text font-medium"
                )}>
                  {type}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Languages */}
      <div>
        <h3 className="text-sm font-semibold text-text mb-3">Languages</h3>
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
        <h3 className="text-sm font-semibold text-text mb-3">Focus Areas</h3>
        <div className="space-y-2">
          {FILTER_OPTIONS.focusAreas.map((focus) => {
            const isSelected = filters.focusAreas.includes(focus);
            return (
              <label
                key={focus}
                className="flex items-center gap-2 cursor-pointer group"
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggleFilter("focusAreas", focus)}
                  className="w-4 h-4 rounded border-border bg-surface text-primary focus:ring-2 focus:ring-focus focus:ring-offset-2 focus:ring-offset-bg cursor-pointer"
                />
                <span className={cn(
                  "text-sm text-text-muted group-hover:text-text transition-colors duration-fast",
                  isSelected && "text-text font-medium"
                )}>
                  {focus}
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
          Clear filters
        </Button>
      )}
    </div>
  );
}

