"use client";

import React, { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Container, H1, Paragraph, Button, SearchInput, Select } from "@/components/ui";
import { CoachCard, type CoachCardData } from "@/components/coaches/CoachCard";
import { SkeletonCoachCard } from "@/components/coaches/SkeletonCoachCard";
import { FiltersSidebar, type FilterState } from "@/components/coaches/FiltersSidebar";
import { FiltersDrawer } from "@/components/coaches/FiltersDrawer";
import { Filter } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";
import type { Route } from "next";

const SORT_OPTIONS = [
  { value: "recommended", label: "Recommended" },
  { value: "top-rated", label: "Top rated" },
  { value: "newest", label: "Newest" },
];

const QUICK_FILTERS = [
  { label: "Strength", type: "goal", value: "Strength" },
  { label: "Fat loss", type: "goal", value: "Fat loss" },
  { label: "Mobility", type: "goal", value: "Mobility" },
  { label: "Endurance", type: "goal", value: "Endurance" },
  { label: "Posture", type: "goal", value: "Posture" },
  { label: "Home", type: "trainingType", value: "Home" },
  { label: "Gym", type: "trainingType", value: "Gym" },
];

function CoachesPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [coaches, setCoaches] = React.useState<CoachCardData[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [filtersDrawerOpen, setFiltersDrawerOpen] = React.useState(false);
  const [region, setRegion] = React.useState<"EU" | "UK" | "US">("EU");

  // Parse URL params to initial state
  const [filters, setFilters] = React.useState<FilterState>(() => {
    return {
      goals: searchParams.getAll("goal"),
      level: searchParams.getAll("level"),
      trainingType: searchParams.getAll("trainingType"),
      languages: searchParams.getAll("lang"),
      focusAreas: searchParams.getAll("focus"),
    };
  });

  const [search, setSearch] = React.useState(searchParams.get("search") || "");
  const [sort, setSort] = React.useState(searchParams.get("sort") || "recommended");
  const [debouncedSearch, setDebouncedSearch] = React.useState(search);

  // Debounce search
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Update URL when filters/search/sort change
  React.useEffect(() => {
    const params = new URLSearchParams();
    
    filters.goals.forEach((goal) => params.append("goal", goal));
    filters.level.forEach((level) => params.append("level", level));
    filters.trainingType.forEach((type) => params.append("trainingType", type));
    filters.languages.forEach((lang) => params.append("lang", lang));
    filters.focusAreas.forEach((focus) => params.append("focus", focus));
    
    if (debouncedSearch) {
      params.set("search", debouncedSearch);
    }
    
    if (sort !== "recommended") {
      params.set("sort", sort);
    }

    const queryString = params.toString();
    const target = `/coaches${queryString ? `?${queryString}` : ""}` as Route;
    router.replace(target, { scroll: false });
  }, [filters, debouncedSearch, sort, router]);

  // Fetch coaches
  React.useEffect(() => {
    setLoading(true);
    setError(null);

    const params = new URLSearchParams();
    filters.goals.forEach((goal) => params.append("goal", goal));
    filters.level.forEach((level) => params.append("level", level));
    filters.trainingType.forEach((type) => params.append("trainingType", type));
    filters.languages.forEach((lang) => params.append("lang", lang));
    filters.focusAreas.forEach((focus) => params.append("focus", focus));
    
    if (debouncedSearch) {
      params.set("search", debouncedSearch);
    }
    
    if (sort !== "recommended") {
      params.set("sort", sort);
    }

    fetch(`/api/coaches?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          setCoaches(data.coaches || []);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching coaches:", err);
        setError("Failed to load coaches");
        setLoading(false);
      });
  }, [filters, debouncedSearch, sort]);

  const handleQuickFilterToggle = (type: string, value: string) => {
    if (type === "goal") {
      const isSelected = filters.goals.includes(value);
      setFilters({
        ...filters,
        goals: isSelected
          ? filters.goals.filter((g) => g !== value)
          : [...filters.goals, value],
      });
    } else if (type === "trainingType") {
      const isSelected = filters.trainingType.includes(value);
      setFilters({
        ...filters,
        trainingType: isSelected
          ? filters.trainingType.filter((t) => t !== value)
          : [...filters.trainingType, value],
      });
    }
  };

  const clearFilters = () => {
    setFilters({
      goals: [],
      level: [],
      trainingType: [],
      languages: [],
      focusAreas: [],
    });
    setSearch("");
    setDebouncedSearch("");
  };

  const hasActiveFilters = Object.values(filters).some((arr) => arr.length > 0) || search;

  // Navigation handlers for header
  const handleOpenAuth = (mode: "signin" | "signup") => {
    const currentPath = typeof window !== "undefined" ? window.location.pathname : "";
    const returnTo = currentPath !== "/auth/sign-in" && currentPath !== "/auth/sign-up" && currentPath !== "/auth/reset-password"
      ? currentPath
      : "/dashboard";
    const query = returnTo ? `?returnTo=${encodeURIComponent(returnTo)}` : "";
    router.push(`/auth/${mode}${query}` as Route);
  };

  const handleNavigate = (page: string) => {
    const target =
      page === "home"
        ? "/"
        : page.startsWith("/")
          ? page
          : `/${page}`;
    router.push(target as Route);
  };

  return (
    <>
      <SiteHeader
        onOpenAuth={handleOpenAuth}
        onNavigate={handleNavigate}
        region={region}
        setRegion={setRegion}
      />
      <div className="min-h-screen bg-bg text-text py-8 md:py-12">
      <Container>
        {/* Page Header */}
        <div className="mb-8">
          <H1 className="mb-3">Find your coach</H1>
          <Paragraph className="text-lg">
            Browse coaches by goal, style, and training type.
          </Paragraph>
        </div>

        {/* Search + Sort Row */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <SearchInput
              placeholder="Search coaches or specialties"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="sm:w-48">
            <Select
              options={SORT_OPTIONS}
              value={sort}
              onChange={(e) => setSort(e.target.value)}
            />
          </div>
          {/* Mobile Filters Button */}
          <Button
            variant="outline"
            className="sm:hidden"
            onClick={() => setFiltersDrawerOpen(true)}
          >
            <Filter size={18} />
            Filters
          </Button>
        </div>

        {/* Quick Filter Chips */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {QUICK_FILTERS.map((filter) => {
            const isActive =
              (filter.type === "goal" && filters.goals.includes(filter.value)) ||
              (filter.type === "trainingType" && filters.trainingType.includes(filter.value));
            
            return (
              <button
                key={`${filter.type}-${filter.value}`}
                onClick={() => handleQuickFilterToggle(filter.type, filter.value)}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors duration-fast",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
                  isActive
                    ? "bg-primary text-on-primary"
                    : "bg-surface-hover text-text-muted hover:text-text border border-border"
                )}
              >
                {filter.label}
              </button>
            );
          })}
        </div>

        {/* Main Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar (Desktop) */}
          <aside className="hidden lg:block lg:col-span-1">
            <div className="sticky top-8">
              <FiltersSidebar filters={filters} onFiltersChange={setFilters} />
            </div>
          </aside>

          {/* Coach Grid */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {Array.from({ length: 9 }).map((_, i) => (
                  <SkeletonCoachCard key={i} />
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <h2 className="text-2xl font-semibold mb-2">Something went wrong</h2>
                <p className="text-text-muted mb-6">{error}</p>
                <Button variant="primary" onClick={() => window.location.reload()}>
                  Retry
                </Button>
              </div>
            ) : coaches.length === 0 ? (
              <div className="text-center py-12">
                {hasActiveFilters ? (
                  <>
                    <h2 className="text-2xl font-semibold mb-2">No matches</h2>
                    <p className="text-text-muted mb-6">
                      Try clearing filters or searching by a different term.
                    </p>
                    <Button variant="primary" onClick={clearFilters}>
                      Clear filters
                    </Button>
                  </>
                ) : (
                  <>
                    <h2 className="text-2xl font-semibold mb-2">No coaches yet</h2>
                    <p className="text-text-muted mb-6">
                      Want to be the first coach on the platform?
                    </p>
                    <Button variant="primary" asChild>
                      <Link href="/become-a-coach">Become a Coach</Link>
                    </Button>
                  </>
                )}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 mb-12">
                  {coaches.map((coach) => (
                    <CoachCard key={coach.id} coach={coach} />
                  ))}
                </div>

                {/* Bottom CTA Strip */}
                <div className="border-t border-border pt-8 mt-8">
                  <div className="bg-surface border border-border rounded-2xl p-6 md:p-8 text-center">
                    <h2 className="text-xl font-semibold mb-2">Are you a coach?</h2>
                    <p className="text-text-muted mb-6">
                      Apply to join and deliver your coaching through our platform.
                    </p>
                    <Button variant="primary" size="lg" asChild>
                      <Link href="/become-a-coach">Become a Coach</Link>
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </Container>

      {/* Filters Drawer (Mobile) */}
      <FiltersDrawer
        isOpen={filtersDrawerOpen}
        onClose={() => setFiltersDrawerOpen(false)}
        filters={filters}
        onFiltersChange={setFilters}
        onApply={() => setFiltersDrawerOpen(false)}
      />
      </div>
      <SiteFooter onNavigate={handleNavigate} />
    </>
  );
}

export default function CoachesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <CoachesPageContent />
    </Suspense>
  );
}

