import { generatePageMetadata } from "@/lib/metadata";
import { COPY } from "@/lib/copy-variants";

export const metadata = generatePageMetadata({
  title: "AI Course Generator",
  description: COPY.generator.metaDescription,
  url: "/generator",
  image: "/logo.webp",
});

export default function GeneratorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
