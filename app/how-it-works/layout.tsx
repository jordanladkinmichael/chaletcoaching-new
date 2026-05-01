import { generatePageMetadata } from "@/lib/metadata";
import { getServerLocale } from "@/lib/i18n/server";
import { messages } from "@/lib/i18n/messages";

export async function generateMetadata() {
  const locale = await getServerLocale();
  const metadataCopy = messages[locale].metadata;

  return generatePageMetadata({
    title: metadataCopy.howItWorksTitle,
    description: metadataCopy.howItWorksDescription,
    url: "/how-it-works",
    image: "/logo.webp",
  });
}

export default function HowItWorksLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
