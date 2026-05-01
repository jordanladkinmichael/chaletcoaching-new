import { generatePageMetadata } from "@/lib/metadata";
import { getServerLocale } from "@/lib/i18n/server";
import { messages } from "@/lib/i18n/messages";

export async function generateMetadata() {
  const locale = await getServerLocale();
  const metadataCopy = messages[locale].metadata;

  return generatePageMetadata({
    title: metadataCopy.coachesTitle,
    description: metadataCopy.coachesDescription,
    url: "/coaches",
    image: "/logo.webp",
  });
}

export default function CoachesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
