"use client";

import React from "react";
import { Drawer } from "@/components/ui/drawer";
import { FiltersSidebar, FilterState } from "./FiltersSidebar";
import { Button } from "@/components/ui/button";
import type { Locale } from "@/lib/i18n/config";

interface FiltersDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  onApply: () => void;
  copy: {
    title: string;
    clear: string;
    apply: string;
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
}

export function FiltersDrawer({
  isOpen,
  onClose,
  filters,
  onFiltersChange,
  onApply,
  copy,
  locale,
}: FiltersDrawerProps) {
  const [tempFilters, setTempFilters] = React.useState<FilterState>(filters);

  React.useEffect(() => {
    if (isOpen) {
      setTempFilters(filters);
    }
  }, [isOpen, filters]);

  const handleApply = () => {
    onFiltersChange(tempFilters);
    onApply();
  };

  const handleClear = () => {
    const clearedFilters: FilterState = {
      goals: [],
      level: [],
      trainingType: [],
      languages: [],
      focusAreas: [],
    };
    setTempFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={copy.title}
      side="left"
      className="flex flex-col"
    >
      <div className="flex-1 overflow-y-auto pb-20">
        <FiltersSidebar
          filters={tempFilters}
          onFiltersChange={setTempFilters}
          copy={copy}
          locale={locale}
        />
      </div>
      
      {/* Sticky footer with buttons */}
      <div className="sticky bottom-0 left-0 right-0 p-4 bg-surface border-t border-border flex gap-3">
        <Button variant="outline" size="md" fullWidth onClick={handleClear}>
          {copy.clear}
        </Button>
        <Button variant="primary" size="md" fullWidth onClick={handleApply}>
          {copy.apply}
        </Button>
      </div>
    </Drawer>
  );
}

