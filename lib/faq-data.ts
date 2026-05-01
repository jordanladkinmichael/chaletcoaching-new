/**
 * Centralized FAQ data source
 * Used on Home page (mini FAQ) and /faq page (full list)
 */

import { DEFAULT_LOCALE, type Locale } from "@/lib/i18n/config";

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

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
    answer: "We recommend 3-4 sessions per week for optimal results, but you can adjust based on your schedule and goals.",
  },
];

export const MINI_FAQS: FAQItem[] = [
  ALL_FAQS[0],
  ALL_FAQS[1],
  ALL_FAQS[2],
  ALL_FAQS[3],
  ALL_FAQS[4],
  ALL_FAQS[5],
];

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

export const FAQ_ITEMS: FaqItem[] = [
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
    keywords: ["regenerate", "again", "retry"],
  },
  {
    id: "does-ai-replace-coach",
    category: "instant_ai",
    question: "Does Instant AI replace a coach?",
    answer: "It's a fast option when you need speed. Coaches are best when you want guidance and accountability.",
    keywords: ["replace", "coach", "comparison"],
  },
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
    keywords: ["rates", "currency", "eur", "gbp", "usd"],
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

const ALL_FAQS_TR: FAQItem[] = [
  {
    id: "coach-delivery-time",
    question: "Bir koç programını ne kadar hızlı alırım?",
    answer: "Koç programları koçunuz tarafından hazırlanır. Teslim süresi, koçunuzun takvimine ve programın karmaşıklığına bağlıdır.",
  },
  {
    id: "coach-vs-ai",
    question: "Koç Programı ile Instant AI arasındaki fark nedir?",
    answer: "Koç Programı, koçunuzun kişiselleştirilmiş uzmanlığıyla hazırlanır. Instant AI ise dakikalar içinde oluşturulur.",
  },
  {
    id: "refund-policy",
    question: "Geri ödeme alabilir miyim?",
    answer: "Geri ödeme uygunluğu sipariş durumunuza ve teslimat aşamasına bağlıdır. Lütfen İade Politikamızı okuyun.",
  },
  {
    id: "tokens-expire",
    question: "Tokenların süresi doluyor mu?",
    answer: "Hayır, tokenların süresi dolmaz.",
  },
  {
    id: "payment-methods",
    question: "Hangi ödeme yöntemlerini destekliyorsunuz?",
    answer: "Visa ve Mastercard.",
  },
  {
    id: "currencies",
    question: "Hangi para birimleri destekleniyor?",
    answer: "EUR, GBP ve USD.",
  },
  {
    id: "how-tokens-work",
    question: "Tokenlar nasıl çalışır?",
    answer: "100 token = €1.00 / £0.87 / $1.19. Koç programı talep ederken veya instant AI programları üretirken token harcarsınız.",
  },
  {
    id: "is-it-safe",
    question: "Güvenli mi?",
    answer: "Sakatlık riskini azaltan seçenekler ve alternatifler sunuyoruz, ancak bu tıbbi tavsiye değildir. Başlamadan önce bir sağlık uzmanına danışın.",
  },
  {
    id: "equipment-needed",
    question: "Hangi ekipmanlara ihtiyacım var?",
    answer: "Antrenmanların çoğu minimum ekipmanla yapılabilir. Farklı kurulumlar için alternatifler sunuyoruz.",
  },
  {
    id: "training-frequency",
    question: "Ne sıklıkla antrenman yapmalıyım?",
    answer: "En iyi sonuçlar için haftada 3-4 seans öneriyoruz, ancak bunu takviminize ve hedeflerinize göre ayarlayabilirsiniz.",
  },
];

const MINI_FAQS_TR: FAQItem[] = [
  ALL_FAQS_TR[0],
  ALL_FAQS_TR[1],
  ALL_FAQS_TR[2],
  ALL_FAQS_TR[3],
  ALL_FAQS_TR[4],
  ALL_FAQS_TR[5],
];

