"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Container } from "@/components/ui";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";
import { CoachProfileHeader } from "@/components/coaches/CoachProfileHeader";
import { CoachHero } from "@/components/coaches/CoachHero";
import { TrustStrip } from "@/components/coaches/TrustStrip";
import { AboutSection } from "@/components/coaches/AboutSection";
import { CoachingFocusSection } from "@/components/coaches/CoachingFocusSection";
import { WhatYouReceiveList } from "@/components/coaches/WhatYouReceiveList";
import { RequestCoachForm } from "@/components/coaches/RequestCoachForm";
import { MiniFAQAccordion } from "@/components/coaches/MiniFAQAccordion";
import { RelatedCoachesRow } from "@/components/coaches/RelatedCoachesRow";
import { SkeletonCoachProfile } from "@/components/coaches/SkeletonCoachProfile";
import { Button } from "@/components/ui/button";
import type { CoachCardData } from "@/components/coaches/CoachCard";

interface Coach extends CoachCardData {
  level: string;
  trainingType: string;
  languages: string[];
  goals: string[];
  focusAreas: string[];
}

export default function CoachProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const slug = params.slug as string;

  const [coach, setCoach] = React.useState<Coach | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [region, setRegion] = React.useState<"EU" | "UK" | "US">("EU");

  // Navigation handlers for header
  const handleOpenAuth = (mode: "signin" | "signup") => {
    router.push(`/?auth=${mode}`);
  };

  const handleNavigate = (page: string) => {
    if (page === "home") {
      router.push("/");
    } else if (page === "coaches") {
      router.push("/coaches");
    } else if (page === "pricing") {
      router.push("/pricing");
    } else if (page === "contact") {
      router.push("/contact");
    } else if (page === "dashboard") {
      router.push("/dashboard");
    } else if (page === "generator") {
      router.push("/generator");
    } else {
      router.push(`/${page}`);
    }
  };

  // Fetch coach data
  React.useEffect(() => {
    if (!slug) return;

    setLoading(true);
    setError(null);

    fetch(`/api/coaches?slug=${slug}`)
      .then((res) => {
        if (res.status === 404) {
          setError("not-found");
          setLoading(false);
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data?.coach) {
          setCoach(data.coach);
        } else if (data?.error) {
          setError("error");
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching coach:", err);
        setError("error");
        setLoading(false);
      });
  }, [slug]);

  const scrollToForm = () => {
    document.getElementById("request-form")?.scrollIntoView({ behavior: "smooth" });
  };

  if (loading) {
    return (
      <>
        <SiteHeader
          onOpenAuth={handleOpenAuth}
          onNavigate={handleNavigate}
          region={region}
          setRegion={setRegion}
        />
        <div className="min-h-screen bg-bg text-text py-8 md:py-12">
          <Container>
            <SkeletonCoachProfile />
          </Container>
        </div>
        <SiteFooter onNavigate={handleNavigate} />
      </>
    );
  }

  if (error === "not-found" || !coach) {
    return (
      <>
        <SiteHeader
          onOpenAuth={handleOpenAuth}
          onNavigate={handleNavigate}
          region={region}
          setRegion={setRegion}
        />
        <div className="min-h-screen bg-bg text-text py-12 md:py-16">
          <Container>
            <div className="max-w-2xl mx-auto text-center">
              <h1 className="text-3xl font-bold mb-4">Coach not found</h1>
              <p className="text-text-muted mb-8">
                The coach you&apos;re looking for doesn&apos;t exist or has been removed.
              </p>
              <Button variant="primary" size="lg" asChild>
                <Link href="/coaches">Back to coaches</Link>
              </Button>
            </div>
          </Container>
        </div>
        <SiteFooter onNavigate={handleNavigate} />
      </>
    );
  }

  if (error === "error") {
    return (
      <>
        <SiteHeader
          onOpenAuth={handleOpenAuth}
          onNavigate={handleNavigate}
          region={region}
          setRegion={setRegion}
        />
        <div className="min-h-screen bg-bg text-text py-12 md:py-16">
          <Container>
            <div className="max-w-2xl mx-auto text-center">
              <h1 className="text-3xl font-bold mb-4">Something went wrong</h1>
              <p className="text-text-muted mb-8">
                We couldn't load the coach profile. Please try again.
              </p>
              <Button variant="primary" size="lg" onClick={() => window.location.reload()}>
                Retry
              </Button>
            </div>
          </Container>
        </div>
        <SiteFooter onNavigate={handleNavigate} />
      </>
    );
  }

  return (
    <>
      <SiteHeader
        onOpenAuth={handleOpenAuth}
        onNavigate={handleNavigate}
        region={region}
        setRegion={setRegion}
      />
      <div className="min-h-screen bg-bg text-text py-8 md:py-12">
        <Container>
          {/* Back + Actions Bar */}
          <CoachProfileHeader coachSlug={coach.slug} coachName={coach.name} />

          {/* Profile Hero */}
          <CoachHero coach={coach} onRequestClick={scrollToForm} />

          {/* Trust Strip */}
          <TrustStrip />

          {/* About + Coaching Focus (side by side on desktop) */}
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            <AboutSection bio={coach.bio} />
            <CoachingFocusSection goals={coach.goals} focusAreas={coach.focusAreas} />
          </div>

          {/* What you receive */}
          <WhatYouReceiveList className="mb-12" />

          {/* Inline Request Form */}
          <RequestCoachForm coachId={coach.id} coachSlug={coach.slug} className="mb-12" />

          {/* Mini FAQ */}
          <MiniFAQAccordion className="mb-12" />

          {/* Related coaches */}
          <RelatedCoachesRow
            currentCoachSlug={coach.slug}
            goal={coach.goals[0]}
            trainingType={coach.trainingType}
          />
        </Container>
      </div>
      <SiteFooter onNavigate={handleNavigate} />
    </>
  );
}
