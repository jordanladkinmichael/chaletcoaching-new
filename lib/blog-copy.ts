import type { Locale } from "@/lib/i18n/config";

export type BlogArticleSlug =
  | "knee-safe-lower-body-1"
  | "bands-only-hiit-30min"
  | "trx-posture-reset-back-core"
  | "glute-power-without-knee-pain";

type BlogArticleCopy = {
  slug: BlogArticleSlug;
  image: string;
  category: string;
  readTime: string;
  title: string;
  accent: string;
  subtitle?: string;
  description: string;
  alt: string;
  meta: string[];
  who: string[];
  equipment: string[];
  sessionTitle: string;
  blocks: Array<{
    title: string;
    body: string;
    items?: string[];
  }>;
  progressionTitle: string;
  progression: string;
  previous?: BlogArticleSlug;
  next?: BlogArticleSlug;
};

type BlogCopy = {
  indexTitle: string;
  indexSubtitle: string;
  read: string;
  backToBlog: string;
  previous: string;
  next: string;
  noPrevious: string;
  whoFor: string;
  equipment: string;
  metadata: {
    indexTitle: string;
    indexDescription: string;
  };
  articles: Record<BlogArticleSlug, BlogArticleCopy>;
};

const articlesEn: Record<BlogArticleSlug, BlogArticleCopy> = {
  "knee-safe-lower-body-1": {
    slug: "knee-safe-lower-body-1",
    image: "/images/athletes-box-squat-technique.webp",
    category: "Lower Body",
    readTime: "5-7 min read",
    title: "Knee-safe Lower Body Session #1",
    accent: "Lower Body",
    description:
      "Practical tips and alternatives to keep your knees comfortable while training legs at home or in the gym.",
    alt: "Home workout setup for knee-safe training",
    meta: ["40-45 min", "Beginner-Intermediate", "Minimal Equipment", "Knee-sensitive"],
    who: ["Beginner to intermediate level", "Training at home", "Minimal equipment", "Knee-sensitive individuals"],
    equipment: ["Chair or box, 40-50 cm", "1-2 dumbbells or kettlebell", "Mini-band"],
    sessionTitle: "Session (about 40-45 min)",
    blocks: [
      { title: "Warm-up (6 min)", body: "Cat-camel x6, hip hinge drill x8, ankle rocks x8/side, glute bridge x10 easy." },
      {
        title: "Main (24-26 min)",
        body: "Move with controlled tempo and keep knee travel comfortable.",
        items: [
          "Box squat to chair: 4x8, controlled 3-1-2-0 tempo, rest 90 s.",
          "DB Romanian deadlift: 4x10, rest 90 s.",
          "Step-back split squat, short range: 3x8/side, rest 75 s.",
          "Mini-band lateral walk: 3x12/side, rest 45 s.",
        ],
      },
      { title: "Finisher (4 min)", body: "EMOM x4: 20 s marching high knees plus 40 s easy walk, low impact." },
      { title: "Cool-down (4-5 min)", body: "Couch stretch 1 min/side, hamstring stretch 45 s/side, breathing 1 min." },
    ],
    progressionTitle: "Progression next time",
    progression: "Add 1-2 reps to box squat and RDL or add 2-4 kg total.",
    next: "bands-only-hiit-30min",
  },
  "bands-only-hiit-30min": {
    slug: "bands-only-hiit-30min",
    image: "/images/athletes-perfect-form.webp",
    category: "HIIT",
    readTime: "4-6 min read",
    title: "Bands-only HIIT - 30-min low-impact fat burn (Home)",
    accent: "HIIT",
    description: "Joint-friendly cardio and strength using only resistance bands.",
    alt: "Athletes demonstrating perfect form with resistance bands",
    meta: ["30-35 min", "Beginner-Intermediate", "Home Setup", "Joint-friendly"],
    who: ["Beginner to intermediate level", "Home setup training", "Joint-friendly cardio and strength", "Low-impact fat burn"],
    equipment: ["Long resistance band", "Mini-band", "Light dumbbells, optional"],
    sessionTitle: "Session (about 30-35 min)",
    blocks: [
      { title: "Warm-up (5-6 min)", body: "Cat-camel x6, hip hinge drill x8, ankle rocks x8/side, shoulder circles x10." },
      {
        title: "Main (22-24 min)",
        body: "Circuit x3 rounds: work 40 s, rest 20 s.",
        items: [
          "Banded good morning, hip hinge focus for hamstrings and glutes.",
          "Mini-band lateral walk, pelvis level and toes forward.",
          "Standing banded chest press, staggered stance and ribs down.",
          "Anchored banded row, elbows low-to-mid and squeeze the back.",
          "DB goblet hold march, core brace and slow steps.",
        ],
      },
      { title: "Finisher (3 min)", body: "Shadow boxing: 3x40 s on, 20 s off, low impact." },
      { title: "Cool-down (4-5 min)", body: "Couch stretch 45 s/side, hamstring stretch 45 s/side, box breathing 1 min." },
    ],
    progressionTitle: "Progression",
    progression: "Add one round or increase band tension by 10-15%.",
    previous: "knee-safe-lower-body-1",
    next: "trx-posture-reset-back-core",
  },
  "trx-posture-reset-back-core": {
    slug: "trx-posture-reset-back-core",
    image: "/images/trx-row-precision.webp",
    category: "Posture",
    readTime: "5-7 min read",
    title: "TRX Posture Reset - Back & Core for desk workers",
    accent: "Posture Reset",
    description: "Reset your posture and strengthen back/core muscles using suspension training.",
    alt: "TRX row exercise demonstrating precision and form",
    meta: ["40-45 min", "All Levels", "TRX/Suspension", "Desk Workers"],
    who: ["Rounded-shoulder posture", "Back and core work without knee stress", "Desk workers and office professionals", "All fitness levels"],
    equipment: ["TRX or suspension straps", "Mat", "Light dumbbell, optional"],
    sessionTitle: "Session (about 40-45 min)",
    blocks: [
      { title: "Warm-up (6 min)", body: "Thoracic rotations x6/side, scapular wall slides x8, glute bridges x10." },
      {
        title: "Main (26-28 min)",
        body: "Keep ribs stacked and shoulders down during each pull.",
        items: [
          "TRX row: 4x10-12, rest 75 s.",
          "TRX Y-raise: 3x10, rest 60 s.",
          "Pallof press with cable or band: 3x12/side, rest 45 s.",
          "TRX hamstring curl: 3x8-12, rest 75 s.",
        ],
      },
      { title: "Finisher (4 min)", body: "20 s high-arm march plus 40 s easy breathing x4." },
      { title: "Cool-down (5 min)", body: "Pec doorway stretch 45 s/side, long spine decompression 60 s, nasal breathing 1 min." },
    ],
    progressionTitle: "Progression",
    progression: "Reduce your body angle during TRX movements or add one set.",
    previous: "bands-only-hiit-30min",
    next: "glute-power-without-knee-pain",
  },
  "glute-power-without-knee-pain": {
    slug: "glute-power-without-knee-pain",
    image: "/images/powerful-glute-thrust.webp",
    category: "Glutes",
    readTime: "5-7 min read",
    title: "Glute Power without Knee Pain - Hinges & Hip Thrusts",
    accent: "Power",
    description: "Build powerful glutes with minimal knee stress using hip hinges and thrust movements.",
    alt: "Powerful glute thrust exercise demonstration",
    meta: ["40-45 min", "All Levels", "Gym/Home", "Knee-safe"],
    who: ["Strong glutes with minimal knee stress", "Gym or home with a bench", "All fitness levels", "Hip hinge movement focus"],
    equipment: ["Bench or sofa edge", "Barbell or dumbbell", "Mini-band"],
    sessionTitle: "Session (about 40-45 min)",
    blocks: [
      { title: "Warm-up (6 min)", body: "Assisted hip airplanes x4/side, cat-camel x6, band external rotations x12." },
      {
        title: "Main (26-28 min)",
        body: "Prioritize hip extension and hamstring tension without forcing knee range.",
        items: [
          "Barbell or DB hip thrust: 4x8-10, rest 90 s.",
          "Romanian deadlift with DB or barbell: 4x8-10, rest 90 s.",
          "45-degree back extension, controlled: 3x10-12, rest 75 s.",
          "Mini-band abduction, standing or side-lying: 3x15/side, rest 45 s.",
        ],
      },
      { title: "Finisher (4 min)", body: "EMOM x4: 20 s glute bridge hold plus 40 s rest." },
      { title: "Cool-down (5 min)", body: "Piriformis stretch 45 s/side, hamstring stretch 45 s/side, box breathing 1 min." },
    ],
    progressionTitle: "Progression",
    progression: "Increase thrust/RDL load by 2-5 kg or add one set to back extension.",
    previous: "trx-posture-reset-back-core",
  },
};

