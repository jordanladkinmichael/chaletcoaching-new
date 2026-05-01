import type { Locale } from "@/lib/i18n/config";

export const PUBLIC_PAGES_COPY = {
  en: {
    paymentsTokens: {
      hero: {
        title: "Payments and tokens explained",
        subtitle:
          "Tokens are a simple balance you use across Instant AI plans and coach-built requests.",
        pricing: "See pricing",
        coaches: "Choose a coach",
        howItWorks: "How it works",
        imageAlt: "Tokens and secure payments",
      },
      basics: {
        title: "Token basics",
        cards: [
          {
            title: "What are tokens?",
            text: "Tokens are your training balance. You top up once and spend tokens on features.",
          },
          {
            title: "Why tokens?",
            text: "They keep pricing consistent across different plan types and options.",
          },
          {
            title: "Where do I see my balance?",
            text: "Your token balance is available in your dashboard when signed in.",
          },
        ],
      },
      rates: {
        title: "Rates and currencies",
        lead: "For every euro you spend, you receive 100 tokens (equivalent rates in GBP and USD).",
        body: "EUR is the base. Your preferred currency is always displayed in the header.",
        rows: [
          { code: "EUR", value: "€1.00 → 100 tokens" },
          { code: "GBP", value: "£0.87 → 100 tokens" },
          { code: "USD", value: "$1.19 → 100 tokens" },
        ],
      },
      topups: {
        title: "How top-ups work",
        steps: [
          "Choose a pack or enter a custom amount.",
          "Tokens are added to your balance after a successful payment.",
          "One balance covers everything: AI plans and coach requests.",
        ],
        tipTitle: "Tip",
        tip: "If you don't have enough tokens for an action, you'll be prompted to top up.",
        cta: "See pricing",
      },
      spending: {
        title: "How spending works",
        ai: {
          title: "Instant AI",
          items: [
            "Preview plan: 50 tokens",
            "Publishing a full plan depends on selected options",
          ],
          cta: "Open the generator",
        },
        coach: {
          title: "Coach-built request",
          items: [
            "Base request starts at 10,000 tokens",
            "Total cost depends on your selections (level, equipment, days per week)",
          ],
          cta: "Choose a coach",
        },
      },
      security: {
        title: "Security and payments",
        items: [
          "Visa and Mastercard payments",
          "Secure checkout",
          "We do not store your full card details",
        ],
      },
      refunds: {
        title: "Refunds",
        paragraphs: [
          "Refund eligibility depends on the situation and the service used.",
          "Please review our refund policy for details and eligibility.",
        ],
        cta: "Read refund policy",
      },
      faq: {
        title: "FAQ",
        items: [
          ["tokens-expire", "Do tokens expire?", "No. Your tokens stay in your account with no time limit."],
          ["both-flows", "Can I use tokens for both flows?", "Absolutely. One balance covers AI-generated plans and coach requests alike."],
          ["eur-base", "Why is EUR the base currency?", "It keeps pricing consistent. You can still view prices in your selected currency."],
          ["insufficient-tokens", "What happens if I don't have enough tokens?", "You will be prompted to top up before completing the action."],
          ["when-deducted", "When are tokens deducted?", "Tokens are deducted when you confirm an action that requires tokens."],
          ["payment-secure", "Is my payment secure?", "Yes. Payments are processed via secure checkout."],
          ["refund", "Can I get a refund?", "Please see our refund policy for details and eligibility."],
          ["see-purchases", "Where can I see my purchases?", "In your dashboard after signing in."],
        ],
      },
      cta: {
        title: "Top up and go",
        pricing: "See pricing",
        generator: "Open the generator",
      },
    },
    trustSafety: {
      hero: {
        title: "Trust and safety",
        subtitle:
          "Training guidance is informational and should be used with common sense. If you're unsure, consult a qualified professional.",
        coaches: "View coaches",
        generator: "Build a plan with AI",
        howItWorks: "How it works",
        imageAlt: "Trust and safety guidelines",
      },
      sections: [
        {
          title: "Safety first",
          items: [
            "Warm up before training and progress gradually.",
            "Choose loads you can control with proper technique.",
            "Prioritize recovery, sleep, and hydration.",
            "Use equipment safely and train in a suitable environment.",
            "Stop if you feel sharp pain, dizziness, or numbness.",
            "If you have a medical condition, consult a professional first.",
          ],
        },
        {
          title: "Not medical advice",
          items: [
            "We do not provide medical advice, diagnosis, or treatment.",
            "Our content is not a substitute for a doctor, physiotherapist, or licensed professional.",
            "If you are pregnant, recovering from injury, or have chronic conditions, seek professional guidance before training.",
          ],
        },
        {
          title: "Your responsibility",
          items: [
            "You are responsible for your training choices and how you perform exercises.",
            "Adjust intensity based on your experience, form, and recovery.",
            "Use safety measures such as spotters, proper footwear, and appropriate surfaces.",
            "If something feels wrong, stop and reassess.",
          ],
        },
        {
          title: "Platform limitations",
          items: [
            "Coach-built and AI-generated plans may contain errors or may not fit your unique situation.",
            "Always verify exercise technique and suitability for your body and equipment.",
            "Progress is not guaranteed and depends on consistency, recovery, and individual differences.",
            "Do not use the platform for emergency situations.",
          ],
        },
        {
          title: "For coaches",
          items: [
            "Coaches must provide clear, safe guidance and avoid medical claims.",
            "Coaches should recommend professional help when appropriate.",
            "Coaches are responsible for the advice they provide within the platform.",
          ],
        },
      ],
      stop: {
        title: "When to stop",
        items: [
          "Sharp or worsening pain",
          "Dizziness or fainting",
          "Chest pain or unusual shortness of breath",
          "Numbness or tingling",
          "Any symptom that feels unsafe",
        ],
      },
      faq: {
        title: "FAQ",
        contact: "Contact support",
        items: [
          ["medical-advice", "Is this medical advice?", "No. The content is informational and not a substitute for licensed medical care."],
          ["beginners-safe", "Can beginners use the plans safely?", "Yes. Choose beginner-friendly options and progress gradually. If unsure, work with a coach."],
          ["injury-condition", "What if I have an injury or condition?", "Consult a qualified professional before training and avoid movements that cause pain."],
          ["results-guaranteed", "Are results guaranteed?", "No. Results vary and depend on consistency, recovery, and individual factors."],
          ["report-unsafe", "Can I report unsafe content?", "Yes. Contact support and include details so we can review the issue."],
          ["who-responsible", "Who is responsible for how I train?", "You are responsible for your training decisions and execution. Use guidance responsibly."],
        ],
      },
      cta: {
        title: "Begin with confidence",
        coaches: "View coaches",
        generator: "Build a plan with AI",
      },
    },
    whatYouReceive: {
      hero: {
        title: "What you receive",
        subtitle:
          "A clear training plan you can follow. Built by a coach or generated instantly with AI.",
        coaches: "Find your coach",
        generator: "Generate a plan",
        pricing: "See pricing",
        imageAlt: "Training plan outputs overview",
      },
      atAGlance: {
        title: "At a glance",
        items: [
          "Weekly structure and progression",
          "Session-by-session workouts",
          "Exercise guidance and alternatives",
          "Intensity and recovery recommendations",
          "Equipment-aware options",
          "Printable and downloadable format",
        ],
      },
      inside: {
        title: "What's inside the plan",
        cards: [
          ["Structure", "A weekly plan with progression that matches your goal and level."],
          ["Sessions", "Warm-up, main work, accessories, and cooldown."],
          ["Progression", "Clear progression rules so you always know what to increase next."],
        ],
      },
      examples: {
        title: "Examples of outputs",
        imageAlt: "Examples of weekly and session views",
        items: [
          ["Week view", "Overview of your weekly schedule with progression indicators and session distribution."],
          ["Session view", "Detailed breakdown of each workout including warm-up, main exercises, and cooldown."],
          ["Exercise alternatives", "Equipment-aware alternatives for each exercise to match your setup and preferences."],
        ],
      },
      compare: {
        title: "Coach-built vs Instant AI",
        imageAlt: "Coach-built and Instant AI comparison",
        coach: {
          title: "Coach-built request",
          items: [
            "Tailored to your preferences",
            "Structured progression based on your inputs",
            "Great when you want a coach-led approach",
          ],
          cta: "Find a coach",
        },
        ai: {
          title: "Instant AI",
          items: [
            "Generate in minutes",
            "Preview first, then publish",
            "Perfect for quick iteration",
          ],
          cta: "Generate now",
        },
      },
      formats: {
        title: "Formats and access",
        items: [
          "Available in your dashboard",
          "Downloadable and printable",
          "Easy to revisit and regenerate",
        ],
      },
      quality: {
        title: "Quality promise",
        items: [
          "Clear structure",
          "Progressive overload guidance",
          "Equipment-aware options",
          "Beginner-friendly defaults",
        ],
      },
      faq: {
        title: "FAQ",
        items: [
          ["what-included", "What's included in a plan?", "Each plan includes a weekly structure with clear progression, session-by-session workouts, exercise guidance with alternatives, intensity and recovery recommendations, equipment-aware options, and a printable format you can download."],
          ["suitable-beginners", "Is this suitable for beginners?", "Yes. Plans include beginner-friendly defaults and you can choose your level when requesting a coach course or generating an Instant AI plan."],
          ["choose-equipment", "Can I choose equipment and training type?", "Yes. You can select your equipment setup and training type when creating your request or generating your plan."],
          ["instant-ai-previews", "How do Instant AI previews work?", "Pay 50 tokens to preview the plan layout. Happy with it? Publish the complete version and download it straight away."],
          ["same-tokens", "Can I use the same tokens for both flows?", "Yes. Your balance is shared across coach plans and AI plans."],
          ["access-plans", "Where can I access my plans?", "Open your dashboard to see every plan, download files, and track your training."],
        ],
      },
      cta: {
        title: "Create your plan now",
        coaches: "Find your coach",
        generator: "Generate a plan",
      },
    },
    contact: {
      hero: {
        title: "Contact us",
        subtitle:
          "Need help with tokens, coach requests, or Instant AI? We're here to help.",
        links: ["Support", "FAQ", "Payments & tokens"],
      },
      detailsTitle: "Contact details",
      cards: {
        email: { title: "Email", value: "info@chaletcoaching.co.uk", cta: "Send email" },
        phone: { title: "Phone", value: "+44 7782 358363", cta: "Call" },
        address: {
          title: "Company address",
          value: "20 Wenlock Road, London, England, N1 7GU",
          copy: "Copy address",
          copied: "Copied",
        },
      },
      formTitle: "Send a message",
      before: {
        title: "Before you send",
        items: [
          "Describe what you were trying to do",
          "Include any error message",
          "Add screenshots if possible",
          "Tell us which page you were on",
        ],
      },
    },
    contactForm: {
      validation: {
        name: "Name is too short",
        email: "Enter a valid email",
        topic: "Please select a topic",
        message: "Message must be at least 20 characters",
        invalid: "Invalid input",
      },
      labels: {
        honeypot: "Company Website",
        name: "Full name",
        email: "Email",
        topic: "Topic",
        message: "Message",
      },
      placeholders: {
        name: "John Doe",
        email: "you@example.com",
        message: "Tell us about your question or issue...",
      },
      topics: [
        ["", "Select a topic"],
        ["Tokens and billing", "Tokens and billing"],
        ["Coach requests", "Coach requests"],
        ["Instant AI generator", "Instant AI generator"],
        ["Account and dashboard", "Account and dashboard"],
        ["Partnerships", "Partnerships"],
        ["Other", "Other"],
      ],
      states: {
        successTitle: "Success",
        successBody: "We received your message. We'll reply by email.",
        errorTitle: "Error",
        sending: "Sending...",
        submit: "Send message",
        faq: "Read FAQ",
      },
      errors: {
        failed: "Failed to send message",
        generic: "Something went wrong",
        rateLimit: "Too many requests. Please try again in 10 minutes or email us directly.",
        failedWithEmail:
          "Please try again or email us directly at info@chaletcoaching.co.uk.",
      },
    },
  },
  tr: {
    paymentsTokens: {
      hero: {
        title: "Ödemeler ve tokenlar",
        subtitle:
          "Tokenlar, Instant AI planları ve koç tarafından hazırlanan talepler için kullandığınız basit bir bakiyedir.",
        pricing: "Fiyatları gör",
        coaches: "Koç seç",
        howItWorks: "Nasıl çalışır",
        imageAlt: "Tokenlar ve güvenli ödemeler",
      },
      basics: {
        title: "Token temelleri",
        cards: [
          {
            title: "Token nedir?",
            text: "Tokenlar antrenman bakiyenizdir. Bir kez yükleme yapar, özelliklerde token harcarsınız.",
          },
          {
            title: "Neden token?",
            text: "Farklı plan tipleri ve seçenekler arasında fiyatlandırmayı tutarlı tutar.",
          },
          {
            title: "Bakiyemi nerede görürüm?",
            text: "Giriş yaptığınızda token bakiyeniz panelinizde görünür.",
          },
        ],
      },
      rates: {
        title: "Kurlar ve para birimleri",
        lead: "Harcanan her euro için 100 token alırsınız (GBP ve USD için eşdeğer oranlar).",
        body: "Baz para birimi EUR'dur. Seçtiğiniz para birimi her zaman başlıkta gösterilir.",
        rows: [
          { code: "EUR", value: "€1.00 → 100 token" },
          { code: "GBP", value: "£0.87 → 100 token" },
          { code: "USD", value: "$1.19 → 100 token" },
        ],
      },
      topups: {
        title: "Yüklemeler nasıl çalışır",
        steps: [
          "Bir paket seçin veya özel bir tutar girin.",
          "Başarılı ödemeden sonra tokenlar bakiyenize eklenir.",
          "Tek bakiye her şeyi kapsar: AI planları ve koç talepleri.",
        ],
        tipTitle: "İpucu",
        tip: "Bir işlem için yeterli tokenınız yoksa yükleme yapmanız istenir.",
        cta: "Fiyatları gör",
      },
      spending: {
        title: "Token harcama nasıl çalışır",
        ai: {
          title: "Instant AI",
          items: [
            "Plan önizlemesi: 50 token",
            "Tam planı yayınlama maliyeti seçilen seçeneklere bağlıdır",
          ],
          cta: "Oluşturucuyu aç",
        },
        coach: {
          title: "Koç talebi",
          items: [
            "Temel talep 10.000 token ile başlar",
            "Toplam maliyet seçimlerinize bağlıdır (seviye, ekipman, haftalık gün sayısı)",
          ],
          cta: "Koç seç",
        },
      },
      security: {
        title: "Güvenlik ve ödemeler",
        items: [
          "Visa ve Mastercard ödemeleri",
          "Güvenli ödeme akışı",
          "Tam kart bilgilerinizi saklamayız",
        ],
      },
      refunds: {
        title: "İadeler",
        paragraphs: [
          "İade uygunluğu duruma ve kullanılan hizmete bağlıdır.",
          "Detaylar ve uygunluk için lütfen iade politikamızı inceleyin.",
        ],
        cta: "İade politikasını oku",
      },
      faq: {
        title: "SSS",
        items: [
          ["tokens-expire", "Tokenların süresi dolar mı?", "Hayır. Tokenlarınız hesabınızda süre sınırı olmadan kalır."],
          ["both-flows", "Tokenları iki akışta da kullanabilir miyim?", "Evet. Tek bakiye hem AI planlarını hem de koç taleplerini kapsar."],
          ["eur-base", "Neden baz para birimi EUR?", "Fiyatları tutarlı tutar. Yine de fiyatları seçtiğiniz para biriminde görebilirsiniz."],
          ["insufficient-tokens", "Yeterli tokenım yoksa ne olur?", "İşlemi tamamlamadan önce yükleme yapmanız istenir."],
          ["when-deducted", "Tokenlar ne zaman düşülür?", "Token gerektiren bir işlemi onayladığınızda bakiyenizden düşülür."],
          ["payment-secure", "Ödemem güvenli mi?", "Evet. Ödemeler güvenli ödeme akışı üzerinden işlenir."],
          ["refund", "İade alabilir miyim?", "Detaylar ve uygunluk için lütfen iade politikamızı inceleyin."],
          ["see-purchases", "Satın alımlarımı nerede görürüm?", "Giriş yaptıktan sonra panelinizde görebilirsiniz."],
        ],
      },
      cta: {
        title: "Yükle ve başla",
        pricing: "Fiyatları gör",
        generator: "Oluşturucuyu aç",
      },
    },
    trustSafety: {
      hero: {
        title: "Güven ve emniyet",
        subtitle:
          "Antrenman yönlendirmesi bilgilendirme amaçlıdır ve sağduyuyla kullanılmalıdır. Emin değilseniz nitelikli bir uzmana danışın.",
        coaches: "Koçları gör",
        generator: "AI ile plan oluştur",
        howItWorks: "Nasıl çalışır",
        imageAlt: "Güven ve emniyet yönergeleri",
      },
      sections: [
        {
          title: "Önce güvenlik",
          items: [
            "Antrenmandan önce ısının ve kademeli ilerleyin.",
            "Doğru teknikle kontrol edebileceğiniz ağırlıkları seçin.",
            "Toparlanma, uyku ve hidrasyona öncelik verin.",
            "Ekipmanı güvenli kullanın ve uygun bir ortamda çalışın.",
            "Keskin ağrı, baş dönmesi veya uyuşma hissederseniz durun.",
            "Tıbbi bir durumunuz varsa önce bir uzmana danışın.",
          ],
        },
        {
          title: "Tıbbi tavsiye değildir",
          items: [
            "Tıbbi tavsiye, teşhis veya tedavi sunmuyoruz.",
            "İçeriğimiz doktor, fizyoterapist veya lisanslı uzman yerine geçmez.",
            "Hamileyseniz, sakatlıktan dönüyorsanız veya kronik rahatsızlığınız varsa antrenmandan önce profesyonel destek alın.",
          ],
        },
        {
          title: "Sizin sorumluluğunuz",
          items: [
            "Antrenman seçimlerinizden ve egzersizleri nasıl uyguladığınızdan siz sorumlusunuz.",
            "Yoğunluğu deneyiminize, tekniğinize ve toparlanmanıza göre ayarlayın.",
            "Spotter, uygun ayakkabı ve doğru zemin gibi güvenlik önlemlerini kullanın.",
            "Bir şey yanlış gelirse durun ve yeniden değerlendirin.",
          ],
        },
        {
          title: "Platform sınırları",
          items: [
            "Koç tarafından hazırlanan ve AI tarafından üretilen planlarda hata olabilir veya özel durumunuza uymayabilir.",
            "Egzersiz tekniğini ve bedeninize/ekipmanınıza uygunluğu her zaman kontrol edin.",
            "İlerleme garanti edilmez; tutarlılık, toparlanma ve bireysel farklara bağlıdır.",
            "Platformu acil durumlar için kullanmayın.",
          ],
        },
        {
          title: "Koçlar için",
          items: [
            "Koçlar net ve güvenli yönlendirme sağlamalı, tıbbi iddialardan kaçınmalıdır.",
            "Koçlar uygun olduğunda profesyonel yardım önermelidir.",
            "Koçlar platform içinde verdikleri tavsiyeden sorumludur.",
          ],
        },
      ],
      stop: {
        title: "Ne zaman durmalısınız",
        items: [
          "Keskin veya kötüleşen ağrı",
          "Baş dönmesi veya bayılma hissi",
          "Göğüs ağrısı veya olağandışı nefes darlığı",
          "Uyuşma veya karıncalanma",
          "Güvensiz hissettiren herhangi bir belirti",
        ],
      },
      faq: {
        title: "SSS",
        contact: "Destekle iletişime geç",
        items: [
          ["medical-advice", "Bu tıbbi tavsiye mi?", "Hayır. İçerik bilgilendirme amaçlıdır ve lisanslı tıbbi bakımın yerine geçmez."],
          ["beginners-safe", "Yeni başlayanlar planları güvenle kullanabilir mi?", "Evet. Başlangıç dostu seçenekleri seçin ve kademeli ilerleyin. Emin değilseniz bir koçla çalışın."],
          ["injury-condition", "Sakatlığım veya rahatsızlığım varsa ne yapmalıyım?", "Antrenmandan önce nitelikli bir uzmana danışın ve ağrıya neden olan hareketlerden kaçının."],
          ["results-guaranteed", "Sonuçlar garanti mi?", "Hayır. Sonuçlar tutarlılık, toparlanma ve bireysel faktörlere göre değişir."],
          ["report-unsafe", "Güvensiz içerik bildirebilir miyim?", "Evet. Konuyu inceleyebilmemiz için destekle iletişime geçip detayları paylaşın."],
          ["who-responsible", "Nasıl antrenman yaptığımdan kim sorumlu?", "Antrenman kararlarınızdan ve uygulamanızdan siz sorumlusunuz. Yönlendirmeyi sorumlu şekilde kullanın."],
        ],
      },
      cta: {
        title: "Güvenle başlayın",
        coaches: "Koçları gör",
        generator: "AI ile plan oluştur",
      },
    },
    whatYouReceive: {
      hero: {
        title: "Neler alırsınız",
        subtitle:
          "Takip edebileceğiniz net bir antrenman planı. Bir koç tarafından hazırlanır veya AI ile anında üretilir.",
        coaches: "Koçunu bul",
        generator: "Plan oluştur",
        pricing: "Fiyatları gör",
        imageAlt: "Antrenman planı çıktıları özeti",
      },
      atAGlance: {
        title: "Kısa özet",
        items: [
          "Haftalık yapı ve ilerleme",
          "Seans seans antrenmanlar",
          "Egzersiz yönlendirmesi ve alternatifler",
          "Yoğunluk ve toparlanma önerileri",
          "Ekipmana göre seçenekler",
          "Yazdırılabilir ve indirilebilir format",
        ],
      },
      inside: {
        title: "Planın içinde neler var",
        cards: [
          ["Yapı", "Hedefinize ve seviyenize uygun ilerleme içeren haftalık plan."],
          ["Seanslar", "Isınma, ana çalışma, yardımcı egzersizler ve soğuma."],
          ["İlerleme", "Bir sonraki adımda neyi artıracağınızı gösteren net ilerleme kuralları."],
        ],
      },
      examples: {
        title: "Çıktı örnekleri",
        imageAlt: "Haftalık ve seans görünümleri örnekleri",
        items: [
          ["Hafta görünümü", "İlerleme göstergeleri ve seans dağılımıyla haftalık program özeti."],
          ["Seans görünümü", "Isınma, ana egzersizler ve soğuma dahil her antrenmanın detaylı dökümü."],
          ["Egzersiz alternatifleri", "Ekipmanınıza ve tercihlerinize uygun egzersiz alternatifleri."],
        ],
      },
      compare: {
        title: "Koç planı ve Instant AI",
        imageAlt: "Koç planı ve Instant AI karşılaştırması",
        coach: {
          title: "Koç talebi",
          items: [
            "Tercihlerinize göre uyarlanır",
            "Girdilerinize göre yapılandırılmış ilerleme",
            "Koç liderliğinde yaklaşım istediğinizde idealdir",
          ],
          cta: "Koç bul",
        },
        ai: {
          title: "Instant AI",
          items: [
            "Dakikalar içinde üretin",
            "Önce önizleyin, sonra yayınlayın",
            "Hızlı deneme ve düzenleme için uygundur",
          ],
          cta: "Şimdi oluştur",
        },
      },
      formats: {
        title: "Formatlar ve erişim",
        items: [
          "Panelinizde kullanılabilir",
          "İndirilebilir ve yazdırılabilir",
          "Tekrar açması ve yeniden üretmesi kolay",
        ],
      },
      quality: {
        title: "Kalite sözü",
        items: [
          "Net yapı",
          "Kademeli yüklenme yönlendirmesi",
          "Ekipmana göre seçenekler",
          "Başlangıç dostu varsayılanlar",
        ],
      },
      faq: {
        title: "SSS",
        items: [
          ["what-included", "Bir planda neler bulunur?", "Her plan haftalık yapı, net ilerleme, seans seans antrenmanlar, egzersiz yönlendirmeleri, alternatifler, yoğunluk ve toparlanma önerileri, ekipmana göre seçenekler ve indirilebilir format içerir."],
          ["suitable-beginners", "Yeni başlayanlar için uygun mu?", "Evet. Planlarda başlangıç dostu varsayılanlar vardır ve koç talebi ya da Instant AI planı oluştururken seviyenizi seçebilirsiniz."],
          ["choose-equipment", "Ekipman ve antrenman türü seçebilir miyim?", "Evet. Talep oluştururken veya plan üretirken ekipmanınızı ve antrenman türünüzü seçebilirsiniz."],
          ["instant-ai-previews", "Instant AI önizlemeleri nasıl çalışır?", "Plan düzenini önizlemek için 50 token ödersiniz. Memnunsanız tam sürümü yayınlayıp hemen indirebilirsiniz."],
          ["same-tokens", "Aynı tokenları iki akışta da kullanabilir miyim?", "Evet. Bakiyeniz koç planları ve AI planları arasında ortaktır."],
          ["access-plans", "Planlarıma nereden erişirim?", "Tüm planları görmek, dosyaları indirmek ve antrenmanınızı takip etmek için panelinizi açın."],
        ],
      },
      cta: {
        title: "Planınızı şimdi oluşturun",
        coaches: "Koçunu bul",
        generator: "Plan oluştur",
      },
    },
    contact: {
      hero: {
        title: "Bize ulaşın",
        subtitle:
          "Tokenlar, koç talepleri veya Instant AI hakkında yardıma mı ihtiyacınız var? Yardım için buradayız.",
        links: ["Destek", "SSS", "Ödemeler ve tokenlar"],
      },
      detailsTitle: "İletişim bilgileri",
      cards: {
        email: { title: "E-posta", value: "info@chaletcoaching.co.uk", cta: "E-posta gönder" },
        phone: { title: "Telefon", value: "+44 7782 358363", cta: "Ara" },
        address: {
          title: "Şirket adresi",
          value: "20 Wenlock Road, London, England, N1 7GU",
          copy: "Adresi kopyala",
          copied: "Kopyalandı",
        },
      },
      formTitle: "Mesaj gönder",
      before: {
        title: "Göndermeden önce",
        items: [
          "Ne yapmaya çalıştığınızı açıklayın",
          "Varsa hata mesajını ekleyin",
          "Mümkünse ekran görüntüsü ekleyin",
          "Hangi sayfada olduğunuzu söyleyin",
        ],
      },
    },
    contactForm: {
      validation: {
        name: "İsim çok kısa",
        email: "Geçerli bir e-posta girin",
        topic: "Lütfen bir konu seçin",
        message: "Mesaj en az 20 karakter olmalıdır",
        invalid: "Geçersiz giriş",
      },
      labels: {
        honeypot: "Şirket web sitesi",
        name: "Ad soyad",
        email: "E-posta",
        topic: "Konu",
        message: "Mesaj",
      },
      placeholders: {
        name: "John Doe",
        email: "you@example.com",
        message: "Sorunuzu veya probleminizi anlatın...",
      },
      topics: [
        ["", "Konu seçin"],
        ["Tokens and billing", "Tokenlar ve faturalandırma"],
        ["Coach requests", "Koç talepleri"],
        ["Instant AI generator", "Instant AI generator"],
        ["Account and dashboard", "Hesap ve panel"],
        ["Partnerships", "İş birlikleri"],
        ["Other", "Diğer"],
      ],
      states: {
        successTitle: "Başarılı",
        successBody: "Mesajınızı aldık. E-posta ile yanıt vereceğiz.",
        errorTitle: "Hata",
        sending: "Gönderiliyor...",
        submit: "Mesaj gönder",
        faq: "SSS'yi oku",
      },
      errors: {
        failed: "Mesaj gönderilemedi",
        generic: "Bir şeyler ters gitti",
        rateLimit: "Çok fazla istek. Lütfen 10 dakika sonra tekrar deneyin veya doğrudan e-posta gönderin.",
        failedWithEmail:
          "Lütfen tekrar deneyin veya doğrudan info@chaletcoaching.co.uk adresine e-posta gönderin.",
      },
    },
  },
} as const;

export function getPublicPagesCopy(locale: Locale) {
  return PUBLIC_PAGES_COPY[locale] ?? PUBLIC_PAGES_COPY.en;
}
