import { Metadata } from "next";
import Link from "next/link";
import { Container, H1, H2, Paragraph, Button, Card } from "@/components/ui";

export const metadata: Metadata = {
  title: "Become a Coach | Chaletcoaching",
  description: "Apply to join and build coach-led courses with AI support.",
};

export default function BecomeACoachPage() {
  return (
    <div className="min-h-screen bg-bg text-text py-12 md:py-16">
      <Container>
        <div className="max-w-3xl mx-auto">
          <H1 className="mb-6">Become a Coach</H1>
          <Paragraph className="text-lg mb-8">
            Join our platform and help users achieve their fitness goals with structured, coach-led courses enhanced by AI support.
          </Paragraph>

          <div className="space-y-6 mb-12">
            <Card>
              <H2 className="mb-4">What We Offer</H2>
              <ul className="space-y-3 text-text-muted">
                <li className="flex items-start gap-3">
                  <span className="text-primary mt-1">•</span>
                  <span>Platform to showcase your expertise and build your coaching brand</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary mt-1">•</span>
                  <span>AI tools to streamline course creation and delivery</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary mt-1">•</span>
                  <span>Token-based compensation model</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary mt-1">•</span>
                  <span>Support for various training specializations</span>
                </li>
              </ul>
            </Card>

            <Card>
              <H2 className="mb-4">Requirements</H2>
              <ul className="space-y-3 text-text-muted">
                <li className="flex items-start gap-3">
                  <span className="text-primary mt-1">•</span>
                  <span>Certified fitness professional or equivalent experience</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary mt-1">•</span>
                  <span>Ability to create structured, progressive training programs</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary mt-1">•</span>
                  <span>Commitment to quality and safety standards</span>
                </li>
              </ul>
            </Card>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button variant="primary" size="lg" asChild>
              <Link href="/contact">Contact Us to Apply</Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/">Back to Home</Link>
            </Button>
          </div>
        </div>
      </Container>
    </div>
  );
}