const coachProfileFAQ_TR: FAQItem[] = [
  {
    id: "what-is-request",
    question: "Koç programı talebi nedir?",
    answer: "Koç programı talebi, bir koçtan sizin için kişiselleştirilmiş bir antrenman planı hazırlamasını istemenizi sağlar. Koç, hedeflerinize, seviyenize ve tercihlerinize göre yapılandırılmış bir program tasarlar.",
  },
  {
    id: "how-tokens-work",
    question: "Tokenlar nasıl çalışır?",
    answer: "100 token = €1.00 / £0.87 / $1.19. Koç programı talep ederken veya instant AI programları üretirken token harcarsınız. Tokenların süresi dolmaz.",
  },
  {
    id: "instant-ai-instead",
    question: "Bunun yerine Instant AI kullanabilir miyim?",
    answer: "Evet. Instant AI dakikalar içinde bir program üretir, koç programları ise koçunuz tarafından kişiselleştirilir. Platformda her iki seçenek de mevcuttur.",
  },
  {
    id: "where-see-requests",
    question: "Taleplerimi nerede görebilirim?",
    answer: "Tüm koç programı taleplerinizi panelinizde takip edebilirsiniz. Durumu ve güncellemeleri görür, taleplerinizi oradan yönetirsiniz.",
  },
];

