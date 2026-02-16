/**
 * Centralized FAQ data source
 * Used on Home page (mini FAQ) and /faq page (full list)
 */

// Legacy FAQItem type (kept for backward compatibility)
export interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

// New FaqItem type for expanded /faq page
export type FaqCategory =
  | "getting_started"
  | "coaches"
  | "instant_ai"
  | "tokens_payments"
  | "account"
  | "safety"
  | "refunds";

export type FaqItem = {
  id: string;
  category: FaqCategory;
  question: string;
  answer: string;
  keywords: string[];
};

// Full FAQ list (for /faq page)
export const ALL_FAQS: FAQItem[] = [
  {
    id: "coach-delivery-time",
    question: "How fast will I receive a coach course?",
    answer: "Coach courses are delivered by your coach. Delivery time depends on your coach's schedule and course complexity.",
  },
  {
    id: "coach-vs-ai",
    question: "What's the difference between Coach Course and Instant AI?",
    answer: "Coach Course is delivered by your coach with personalized expertise. Instant AI is generated in minutes.",
  },
  {
    id: "refund-policy",
    question: "Can I get a refund?",
    answer: "Refund eligibility depends on your order status and delivery stage. Please read our Refund Policy.",
  },
  {
    id: "tokens-expire",
    question: "Do tokens expire?",
    answer: "No, tokens do not expire.",
  },
  {
    id: "payment-methods",
    question: "What payment methods do you support?",
    answer: "Visa and Mastercard.",
  },
  {
    id: "currencies",
    question: "Which currencies are supported?",
    answer: "EUR, GBP, and USD.",
  },
  {
    id: "how-tokens-work",
    question: "How do tokens work?",
    answer: "100 tokens = €1.00 / £0.87 / $1.19. You spend tokens when requesting coach courses or generating instant AI courses.",
  },
  {
    id: "is-it-safe",
    question: "Is it safe?",
    answer: "We include injury-safe options and alternatives, but this is not medical advice. Consult a healthcare professional before starting.",
  },
  {
    id: "equipment-needed",
    question: "What equipment do I need?",
    answer: "Most workouts can be done with minimal equipment. We provide alternatives for different setups.",
  },
  {
    id: "training-frequency",
    question: "How often should I train?",
    answer: "We recommend 3–4 sessions per week for optimal results, but you can adjust based on your schedule and goals.",
  },
];

// Mini FAQ for Home page (curated subset)
export const MINI_FAQS: FAQItem[] = [
  ALL_FAQS[0], // coach-delivery-time
  ALL_FAQS[1], // coach-vs-ai
  ALL_FAQS[2], // refund-policy
  ALL_FAQS[3], // tokens-expire
  ALL_FAQS[4], // payment-methods
  ALL_FAQS[5], // currencies
];

// Coach Profile FAQ (4 questions for coach profile page)
export const coachProfileFAQ: FAQItem[] = [
  {
    id: "what-is-request",
    question: "What is a coach course request?",
    answer: "A coach course request lets you ask a coach to create a personalized training plan for you. The coach will design a structured program based on your goals, level, and preferences.",
  },
  {
    id: "how-tokens-work",
    question: "How do tokens work?",
    answer: "100 tokens = €1.00 / £0.87 / $1.19. You spend tokens when requesting coach courses or generating instant AI courses. Tokens never expire.",
  },
  {
    id: "instant-ai-instead",
    question: "Can I use Instant AI instead?",
    answer: "Yes. Instant AI generates a course in minutes, while coach courses are personalized by your coach. Both options are available on the platform.",
  },
  {
    id: "where-see-requests",
    question: "Where can I see my requests?",
    answer: "You can track all your coach course requests in your dashboard. You'll see the status, updates, and can manage your requests there.",
  },
];