const articlesTr: Record<BlogArticleSlug, BlogArticleCopy> = {
  "knee-safe-lower-body-1": {
    ...articlesEn["knee-safe-lower-body-1"],
    category: "Alt Vücut",
    readTime: "5-7 dk okuma",
    title: "Diz Dostu Alt Vücut Seansı #1",
    accent: "Alt Vücut",
    description: "Evde veya spor salonunda bacak çalışırken dizleri rahat tutmak için pratik alternatifler.",
    alt: "Diz dostu antrenman için ev egzersiz düzeni",
    meta: ["40-45 dk", "Başlangıç-Orta", "Minimum ekipman", "Diz hassasiyeti"],
    who: ["Başlangıçtan orta seviyeye", "Evde antrenman", "Minimum ekipman", "Diz hassasiyeti olanlar"],
    equipment: ["Sandalye veya kutu, 40-50 cm", "1-2 dumbbell veya kettlebell", "Mini bant"],
    sessionTitle: "Seans (yaklaşık 40-45 dk)",
    blocks: [
      { title: "Isınma (6 dk)", body: "Cat-camel x6, kalça menteşe drili x8, ayak bileği rock x8/taraf, kolay glute bridge x10." },
      { title: "Ana bölüm (24-26 dk)", body: "Kontrollü tempo kullanın ve diz hareket aralığını rahat tutun.", items: ["Sandalyeye box squat: 4x8, kontrollü 3-1-2-0 tempo.", "DB Romanian deadlift: 4x10.", "Geri adım split squat, kısa aralık: 3x8/taraf.", "Mini bant lateral yürüyüş: 3x12/taraf."] },
      { title: "Bitirici (4 dk)", body: "EMOM x4: 20 sn yüksek diz yürüyüşü + 40 sn kolay yürüyüş." },
      { title: "Soğuma (4-5 dk)", body: "Couch stretch 1 dk/taraf, hamstring stretch 45 sn/taraf, nefes 1 dk." },
    ],
    progressionTitle: "Bir sonraki ilerleme",
    progression: "Box squat ve RDL için 1-2 tekrar ekleyin veya toplam 2-4 kg artırın.",
  },
  "bands-only-hiit-30min": {
    ...articlesEn["bands-only-hiit-30min"],
    category: "HIIT",
    readTime: "4-6 dk okuma",
    title: "Sadece Bantla HIIT - Evde 30 dk düşük etkili yağ yakımı",
    description: "Sadece direnç bantlarıyla eklem dostu kardiyo ve güç çalışması.",
    alt: "Direnç bantlarıyla doğru form gösteren sporcular",
    meta: ["30-35 dk", "Başlangıç-Orta", "Ev düzeni", "Eklem dostu"],
    who: ["Başlangıçtan orta seviyeye", "Evde antrenman", "Eklem dostu kardiyo ve güç", "Düşük etkili yağ yakımı"],
    equipment: ["Uzun direnç bandı", "Mini bant", "Hafif dumbbell, opsiyonel"],
    sessionTitle: "Seans (yaklaşık 30-35 dk)",
    blocks: [
      { title: "Isınma (5-6 dk)", body: "Cat-camel x6, kalça menteşe drili x8, ayak bileği rock x8/taraf, omuz daireleri x10." },
      { title: "Ana bölüm (22-24 dk)", body: "3 tur devre: 40 sn çalışma, 20 sn dinlenme.", items: ["Bantlı good morning.", "Mini bant lateral yürüyüş.", "Ayakta bantlı chest press.", "Sabitlenmiş bantlı row.", "DB goblet hold march."] },
      { title: "Bitirici (3 dk)", body: "Shadow boxing: 3x40 sn çalışma, 20 sn dinlenme." },
      { title: "Soğuma (4-5 dk)", body: "Couch stretch 45 sn/taraf, hamstring stretch 45 sn/taraf, box breathing 1 dk." },
    ],
    progressionTitle: "İlerleme",
    progression: "Bir tur ekleyin veya bant gerginliğini %10-15 artırın.",
  },
  "trx-posture-reset-back-core": {
    ...articlesEn["trx-posture-reset-back-core"],
    category: "Postür",
    readTime: "5-7 dk okuma",
    title: "TRX Postür Reset - Masa başı çalışanlar için sırt ve core",
    accent: "Postür Reset",
    description: "Suspension training ile postürü resetleyin, sırt ve core kaslarını güçlendirin.",
    alt: "TRX row egzersizinde form ve kontrol",
    meta: ["40-45 dk", "Tüm seviyeler", "TRX/Suspension", "Masa başı çalışanlar"],
    who: ["Yuvarlanan omuz postürü", "Diz stresi olmadan sırt ve core", "Masa başı çalışanlar", "Tüm fitness seviyeleri"],
    equipment: ["TRX veya suspension strap", "Mat", "Hafif dumbbell, opsiyonel"],
    sessionTitle: "Seans (yaklaşık 40-45 dk)",
    blocks: [
      { title: "Isınma (6 dk)", body: "Torakal rotasyon x6/taraf, scapular wall slide x8, glute bridge x10." },
      { title: "Ana bölüm (26-28 dk)", body: "Her çekişte kaburgaları hizalı, omuzları aşağıda tutun.", items: ["TRX row: 4x10-12.", "TRX Y-raise: 3x10.", "Pallof press: 3x12/taraf.", "TRX hamstring curl: 3x8-12."] },
      { title: "Bitirici (4 dk)", body: "20 sn yüksek kol yürüyüşü + 40 sn rahat nefes x4." },
      { title: "Soğuma (5 dk)", body: "Göğüs kapı esnetmesi 45 sn/taraf, omurga rahatlatma 60 sn, burundan nefes 1 dk." },
    ],
    progressionTitle: "İlerleme",
    progression: "TRX hareketlerinde vücut açısını azaltın veya bir set ekleyin.",
  },
  "glute-power-without-knee-pain": {
    ...articlesEn["glute-power-without-knee-pain"],
    category: "Kalça",
    readTime: "5-7 dk okuma",
    title: "Diz Ağrısı Olmadan Kalça Gücü - Hinge ve Hip Thrust",
    accent: "Güç",
    description: "Hip hinge ve thrust hareketleriyle diz stresini azaltarak güçlü kalçalar oluşturun.",
    alt: "Güçlü hip thrust egzersizi gösterimi",
    meta: ["40-45 dk", "Tüm seviyeler", "Salon/Ev", "Diz dostu"],
    who: ["Diz stresi az güçlü kalçalar", "Bench ile salon veya ev", "Tüm fitness seviyeleri", "Hip hinge odağı"],
    equipment: ["Bench veya koltuk kenarı", "Barbell veya dumbbell", "Mini bant"],
    sessionTitle: "Seans (yaklaşık 40-45 dk)",
    blocks: [
      { title: "Isınma (6 dk)", body: "Destekli hip airplane x4/taraf, cat-camel x6, bant external rotation x12." },
      { title: "Ana bölüm (26-28 dk)", body: "Diz aralığını zorlamadan kalça ekstansiyonuna ve hamstring gerilimine odaklanın.", items: ["Barbell veya DB hip thrust: 4x8-10.", "DB veya barbell RDL: 4x8-10.", "45 derece back extension: 3x10-12.", "Mini bant abduction: 3x15/taraf."] },
      { title: "Bitirici (4 dk)", body: "EMOM x4: 20 sn glute bridge hold + 40 sn dinlenme." },
      { title: "Soğuma (5 dk)", body: "Piriformis stretch 45 sn/taraf, hamstring stretch 45 sn/taraf, box breathing 1 dk." },
    ],
    progressionTitle: "İlerleme",
    progression: "Thrust/RDL yükünü 2-5 kg artırın veya back extension için bir set ekleyin.",
  },
};

