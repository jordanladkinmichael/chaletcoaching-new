import { generatePageMetadata } from "@/lib/metadata";
import { COPY } from "@/lib/copy-variants";

export const metadata = generatePageMetadata({
  title: "How it works",
  description: COPY.howItWorks.metaDescription,
  url: "/how-it-works",
  image: "/logo.webp",
});

export default function HowItWorksLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
