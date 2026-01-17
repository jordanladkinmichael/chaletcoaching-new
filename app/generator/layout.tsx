import { generatePageMetadata } from "@/lib/metadata";

export const metadata = generatePageMetadata({
  title: "AI Course Generator",
  description: "Generate personalized fitness training plans with AI. Customize your workout program by goals, level, equipment, and preferences.",
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
