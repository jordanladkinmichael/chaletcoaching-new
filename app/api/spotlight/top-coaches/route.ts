import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import coachesSeedData from "@/coaches_seed_15.json";
import { DEFAULT_LOCALE, isLocale } from "@/lib/i18n/config";

export const dynamic = "force-dynamic";

const SPOTLIGHT_TRANSLATIONS_TR: Record<
  string,
  { specialties: string[]; bio: string }
> = {
  c10: {
    specialties: ["Mobilite", "Postur", "Masa Basi Rutinleri"],
    bio: "Masa basi yasam icin mobilite ve postur planlari. Kisa rutinler, net ilerleme ve gereksiz karmasa olmadan guclu aliskanliklar.",
  },
  c04: {
    specialties: ["Pilates", "Core Stabilitesi", "Postur"],
    bio: "Core kontrolu ve hizalanmaya odaklanan Pilates kocu. Net seanslar, yumusak ilerleme ve gunluk hayatta daha guclu bir durus.",
  },
  c01: {
    specialties: ["Yoga Flow", "Nefes Calismasi", "Esneklik"],
    bio: "Gercekten surdurebileceginiz basit rutinlere odaklanan bir vinyasa yoga kocu. Sakin yapi, net yonlendirme, gereksiz sus yok.",
  },
  c02: {
    specialties: ["Powerlifting", "Guc Programlamasi", "Teknik"],
    bio: "Guvenli ilerleme ve temiz teknige odaklanan deneyimli bir guc kocu. Planlar yapili, olculebilir ve gercekcidir.",
  },
  c08: {
    specialties: ["Boks Fitness", "Ayak Calismasi", "Kondisyon"],
    bio: "Dayaniklilik ve ozguven gelistiren boks ilhamli fitness. Temiz drilller, akilli ilerlemeler ve egosuz yaklasim.",
  },
  c14: {
    specialties: ["Dusuk Etkili Fitness", "Denge", "Eklem Dostu Guc"],
    bio: "Sureklilik icin tasarlanmis dusuk etkili guc ve denge seanslari. Yumusak ilerleme, net yonlendirme ve daha guvenli hareket aliskanliklari.",
  },
  c06: {
    specialties: ["Kosu", "5K-Half Marathon", "Dayaniklilik Planlamasi"],
    bio: "Bulundugunuz seviyeden baslayan kosu planlari. Basit tempo, akilli yuklenme ve gercek hayat programina uyan rutinler.",
  },
  c03: {
    specialties: ["Kalistenik", "Vucut Agirligi Gucu", "Beceri Ilerlemeleri"],
    bio: "Sizinle birlikte olceklenen vucut agirligi antrenmani. Guclu temeller, net ilerlemeler ve sakatlik dramasiz beceri calismasi.",
  },
  c11: {
    specialties: ["Olympic Lifting", "Barbell Technigi", "Patlayici Guc"],
    bio: "Patlayici guc icin barbell teknigi kocu. Yapilandirilmis bloklar, teknik drilller ve gercekci ilerleme.",
  },
  c07: {
    specialties: ["Bisiklet", "Performans", "Zone Antrenmani"],
    bio: "Net haftalik yapiya sahip bisiklet odakli programlama. Akilli intervaller, toparlanma bloklari ve guc destegi.",
  },
};

async function getRequestLocale(request: Request) {
  const url = new URL(request.url);
  const localeParam = url.searchParams.get("locale");
  if (isLocale(localeParam)) {
    return localeParam;
  }

  const cookieStore = await cookies();
  const localeCookie = cookieStore.get("chalet_locale")?.value;
  return isLocale(localeCookie) ? localeCookie : DEFAULT_LOCALE;
}

/**
 * Top coaches for spotlight
 * Public endpoint - no auth required
 * Returns featured coaches from seed data
 */
export async function GET(request: Request) {
  try {
    const locale = await getRequestLocale(request);

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
    const topCoaches = sortedCoaches.slice(0, 6).map((coach) => {
      const translation =
        locale === "tr" ? SPOTLIGHT_TRANSLATIONS_TR[coach.id] : undefined;

      return {
        id: coach.id,
        slug: coach.slug,
        name: coach.name,
        avatar: coach.avatar,
        specialties: translation?.specialties ?? coach.specialties,
        rating: coach.rating,
        coursesCount: coach.coursesCount,
        bio: translation?.bio ?? coach.bio,
      };
    });

    return NextResponse.json({ coaches: topCoaches });
  } catch (error) {
    console.error("Error fetching top coaches:", error);
    return NextResponse.json(
      { error: "Failed to fetch top coaches" },
      { status: 500 }
    );
  }
}

