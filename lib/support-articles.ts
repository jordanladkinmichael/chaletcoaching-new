/**
 * Support articles data and types
 * Local data file - no API required
 */

export type SupportCategory =
  | "tokens_billing"
  | "coach_requests"
  | "instant_ai"
  | "account_dashboard"
  | "troubleshooting"
  | "trust_safety";

export type SupportArticleSection = {
  heading?: string;
  paragraphs?: string[]; // Optional - section can have only bullets
  bullets?: string[]; // Optional - section can have only paragraphs
};

export type SupportArticle = {
  slug: string;
  title: string;
  description: string;
  category: SupportCategory;
  keywords: string[];
  body: SupportArticleSection[];
  updatedAt: string; // YYYY-MM-DD
  popular?: boolean; // mark top 6
};

export const SUPPORT_ARTICLES: SupportArticle[] = [
  // Tokens & billing
  {
    slug: "tokens-what-are-they",
    title: "What are tokens?",
    description: "Learn what tokens are and how they work as your training balance.",
    category: "tokens_billing",
    keywords: ["tokens", "balance", "what are tokens", "explanation"],
    body: [
      {
        paragraphs: [
          "Tokens are your training balance. You top up once and spend tokens on features.",
          "They keep pricing consistent across different plan types and options.",
        ],
      },
      {
        heading: "How tokens work",
        paragraphs: [
          "100 tokens = €1.00 | £0.87 | $1.19. You top up your balance once and spend tokens on coach requests or Instant AI plans.",
          "Tokens remain in your balance until used. There is no expiration date.",
        ],
      },
      {
        heading: "Where to see your balance",
        paragraphs: [
          "Your token balance is available in your dashboard when signed in.",
          "You can also see it in the header after signing in.",
        ],
      },
    ],
    updatedAt: "2025-01-15",
    popular: true,
  },
  {
    slug: "token-rates-currencies",
    title: "Token rates and currencies",
    description: "Understanding token exchange rates and currency options.",
    category: "tokens_billing",
    keywords: ["rates", "currency", "EUR", "GBP", "USD", "exchange"],
    body: [
      {
        paragraphs: [
          "100 tokens = €1.00 | £0.87 | $1.19",
          "EUR is the base currency. Your selected currency is shown in the header.",
        ],
      },
      {
        heading: "Currency options",
        paragraphs: [
          "You can view prices in EUR, GBP, or USD. Select your preferred currency in the header dropdown.",
          "All token calculations are based on EUR, then converted to your selected currency.",
        ],
      },
      {
        heading: "Related links",
        bullets: [
          "[Payments & tokens](/payments-tokens)",
          "[Pricing](/pricing)",
        ],
      },
    ],
    updatedAt: "2025-01-15",
    popular: true,
  },
  {
    slug: "top-up-tokens",
    title: "How to top up tokens",
    description: "Step-by-step guide to adding tokens to your balance.",
    category: "tokens_billing",
    keywords: ["top up", "add tokens", "purchase", "buy tokens"],
    body: [
      {
        heading: "Steps to top up",
        bullets: [
          "Go to the Pricing page",
          "Choose a pack or enter a custom amount",
          "Complete the secure checkout",
          "Tokens are added to your balance after successful payment",
        ],
      },
      {
        paragraphs: [
          "You can use the same balance for both Instant AI and coach requests.",
        ],
      },
      {
        heading: "Related links",
        bullets: [
          "[Pricing](/pricing)",
          "[Payments & tokens](/payments-tokens)",
        ],
      },
    ],
    updatedAt: "2025-01-15",
    popular: true,
  },
  {
    slug: "pricing-packs-custom",
    title: "Token packs and custom load",
    description: "Understanding token packages and custom amounts.",
    category: "tokens_billing",
    keywords: ["packs", "custom", "starter", "momentum", "elite"],
    body: [
      {
        heading: "Token packs",
        paragraphs: [
          "We offer three preset packs: Starter Spark (10,000 tokens), Momentum Pack (20,000 tokens), and Elite Performance (30,000 tokens).",
          "Each pack is designed for different usage levels.",
        ],
      },
      {
        heading: "Custom load",
        paragraphs: [
          "You can also enter a custom amount. Tokens are calculated based on your selected currency.",
          "Custom amounts are rounded to the nearest 10 tokens for consistency.",
        ],
      },
      {
        heading: "Related links",
        bullets: [
          "[Pricing](/pricing)",
          "[Payments & tokens](/payments-tokens)",
        ],
      },
    ],
    updatedAt: "2025-01-15",
  },
  {
    slug: "refunds-basics",
    title: "Refunds at a glance",
    description: "Quick overview of refund eligibility and process.",
    category: "tokens_billing",
    keywords: ["refund", "return", "money back"],
    body: [
      {
        paragraphs: [
          "Refund eligibility depends on the situation and the service used.",
          "Please review our refund policy for details and eligibility.",
        ],
      },
      {
        heading: "Related links",
        bullets: [
          "[Refund policy](/legal/refunds)",
        ],
      },
    ],
    updatedAt: "2025-01-15",
  },
  // Coach requests
  {
    slug: "coach-request-overview",
    title: "How coach requests work",
    description: "Understanding the coach request process from start to finish.",
    category: "coach_requests",
    keywords: ["coach", "request", "how it works", "process"],
    body: [
      {
        paragraphs: [
          "Coach requests are personalized plans created by certified coaches based on your specific goals and preferences.",
          "You fill out a form with your level, training type, equipment, and days per week.",
        ],
      },
      {
        heading: "The process",
        bullets: [
          "Browse coaches and select one",
          "Fill out the request form",
          "Review the cost breakdown",
          "Submit your request",
          "Receive your personalized plan",
        ],
      },
      {
        heading: "Related links",
        bullets: [
          "[Browse coaches](/coaches)",
          "[How it works](/how-it-works)",
        ],
      },
    ],
    updatedAt: "2025-01-15",
    popular: true,
  },
  {
    slug: "coach-request-pricing",
    title: "How coach request pricing is calculated",
    description: "Understanding the cost breakdown for coach requests.",
    category: "coach_requests",
    keywords: ["pricing", "cost", "calculate", "breakdown"],
    body: [
      {
        paragraphs: [
          "Coach request pricing starts at 10,000 tokens base cost.",
          "Additional costs depend on your selections.",
        ],
      },
      {
        heading: "Cost factors",
        bullets: [
          "Base request: 10,000 tokens",
          "Level: Intermediate (+5,000) or Advanced (+12,000)",
          "Training type: Mixed (+4,000)",
          "Equipment: Basic (+3,000) or Full gym (+6,000)",
          "Days per week: 4 days (+4,000), 5 days (+8,000), 6 days (+12,000)",
        ],
      },
      {
        heading: "Related links",
        bullets: [
          "[Payments & tokens](/payments-tokens)",
          "[Browse coaches](/coaches)",
        ],
      },
    ],
    updatedAt: "2025-01-15",
  },
  {
    slug: "coach-request-tips",
    title: "Tips for a better coach request",
    description: "Best practices for getting the most out of your coach request.",
    category: "coach_requests",
    keywords: ["tips", "best practices", "improve"],
    body: [
      {
        heading: "Be specific",
        paragraphs: [
          "Provide clear information about your goals, current fitness level, and available equipment.",
          "The more details you share, the better your personalized plan will be.",
        ],
      },
      {
        heading: "Choose the right coach",
        paragraphs: [
          "Browse coach profiles to find someone whose expertise matches your goals.",
          "Read their specialties and focus areas before making a request.",
        ],
      },
      {
        heading: "Related links",
        bullets: [
          "[Browse coaches](/coaches)",
        ],
      },
    ],
    updatedAt: "2025-01-15",
  },
  {
    slug: "coach-profile-request",
    title: "Requesting a plan from a coach profile",
    description: "How to request a plan directly from a coach's profile page.",
    category: "coach_requests",
    keywords: ["profile", "coach page", "request"],
    body: [
      {
        paragraphs: [
          "You can request a plan directly from any coach's profile page.",
          "Click the 'Request plan' button on the coach profile.",
        ],
      },
      {
        heading: "Steps",
        bullets: [
          "Visit the coach's profile page",
          "Click 'Request plan'",
          "Fill out the request form",
          "Review and submit",
        ],
      },
      {
        heading: "Related links",
        bullets: [
          "[Browse coaches](/coaches)",
        ],
      },
    ],
    updatedAt: "2025-01-15",
  },
  // Instant AI generator
  {
    slug: "instant-ai-preview",
    title: "How Instant AI previews work (50 tokens)",
    description: "Understanding the preview feature and its cost.",
    category: "instant_ai",
    keywords: ["preview", "50 tokens", "instant ai"],
    body: [
      {
        paragraphs: [
          "Instant AI previews let you see a sample of your plan before committing to the full cost.",
          "Preview costs 50 tokens and shows you a glimpse of what your plan will look like.",
        ],
      },
      {
        heading: "How it works",
        bullets: [
          "Fill out the generator form",
          "Click 'Preview plan' (50 tokens)",
          "Review the preview",
          "Decide to publish or make changes",
        ],
      },
      {
        heading: "Related links",
        bullets: [
          "[Open generator](/generator)",
          "[Payments & tokens](/payments-tokens)",
        ],
      },
    ],
    updatedAt: "2025-01-15",
    popular: true,
  },
  {
    slug: "instant-ai-publish",
    title: "Publishing your full plan",
    description: "How to publish your Instant AI plan after preview.",
    category: "instant_ai",
    keywords: ["publish", "full plan", "generate"],
    body: [
      {
        paragraphs: [
          "After previewing your plan, you can publish it to get the complete version.",
          "Publishing costs depend on your selected options (weeks, workout types, muscle groups).",
        ],
      },
      {
        heading: "Steps",
        bullets: [
          "Preview your plan (50 tokens)",
          "Review the preview",
          "Click 'Publish plan'",
          "Confirm the cost",
          "Receive your full plan",
        ],
      },
      {
        heading: "Related links",
        bullets: [
          "[Open generator](/generator)",
          "[Payments & tokens](/payments-tokens)",
        ],
      },
    ],
    updatedAt: "2025-01-15",
  },
  {
    slug: "instant-ai-costs",
    title: "What affects Instant AI cost?",
    description: "Understanding factors that influence Instant AI plan pricing.",
    category: "instant_ai",
    keywords: ["cost", "pricing", "factors"],
    body: [
      {
        paragraphs: [
          "Instant AI plan costs depend on several factors related to your selections.",
        ],
      },
      {
        heading: "Cost factors",
        bullets: [
          "Number of weeks",
          "Workout types selected",
          "Muscle groups targeted",
          "Complexity of the plan",
        ],
      },
      {
        heading: "Related links",
        bullets: [
          "[Open generator](/generator)",
          "[Payments & tokens](/payments-tokens)",
        ],
      },
    ],
    updatedAt: "2025-01-15",
  },
  // Account & dashboard
  {
    slug: "sign-in-and-access",
    title: "Sign-in and access basics",
    description: "How to sign in and access your account.",
    category: "account_dashboard",
    keywords: ["sign in", "login", "access", "account"],
    body: [
      {
        paragraphs: [
          "Sign in to access your dashboard, view your plans, and manage your token balance.",
        ],
      },
      {
        heading: "How to sign in",
        bullets: [
          "Click 'Sign in' in the header",
          "Enter your email and password",
          "Access your dashboard",
        ],
      },
      {
        heading: "Creating an account",
        paragraphs: [
          "If you don't have an account, click 'Create account' to sign up.",
        ],
      },
    ],
    updatedAt: "2025-01-15",
  },
  {
    slug: "where-to-find-plans",
    title: "Where to find your plans in the dashboard",
    description: "Locating your coach requests and Instant AI plans.",
    category: "account_dashboard",
    keywords: ["dashboard", "plans", "find", "where"],
    body: [
      {
        paragraphs: [
          "All your plans, both coach requests and Instant AI plans, are available in your Dashboard.",
          "You can view, download, and track your progress there.",
        ],
      },
      {
        heading: "Dashboard sections",
        bullets: [
          "Token balance and history",
          "Courses created",
          "Recent activity",
          "All your plans",
        ],
      },
      {
        heading: "Related links",
        bullets: [
          "[Dashboard](/dashboard)",
        ],
      },
    ],
    updatedAt: "2025-01-15",
    popular: true,
  },
  {
    slug: "balance-and-history",
    title: "Checking token balance and history",
    description: "How to view your token balance and transaction history.",
    category: "account_dashboard",
    keywords: ["balance", "history", "transactions", "tokens"],
    body: [
      {
        paragraphs: [
          "Your token balance is visible in the header after signing in.",
          "You can also see detailed balance and transaction history in your dashboard.",
        ],
      },
      {
        heading: "Transaction history",
        paragraphs: [
          "View all your token transactions, including top-ups and spending, in the dashboard.",
          "Each transaction shows the date, amount, and reason.",
        ],
      },
      {
        heading: "Related links",
        bullets: [
          "[Dashboard](/dashboard)",
          "[Payments & tokens](/payments-tokens)",
        ],
      },
    ],
    updatedAt: "2025-01-15",
  },
  // Troubleshooting
  {
    slug: "generation-stuck",
    title: "Generation is stuck or slow",
    description: "What to do if your plan generation is taking too long.",
    category: "troubleshooting",
    keywords: ["stuck", "slow", "loading", "generation"],
    body: [
      {
        paragraphs: [
          "If generation seems stuck or is taking longer than expected, try these steps.",
        ],
      },
      {
        heading: "Troubleshooting steps",
        bullets: [
          "Wait a moment - complex plans can take time",
          "Refresh the page",
          "Check your internet connection",
          "Try generating again",
          "Contact support if the issue persists",
        ],
      },
      {
        heading: "Related links",
        bullets: [
          "[Contact support](/contact)",
        ],
      },
    ],
    updatedAt: "2025-01-15",
  },
  {
    slug: "payment-issues",
    title: "Payment issues and troubleshooting",
    description: "Common payment problems and solutions.",
    category: "troubleshooting",
    keywords: ["payment", "checkout", "failed", "error"],
    body: [
      {
        paragraphs: [
          "If you're experiencing payment issues, here are common solutions.",
        ],
      },
      {
        heading: "Common issues",
        bullets: [
          "Payment declined - check your card details and available funds",
          "Checkout not loading - try refreshing or using a different browser",
          "Tokens not added - contact support with your transaction ID",
        ],
      },
      {
        heading: "Related links",
        bullets: [
          "[Contact support](/contact)",
          "[Payments & tokens](/payments-tokens)",
        ],
      },
    ],
    updatedAt: "2025-01-15",
  },
  {
    slug: "common-ui-issues",
    title: "Common UI issues (loading, blank states)",
    description: "Fixing common interface problems.",
    category: "troubleshooting",
    keywords: ["UI", "loading", "blank", "error"],
    body: [
      {
        paragraphs: [
          "If you see loading issues or blank states, try these fixes.",
        ],
      },
      {
        heading: "Quick fixes",
        bullets: [
          "Refresh the page",
          "Clear your browser cache",
          "Try a different browser",
          "Check your internet connection",
          "Disable browser extensions temporarily",
        ],
      },
      {
        heading: "Related links",
        bullets: [
          "[Contact support](/contact)",
        ],
      },
    ],
    updatedAt: "2025-01-15",
  },
  // Trust & safety
  {
    slug: "trust-safety-basics",
    title: "Training safely with our plans",
    description: "Important safety guidelines and disclaimers.",
    category: "trust_safety",
    keywords: ["safety", "training", "disclaimer", "guidelines"],
    body: [
      {
        paragraphs: [
          "Our plans are designed to help you train safely, but you should always consult with a healthcare professional before starting any new exercise program.",
        ],
      },
      {
        heading: "Safety guidelines",
        bullets: [
          "Consult a healthcare professional before starting",
          "Listen to your body and stop if you feel pain",
          "Start slowly and progress gradually",
          "Use proper form and technique",
        ],
      },
      {
        heading: "Related links",
        bullets: [
          "[Trust & safety](/trust-safety)",
        ],
      },
    ],
    updatedAt: "2025-01-15",
  },
];

