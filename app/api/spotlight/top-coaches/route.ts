import { NextResponse } from "next/server";
import coachesSeedData from "@/coaches_seed_15.json";

/**
 * Top coaches for spotlight
 * Public endpoint - no auth required
 * Returns featured coaches from seed data
 */
export async function GET() {
  try {
    // Get featured coaches or top-rated coaches from seed data
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
    const allCoaches = (coachesSeedData as CoachSeedData[]).map((coach: CoachSeedData) => ({
      id: coach.id,
      slug: coach.slug,
      name: coach.name,
      avatar: `/images/${coach.avatar}`, // Path to avatar image
      specialties: coach.specialties,
      rating: coach.rating,
      coursesCount: coach.coursesCount,
      featured: coach.featured,
      bio: coach.bio,
    }));

    // Sort by featured first, then by rating, then by coursesCount
    const sortedCoaches = allCoaches.sort((a, b) => {
      // Featured coaches first
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      
      // Then by rating
      const ratingA = a.rating || 0;
      const ratingB = b.rating || 0;
      if (ratingB !== ratingA) return ratingB - ratingA;
      
      // Then by coursesCount
      const coursesA = a.coursesCount || 0;
      const coursesB = b.coursesCount || 0;
      return coursesB - coursesA;
    });

    // Return top 6 coaches
    const topCoaches = sortedCoaches.slice(0, 6).map((coach) => ({
      id: coach.id,
      slug: coach.slug,
      name: coach.name,
      avatar: coach.avatar,
      specialties: coach.specialties,
      rating: coach.rating,
      coursesCount: coach.coursesCount,
      bio: coach.bio,
    }));

    return NextResponse.json({ coaches: topCoaches });
  } catch (error) {
    console.error("Error fetching top coaches:", error);
    return NextResponse.json(
      { error: "Failed to fetch top coaches" },
      { status: 500 }
    );
  }
}

