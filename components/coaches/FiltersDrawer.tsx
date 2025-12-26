"use client";

import React from "react";
import { Drawer } from "@/components/ui/drawer";
import { FiltersSidebar, FilterState } from "./FiltersSidebar";
import { Button } from "@/components/ui/button";

interface FiltersDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  onApply: () => void;
}

export function FiltersDrawer({
  isOpen,
  onClose,
  filters,
  onFiltersChange,
  onApply,
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
      title="Filters"
      side="left"
      className="flex flex-col"
    >
      <div className="flex-1 overflow-y-auto pb-20">
        <FiltersSidebar
          filters={tempFilters}
          onFiltersChange={setTempFilters}
        />
      </div>
      
      {/* Sticky footer with buttons */}
      <div className="sticky bottom-0 left-0 right-0 p-4 bg-surface border-t border-border flex gap-3">
        <Button variant="outline" size="md" fullWidth onClick={handleClear}>
          Clear
        </Button>
        <Button variant="primary" size="md" fullWidth onClick={handleApply}>
          Apply
        </Button>
      </div>
    </Drawer>
  );
}

