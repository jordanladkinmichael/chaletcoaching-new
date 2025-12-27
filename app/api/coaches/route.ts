import { NextRequest, NextResponse } from "next/server";

/**
 * Coaches catalog endpoint
 * Public endpoint - no auth required
 * Supports filtering, searching, and sorting
 */

interface Coach {
  id: string;
  slug: string;
  name: string;
  avatar: string;
  bio: string;
  rating?: number;
  coursesCount?: number;
  featured?: boolean;
  goals: string[];
  level: string;
  trainingType: string;
  languages: string[];
  focusAreas: string[];
  specialties: string[];
}

// Import seed data
import coachesSeedData from "@/coaches_seed_15.json";

// Type for seed data structure
interface CoachSeedData {
  id: string;
  slug: string;
  name: string;
  avatar: string;
  bio: string;
  rating?: number;
  coursesCount?: number;
  featured?: boolean;
  goals: string[];
  level: string;
  trainingType: string;
  languages: string[];
  focusAreas: string[];
  specialties: string[];
}

// Transform seed data to match Coach interface
const allCoaches: Coach[] = (coachesSeedData as CoachSeedData[]).map((coach: CoachSeedData) => ({
  id: coach.id,
  slug: coach.slug,
  name: coach.name,
  avatar: `/images/${coach.avatar}`, // Assuming images are in /public/images/
  bio: coach.bio,
  rating: coach.rating,
  coursesCount: coach.coursesCount,
  featured: coach.featured,
  goals: coach.goals,
  level: coach.level.charAt(0).toUpperCase() + coach.level.slice(1), // Capitalize first letter
  trainingType: coach.trainingType.charAt(0).toUpperCase() + coach.trainingType.slice(1), // Capitalize first letter
  languages: coach.languages,
  focusAreas: coach.focusAreas,
  specialties: coach.specialties,
}));


// Calculate recommended score
function calculateRecommendedScore(coach: Coach): number {
  const rating = coach.rating || 0;
  const coursesCount = coach.coursesCount || 0;
  return 0.7 * rating + 0.3 * Math.log10(coursesCount + 1);
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // Check if requesting single coach by slug
    const slug = searchParams.get("slug");
    if (slug) {
      const coach = allCoaches.find((c) => c.slug === slug);
      if (!coach) {
        return NextResponse.json(
          { error: "Coach not found" },
          { status: 404 }
        );
      }
      return NextResponse.json({ coach });
    }
    
    // Parse filters
    const goals = searchParams.getAll("goal");
    const level = searchParams.get("level");
    const trainingType = searchParams.get("trainingType");
    const languages = searchParams.getAll("lang");
    const focusAreas = searchParams.getAll("focus");
    const search = searchParams.get("search")?.toLowerCase() || "";
    const sort = searchParams.get("sort") || "recommended";
    const excludeSlug = searchParams.get("excludeSlug");
    const limitParam = searchParams.get("limit");
    const limit = limitParam ? parseInt(limitParam, 10) : undefined;

    // Filter coaches
    let filtered = allCoaches.filter((coach) => {
      // Exclude slug filter (for related coaches)
      if (excludeSlug && coach.slug === excludeSlug) {
        return false;
      }

      // Goals filter
      if (goals.length > 0) {
        const hasMatchingGoal = goals.some((goal) =>
          coach.goals.some((g) => g.toLowerCase() === goal.toLowerCase())
        );
        if (!hasMatchingGoal) return false;
      }

      // Level filter
      if (level && coach.level.toLowerCase() !== level.toLowerCase()) {
        return false;
      }

      // Training type filter
      if (trainingType && coach.trainingType.toLowerCase() !== trainingType.toLowerCase()) {
        return false;
      }

      // Languages filter
      if (languages.length > 0) {
        const hasMatchingLang = languages.some((lang) =>
          coach.languages.some((l) => l.toUpperCase() === lang.toUpperCase())
        );
        if (!hasMatchingLang) return false;
      }

      // Focus areas filter
      if (focusAreas.length > 0) {
        const hasMatchingFocus = focusAreas.some((focus) =>
          coach.focusAreas.some((f) => f.toLowerCase() === focus.toLowerCase())
        );
        if (!hasMatchingFocus) return false;
      }

      // Search filter (name + specialties + focusAreas)
      if (search) {
        const searchInName = coach.name.toLowerCase().includes(search);
        const searchInSpecialties = coach.specialties.some((s) =>
          s.toLowerCase().includes(search)
        );
        const searchInFocusAreas = coach.focusAreas.some((f) =>
          f.toLowerCase().includes(search)
        );
        if (!searchInName && !searchInSpecialties && !searchInFocusAreas) {
          return false;
        }
      }

      return true;
    });

    // Sort coaches
    if (sort === "recommended") {
      filtered = filtered.sort((a, b) => {
        const scoreA = calculateRecommendedScore(a);
        const scoreB = calculateRecommendedScore(b);
        return scoreB - scoreA;
      });
    } else if (sort === "top-rated") {
      filtered = filtered.sort((a, b) => {
        const ratingA = a.rating || 0;
        const ratingB = b.rating || 0;
        return ratingB - ratingA;
      });
    } else if (sort === "newest") {
      // For now, sort by id (can be replaced with createdAt when available)
      filtered = filtered.sort((a, b) => {
        const idA = parseInt(a.id.split("-")[1]) || 0;
        const idB = parseInt(b.id.split("-")[1]) || 0;
        return idB - idA;
      });
    }

    // Apply limit if specified (for related coaches)
    if (limit && limit > 0) {
      filtered = filtered.slice(0, limit);
    }

    return NextResponse.json({ coaches: filtered });
  } catch (error) {
    console.error("Error fetching coaches:", error);
    return NextResponse.json(
      { error: "Failed to fetch coaches" },
      { status: 500 }
    );
  }
}

