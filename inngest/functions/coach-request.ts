/**
 * Inngest function to process coach requests
 * Generates course content asynchronously and triggers PDF generation
 */

import { inngest } from "../client";
import { prisma } from "@/lib/db";
import { generateAndSaveCourse, CourseGenerationOptions } from "@/lib/course-generator";

type CoachRequestedEvent = {
  name: "coach/requested";
  data: {
    requestId: string;
    userId: string;
    coachId: string;
    coachSlug: string;
    goal: string;
    level: string;
    trainingType: string;
    equipment: string;
    daysPerWeek: number;
    notes?: string | null;
  };
};

/**
 * Map coach request form fields to course generation options
 */
function mapCoachRequestToCourseOptions(data: CoachRequestedEvent["data"]): CourseGenerationOptions {
  // Map trainingType to workoutTypes
  const workoutTypesMap: Record<string, string[]> = {
    Home: [
      "Home Minimal Equipment",
      "Calisthenics (Bodyweight)",
      "Resistance Bands / Mini-bands",
    ],
    Gym: [
      "Full-Body Strength",
      "Upper/Lower Split",
      "Push / Pull / Legs (PPL)",
    ],
    Mixed: [
      "Home Minimal Equipment",
      "Full-Body Strength",
      "Upper/Lower Split",
    ],
  };

  // Map goal to targetMuscles
  const targetMusclesMap: Record<string, string[]> = {
    Strength: ["full_body"],
    "Fat loss": ["full_body", "core"],
    Mobility: ["shoulders", "hips", "back"],
    Endurance: ["legs", "cardio"],
    Posture: ["upper_back", "core"],
  };

  const workoutTypes = workoutTypesMap[data.trainingType] || workoutTypesMap["Mixed"];
  const targetMuscles = targetMusclesMap[data.goal] || ["full_body"];

  // Map equipment to specialEquipment
  const specialEquipment = data.equipment === "Full gym";

  return {
    userId: data.userId,
    weeks: 4, // Default to 4 weeks
    sessionsPerWeek: data.daysPerWeek,
    injurySafe: true, // Conservative default
    specialEquipment,
    nutritionTips: false, // Can be enabled later if needed
    pdf: "text",
    images: 6, // Default to 6 images
    workoutTypes,
    targetMuscles,
    gender: "male", // Default - should be added to form later
    notes: data.notes || undefined,
  };
}

export const processCoachRequest = inngest.createFunction(
  {
    id: "process-coach-request",
    name: "Process Coach Request",
    retries: 2,
  },
  { event: "coach/requested" },
  async ({ event, step }) => {
    const { requestId, userId } = event.data;

    // Step 1: Update request status to processing
    await step.run("update-status-processing", async () => {
      await prisma.coachRequest.update({
        where: { id: requestId },
        data: { status: "processing" },
      });
      console.log(`Coach request ${requestId} status updated to processing`);
      return { status: "processing" };
    });

    // Step 2: Map coach request to course options and generate course
    const course = await step.run("generate-course", async () => {
      try {
        const courseOptions = mapCoachRequestToCourseOptions(event.data);
        console.log("Generating course for coach request", {
          requestId,
          courseOptions: {
            weeks: courseOptions.weeks,
            sessionsPerWeek: courseOptions.sessionsPerWeek,
            workoutTypes: courseOptions.workoutTypes,
            targetMuscles: courseOptions.targetMuscles,
          },
        });

        const generatedCourse = await generateAndSaveCourse(courseOptions);
        console.log(`Course generated successfully: ${generatedCourse.id}`);

        return generatedCourse;
      } catch (error) {
        console.error("Error generating course:", error);
        // Update request status to failed
        await prisma.coachRequest.update({
          where: { id: requestId },
          data: {
            status: "failed",
            error: error instanceof Error ? error.message : String(error),
          },
        });
        throw error;
      }
    });

    // Step 3: Update request with courseId and trigger PDF generation
    await step.run("update-request-complete", async () => {
      // Update request status to done and link course
      await prisma.coachRequest.update({
        where: { id: requestId },
        data: {
          status: "done",
          courseId: course.id,
        },
      });
      console.log(`Coach request ${requestId} completed, course: ${course.id}`);

      // Trigger PDF generation (async, don't wait)
      inngest.send({
        name: "pdf/generate",
        data: {
          courseId: course.id,
          userId,
        },
      }).catch((error) => {
        console.error(`Failed to trigger PDF generation for course ${course.id}:`, error);
      });

      return { courseId: course.id, status: "done" };
    });

    return {
      success: true,
      requestId,
      courseId: course.id,
      message: "Coach request processed successfully",
    };
  }
);

