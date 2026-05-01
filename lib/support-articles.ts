/**
 * Support articles data and types
 * Local data file - no API required
 */

import { DEFAULT_LOCALE, type Locale } from "@/lib/i18n/config";

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

const SUPPORT_ARTICLES_TR: SupportArticle[] = [];

SUPPORT_ARTICLES_TR.push(
  {
    slug: "tokens-what-are-they",
    title: "Tokenlar nedir?",
    description: "Tokenların ne olduğunu ve antrenman bakiyeniz olarak nasıl çalıştığını öğrenin.",
    category: "tokens_billing",
    keywords: ["token", "bakiye", "token nedir", "açıklama"],
    body: [
      {
        paragraphs: [
          "Tokenlar antrenman bakiyenizdir. Bir kez yükleme yapar ve özelliklerde token harcarsınız.",
          "Farklı plan türleri ve seçenekleri arasında fiyatlandırmayı tutarlı tutarlar.",
        ],
      },
      {
        heading: "Tokenlar nasıl çalışır",
        paragraphs: [
          "100 token = €1.00 | £0.87 | $1.19. Bakiyenizi bir kez yüklersiniz ve koç talepleri veya Instant AI planlarında token harcarsınız.",
          "Tokenlar kullanılana kadar bakiyenizde kalır. Son kullanma tarihleri yoktur.",
        ],
      },
      {
        heading: "Bakiyenizi nerede görürsünüz",
        paragraphs: [
          "Giriş yaptığınızda token bakiyeniz panelinizde görünür.",
          "Giriş yaptıktan sonra bunu üst barda da görebilirsiniz.",
        ],
      },
    ],
    updatedAt: "2025-01-15",
    popular: true,
  },
  {
    slug: "token-rates-currencies",
    title: "Token kurları ve para birimleri",
    description: "Token dönüşüm kurlarını ve para birimi seçeneklerini anlayın.",
    category: "tokens_billing",
    keywords: ["kur", "para birimi", "eur", "gbp", "usd", "döviz"],
    body: [
      {
        paragraphs: [
          "100 token = €1.00 | £0.87 | $1.19",
          "Temel para birimi EUR'dur. Seçtiğiniz para birimi üst barda gösterilir.",
        ],
      },
      {
        heading: "Para birimi seçenekleri",
        paragraphs: [
          "Fiyatları EUR, GBP veya USD olarak görebilirsiniz. Tercih ettiğiniz para birimini üst bardaki seçimden belirleyin.",
          "Tüm token hesaplamaları önce EUR üzerinden yapılır, sonra seçtiğiniz para birimine çevrilir.",
        ],
      },
      {
        heading: "İlgili bağlantılar",
        bullets: [
          "[Ödeme ve tokenlar](/payments-tokens)",
          "[Fiyatlandırma](/pricing)",
        ],
      },
    ],
    updatedAt: "2025-01-15",
    popular: true,
  },
  {
    slug: "top-up-tokens",
    title: "Tokenlar nasıl yüklenir",
    description: "Bakiyenize token eklemek için adım adım rehber.",
    category: "tokens_billing",
    keywords: ["yükleme", "token ekle", "satın al", "token satın al"],
    body: [
      {
        heading: "Yükleme adımları",
        bullets: [
          "Fiyatlandırma sayfasına gidin",
          "Bir paket seçin veya özel tutar girin",
          "Güvenli ödeme adımını tamamlayın",
          "Ödeme başarılı olduktan sonra tokenlar bakiyenize eklenir",
        ],
      },
      {
        paragraphs: [
          "Aynı bakiyeyi hem Instant AI hem de koç talepleri için kullanabilirsiniz.",
        ],
      },
      {
        heading: "İlgili bağlantılar",
        bullets: [
          "[Fiyatlandırma](/pricing)",
          "[Ödeme ve tokenlar](/payments-tokens)",
        ],
      },
    ],
    updatedAt: "2025-01-15",
    popular: true,
  },
  {
    slug: "pricing-packs-custom",
    title: "Token paketleri ve özel yükleme",
    description: "Token paketlerini ve özel tutarları anlayın.",
    category: "tokens_billing",
    keywords: ["paket", "özel", "starter", "momentum", "elite"],
    body: [
      {
        heading: "Token paketleri",
        paragraphs: [
          "Üç hazır paket sunuyoruz: Starter Spark (10.000 token), Momentum Pack (20.000 token) ve Elite Performance (30.000 token).",
          "Her paket farklı kullanım düzeyleri için tasarlanmıştır.",
        ],
      },
      {
        heading: "Özel yükleme",
        paragraphs: [
          "İsterseniz özel bir tutar da girebilirsiniz. Tokenlar seçtiğiniz para birimine göre hesaplanır.",
          "Tutarlılık için özel miktarlar en yakın 10 tokena yuvarlanır.",
        ],
      },
      {
        heading: "İlgili bağlantılar",
        bullets: [
          "[Fiyatlandırma](/pricing)",
          "[Ödeme ve tokenlar](/payments-tokens)",
        ],
      },
    ],
    updatedAt: "2025-01-15",
  },
  {
    slug: "refunds-basics",
    title: "İadelere hızlı bakış",
    description: "Geri ödeme uygunluğu ve süreç hakkında kısa bir özet.",
    category: "tokens_billing",
    keywords: ["iade", "geri ödeme", "para iadesi"],
    body: [
      {
        paragraphs: [
          "Geri ödeme uygunluğu duruma ve kullanılan hizmete bağlıdır.",
          "Ayrıntılar ve uygunluk için lütfen iade politikamızı inceleyin.",
        ],
      },
      {
        heading: "İlgili bağlantılar",
        bullets: ["[İade politikası](/legal/refunds)"],
      },
    ],
    updatedAt: "2025-01-15",
  }
);

