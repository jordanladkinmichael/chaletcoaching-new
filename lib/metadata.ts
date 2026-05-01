import { Metadata } from "next";
import type { Locale } from "@/lib/i18n/config";
import { messages } from "@/lib/i18n/messages";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://chaletcoaching.co.uk";
const SITE_NAME = "Chaletcoaching";
const DEFAULT_DESCRIPTION = messages.en.metadata.defaultDescription;

export interface MetadataOptions {
  title?: string;
  description?: string;
  image?: string;
  imageAlt?: string;
  url?: string;
  type?: "website" | "article" | "profile";
  noIndex?: boolean;
}

/**
 * Generate metadata for pages
 */
export function generatePageMetadata(options: MetadataOptions = {}): Metadata {
  const {
    title,
    description = DEFAULT_DESCRIPTION,
    image = "/logo.webp",
    imageAlt = messages.en.metadata.defaultImageAlt,
    url = "",
    type = "website",
    noIndex = false,
  } = options;

  const fullTitle = title ? `${title} - ${SITE_NAME}` : SITE_NAME;
  const fullUrl = url ? `${SITE_URL}${url}` : SITE_URL;
  const imageUrl = image.startsWith("http") ? image : `${SITE_URL}${image}`;

  return {
    title: fullTitle,
    description,
    metadataBase: new URL(SITE_URL),
    ...(noIndex && {
      robots: {
        index: false,
        follow: false,
      },
    }),
    openGraph: {
      type,
      siteName: SITE_NAME,
      title: fullTitle,
      description,
      url: fullUrl,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: imageAlt,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [imageUrl],
    },
  };
}

/**
 * Generate metadata for coach profile pages
 */
export function generateCoachMetadata(coach: {
  name: string;
  bio: string;
  avatar: string;
  slug: string;
  rating?: number;
  specialties?: string[];
}, locale: Locale = "en"): Metadata {
  const title = locale === "tr" ? `${coach.name} - Fitness Koçu` : `${coach.name} - Fitness Coach`;
  const description = coach.bio.length > 160 
    ? coach.bio.substring(0, 157) + "..." 
    : coach.bio;
  
  const imageUrl = coach.avatar.startsWith("http") 
    ? coach.avatar 
    : `${SITE_URL}${coach.avatar}`;

  return {
    title,
    description,
    metadataBase: new URL(SITE_URL),
    openGraph: {
      type: "profile",
      siteName: SITE_NAME,
      title,
      description,
      url: `${SITE_URL}/coaches/${coach.slug}`,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
  };
}
