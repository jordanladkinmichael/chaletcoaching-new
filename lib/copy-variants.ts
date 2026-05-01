import type { Locale } from "@/lib/i18n/config";

/**
 * Page-specific copy for duplicate-content reduction (SEO).
 * Use these constants instead of hardcoding so each route has distinct wording.
 */

export const COPY_BY_LOCALE = {
  en: {
    pricingPage: {
      h1: "Token packs & pricing",
      introSecond:
        "Choose a pack below or enter a custom amount. Your balance works for coach requests and Instant AI. All prices include 20% VAT.",
      metaDescription:
        "Token packs and custom top-up for Chaletcoaching. One balance for coach-built plans and Instant AI. Prices in EUR, GBP, USD with VAT.",
    },
    home: {
      pricingHeading: "One balance for coaches and AI",
      pricingIntro:
        "Get tokens once and use them for coach-built plans or instant AI, no subscription. Rates: 100 tokens = €1 or equivalent in GBP and USD.",
    },
    howItWorks: {
      heroParagraph:
        "Two ways to get your plan: work with a coach or generate one with AI. Both use your token balance.",
      ctaCoach: "Find a coach",
      ctaGenerator: "Try the Instant AI generator",
      tokenFaqAnswer:
        "Your balance is charged in tokens. The rate is 100 tokens per euro, or the equivalent in GBP and USD. Top up when needed and spend on the option you choose. Tokens do not expire.",
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
    generator: {
      subtitle:
        "Set your duration, frequency, and preferences below. Preview with 50 tokens, then publish your full plan.",
      coachCta: "Want a coach instead? Find a coach",
      metaDescription:
        "Build your personalized fitness plan with the Instant AI generator. Set duration, sessions, and goals; preview with 50 tokens, then publish. Chaletcoaching.",
    },
    pricingContext: {
      "pricing-page": {
        vatNotice:
          "All displayed package prices include 20% VAT. Tokens are calculated from the net pre-VAT price.",
        sectionHeading: "What you can do with tokens",
        leftCardTitle: "Instant AI plans",
        leftCardBullets: "Preview: 50 tokens. Full plan: depends on your options.",
        leftCta: "Create an AI plan",
        rightCardTitle: "Coach-built plans",
        rightCta: "Request a coach plan",
        cardMicrocopy: {
          starter: "For a quick start",
          momentum: "Best value for consistency",
          elite: "Built for long-term progress",
        },
        buyButton: "Top up tokens",
        signInButton: "Sign in to buy tokens",
        popularBadge: "Most popular",
        customTitle: "Custom Load",
        customBadge: "Flexible",
        customHelper: "Load exactly what you need",
        customButton: "Top up tokens",
        customSignIn: "Sign in to top up",
      },
      home: {
        vatNotice:
          "Prices include VAT. Token cost is based on the net pre-VAT amount.",
        sectionHeading: "Use tokens for",
        leftCardTitle: "AI-generated plans",
        leftCardBullets:
          "Preview 50 tokens, then publish. Cost varies by selected options.",
        leftCta: "Go to generator",
        rightCardTitle: "Coach requests",
        rightCta: "Find a coach",
        cardMicrocopy: {
          starter: "Try it out",
          momentum: "Consistent training value",
          elite: "For serious training goals",
        },
        buyButton: "Get tokens",
        signInButton: "Sign in to get started",
        popularBadge: "Popular choice",
        customTitle: "Custom amount",
        customBadge: "Any amount",
        customHelper: "Choose your own amount",
        customButton: "Add tokens",
        customSignIn: "Sign in first",
      },
    },
    secondaryPages: {
      about: {
        heroCoachCta: "Meet our coaches",
        ctaHeading: "Get started today",
        ctaCoach: "Meet our coaches",
        ctaSecondary: "See pricing",
      },
      whatYouReceive: {
        heroCoachCta: "Find your coach",
        heroGeneratorCta: "Generate a plan",
        ctaHeading: "Create your plan now",
        ctaCoach: "Find your coach",
        ctaGenerator: "Generate a plan",
      },
      trustSafety: {
        heroCoachCta: "View coaches",
        heroGeneratorCta: "Build a plan with AI",
        ctaHeading: "Begin with confidence",
        ctaCoach: "View coaches",
        ctaGenerator: "Build a plan with AI",
      },
      paymentsTokens: {
        heroCoachCta: "Choose a coach",
        ctaHeading: "Top up and go",
        ctaPricing: "See pricing",
        ctaGenerator: "Open the generator",
      },
    },
    howItWorksReceiveList: [
      "Structured weekly progression",
      "Day-by-day workout breakdown",
      "Exercise alternatives included",
      "Recovery and intensity guidance",
      "Options for your equipment",
      "Download or print your plan",
    ] as const,
  },
  tr: {
    pricingPage: {
      h1: "Token paketleri ve fiyatlandirma",
      introSecond:
        "Asagidan bir paket secin veya ozel bir tutar girin. Bakiyeniz hem koc talepleri hem de Instant AI icin calisir. Tum fiyatlara %20 KDV dahildir.",
      metaDescription:
        "Chaletcoaching icin token paketleri ve ozel yukleme. Koc tarafindan hazirlanan planlar ve Instant AI icin tek bakiye. EUR, GBP ve USD fiyatlari KDV dahil.",
    },
    home: {
      pricingHeading: "Koclar ve AI icin tek bakiye",
      pricingIntro:
        "Bir kez token alin ve bunlari koc tarafindan hazirlanan planlar veya aninda AI icin kullanin; abonelik yok. Kurlar: 100 token = €1 veya GBP ve USD karsiligi.",
    },
    howItWorks: {
      heroParagraph:
        "Planinizi almanin iki yolu var: bir kocla calismak veya AI ile plan olusturmak. Her ikisi de token bakiyenizi kullanir.",
      ctaCoach: "Bir koc bulun",
      ctaGenerator: "Instant AI olusturucuyu deneyin",
      tokenFaqAnswer:
        "Bakiyeniz token olarak harcanir. Kur euro basina 100 token ya da GBP ve USD karsiligidir. Ihtiyac duydugunuzda yukleme yapin ve sectiginiz secenekte kullanin. Tokenlarin suresi dolmaz.",
      tokensSectionRate:
        "Kurlar: €1 basina 100 token. GBP ve USD fiyatlari ayni token degerini kullanir.",
      coachSteps: [
        "Kocunuzu secin",
        "Talebinizi gonderin",
        "Planiniz hazirlanir",
        "Panelinizden takip edin",
      ] as const,
      instantAiSteps: [
        "Seceneklerinizi ayarlayin",
        "Bir onizleme olusturun (50 token)",
        "Tam planinizi yayinlayin",
        "Indirin ve antrenmana baslayin",
      ] as const,
      metaDescription:
        "Chaletcoaching uzerinde fitness planinizi almanin iki yolu: koc tarafindan hazirlanan bir plan isteyin veya Instant AI ile bir tane olusturun. Tokenlarin ve her iki secenegin nasil calistigini ogrenin.",
    },
    generator: {
      subtitle:
        "Sure, siklik ve tercihlerinizi asagida ayarlayin. 50 token ile onizleme alin, sonra tam planinizi yayinlayin.",
      coachCta: "Bunun yerine bir koc mu istiyorsunuz? Bir koc bulun",
      metaDescription:
        "Instant AI olusturucu ile kisisellestirilmis fitness planinizi olusturun. Sure, seans ve hedefleri ayarlayin; 50 token ile onizleyin, sonra yayinlayin. Chaletcoaching.",
    },
    pricingContext: {
      "pricing-page": {
        vatNotice:
          "Gösterilen tüm paket fiyatlarına %20 KDV dahildir. Tokenlar KDV öncesi net fiyata göre hesaplanır.",
        sectionHeading: "Tokenlarla neler yapabilirsiniz",
        leftCardTitle: "Instant AI planları",
        leftCardBullets: "Önizleme: 50 token. Tam plan: seçeneklerinize bağlıdır.",
        leftCta: "Bir AI planı oluşturun",
        rightCardTitle: "Koç tarafından hazırlanan planlar",
        rightCta: "Bir koç planı isteyin",
        cardMicrocopy: {
          starter: "Hızlı bir başlangıç için",
          momentum: "Süreklilik için en iyi değer",
          elite: "Uzun vadeli gelişim için",
        },
        buyButton: "Token yükle",
        signInButton: "Token almak için giriş yapın",
        popularBadge: "En popüler",
        customTitle: "Özel Yükleme",
        customBadge: "Esnek",
        customHelper: "İhtiyacınız kadar yükleyin",
        customButton: "Token yükle",
        customSignIn: "Yükleme için giriş yapın",
      },
      home: {
        vatNotice:
          "Fiyatlara KDV dahildir. Token maliyeti KDV öncesi net tutara göre hesaplanır.",
        sectionHeading: "Tokenları şu için kullanın",
        leftCardTitle: "AI ile üretilen planlar",
        leftCardBullets:
          "50 token ile onizleme alin, sonra yayinlayin. Maliyet secilen seceneklere gore degisir.",
        leftCta: "Olusturucuya gidin",
        rightCardTitle: "Koc talepleri",
        rightCta: "Bir koc bulun",
        cardMicrocopy: {
          starter: "Denemek icin",
          momentum: "Tutarlı antrenman degeri",
          elite: "Ciddi hedefler icin",
        },
        buyButton: "Token alin",
        signInButton: "Baslamak icin giris yapin",
        popularBadge: "Populer secim",
        customTitle: "Ozel tutar",
        customBadge: "Herhangi bir tutar",
        customHelper: "Kendi tutarinizi secin",
        customButton: "Token ekle",
        customSignIn: "Once giris yapin",
      },
    },
    secondaryPages: {
      about: {
        heroCoachCta: "Koclarimizla tanisin",
        ctaHeading: "Bugun baslayin",
        ctaCoach: "Koclarimizla tanisin",
        ctaSecondary: "Fiyatlandirmayi gorun",
      },
      whatYouReceive: {
        heroCoachCta: "Kocunuzu bulun",
        heroGeneratorCta: "Bir plan olusturun",
        ctaHeading: "Planinizi simdi olusturun",
        ctaCoach: "Kocunuzu bulun",
        ctaGenerator: "Bir plan olusturun",
      },
      trustSafety: {
        heroCoachCta: "Koclari gorun",
        heroGeneratorCta: "AI ile plan olusturun",
        ctaHeading: "Guvenle baslayin",
        ctaCoach: "Koclari gorun",
        ctaGenerator: "AI ile plan olusturun",
      },
      paymentsTokens: {
        heroCoachCta: "Bir koc secin",
        ctaHeading: "Yukleyin ve baslayin",
        ctaPricing: "Fiyatlandirmayi gorun",
        ctaGenerator: "Olusturucuyu acin",
      },
    },
    howItWorksReceiveList: [
      "Yapilandirilmis haftalik ilerleme",
      "Gun gun antrenman dagilimi",
      "Egzersiz alternatifleri dahil",
      "Toparlanma ve yogunluk rehberi",
      "Ekipmaniniza uygun secenekler",
      "Planinizi indirin veya yazdirin",
    ] as const,
  },
} as const;

export const COPY = COPY_BY_LOCALE.en;

export function getLocalizedCopy(locale: Locale) {
  return COPY_BY_LOCALE[locale] ?? COPY_BY_LOCALE.en;
}

export type PricingContextKey = keyof typeof COPY.pricingContext;
