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
import { BookSessionModal } from "@/components/coaches/BookSessionModal";
import { Button } from "@/components/ui/button";
import { HOURLY_RATE } from "@/lib/coach-pricing";
import type { CoachCardData } from "@/components/coaches/CoachCard";
import type { Route } from "next";

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
  const [bookModalOpen, setBookModalOpen] = React.useState(false);
  const [balance, setBalance] = React.useState(0);

  // Load user balance when authenticated
  React.useEffect(() => {
    if (!session?.user) return;
    fetch("/api/tokens/balance", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => setBalance(typeof data.balance === "number" ? data.balance : 0))
      .catch(() => setBalance(0));
  }, [session]);

  const handleBookSession = React.useCallback(
    async (booking: {
      coachId: string;
      coachSlug: string;
      coachName: string;
      date: string;
      durationHours: number;
      notes: string;
    }) => {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(booking),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Booking failed");
      if (typeof data.newBalance === "number") setBalance(data.newBalance);
    },
    []
  );

  // Navigation handlers for header
  const handleOpenAuth = (mode: "signin" | "signup") => {
    router.push(`/?auth=${mode}`);
  };

  const handleNavigate = (page: string) => {
    const target =
      page === "home"
        ? "/"
        : page.startsWith("/")
          ? page
          : `/${page}`;
    router.push(target as Route);
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
                We couldn&apos;t load the coach profile. Please try again.
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

          {/* Book a Training Session CTA */}
          <div className="mb-12 rounded-2xl border border-border bg-surface p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold mb-1">Book a Training Session</h2>
                <p className="text-sm text-text-muted">
                  {HOURLY_RATE.toLocaleString()} tokens/hour &middot; Select a date &amp; time that works for you
                </p>
              </div>
              <Button
                variant="primary"
                size="lg"
                onClick={() => {
                  if (!session?.user) {
                    handleOpenAuth("signup");
                    return;
                  }
                  setBookModalOpen(true);
                }}
              >
                Book a session
              </Button>
            </div>
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

      {/* Booking Modal */}
      {coach && (
        <BookSessionModal
          isOpen={bookModalOpen}
          onClose={() => setBookModalOpen(false)}
          coachId={coach.id}
          coachSlug={coach.slug}
          coachName={coach.name}
          balance={balance}
          onBook={handleBookSession}
        />
      )}
    </>
  );
}
