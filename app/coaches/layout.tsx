import { generatePageMetadata } from "@/lib/metadata";

export const metadata = generatePageMetadata({
  title: "Find Your Coach",
  description: "Browse our expert fitness coaches. Find the perfect trainer for your goals, whether it's strength training, fat loss, mobility, or endurance.",
  url: "/coaches",
  image: "/logo.webp",
});

export default function CoachesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