const FAQ_ITEMS_TR: FaqItem[] = [
  {
    id: "how-do-i-start",
    category: "getting_started",
    question: "Nasıl başlarım?",
    answer: "Koçlara göz atın veya oluşturucuyu açın. Koç desteği istiyorsanız bir koç profilinden plan talep edin.",
    keywords: ["başla", "başlangıç", "nasıl", "ilk adım"],
  },
  {
    id: "coach-vs-ai-difference",
    category: "getting_started",
    question: "Koç talepleri ile Instant AI arasındaki fark nedir?",
    answer: "Koç talepleri, koç liderliğinde yürüyen bir süreçle hazırlanır. Instant AI ise girdilerinize göre planı hemen üretir.",
    keywords: ["fark", "koç", "instant ai", "karşılaştırma"],
  },
  {
    id: "do-i-need-account",
    category: "getting_started",
    question: "Bir hesaba ihtiyacım var mı?",
    answer: "Sayfalara hesap olmadan göz atabilirsiniz. Plan üretmek, token satın almak ve panelinize erişmek için giriş yapmanız gerekir.",
    keywords: ["hesap", "giriş", "kayıt", "üye ol"],
  },
  {
    id: "how-choose-coach",
    category: "coaches",
    question: "Bir koçu nasıl seçerim?",
    answer: "Filtreleri kullanın ve hedefinize uyan uzmanlık alanlarını arayın. Odak alanlarını ve puanları görmek için koç profilini açın.",
    keywords: ["seç", "koç", "filtre", "profil"],
  },
  {
    id: "what-send-coach-request",
    category: "coaches",
    question: "Koç talebine ne göndermeliyim?",
    answer: "Hedefinizi, seviyenizi, antrenman türünü, ekipmanınızı ve programınızı paylaşın. Ne kadar çok bağlam verirseniz plan o kadar iyi olur.",
    keywords: ["talep", "koç", "bilgi", "gönder"],
  },
  {
    id: "can-request-multiple-plans",
    category: "coaches",
    question: "Birden fazla plan talep edebilir miyim?",
    answer: "Evet. Her talep ayrı bir plandır ve seçiminize göre fiyatlandırılır.",
    keywords: ["birden fazla", "plan", "talep"],
  },
  {
    id: "can-save-coach",
    category: "coaches",
    question: "Bir koçu kaydedebilir miyim?",
    answer: "Evet. Koçları daha sonra tekrar ziyaret etmek için yer imlerine ekleyebilirsiniz.",
    keywords: ["kaydet", "yer imi", "favori", "koç"],
  },
  {
    id: "how-instant-ai-works",
    category: "instant_ai",
    question: "Instant AI oluşturucu nasıl çalışır?",
    answer: "Hedefinizi ve antrenman tercihlerinizi seçin, önizleme oluşturun ve ardından tam planı yayınlayın.",
    keywords: ["instant ai", "oluşturucu", "nasıl çalışır", "süreç"],
  },
  {
    id: "what-is-preview",
    category: "instant_ai",
    question: "Önizleme nedir?",
    answer: "Önizleme, yayınlamadan önce plan yapısını görmenizi sağlar. Önizlemeler 50 token tutar.",
    keywords: ["önizleme", "50 token", "gör"],
  },
  {
    id: "can-regenerate-plan",
    category: "instant_ai",
    question: "Planı yeniden üretebilir miyim?",
    answer: "Evet. Sonuçtan memnun olana kadar girdileri ayarlayıp yeniden oluşturabilirsiniz.",
    keywords: ["yeniden oluştur", "tekrar dene", "yenile"],
  },
  {
    id: "does-ai-replace-coach",
    category: "instant_ai",
    question: "Instant AI bir koçun yerini alır mı?",
    answer: "Hıza ihtiyacınız olduğunda iyi bir seçenektir. Rehberlik ve sorumluluk istiyorsanız koçlar daha uygundur.",
    keywords: ["yerine geçer", "koç", "karşılaştırma"],
  },
  {
    id: "what-are-tokens",
    category: "tokens_payments",
    question: "Tokenlar nedir?",
    answer: "Tokenlar; önizleme, yayınlama ve koç talepleri gibi özelliklerde kullanılan bakiyenizdir.",
    keywords: ["token", "bakiye", "nedir", "açıklama"],
  },
  {
    id: "token-rates",
    category: "tokens_payments",
    question: "Token kurları nedir?",
    answer: "100 token = €1.00 | £0.87 | $1.19. Temel para birimi EUR'dur.",
    keywords: ["kur", "para birimi", "eur", "gbp", "usd"],
  },
  {
    id: "same-tokens-both-flows",
    category: "tokens_payments",
    question: "Aynı tokenları iki akışta da kullanabilir miyim?",
    answer: "Evet. Tek bir token bakiyesi hem koç taleplerinde hem de Instant AI'da çalışır.",
    keywords: ["aynı", "token", "iki akış", "bakiye"],
  },
  {
    id: "not-enough-tokens",
    category: "tokens_payments",
    question: "Yeterli tokenım yoksa ne olur?",
    answer: "İşlemi tamamlamadan önce bakiye yüklemeniz istenir.",
    keywords: ["yetersiz", "token", "yükleme", "bakiye"],
  },
  {
    id: "is-payment-secure",
    category: "tokens_payments",
    question: "Ödeme güvenli mi?",
    answer: "Evet. Ödemeler güvenli ödeme akışı üzerinden işlenir. Tam kart bilgilerinizi saklamıyoruz.",
    keywords: ["ödeme", "güvenli", "kart", "checkout"],
  },
  {
    id: "where-see-balance",
    category: "account",
    question: "Token bakiyemi nerede görebilirim?",
    answer: "Giriş yaptıktan sonra panelinizde.",
    keywords: ["bakiye", "panel", "nerede"],
  },
  {
    id: "where-find-plans",
    category: "account",
    question: "Planlarımı nerede bulurum?",
    answer: "Paneliniz, oluşturduğunuz planları ve koç taleplerini içerir.",
    keywords: ["planlar", "panel", "nerede bulurum"],
  },
  {
    id: "cant-sign-in",
    category: "account",
    question: "Giriş yapamıyorum. Ne yapmalıyım?",
    answer: "E-posta adresinizi kontrol edip tekrar deneyin. Sorun devam ederse destekle iletişime geçin.",
    keywords: ["giriş", "oturum", "sorun", "problem"],
  },
  {
    id: "is-medical-advice",
    category: "safety",
    question: "Bu tıbbi tavsiye mi?",
    answer: "Hayır. Antrenman rehberi bilgilendirme amaçlıdır ve lisanslı tıbbi bakımın yerine geçmez.",
    keywords: ["tıbbi", "tavsiye", "sağlık", "doktor"],
  },
  {
    id: "suitable-beginners",
    category: "safety",
    question: "Bu yeni başlayanlar için uygun mu?",
    answer: "Evet. Başlangıç seçeneklerini seçin, yavaş başlayın ve kademeli ilerleyin.",
    keywords: ["başlangıç", "uygun", "yeni başlayan"],
  },
  {
    id: "when-stop-training",
    category: "safety",
    question: "Antrenmanı ne zaman bırakmalıyım?",
    answer: "Keskin ağrı, baş dönmesi, uyuşma veya güvensiz hissettiğiniz bir durum olursa durun. Gerekirse bir uzmana danışın.",
    keywords: ["dur", "ağrı", "güvenlik", "ne zaman"],
  },
  {
    id: "can-get-refund",
    category: "refunds",
    question: "Geri ödeme alabilir miyim?",
    answer: "Geri ödeme uygunluğu duruma ve kullanılan hizmete bağlıdır. Ayrıntılar için iade politikamıza bakın.",
    keywords: ["geri ödeme", "para iadesi", "iade"],
  },
  {
    id: "where-read-refund-policy",
    category: "refunds",
    question: "İade politikasını nerede okuyabilirim?",
    answer: "Bunu iade sayfamızda okuyabilirsiniz.",
    keywords: ["iade politikası", "oku", "nerede"],
  },
];

