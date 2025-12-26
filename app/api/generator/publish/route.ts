import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { generateWorkoutPlan, generateFitnessImages, generateNutritionAdvice, FitnessContentRequest } from "@/lib/openai";
import { generateCourseTitle, calcFullCourseTokens } from "@/lib/tokens";
import { prisma } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    // Проверяем аутентификацию
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    console.log("Received request body:", body);
    
    // Извлекаем опции из body.opts или напрямую из body
    const opts = body.opts || body;
    const { weeks, sessionsPerWeek, injurySafe, specialEquipment, nutritionTips, workoutTypes, targetMuscles, gender, images, pdf } = opts;

    console.log("Extracted options:", { weeks, sessionsPerWeek, injurySafe, specialEquipment, nutritionTips, workoutTypes, targetMuscles, gender, images, pdf });

    // Валидация входных данных
    if (!weeks || !sessionsPerWeek || !workoutTypes || !targetMuscles || !gender) {
      return NextResponse.json({ 
        error: "Missing required fields", 
        received: { weeks, sessionsPerWeek, workoutTypes, targetMuscles, gender },
        required: ["weeks", "sessionsPerWeek", "workoutTypes", "targetMuscles", "gender"]
      }, { status: 400 });
    }

    // Создаем запрос для OpenAI
    const fitnessRequest: FitnessContentRequest = {
      weeks,
      sessionsPerWeek,
      injurySafe: injurySafe || false,
      specialEquipment: specialEquipment || false,
      nutritionTips: nutritionTips || false,
      workoutTypes,
      targetMuscles,
      gender,
    };

    console.log("Fitness request:", fitnessRequest);

    // Генерируем полный контент с OpenAI
    const [workoutPlan, imageUrls, nutritionAdvice] = await Promise.all([
      generateWorkoutPlan(fitnessRequest),
      images > 0 ? generateFitnessImages(fitnessRequest, images) : Promise.resolve([]),
      nutritionTips ? generateNutritionAdvice(fitnessRequest) : Promise.resolve("")
    ]);

    // Рассчитываем стоимость токенов
    const tokensRequired = calcFullCourseTokens({
      weeks,
      sessionsPerWeek,
      injurySafe,
      specialEquipment,
      nutritionTips,
      pdf: pdf || "text", // PDF always included, default to "text"
      images: images || 0,
      workoutTypes,
      targetMuscles,
      gender,
    });

    // Проверяем баланс токенов пользователя
    const userTransactions = await prisma.transaction.aggregate({
      where: { userId: session.user.id },
      _sum: { amount: true },
    });
    const userBalance = userTransactions._sum.amount ?? 0;

    if (userBalance < tokensRequired) {
      return NextResponse.json({ 
        error: "Insufficient tokens", 
        required: tokensRequired,
        available: userBalance 
      }, { status: 400 });
    }

    // Создаем полный курс
    const fullCourse = {
      title: generateCourseTitle(fitnessRequest),
      description: `Comprehensive ${weeks}-week fitness program with ${workoutTypes.join(', ')} focus on ${targetMuscles.join(', ')}`,
      options: fitnessRequest,
      content: workoutPlan,
      images: imageUrls,
      nutritionAdvice: nutritionAdvice || undefined,
      createdAt: new Date().toISOString(),
      type: "full",
      userId: session.user.id,
      pdf: pdf || "text", // PDF always included, default to "text"
    };

    // Сохраняем курс в базу данных
    const savedCourse = await prisma.course.create({
      data: {
        userId: session.user.id,
        title: fullCourse.title,
        options: JSON.stringify(fitnessRequest),
        tokensSpent: tokensRequired,
        content: workoutPlan,
        images: JSON.stringify(imageUrls),
        nutritionAdvice: nutritionAdvice || null,
      },
    });

    // Списываем токены
    await prisma.transaction.create({
      data: {
        userId: session.user.id,
        type: "spend",
        amount: -tokensRequired,
        meta: JSON.stringify({
          reason: "course_generation",
          courseId: savedCourse.id,
          courseTitle: fullCourse.title,
          options: fitnessRequest,
        }),
      },
    });

    return NextResponse.json({
      success: true,
      course: {
        ...fullCourse,
        id: savedCourse.id,
      },
      courseId: savedCourse.id,
      tokensSpent: tokensRequired,
      remainingBalance: userBalance - tokensRequired,
      message: "Full course generated and published successfully"
    });

  } catch (error) {
    console.error("Error publishing course:", error);
    return NextResponse.json(
      { error: "Failed to publish course" },
      { status: 500 }
    );
  }
}
