/**
 * Page-specific copy for duplicate-content reduction (SEO).
 * Use these constants instead of hardcoding so each route has distinct wording.
 * See IMPLEMENTATION_STEPS_DUPLICATE_CONTENT.md and DUPLICATE_CONTENT_REDUCTION_PLAN.md.
 */

export const COPY = {
  /** Pricing page (/pricing) */
  pricingPage: {
    h1: "Token packs & pricing",
    introSecond:
      "Choose a pack below or enter a custom amount. Your balance works for coach requests and Instant AI. All prices include 20% VAT.",
    metaDescription:
      "Token packs and custom top-up for Chaletcoaching. One balance for coach-built plans and Instant AI. Prices in EUR, GBP, USD with VAT.",
  },

  /** Homepage pricing section */
  home: {
    pricingHeading: "One balance for coaches and AI",
    pricingIntro:
      "Get tokens once and use them for coach-built plans or instant AI—no subscription. Rates: 100 tokens = €1 (or equivalent in GBP/USD).",
  },

  /** How it works page */
  howItWorks: {
    heroParagraph:
      "Two ways to get your plan: work with a coach or generate one with AI. Both use your token balance.",
    ctaCoach: "Find a coach",
    ctaGenerator: "Try the Instant AI generator",
    tokenFaqAnswer:
      "Your balance is charged in tokens. The rate is 100 tokens per euro (or the equivalent in GBP/USD). Top up when you need to and spend on the option you choose. Tokens do not expire.",
    tokensSectionRate:
      "Rates: 100 tokens per €1. Prices in GBP and USD use the same token value.",
    coachSteps: [
      "Choose your coach",
      "Submit your request",
      "Your plan is created",
      "Track it in your dashboard",
    ] as const,
    instantAiSteps: [
      "Set your options",
      "Generate a preview (50 tokens)",
      "Publish your full plan",
      "Download and train",
    ] as const,
    metaDescription:
      "Two ways to get your fitness plan on Chaletcoaching: request a coach-built plan or generate one with Instant AI. Learn how tokens and both options work.",
  },

  /** Generator page */
  generator: {
    subtitle:
      "Set your duration, frequency, and preferences below. Preview with 50 tokens, then publish your full plan.",
    coachCta: "Want a coach instead? Find a coach",
    metaDescription:
      "Build your personalized fitness plan with the Instant AI generator. Set duration, sessions, and goals; preview with 50 tokens, then publish. Chaletcoaching.",
  },

  /** Pricing component — context-based strings (home vs pricing-page) */
  pricingContext: {
    "pricing-page": {
      vatNotice:
        "All displayed package prices include 20% VAT. Tokens are calculated from the net (pre-VAT) price.",
      sectionHeading: "What you can do with tokens",
      leftCardTitle: "Instant AI plans",
      leftCardBullets: "Preview: 50 tokens. Full plan: depends on your options.",
      leftCta: "Create an AI plan",
      rightCardTitle: "Coach-built plans",
      rightCta: "Request a coach plan",
    },
    home: {
      vatNotice:
        "Prices include VAT. Token cost is based on net (pre-VAT) amount.",
      sectionHeading: "Use tokens for",
      leftCardTitle: "AI-generated plans",
      leftCardBullets:
        "Preview (50 tokens), then publish. Cost varies by options.",
      leftCta: "Go to generator",
      rightCardTitle: "Coach requests",
      rightCta: "Find a coach",
    },
  },
} as const;

export type PricingContextKey = keyof typeof COPY.pricingContext;