export const BLOG_COPY: Record<Locale, BlogCopy> = {
  en: {
    indexTitle: "Blog",
    indexSubtitle: "Latest insights on fitness, AI training, and wellness.",
    read: "Read",
    backToBlog: "Back to Blog",
    previous: "Previous:",
    next: "Next:",
    noPrevious: "No previous posts",
    whoFor: "Who it's for",
    equipment: "Equipment needed",
    metadata: {
      indexTitle: "Blog - Chaletcoaching",
      indexDescription: "Fitness, AI training, and wellness articles from Chaletcoaching.",
    },
    articles: articlesEn,
  },
  tr: {
    indexTitle: "Blog",
    indexSubtitle: "Fitness, AI antrenman ve iyi yaşam üzerine en yeni içerikler.",
    read: "Oku",
    backToBlog: "Blog'a dön",
    previous: "Önceki:",
    next: "Sonraki:",
    noPrevious: "Önceki yazı yok",
    whoFor: "Kimler için",
    equipment: "Gerekli ekipman",
    metadata: {
      indexTitle: "Blog - Chaletcoaching",
      indexDescription: "Chaletcoaching'den fitness, AI antrenman ve iyi yaşam yazıları.",
    },
    articles: articlesTr,
  },
};

export function getBlogCopy(locale: Locale) {
  return BLOG_COPY[locale] ?? BLOG_COPY.en;
}

export function getBlogArticle(locale: Locale, slug: BlogArticleSlug) {
  return getBlogCopy(locale).articles[slug];
}