SUPPORT_ARTICLES_TR.push(
  {
    slug: "coach-request-overview",
    title: "Koç talepleri nasıl çalışır",
    description: "Koç talebi sürecini baştan sona anlayın.",
    category: "coach_requests",
    keywords: ["koç", "talep", "nasıl çalışır", "süreç"],
    body: [
      {
        paragraphs: [
          "Koç talepleri, belirli hedeflerinize ve tercihlerinize göre sertifikalı koçlar tarafından hazırlanan kişiselleştirilmiş planlardır.",
          "Seviyeniz, antrenman türünüz, ekipmanınız ve haftalık gün sayınızla ilgili bir form doldurursunuz.",
        ],
      },
      {
        heading: "Süreç",
        bullets: [
          "Koçlara göz atın ve birini seçin",
          "Talep formunu doldurun",
          "Maliyet dökümünü gözden geçirin",
          "Talebinizi gönderin",
          "Kişiselleştirilmiş planınızı alın",
        ],
      },
      {
        heading: "İlgili bağlantılar",
        bullets: [
          "[Koçlara göz atın](/coaches)",
          "[Nasıl çalışır](/how-it-works)",
        ],
      },
    ],
    updatedAt: "2025-01-15",
    popular: true,
  },
  {
    slug: "coach-request-pricing",
    title: "Koç talebi fiyatı nasıl hesaplanır",
    description: "Koç talepleri için maliyet dökümünü anlayın.",
    category: "coach_requests",
    keywords: ["fiyat", "maliyet", "hesaplama", "döküm"],
    body: [
      {
        paragraphs: [
          "Koç talebi fiyatlandırması 10.000 token temel maliyetle başlar.",
          "Ek maliyetler seçiminize bağlıdır.",
        ],
      },
      {
        heading: "Maliyet faktörleri",
        bullets: [
          "Temel talep: 10.000 token",
          "Seviye: Orta (+5.000) veya İleri (+12.000)",
          "Antrenman türü: Karışık (+4.000)",
          "Ekipman: Basic (+3.000) veya Full gym (+6.000)",
          "Haftalık gün sayısı: 4 gün (+4.000), 5 gün (+8.000), 6 gün (+12.000)",
        ],
      },
      {
        heading: "İlgili bağlantılar",
        bullets: [
          "[Ödeme ve tokenlar](/payments-tokens)",
          "[Koçlara göz atın](/coaches)",
        ],
      },
    ],
    updatedAt: "2025-01-15",
  },
  {
    slug: "coach-request-tips",
    title: "Daha iyi bir koç talebi için ipuçları",
    description: "Koç talebinizden en iyi sonucu almak için en iyi uygulamalar.",
    category: "coach_requests",
    keywords: ["ipuçları", "en iyi uygulamalar", "iyileştir"],
    body: [
      {
        heading: "Net olun",
        paragraphs: [
          "Hedefleriniz, mevcut kondisyon seviyeniz ve mevcut ekipmanınız hakkında net bilgiler verin.",
          "Ne kadar çok ayrıntı paylaşırsanız kişiselleştirilmiş planınız o kadar iyi olur.",
        ],
      },
      {
        heading: "Doğru koçu seçin",
        paragraphs: [
          "Hedeflerinize uygun uzmanlığa sahip birini bulmak için koç profillerine göz atın.",
          "Talep oluşturmadan önce uzmanlıklarını ve odak alanlarını okuyun.",
        ],
      },
      {
        heading: "İlgili bağlantılar",
        bullets: ["[Koçlara göz atın](/coaches)"],
      },
    ],
    updatedAt: "2025-01-15",
  },
  {
    slug: "coach-profile-request",
    title: "Bir koç profilinden plan istemek",
    description: "Doğrudan koç profil sayfasından nasıl plan talep edilir.",
    category: "coach_requests",
    keywords: ["profil", "koç sayfası", "talep"],
    body: [
      {
        paragraphs: [
          "Herhangi bir koçun profil sayfasından doğrudan plan talep edebilirsiniz.",
          "Koç profilindeki 'Plan talep et' düğmesine tıklayın.",
        ],
      },
      {
        heading: "Adımlar",
        bullets: [
          "Koçun profil sayfasını ziyaret edin",
          "'Plan talep et' düğmesine tıklayın",
          "Talep formunu doldurun",
          "Gözden geçirip gönderin",
        ],
      },
      {
        heading: "İlgili bağlantılar",
        bullets: ["[Koçlara göz atın](/coaches)"],
      },
    ],
    updatedAt: "2025-01-15",
  }
);

