import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { generateWorkoutPlan, generateFitnessImages, FitnessContentRequest } from "@/lib/openai";
import { prisma } from "@/lib/db";
import { generateCourseTitle } from "@/lib/tokens";

export async function POST(request: NextRequest) {
  try {
    // Проверяем аутентификацию
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    console.log("Received request body:", body);
    
    // Нормализуем входные данные: поддерживаем body, body.opts, body.options
    const raw = body?.opts || body?.options || body || {};
    const weeks = Number(raw.weeks);
    const sessionsPerWeek = Number(raw.sessionsPerWeek);
    const injurySafe = !!raw.injurySafe;
    const specialEquipment = !!raw.specialEquipment;
    const nutritionTips = !!raw.nutritionTips;
    const images = Number(raw.images ?? 0);
    const workoutTypes = Array.isArray(raw.workoutTypes) ? raw.workoutTypes : [];
    const targetMuscles = Array.isArray(raw.targetMuscles) ? raw.targetMuscles : [];
    const gender = raw.gender;

    console.log("Normalized options:", { weeks, sessionsPerWeek, injurySafe, specialEquipment, nutritionTips, workoutTypes, targetMuscles, gender, images });

    // Валидация входных данных
    if (!weeks || !sessionsPerWeek || !workoutTypes.length || !targetMuscles.length || !gender) {
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

    // Генерируем контент с OpenAI
    const [workoutPlan, imageUrls] = await Promise.all([
      generateWorkoutPlan(fitnessRequest),
      images > 0 ? generateFitnessImages(fitnessRequest, images) : Promise.resolve([])
    ]);

    // Создаем превью курс
    const previewCourse = {
      title: generateCourseTitle(fitnessRequest),
      description: workoutPlan.substring(0, 200) + "...",
      options: fitnessRequest,
      content: workoutPlan,
      images: imageUrls,
      createdAt: new Date().toISOString(),
      type: "preview",
      userId: session.user.email,
    };

    // Сохраняем в базу данных
    const savedPreview = await prisma.preview.create({
      data: {
        userId: session.user.id,
        options: JSON.stringify(fitnessRequest),
        tokensSpent: 0, // Preview не тратит токены
        result: JSON.stringify({
          workoutPlan,
          imageUrls,
          title: previewCourse.title,
          description: previewCourse.description
        }),
      },
    });

    console.log("Preview saved to database:", savedPreview.id);

    return NextResponse.json({
      success: true,
      course: previewCourse,
      previewId: savedPreview.id,
      message: "Preview generated successfully"
    });

  } catch (error) {
    console.error("Error generating preview:", error);
    return NextResponse.json(
      { error: "Failed to generate preview" },
      { status: 500 }
    );
  }
}
