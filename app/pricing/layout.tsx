import { generatePageMetadata } from "@/lib/metadata";

export const metadata = generatePageMetadata({
  title: "Pricing & Tokens",
  description: "Flexible token-based pricing for AI-generated fitness courses. Choose a plan that fits your needs and start your fitness journey today.",
  url: "/pricing",
  image: "/logo.webp",
});

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