SUPPORT_ARTICLES_TR.push(
  {
    slug: "instant-ai-preview",
    title: "Instant AI önizlemeleri nasıl çalışır (50 token)",
    description: "Önizleme özelliğini ve maliyetini anlayın.",
    category: "instant_ai",
    keywords: ["önizleme", "50 token", "instant ai"],
    body: [
      {
        paragraphs: [
          "Instant AI önizlemeleri, tam maliyete geçmeden önce planınızdan bir örnek görmenizi sağlar.",
          "Önizleme 50 token tutar ve planınızın nasıl görüneceğine dair kısa bir görünüm sunar.",
        ],
      },
      {
        heading: "Nasıl çalışır",
        bullets: [
          "Oluşturucu formunu doldurun",
          "'Planı önizle' düğmesine tıklayın (50 token)",
          "Önizlemeyi inceleyin",
          "Yayınlamaya veya değişiklik yapmaya karar verin",
        ],
      },
      {
        heading: "İlgili bağlantılar",
        bullets: [
          "[Oluşturucuyu açın](/generator)",
          "[Ödeme ve tokenlar](/payments-tokens)",
        ],
      },
    ],
    updatedAt: "2025-01-15",
    popular: true,
  },
  {
    slug: "instant-ai-publish",
    title: "Tam planınızı yayınlama",
    description: "Önizlemeden sonra Instant AI planınızı nasıl yayınlayacağınız.",
    category: "instant_ai",
    keywords: ["yayınla", "tam plan", "oluştur"],
    body: [
      {
        paragraphs: [
          "Planınızı önizledikten sonra tam sürümü almak için yayınlayabilirsiniz.",
          "Yayınlama maliyeti seçtiğiniz seçeneklere bağlıdır (haftalar, antrenman türleri, kas grupları).",
        ],
      },
      {
        heading: "Adımlar",
        bullets: [
          "Planınızı önizleyin (50 token)",
          "Önizlemeyi inceleyin",
          "'Planı yayınla' düğmesine tıklayın",
          "Maliyeti onaylayın",
          "Tam planınızı alın",
        ],
      },
      {
        heading: "İlgili bağlantılar",
        bullets: [
          "[Oluşturucuyu açın](/generator)",
          "[Ödeme ve tokenlar](/payments-tokens)",
        ],
      },
    ],
    updatedAt: "2025-01-15",
  },
  {
    slug: "instant-ai-costs",
    title: "Instant AI maliyetini ne etkiler?",
    description: "Instant AI plan fiyatlandırmasını etkileyen faktörleri anlayın.",
    category: "instant_ai",
    keywords: ["maliyet", "fiyat", "faktörler"],
    body: [
      {
        paragraphs: [
          "Instant AI plan maliyeti, yaptığınız seçimlere bağlı birkaç faktöre göre belirlenir.",
        ],
      },
      {
        heading: "Maliyet faktörleri",
        bullets: [
          "Hafta sayısı",
          "Seçilen antrenman türleri",
          "Hedeflenen kas grupları",
          "Planın karmaşıklığı",
        ],
      },
      {
        heading: "İlgili bağlantılar",
        bullets: [
          "[Oluşturucuyu açın](/generator)",
          "[Ödeme ve tokenlar](/payments-tokens)",
        ],
      },
    ],
    updatedAt: "2025-01-15",
  }
);