// Helper functions
export function getArticleBySlug(slug: string): SupportArticle | undefined {
  return SUPPORT_ARTICLES.find((article) => article.slug === slug);
}

export function getArticlesByCategory(category: SupportCategory | "all"): SupportArticle[] {
  if (category === "all") return SUPPORT_ARTICLES;
  return SUPPORT_ARTICLES.filter((article) => article.category === category);
}

export function getPopularArticles(): SupportArticle[] {
  return SUPPORT_ARTICLES.filter((article) => article.popular).slice(0, 6);
}

export function searchArticles(query: string): SupportArticle[] {
  if (!query.trim()) return SUPPORT_ARTICLES;
  
  const lowerQuery = query.toLowerCase();
  return SUPPORT_ARTICLES.filter((article) => {
    // Search in title, description, keywords
    if (
      article.title.toLowerCase().includes(lowerQuery) ||
      article.description.toLowerCase().includes(lowerQuery) ||
      article.keywords.some((kw) => kw.toLowerCase().includes(lowerQuery))
    ) {
      return true;
    }
    
    // Search in body paragraphs
    return article.body.some((section) =>
      (section.paragraphs ?? []).some((para) => para.toLowerCase().includes(lowerQuery))
    );
  });
}

export function getCategoryCount(category: SupportCategory | "all"): number {
  return getArticlesByCategory(category).length;
}

export const CATEGORY_LABELS: Record<SupportCategory, string> = {
  tokens_billing: "Tokens & billing",
  coach_requests: "Coach requests",
  instant_ai: "Instant AI generator",
  account_dashboard: "Account & dashboard",
  troubleshooting: "Troubleshooting",
  trust_safety: "Trust & safety",
};