// Expanded FAQ items for /faq page (24 items)
export const FAQ_ITEMS: FaqItem[] = [
  // Getting started
  {
    id: "how-do-i-start",
    category: "getting_started",
    question: "How do I start?",
    answer: "Browse coaches or open the generator. If you want coach guidance, request a plan from a coach profile.",
    keywords: ["start", "begin", "getting started", "how to"],
  },
  {
    id: "coach-vs-ai-difference",
    category: "getting_started",
    question: "What's the difference between Coach requests and Instant AI?",
    answer: "Coach requests are tailored by a coach-led workflow. Instant AI generates a plan immediately based on your inputs.",
    keywords: ["difference", "coach", "instant ai", "compare"],
  },
  {
    id: "do-i-need-account",
    category: "getting_started",
    question: "Do I need an account?",
    answer: "You can browse pages without an account. You'll need to sign in to generate, purchase tokens, and access your dashboard.",
    keywords: ["account", "sign in", "sign up", "register"],
  },
  // Coaches
  {
    id: "how-choose-coach",
    category: "coaches",
    question: "How do I choose a coach?",
    answer: "Use filters and look for specialties that match your goal. Open the coach profile to see focus areas and ratings.",
    keywords: ["choose", "select", "coach", "filter"],
  },
  {
    id: "what-send-coach-request",
    category: "coaches",
    question: "What do I send in a coach request?",
    answer: "Share your goal, level, training type, equipment, and schedule. The more context you provide, the better the plan.",
    keywords: ["request", "send", "coach", "information"],
  },
  {
    id: "can-request-multiple-plans",
    category: "coaches",
    question: "Can I request multiple plans?",
    answer: "Yes. Each request is a separate plan and is priced based on your selections.",
    keywords: ["multiple", "several", "plans", "requests"],
  },
  {
    id: "can-save-coach",
    category: "coaches",
    question: "Can I save a coach?",
    answer: "Yes. You can bookmark coaches to revisit them later.",
    keywords: ["save", "bookmark", "favorite", "coach"],
  },
  // Instant AI
  {
    id: "how-instant-ai-works",
    category: "instant_ai",
    question: "How does the Instant AI generator work?",
    answer: "Select your goal and training preferences, generate a preview, then publish a full plan.",
    keywords: ["instant ai", "generator", "how it works", "process"],
  },
  {
    id: "what-is-preview",
    category: "instant_ai",
    question: "What is a preview?",
    answer: "A preview lets you see the plan structure before publishing. Previews cost 50 tokens.",
    keywords: ["preview", "50 tokens", "see", "before"],
  },
  {
    id: "can-regenerate-plan",
    category: "instant_ai",
    question: "Can I regenerate the plan?",
    answer: "Yes. You can adjust inputs and generate again until you're happy with the result.",
    keywords: ["regenerate", "regenerate", "again", "retry"],
  },
  {
    id: "does-ai-replace-coach",
    category: "instant_ai",
    question: "Does Instant AI replace a coach?",
    answer: "It's a fast option when you need speed. Coaches are best when you want guidance and accountability.",
    keywords: ["replace", "coach", "vs", "comparison"],
  },
  // Tokens & payments
  {
    id: "what-are-tokens",
    category: "tokens_payments",
    question: "What are tokens?",
    answer: "Tokens are your balance used across features like previews, publishing, and coach requests.",
    keywords: ["tokens", "balance", "what are", "explanation"],
  },
  {
    id: "token-rates",
    category: "tokens_payments",
    question: "What are the token rates?",
    answer: "100 tokens = €1.00 | £0.87 | $1.19. EUR is the base currency.",
    keywords: ["rates", "currency", "EUR", "GBP", "USD"],
  },
  {
    id: "same-tokens-both-flows",
    category: "tokens_payments",
    question: "Can I use the same tokens for both flows?",
    answer: "Yes. One token balance works across coach requests and Instant AI.",
    keywords: ["both", "flows", "same", "balance"],
  },
  {
    id: "not-enough-tokens",
    category: "tokens_payments",
    question: "What happens if I don't have enough tokens?",
    answer: "You'll be prompted to top up before completing the action.",
    keywords: ["insufficient", "not enough", "top up", "balance"],
  },
  {
    id: "is-payment-secure",
    category: "tokens_payments",
    question: "Is payment secure?",
    answer: "Yes. Payments are processed via secure checkout. We do not store your full card details.",
    keywords: ["payment", "secure", "checkout", "card"],
  },
  // Account
  {
    id: "where-see-balance",
    category: "account",
    question: "Where can I see my token balance?",
    answer: "In your dashboard after signing in.",
    keywords: ["balance", "dashboard", "where", "see"],
  },
  {
    id: "where-find-plans",
    category: "account",
    question: "Where do I find my plans?",
    answer: "Your dashboard contains your generated plans and coach requests.",
    keywords: ["plans", "dashboard", "find", "where"],
  },
  {
    id: "cant-sign-in",
    category: "account",
    question: "I can't sign in. What should I do?",
    answer: "Check your email address and try again. If the issue persists, contact support.",
    keywords: ["sign in", "login", "problem", "issue"],
  },
  // Safety
  {
    id: "is-medical-advice",
    category: "safety",
    question: "Is this medical advice?",
    answer: "No. Training guidance is informational and not a substitute for licensed medical care.",
    keywords: ["medical", "advice", "health", "doctor"],
  },
  {
    id: "suitable-beginners",
    category: "safety",
    question: "Is this suitable for beginners?",
    answer: "Yes. Choose beginner options, start conservatively, and progress gradually.",
    keywords: ["beginners", "suitable", "start", "new"],
  },
  {
    id: "when-stop-training",
    category: "safety",
    question: "When should I stop training?",
    answer: "Stop if you feel sharp pain, dizziness, numbness, or anything unsafe. Consult a professional if needed.",
    keywords: ["stop", "pain", "safety", "when"],
  },
  // Refunds
  {
    id: "can-get-refund",
    category: "refunds",
    question: "Can I get a refund?",
    answer: "Refund eligibility depends on the situation and service used. See our refund policy for details.",
    keywords: ["refund", "money back", "return"],
  },
  {
    id: "where-read-refund-policy",
    category: "refunds",
    question: "Where can I read the refund policy?",
    answer: "You can read it on our refunds page.",
    keywords: ["refund policy", "read", "where"],
  },
];

// Helper functions
export function getFaqItemsByCategory(category: FaqCategory | "all"): FaqItem[] {
  if (category === "all") return FAQ_ITEMS;
  return FAQ_ITEMS.filter((item) => item.category === category);
}

export function searchFaqItems(query: string): FaqItem[] {
  if (!query.trim()) return FAQ_ITEMS;
  
  const lowerQuery = query.toLowerCase();
  return FAQ_ITEMS.filter((item) => {
    // Search in question, answer, keywords
    return (
      item.question.toLowerCase().includes(lowerQuery) ||
      item.answer.toLowerCase().includes(lowerQuery) ||
      item.keywords.some((kw) => kw.toLowerCase().includes(lowerQuery))
    );
  });
}

export function getCategoryCount(category: FaqCategory | "all"): number {
  return getFaqItemsByCategory(category).length;
}

export const CATEGORY_LABELS: Record<FaqCategory, string> = {
  getting_started: "Getting started",
  coaches: "Coaches",
  instant_ai: "Instant AI",
  tokens_payments: "Tokens & payments",
  account: "Account",
  safety: "Safety",
  refunds: "Refunds",
};