SUPPORT_ARTICLES_TR.push(
  {
    slug: "sign-in-and-access",
    title: "Giriş ve erişim temelleri",
    description: "Hesabınıza nasıl giriş yapacağınızı ve erişeceğinizi öğrenin.",
    category: "account_dashboard",
    keywords: ["giriş", "oturum", "erişim", "hesap"],
    body: [
      {
        paragraphs: [
          "Panelinize erişmek, planlarınızı görmek ve token bakiyenizi yönetmek için giriş yapın.",
        ],
      },
      {
        heading: "Nasıl giriş yapılır",
        bullets: [
          "Üst bardaki 'Giriş yap' düğmesine tıklayın",
          "E-posta adresinizi ve şifrenizi girin",
          "Panelinize erişin",
        ],
      },
      {
        heading: "Hesap oluşturma",
        paragraphs: [
          "Hesabınız yoksa kayıt olmak için 'Hesap oluştur' düğmesine tıklayın.",
        ],
      },
    ],
    updatedAt: "2025-01-15",
  },
  {
    slug: "where-to-find-plans",
    title: "Planlarınızı panelde nerede bulursunuz",
    description: "Koç taleplerinizi ve Instant AI planlarınızı bulun.",
    category: "account_dashboard",
    keywords: ["panel", "planlar", "bul", "nerede"],
    body: [
      {
        paragraphs: [
          "Tüm planlarınız, hem koç talepleri hem de Instant AI planları, panelinizde bulunur.",
          "Oradan görüntüleyebilir, indirebilir ve ilerlemenizi takip edebilirsiniz.",
        ],
      },
      {
        heading: "Panel bölümleri",
        bullets: [
          "Token bakiyesi ve geçmişi",
          "Oluşturulan kurslar",
          "Son etkinlikler",
          "Tüm planlarınız",
        ],
      },
      {
        heading: "İlgili bağlantılar",
        bullets: ["[Panel](/dashboard)"],
      },
    ],
    updatedAt: "2025-01-15",
    popular: true,
  },
  {
    slug: "balance-and-history",
    title: "Token bakiyesi ve geçmişini kontrol etme",
    description: "Token bakiyenizi ve işlem geçmişinizi nasıl göreceğinizi öğrenin.",
    category: "account_dashboard",
    keywords: ["bakiye", "geçmiş", "işlem", "token"],
    body: [
      {
        paragraphs: [
          "Token bakiyeniz giriş yaptıktan sonra üst barda görünür.",
          "Ayrıntılı bakiye ve işlem geçmişini panelinizde de görebilirsiniz.",
        ],
      },
      {
        heading: "İşlem geçmişi",
        paragraphs: [
          "Yüklemeler ve harcamalar dahil tüm token işlemlerinizi panelde görüntüleyin.",
          "Her işlem tarihini, tutarı ve sebebi gösterir.",
        ],
      },
      {
        heading: "İlgili bağlantılar",
        bullets: [
          "[Panel](/dashboard)",
          "[Ödeme ve tokenlar](/payments-tokens)",
        ],
      },
    ],
    updatedAt: "2025-01-15",
  },
  {
    slug: "generation-stuck",
    title: "Oluşturma takıldı veya yavaş",
    description: "Plan üretimi çok uzun sürüyorsa ne yapmanız gerektiği.",
    category: "troubleshooting",
    keywords: ["takıldı", "yavaş", "yükleniyor", "oluşturma"],
    body: [
      {
        paragraphs: [
          "Oluşturma takılmış gibi görünüyorsa veya beklenenden uzun sürüyorsa şu adımları deneyin.",
        ],
      },
      {
        heading: "Sorun giderme adımları",
        bullets: [
          "Biraz bekleyin - karmaşık planlar zaman alabilir",
          "Sayfayı yenileyin",
          "İnternet bağlantınızı kontrol edin",
          "Yeniden oluşturmayı deneyin",
          "Sorun devam ederse destekle iletişime geçin",
        ],
      },
      {
        heading: "İlgili bağlantılar",
        bullets: ["[Destekle iletişime geçin](/contact)"],
      },
    ],
    updatedAt: "2025-01-15",
  },
  {
    slug: "payment-issues",
    title: "Ödeme sorunları ve çözümleri",
    description: "Yaygın ödeme sorunları ve çözümleri.",
    category: "troubleshooting",
    keywords: ["ödeme", "checkout", "başarısız", "hata"],
    body: [
      {
        paragraphs: [
          "Ödeme sorunları yaşıyorsanız, burada bazı yaygın çözümler bulunur.",
        ],
      },
      {
        heading: "Yaygın sorunlar",
        bullets: [
          "Ödeme reddedildi - kart bilgilerinizi ve bakiyenizi kontrol edin",
          "Ödeme sayfası yüklenmiyor - yenilemeyi veya farklı bir tarayıcı kullanmayı deneyin",
          "Tokenlar eklenmedi - işlem kimliğinizle birlikte destekle iletişime geçin",
        ],
      },
      {
        heading: "İlgili bağlantılar",
        bullets: [
          "[Destekle iletişime geçin](/contact)",
          "[Ödeme ve tokenlar](/payments-tokens)",
        ],
      },
    ],
    updatedAt: "2025-01-15",
  },
  {
    slug: "common-ui-issues",
    title: "Yaygın arayüz sorunları (yüklenme, boş durumlar)",
    description: "Yaygın arayüz problemlerini giderin.",
    category: "troubleshooting",
    keywords: ["arayüz", "yüklenme", "boş", "hata"],
    body: [
      {
        paragraphs: [
          "Yüklenme sorunları veya boş durumlar görüyorsanız şu çözümleri deneyin.",
        ],
      },
      {
        heading: "Hızlı çözümler",
        bullets: [
          "Sayfayı yenileyin",
          "Tarayıcı önbelleğinizi temizleyin",
          "Farklı bir tarayıcı deneyin",
          "İnternet bağlantınızı kontrol edin",
          "Tarayıcı eklentilerini geçici olarak devre dışı bırakın",
        ],
      },
      {
        heading: "İlgili bağlantılar",
        bullets: ["[Destekle iletişime geçin](/contact)"],
      },
    ],
    updatedAt: "2025-01-15",
  },
  {
    slug: "trust-safety-basics",
    title: "Planlarımızla güvenli şekilde antrenman yapmak",
    description: "Önemli güvenlik yönergeleri ve uyarılar.",
    category: "trust_safety",
    keywords: ["güvenlik", "antrenman", "uyarı", "rehber"],
    body: [
      {
        paragraphs: [
          "Planlarımız güvenli antrenman yapmanıza yardımcı olmak için tasarlanmıştır, ancak yeni bir egzersiz programına başlamadan önce her zaman bir sağlık uzmanına danışmalısınız.",
        ],
      },
      {
        heading: "Güvenlik yönergeleri",
        bullets: [
          "Başlamadan önce bir sağlık uzmanına danışın",
          "Vücudunuzu dinleyin ve ağrı hissederseniz durun",
          "Yavaş başlayın ve kademeli ilerleyin",
          "Doğru form ve teknik kullanın",
        ],
      },
      {
        heading: "İlgili bağlantılar",
        bullets: ["[Güven ve emniyet](/trust-safety)"],
      },
    ],
    updatedAt: "2025-01-15",
  }
);

