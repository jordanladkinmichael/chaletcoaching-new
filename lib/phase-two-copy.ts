import type { Locale } from "@/lib/i18n/config";

export const PHASE_TWO_COPY = {
  en: {
    about: {
      copied: "Copied",
      copyFailedTitle: "Failed to copy",
      copyFailedMessage: "Please try again",
      hero: {
        title: "About Chalet Coaching",
        subtitle:
          "Coach-led training plans with an optional Instant AI flow. Clear, structured, and built for real progress.",
        coachCta: "Meet our coaches",
        howItWorksCta: "How it works",
        heroAlt: "Coach-led training, enhanced by smart tooling",
        placeholderTitle: "Coach-first platform",
        placeholderBody: "Add /public/about_hero.webp to replace this visual.",
      },
      whatWeDo: {
        title: "What we do",
        cards: [
          {
            title: "Coach-first plans",
            description: "Choose a coach and submit your training request.",
          },
          {
            title: "Instant AI option",
            description: "Generate a plan in minutes when you need speed.",
          },
          {
            title: "Tokens power everything",
            description: "One balance you can use across both flows.",
          },
        ],
      },
      platform: {
        title: "How the platform works",
        coach: {
          title: "Coach-built requests",
          steps: [
            "Pick a coach",
            "Send your request",
            "Receive and track your plan in your dashboard",
          ],
          cta: "Explore coaches",
        },
        ai: {
          title: "Instant AI generator",
          steps: ["Choose inputs", "Preview", "Publish and download"],
          cta: "Try the AI generator",
        },
      },
      principles: {
        title: "Our principles",
        cards: [
          {
            title: "Clarity over hype",
            description:
              "We focus on clear, actionable guidance instead of marketing fluff.",
          },
          {
            title: "Safety first",
            description:
              "Training guidance is informational and should be used responsibly.",
          },
          {
            title: "Coach-led accountability",
            description:
              "Coaches provide personalized guidance and help you stay on track.",
          },
          {
            title: "Respect for your time",
            description:
              "We value efficiency and deliver plans that fit your schedule.",
          },
        ],
      },
      trust: {
        title: "Trust and safety",
        body:
          "Training guidance is informational and should be used responsibly. If you have a condition or injury, consult a qualified professional.",
        cta: "Read trust and safety",
      },
      company: {
        title: "Company details",
        labels: {
          name: "Company name",
          number: "Company number",
          address: "Address",
          phone: "Phone",
          email: "Email",
        },
        copyAriaPrefix: "Copy",
      },
      cta: {
        title: "Get started today",
        coach: "Meet our coaches",
        pricing: "See pricing",
      },
    },
    howItWorks: {
      hero: {
        title: "How it works",
        subtitle:
          "Two ways to get your plan: work with a coach or generate one with AI. Both use your token balance.",
        coachCta: "Find a coach",
        generatorCta: "Try the Instant AI generator",
        heroAlt: "Coach-led and Instant AI training flows",
      },
      paths: {
        coach: {
          title: "Coach-built request",
          body:
            "Tell your coach your goal and preferences. Your plan is tailored to your request.",
          cta: "Find a coach",
          imageAlt: "Coach-built request",
        },
        ai: {
          title: "Instant AI plan",
          body:
            "Generate a plan in minutes. Preview first, then publish when ready.",
          cta: "Generate now",
          imageAlt: "Instant AI plan generation",
        },
      },
      coachFlow: {
        title: "How Coach requests work",
        emojis: ["🔎", "📝", "🧩", "📊"],
        steps: [
          "Choose your coach",
          "Submit your request",
          "Your plan is created",
          "Track it in your dashboard",
        ],
      },
      aiFlow: {
        title: "How Instant AI works",
        emojis: ["🎛️", "👀", "✅", "⬇️"],
        steps: [
          "Set your options",
          "Generate a preview (50 tokens)",
          "Publish your full plan",
          "Download and train",
        ],
      },
      receive: {
        title: "What you receive",
        imageAlt: "Example training plan output",
        items: [
          "Structured weekly progression",
          "Day-by-day workout breakdown",
          "Exercise alternatives included",
          "Recovery and intensity guidance",
          "Options for your equipment",
          "Download or print your plan",
        ],
      },
      tokens: {
        title: "Tokens and payments",
        body:
          "Rates: 100 tokens per €1. Prices in GBP and USD use the same token value.",
        cta: "See pricing",
        imageAlt: "Tokens and secure payments",
      },
      safety: {
        title: "Trust and safety",
        imageAlt: "Trust and safety",
        items: [
          "Training guidance is informational and not medical advice.",
          "Stop if you feel pain and consult a professional if needed.",
          "Beginner-friendly options are available.",
        ],
      },
      faq: {
        title: "FAQ",
        items: [
          {
            id: "coach-vs-ai",
            title: "What is the difference between Coach requests and Instant AI?",
            paragraphs: [
              "Coach requests are personalized plans created by certified coaches based on your specific goals and preferences. Instant AI plans are generated automatically in minutes using AI technology.",
              "Both options use tokens from your balance, but coach requests offer human expertise and personalized guidance, while Instant AI provides immediate results.",
            ],
          },
          {
            id: "how-tokens-work",
            title: "How do tokens work?",
            paragraphs: [
              "Your balance is charged in tokens. The rate is 100 tokens per euro, or the equivalent in GBP and USD. Top up when needed and spend on the option you choose. Tokens do not expire.",
            ],
          },
          {
            id: "tokens-expire",
            title: "Do tokens expire?",
            paragraphs: ["They never expire. Use them whenever you are ready."],
          },
          {
            id: "both-flows",
            title: "Can I use both flows with the same balance?",
            paragraphs: [
              "Yes, a single token balance covers coach-built plans and AI-generated ones.",
            ],
          },
          {
            id: "insufficient-tokens",
            title: "What happens if I don't have enough tokens?",
            paragraphs: [
              "You will be asked to top up before continuing. Head to the Pricing page to add more tokens at any time.",
              "With Instant AI, you can preview a plan for 50 tokens before deciding to publish the full version.",
            ],
          },
          {
            id: "where-find-plans",
            title: "Where do I find my plans?",
            paragraphs: [
              "Everything is in your Dashboard: coach plans, AI plans, downloads, and progress tracking.",
            ],
          },
        ],
      },
      cta: {
        title: "Start your plan",
        coach: "Find a coach",
        generator: "Try the Instant AI generator",
      },
    },
    pricing: {
      h1: "Token packs & pricing",
      rateLine: "100 tokens = €1.00 | £{gbpRate} | ${usdRate}",
      intro:
        "Choose a pack below or enter a custom amount. Your balance works for coach requests and Instant AI. All prices include 20% VAT.",
      invalidAmount: "Please enter a valid amount.",
      customTopUpDescription: "Custom top-up",
      invalidPack: "Invalid pack",
      checkoutFailed: "Failed to start checkout",
    },
  },
  tr: {
    about: {
      copied: "Kopyalandi",
      copyFailedTitle: "Kopyalama basarisiz",
      copyFailedMessage: "Lutfen tekrar deneyin",
      hero: {
        title: "Chalet Coaching Hakkinda",
        subtitle:
          "Koç odaklı antrenman planları, isteğe bağlı Instant AI akışıyla birlikte. Net, yapılandırılmış ve gerçek ilerleme için tasarlandı.",
        coachCta: "Koçlarımızla tanışın",
        howItWorksCta: "Nasıl çalışır",
        heroAlt: "Akıllı araçlarla desteklenen koç odaklı antrenman",
        placeholderTitle: "Koç odaklı platform",
        placeholderBody: "Bu görseli değiştirmek için /public/about_hero.webp ekleyin.",
      },
      whatWeDo: {
        title: "Ne yapiyoruz",
        cards: [
          {
            title: "Koç odaklı planlar",
            description: "Bir koç seçin ve antrenman talebinizi gönderin.",
          },
          {
            title: "Instant AI seçeneği",
            description: "Hız gerektiğinde birkaç dakika içinde plan oluşturun.",
          },
          {
            title: "Her şeyi tokenlar yönetir",
            description: "Her iki akışta da kullanabileceğiniz tek bakiye.",
          },
        ],
      },
      platform: {
        title: "Platform nasil calisir",
        coach: {
          title: "Koç tarafından hazırlanan talepler",
          steps: [
            "Bir koç seçin",
            "Talebinizi gönderin",
            "Planınızı panelinizden alın ve takip edin",
          ],
          cta: "Koçları keşfedin",
        },
        ai: {
          title: "Instant AI oluşturucu",
          steps: ["Girdileri seçin", "Önizleyin", "Yayınlayın ve indirin"],
          cta: "AI oluşturucuyu deneyin",
        },
      },
      principles: {
        title: "Ilkelerimiz",
        cards: [
          {
            title: "Abartı değil netlik",
            description:
              "Pazarlama süsü yerine açık ve uygulanabilir yönlendirmeye odaklanırız.",
          },
          {
            title: "Önce güvenlik",
            description:
              "Antrenman yönlendirmesi bilgilendiricidir ve sorumlu şekilde kullanılmalıdır.",
          },
          {
            title: "Koç odaklı takip",
            description:
              "Koçlar kişiselleştirilmiş yönlendirme sağlar ve sizi çizgide tutar.",
          },
          {
            title: "Zamanınıza saygı",
            description:
              "Verimliliğe önem verir ve takviminize uyan planlar sunarız.",
          },
        ],
      },
      trust: {
        title: "Güven ve emniyet",
        body:
          "Antrenman yönlendirmesi bilgilendiricidir ve sorumlu şekilde kullanılmalıdır. Bir rahatsızlığınız veya sakatlığınız varsa, uzman bir profesyonele danışın.",
        cta: "Güven ve emniyet sayfasını okuyun",
      },
      company: {
        title: "Şirket bilgileri",
        labels: {
          name: "Şirket adı",
          number: "Şirket numarası",
          address: "Adres",
          phone: "Telefon",
          email: "E-posta",
        },
        copyAriaPrefix: "Kopyala",
      },
      cta: {
        title: "Bugün başlayın",
        coach: "Koçlarımızla tanışın",
        pricing: "Fiyatlandırmayı görün",
      },
    },
    howItWorks: {
      hero: {
        title: "Nasil calisir",
        subtitle:
          "Planınızı almanın iki yolu var: bir koçla çalışmak ya da AI ile plan oluşturmak. Her ikisi de token bakiyenizi kullanır.",
        coachCta: "Bir koç bulun",
        generatorCta: "Instant AI oluşturucuyu deneyin",
        heroAlt: "Koç odaklı ve Instant AI antrenman akışları",
      },
      paths: {
        coach: {
          title: "Koç tarafından hazırlanan talep",
          body:
            "Hedefinizi ve tercihlerinizi koçunuza iletin. Planınız talebinize göre hazırlanır.",
          cta: "Bir koç bulun",
          imageAlt: "Koç tarafından hazırlanan talep",
        },
        ai: {
          title: "Instant AI planı",
          body:
            "Dakikalar içinde plan oluşturun. Önce önizleyin, hazır olduğunuzda yayınlayın.",
          cta: "Şimdi oluştur",
          imageAlt: "Instant AI plan oluşturma",
        },
      },
      coachFlow: {
        title: "Koç talepleri nasil calisir",
        emojis: ["🔎", "📝", "🧩", "📊"],
        steps: [
          "Koçunuzu seçin",
          "Talebinizi gönderin",
          "Planınız hazırlanır",
          "Panelinizden takip edin",
        ],
      },
      aiFlow: {
        title: "Instant AI nasil calisir",
        emojis: ["🎛️", "👀", "✅", "⬇️"],
        steps: [
          "Seçeneklerinizi ayarlayın",
          "Bir önizleme oluşturun (50 token)",
          "Tam planınızı yayınlayın",
          "İndirin ve antrenmana başlayın",
        ],
      },
      receive: {
        title: "Neler alirsiniz",
        imageAlt: "Örnek antrenman planı çıktısı",
        items: [
          "Yapılandırılmış haftalık ilerleme",
          "Gün gün antrenman dağılımı",
          "Egzersiz alternatifleri dahil",
          "Toparlanma ve yoğunluk yönlendirmesi",
          "Ekipmanınıza uygun seçenekler",
          "Planınızı indirin veya yazdırın",
        ],
      },
      tokens: {
        title: "Tokenlar ve odemeler",
        body:
          "Kurlar: €1 başına 100 token. GBP ve USD fiyatları aynı token değerini kullanır.",
        cta: "Fiyatlandırmayı görün",
        imageAlt: "Tokenlar ve güvenli ödemeler",
      },
      safety: {
        title: "Guven ve emniyet",
        imageAlt: "Güven ve emniyet",
        items: [
          "Antrenman yönlendirmesi bilgilendiricidir ve tıbbi tavsiye değildir.",
          "Ağrı hissederseniz durun ve gerekirse bir uzmana danışın.",
          "Yeni başlayanlara uygun seçenekler mevcuttur.",
        ],
      },
      faq: {
        title: "SSS",
        items: [
          {
            id: "coach-vs-ai",
            title: "Koç talepleri ile Instant AI arasındaki fark nedir?",
            paragraphs: [
              "Koç talepleri, belirli hedeflerinize ve tercihlerinize göre sertifikalı koçlar tarafından hazırlanan kişiselleştirilmiş planlardır. Instant AI planları ise birkaç dakika içinde otomatik olarak oluşturulur.",
              "Her iki seçenek de bakiyenizdeki tokenları kullanır; ancak koç talepleri insan uzmanlığı ve kişisel yönlendirme sunarken, Instant AI anında sonuç sağlar.",
            ],
          },
          {
            id: "how-tokens-work",
            title: "Tokenlar nasıl çalışır?",
            paragraphs: [
              "Bakiyeniz token olarak harcanır. Kur, euro başına 100 token ya da GBP ve USD karşılığıdır. Gerektiğinde yükleme yapın ve seçtiğiniz akışta kullanın. Tokenların süresi dolmaz.",
            ],
          },
          {
            id: "tokens-expire",
            title: "Tokenların süresi doluyor mu?",
            paragraphs: ["Hayır. Hazır olduğunuz zaman kullanabilirsiniz."],
          },
          {
            id: "both-flows",
            title: "Aynı bakiyeyle iki akışı da kullanabilir miyim?",
            paragraphs: [
              "Evet, tek token bakiyesi hem koç planları hem de AI planları için geçerlidir.",
            ],
          },
          {
            id: "insufficient-tokens",
            title: "Yeterli tokenım yoksa ne olur?",
            paragraphs: [
              "Devam etmeden önce yükleme yapmanız istenir. İstediğiniz zaman daha fazla token eklemek için Pricing sayfasına gidin.",
              "Instant AI ile tam sürümü yayınlamadan önce 50 token karşılığında önizleme alabilirsiniz.",
            ],
          },
          {
            id: "where-find-plans",
            title: "Planlarımı nerede bulurum?",
            paragraphs: [
              "Her şey Dashboard içindedir: koç planları, AI planları, indirmeler ve ilerleme takibi.",
            ],
          },
        ],
      },
      cta: {
        title: "Planiniza baslayin",
        coach: "Bir koç bulun",
        generator: "Instant AI oluşturucuyu deneyin",
      },
    },
    pricing: {
      h1: "Token paketleri ve fiyatlandirma",
      rateLine: "100 token = €1.00 | £{gbpRate} | ${usdRate}",
      intro:
        "Aşağıdan bir paket seçin veya özel bir tutar girin. Bakiyeniz hem koç talepleri hem de Instant AI için çalışır. Tüm fiyatlara %20 KDV dahildir.",
      invalidAmount: "Lütfen geçerli bir tutar girin.",
      customTopUpDescription: "Özel yükleme",
      invalidPack: "Geçersiz paket",
      checkoutFailed: "Ödeme başlatılamadı",
    },
  },
} as const;

export function getPhaseTwoCopy(locale: Locale) {
  return PHASE_TWO_COPY[locale] ?? PHASE_TWO_COPY.en;
}
