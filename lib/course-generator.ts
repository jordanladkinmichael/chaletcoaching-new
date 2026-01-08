/**
 * Shared course generation logic
 * Used by both /api/courses/publish and Inngest coach request handler
 */

import { prisma } from "@/lib/db";
import { generateWorkoutPlan, generateFitnessImages, generateNutritionAdvice, FitnessContentRequest } from "@/lib/openai";
import { generateCourseTitle, type GeneratorOpts } from "@/lib/tokens";

export interface CourseGenerationOptions {
  userId: string;
  weeks?: number;
  sessionsPerWeek: number;
  injurySafe?: boolean;
  specialEquipment?: boolean;
  nutritionTips?: boolean;
  pdf?: "none" | "text" | "illustrated";
  images?: number;
  workoutTypes: string[];
  targetMuscles: string[];
  gender: "male" | "female";
  title?: string;
  notes?: string; // Additional context from coach request
}

export interface GeneratedCourse {
  id: string;
  title: string;
  content: string;
  images: string[];
  nutritionAdvice: string | null;
}

/**
 * Generate a course using OpenAI and save to database
 */
export async function generateAndSaveCourse(
  options: CourseGenerationOptions
): Promise<GeneratedCourse> {
  const {
    userId,
    weeks = 4,
    sessionsPerWeek,
    injurySafe = true,
    specialEquipment = false,
    nutritionTips = false,
    pdf = "text",
    images = 6,
    workoutTypes,
    targetMuscles,
    gender,
    title,
    notes,
  } = options;

  // Create fitness request for OpenAI
  const fitnessRequest: FitnessContentRequest = {
    weeks,
    sessionsPerWeek,
    injurySafe,
    specialEquipment,
    nutritionTips,
    workoutTypes,
    targetMuscles,
    gender,
  };

  // Add notes as additional context if provided (for coach requests)
  const contextPrompt = notes 
    ? `\n\nAdditional context from user: ${notes}\n\nPlease incorporate this information into the workout plan.`
    : "";

  console.log("Generating course content via OpenAI API", {
    weeks,
    sessionsPerWeek,
    workoutTypes,
    targetMuscles,
    hasNotes: !!notes,
  });

  // Generate content via OpenAI
  const [workoutPlan, imageUrls, nutritionAdvice] = await Promise.all([
    generateWorkoutPlan(fitnessRequest, contextPrompt || undefined),
    images > 0 ? generateFitnessImages(fitnessRequest, images) : Promise.resolve([]),
    nutritionTips ? generateNutritionAdvice(fitnessRequest) : Promise.resolve(""),
  ]);

  console.log("OpenAI content generated successfully:", {
    workoutPlanLength: workoutPlan.length,
    imagesCount: imageUrls.length,
    hasNutrition: !!nutritionAdvice,
  });

  // Generate course title
  const courseTitle = title ?? generateCourseTitle({
    weeks,
    sessionsPerWeek,
    injurySafe,
    specialEquipment,
    nutritionTips,
    pdf,
    images,
    workoutTypes,
    targetMuscles,
    gender,
  } as GeneratorOpts);

  // Save course to database
  const course = await prisma.course.create({
    data: {
      userId,
      title: courseTitle,
      options: JSON.stringify({
        weeks,
        sessionsPerWeek,
        injurySafe,
        specialEquipment,
        nutritionTips,
        pdf,
        images,
        workoutTypes,
        targetMuscles,
        gender,
      }),
      tokensSpent: 0, // Will be set by caller if needed
      content: workoutPlan,
      images: JSON.stringify(imageUrls),
      nutritionAdvice: nutritionAdvice || null,
    },
    select: { id: true },
  });

  return {
    id: course.id,
    title: courseTitle,
    content: workoutPlan,
    images: imageUrls,
    nutritionAdvice: nutritionAdvice || null,
  };
}