export const CATEGORY_LABELS: Record<SupportCategory, string> = {
  tokens_billing: "Tokens & billing",
  coach_requests: "Coach requests",
  instant_ai: "Instant AI generator",
  account_dashboard: "Account & dashboard",
  troubleshooting: "Troubleshooting",
  trust_safety: "Trust & safety",
};

const CATEGORY_LABELS_TR: Record<SupportCategory, string> = {
  tokens_billing: "Tokenlar ve ödemeler",
  coach_requests: "Koç talepleri",
  instant_ai: "Instant AI oluşturucu",
  account_dashboard: "Hesap ve panel",
  troubleshooting: "Sorun giderme",
  trust_safety: "Güven ve emniyet",
};

const SUPPORT_ARTICLE_DATA = {
  en: {
    articles: SUPPORT_ARTICLES,
    categoryLabels: CATEGORY_LABELS,
  },
  tr: {
    articles: SUPPORT_ARTICLES_TR,
    categoryLabels: CATEGORY_LABELS_TR,
  },
} as const;

// Helper functions
function getSupportLocaleData(locale: Locale = DEFAULT_LOCALE) {
  return SUPPORT_ARTICLE_DATA[locale] ?? SUPPORT_ARTICLE_DATA.en;
}

export function getSupportArticles(locale: Locale = DEFAULT_LOCALE): SupportArticle[] {
  return getSupportLocaleData(locale).articles;
}

