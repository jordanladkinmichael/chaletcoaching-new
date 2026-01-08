import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { calcFullCourseTokens, generateCourseTitle } from "@/lib/tokens";
import { generateWorkoutPlan, generateFitnessImages, generateNutritionAdvice, FitnessContentRequest } from "@/lib/openai";
import { inngest } from "@/inngest/client";

// Валидируем опции генератора и даём дефолты
const Opts = z.object({
  weeks: z.coerce.number().int().min(1).max(52).default(4),
  sessionsPerWeek: z.coerce.number().int().min(1).max(14).default(4),
  injurySafe: z.boolean().optional().default(false),
  specialEquipment: z.boolean().optional().default(false),
  nutritionTips: z.boolean().optional().default(false),
  pdf: z.enum(["none", "text", "illustrated"]).optional().default("none"),
  images: z.coerce.number().int().min(0).max(50).optional().default(0),
  videoPlan: z.boolean().optional().default(false),
  gender: z.enum(["male", "female"]).optional().default("male"),
  workoutTypes: z.array(z.string()).optional().default([]),
  targetMuscles: z.array(z.string()).optional().default([]),
});

const Body = z.object({
  opts: Opts,
  title: z.string().min(1).max(120).optional(), // можно не присылать
});

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const json = await req.json().catch(() => null);
  const parsed = Body.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid body", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { opts, title } = parsed.data;
  const cost = calcFullCourseTokens(opts);

  // Проверим текущий баланс
  const sum = await prisma.transaction.aggregate({
    where: { userId: session.user.id },
    _sum: { amount: true },
  });
  const balance = sum._sum.amount ?? 0;
  if (balance < cost) {
    return NextResponse.json(
      { error: "Not enough tokens", balance },
      { status: 400 }
    );
  }

  // Списываем токены одной транзакцией
  const tx = await prisma.transaction.create({
    data: {
      userId: session.user.id,
      type: "spend",
      amount: -cost,
      meta: JSON.stringify({ reason: "publish", opts }),
    },
    select: { id: true },
  });

  // Генерируем контент через OpenAI API
  console.log("Generating content via OpenAI API for course");
  
  // Создаем запрос для OpenAI
  const fitnessRequest: FitnessContentRequest = {
    weeks: opts.weeks,
    sessionsPerWeek: opts.sessionsPerWeek,
    injurySafe: opts.injurySafe || false,
    specialEquipment: opts.specialEquipment || false,
    nutritionTips: opts.nutritionTips || false,
    workoutTypes: opts.workoutTypes || [],
    targetMuscles: opts.targetMuscles || [],
    gender: opts.gender || "male",
  };

  // Генерируем полный контент с OpenAI
  const [workoutPlan, imageUrls, nutritionAdvice] = await Promise.all([
    generateWorkoutPlan(fitnessRequest),
    opts.images > 0 ? generateFitnessImages(fitnessRequest, opts.images) : Promise.resolve([]),
    opts.nutritionTips ? generateNutritionAdvice(fitnessRequest) : Promise.resolve("")
  ]);

  console.log("OpenAI content generated successfully:", {
    workoutPlanLength: workoutPlan.length,
    imagesCount: imageUrls.length,
    hasNutrition: !!nutritionAdvice
  });

  // Создаём запись курса с сгенерированным контентом
  const course = await prisma.course.create({
    data: {
      userId: session.user.id,
      title: title ?? generateCourseTitle(opts),
      options: JSON.stringify(opts),
      tokensSpent: cost,
      pdfUrl: null,
      // Сохраняем сгенерированный контент
      content: workoutPlan,
      images: JSON.stringify(imageUrls),
      nutritionAdvice: nutritionAdvice || null,
    },
    select: { id: true },
  });

  // Автоматически запускаем генерацию PDF через Inngest (асинхронно, не ждем завершения)
  inngest.send({
    name: "pdf/generate",
    data: {
      courseId: course.id,
      userId: session.user.id,
    },
  }).catch((error) => {
    // Логируем ошибку, но не прерываем процесс создания курса
    console.error("Failed to trigger PDF generation:", error);
  });

  // Возвращаем новый баланс
  const sum2 = await prisma.transaction.aggregate({
    where: { userId: session.user.id },
    _sum: { amount: true },
  });

  return NextResponse.json({
    ok: true,
    txId: tx.id,
    courseId: course.id,
    balance: sum2._sum.amount ?? 0,
  });
}
