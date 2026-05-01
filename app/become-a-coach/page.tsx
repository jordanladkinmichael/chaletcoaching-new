import { Metadata } from "next";
import Link from "next/link";
import { Button, Card, Container, H1, H2, Paragraph } from "@/components/ui";
import { getCoachesCopy } from "@/lib/coaches-copy";
import { messages } from "@/lib/i18n/messages";
import { getServerLocale } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  const metadataCopy = messages[locale].metadata;

  return {
    title: metadataCopy.becomeCoachTitle,
    description: metadataCopy.becomeCoachDescription,
  };
}

export default async function BecomeACoachPage() {
  const locale = await getServerLocale();
  const copy = getCoachesCopy(locale).becomeCoach;

  return (
    <div className="min-h-screen bg-bg text-text py-12 md:py-16">
      <Container>
        <div className="max-w-3xl mx-auto">
          <H1 className="mb-6">{copy.title}</H1>
          <Paragraph className="text-lg mb-8">{copy.subtitle}</Paragraph>

          <div className="space-y-6 mb-12">
            <Card>
              <H2 className="mb-4">{copy.offerTitle}</H2>
              <ul className="space-y-3 text-text-muted">
                {copy.offerItems.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="text-primary mt-1">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </Card>

            <Card>
              <H2 className="mb-4">{copy.requirementsTitle}</H2>
              <ul className="space-y-3 text-text-muted">
                {copy.requirementsItems.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="text-primary mt-1">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button variant="primary" size="lg" asChild>
              <Link href="/contact">{copy.apply}</Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/">{copy.backHome}</Link>
            </Button>
          </div>
        </div>
      </Container>
    </div>
  );
}