export function getCategoryLabels(locale: Locale = DEFAULT_LOCALE): Record<SupportCategory, string> {
  return getSupportLocaleData(locale).categoryLabels;
}

export function getArticleBySlug(
  slug: string,
  locale: Locale = DEFAULT_LOCALE
): SupportArticle | undefined {
  return getSupportArticles(locale).find((article) => article.slug === slug);
}

export function getArticlesByCategory(
  category: SupportCategory | "all",
  locale: Locale = DEFAULT_LOCALE
): SupportArticle[] {
  const articles = getSupportArticles(locale);
  if (category === "all") return articles;
  return articles.filter((article) => article.category === category);
}

export function getPopularArticles(locale: Locale = DEFAULT_LOCALE): SupportArticle[] {
  return getSupportArticles(locale)
    .filter((article) => article.popular)
    .slice(0, 6);
}

export function searchArticles(
  query: string,
  locale: Locale = DEFAULT_LOCALE
): SupportArticle[] {
  const articles = getSupportArticles(locale);
  if (!query.trim()) return articles;

  const lowerQuery = query.toLowerCase();
  return articles.filter((article) => {
    if (
      article.title.toLowerCase().includes(lowerQuery) ||
      article.description.toLowerCase().includes(lowerQuery) ||
      article.keywords.some((keyword) => keyword.toLowerCase().includes(lowerQuery))
    ) {
      return true;
    }

    return article.body.some((section) =>
      (section.paragraphs ?? []).some((paragraph) =>
        paragraph.toLowerCase().includes(lowerQuery)
      )
    );
  });
}

export function getCategoryCount(
  category: SupportCategory | "all",
  locale: Locale = DEFAULT_LOCALE
): number {
  return getArticlesByCategory(category, locale).length;
}


