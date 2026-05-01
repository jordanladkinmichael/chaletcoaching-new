import { Metadata } from "next";
import coachesSeedData from "@/coaches_seed_15.json";
import { getCoachesCopy, localizeCoachDisplay } from "@/lib/coaches-copy";
import { getServerLocale } from "@/lib/i18n/server";
import { generateCoachMetadata } from "@/lib/metadata";

interface CoachSeedData {
  id: string;
  slug: string;
  name: string;
  avatar: string;
  bio: string;
  rating?: number;
  specialties?: string[];
}

function findCoachBySlug(slug: string): CoachSeedData | null {
  const coaches = coachesSeedData as CoachSeedData[];
  return coaches.find((coach) => coach.slug === slug) || null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const locale = await getServerLocale();
  const copy = getCoachesCopy(locale).coachProfile;
  const coach = findCoachBySlug(slug);

  if (!coach) {
    return {
      title: `${copy.notFoundTitle} - Chaletcoaching`,
      description: copy.notFoundBody,
    };
  }

  const avatarPath = coach.avatar.startsWith("/") ? coach.avatar : `/images/${coach.avatar}`;

  const displayCoach = localizeCoachDisplay(
    {
      ...coach,
      goals: [],
      level: "",
      trainingType: "",
      focusAreas: [],
      specialties: coach.specialties ?? [],
    },
    locale
  );

  return generateCoachMetadata(
    {
      name: displayCoach.name,
      bio: displayCoach.bio,
      avatar: avatarPath,
      slug: displayCoach.slug,
      rating: displayCoach.rating,
      specialties: displayCoach.specialties,
    },
    locale
  );
}

export default function CoachLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