export const CATEGORY_LABELS: Record<FaqCategory, string> = {
  getting_started: "Getting started",
  coaches: "Coaches",
  instant_ai: "Instant AI",
  tokens_payments: "Tokens & payments",
  account: "Account",
  safety: "Safety",
  refunds: "Refunds",
};

const CATEGORY_LABELS_TR: Record<FaqCategory, string> = {
  getting_started: "Başlangıç",
  coaches: "Koçlar",
  instant_ai: "Instant AI",
  tokens_payments: "Tokenlar ve ödemeler",
  account: "Hesap",
  safety: "Güvenlik",
  refunds: "İadeler",
};

const FAQ_LOCALE_DATA = {
  en: {
    allFaqs: ALL_FAQS,
    miniFaqs: MINI_FAQS,
    coachProfileFaq: coachProfileFAQ,
    faqItems: FAQ_ITEMS,
    categoryLabels: CATEGORY_LABELS,
  },
  tr: {
    allFaqs: ALL_FAQS_TR,
    miniFaqs: MINI_FAQS_TR,
    coachProfileFaq: coachProfileFAQ_TR,
    faqItems: FAQ_ITEMS_TR,
    categoryLabels: CATEGORY_LABELS_TR,
  },
} as const;

function getFaqLocaleData(locale: Locale = DEFAULT_LOCALE) {
  return FAQ_LOCALE_DATA[locale] ?? FAQ_LOCALE_DATA.en;
}

export function getAllFaqs(locale: Locale = DEFAULT_LOCALE): FAQItem[] {
  return getFaqLocaleData(locale).allFaqs;
}

export function getMiniFaqs(locale: Locale = DEFAULT_LOCALE): FAQItem[] {
  return getFaqLocaleData(locale).miniFaqs;
}

export function getCoachProfileFaq(locale: Locale = DEFAULT_LOCALE): FAQItem[] {
  return getFaqLocaleData(locale).coachProfileFaq;
}

export function getFaqItems(locale: Locale = DEFAULT_LOCALE): FaqItem[] {
  return getFaqLocaleData(locale).faqItems;
}

export function getCategoryLabels(locale: Locale = DEFAULT_LOCALE): Record<FaqCategory, string> {
  return getFaqLocaleData(locale).categoryLabels;
}

export function getFaqItemsByCategory(
  category: FaqCategory | "all",
  locale: Locale = DEFAULT_LOCALE
): FaqItem[] {
  const items = getFaqItems(locale);
  if (category === "all") return items;
  return items.filter((item) => item.category === category);
}

export function searchFaqItems(query: string, locale: Locale = DEFAULT_LOCALE): FaqItem[] {
  const items = getFaqItems(locale);
  if (!query.trim()) return items;

  const lowerQuery = query.toLowerCase();
  return items.filter((item) => {
    return (
      item.question.toLowerCase().includes(lowerQuery) ||
      item.answer.toLowerCase().includes(lowerQuery) ||
      item.keywords.some((keyword) => keyword.toLowerCase().includes(lowerQuery))
    );
  });
}

export function getCategoryCount(
  category: FaqCategory | "all",
  locale: Locale = DEFAULT_LOCALE
): number {
  return getFaqItemsByCategory(category, locale).length;
}
