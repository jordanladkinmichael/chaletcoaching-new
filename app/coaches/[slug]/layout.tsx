import { Metadata } from "next";
import { generateCoachMetadata } from "@/lib/metadata";
import coachesSeedData from "@/coaches_seed_15.json";

interface CoachSeedData {
  id: string;
  slug: string;
  name: string;
  avatar: string;
  bio: string;
  rating?: number;
  specialties?: string[];
}

// Find coach from seed data
function findCoachBySlug(slug: string): CoachSeedData | null {
  const coaches = coachesSeedData as CoachSeedData[];
  return coaches.find((c) => c.slug === slug) || null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const coach = findCoachBySlug(slug);

  if (!coach) {
    return {
      title: "Coach not found — Chaletcoaching",
      description: "The coach you're looking for doesn't exist.",
    };
  }

  // Avatar path handling - seed data has filename, need to add /images/ prefix
  const avatarPath = coach.avatar.startsWith("/") 
    ? coach.avatar 
    : `/images/${coach.avatar}`;

  return generateCoachMetadata({
    name: coach.name,
    bio: coach.bio,
    avatar: avatarPath,
    slug: coach.slug,
    rating: coach.rating,
    specialties: coach.specialties,
  });
}

export default function CoachLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
