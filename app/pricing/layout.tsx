import { generatePageMetadata } from "@/lib/metadata";
import { getServerLocale } from "@/lib/i18n/server";
import { messages } from "@/lib/i18n/messages";

export async function generateMetadata() {
  const locale = await getServerLocale();
  const metadataCopy = messages[locale].metadata;

  return generatePageMetadata({
    title: metadataCopy.pricingTitle,
    description: metadataCopy.pricingDescription,
    url: "/pricing",
    image: "/logo.webp",
  });
}

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
