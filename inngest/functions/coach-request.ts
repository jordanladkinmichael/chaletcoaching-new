/**
 * Inngest function to process coach requests.
 * Generates course content asynchronously, triggers PDF generation,
 * then waits until availableAt before marking as "done".
 */

import { inngest } from "../client";
import { prisma } from "@/lib/db";
import {
  generateAndSaveCourse,
  CourseGenerationOptions,
} from "@/lib/course-generator";
import { sendCourseEmailByUrl } from "@/lib/email/course-email";

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
    availableAt?: string; // ISO string for when the course becomes available
  };
};

/**
 * Map coach request form fields to course generation options
 */
function mapCoachRequestToCourseOptions(
  data: CoachRequestedEvent["data"]
): CourseGenerationOptions {
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

  const targetMusclesMap: Record<string, string[]> = {
    Strength: ["full_body"],
    "Fat loss": ["full_body", "core"],
    Mobility: ["shoulders", "hips", "back"],
    Endurance: ["legs", "cardio"],
    Posture: ["upper_back", "core"],
  };

  const workoutTypes =
    workoutTypesMap[data.trainingType] || workoutTypesMap["Mixed"];
  const targetMuscles = targetMusclesMap[data.goal] || ["full_body"];
  const specialEquipment = data.equipment === "Full gym";

  return {
    userId: data.userId,
    weeks: 4,
    sessionsPerWeek: data.daysPerWeek,
    injurySafe: true,
    specialEquipment,
    nutritionTips: false,
    pdf: "text",
    images: 6,
    workoutTypes,
    targetMuscles,
    gender: "male",
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
      console.log(
        `Coach request ${requestId} status updated to processing`
      );
      return { status: "processing" };
    });

    // Step 2: Generate the course
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

    // Step 3: Link course to request (keep status as "processing")
    await step.run("link-course-to-request", async () => {
      await prisma.coachRequest.update({
        where: { id: requestId },
        data: {
          courseId: course.id,
          // Status stays "processing" — will become "done" after availableAt
        },
      });
      console.log(
        `Coach request ${requestId} linked to course: ${course.id}, status remains processing`
      );
      return { courseId: course.id };
    });

    // Step 4: Trigger PDF generation
    await step.run("trigger-pdf-generation", async () => {
      console.log(
        `[Coach Request] Triggering PDF generation for course ${course.id}`
      );
      await inngest.send({
        name: "pdf/generate",
        data: {
          courseId: course.id,
          userId,
        },
      });
      console.log(
        `[Coach Request] PDF generation event sent successfully for course ${course.id}`
      );
      return { pdfTriggered: true };
    });

    // Step 5: Wait until availableAt before marking as done
    const availableAt = event.data.availableAt;
    if (availableAt) {
      const availableDate = new Date(availableAt);
      const now = new Date();
      if (availableDate > now) {
        console.log(
          `[Coach Request] Waiting until ${availableAt} before marking as done`
        );
        await step.sleepUntil("wait-until-available", availableDate);
      }
    }

    // Step 6: Mark as "done" (only after availableAt has passed)
    await step.run("mark-as-done", async () => {
      await prisma.coachRequest.update({
        where: { id: requestId },
        data: { status: "done" },
      });
      console.log(
        `Coach request ${requestId} marked as done (available for download)`
      );
      return { status: "done" };
    });

    // Step 7: Send email with PDF (after availableAt)
    if (availableAt) {
      await step.run("send-course-email", async () => {
        console.log(
          `[Coach Request] Sending email for course ${course.id}`
        );

        const courseWithPdf = await prisma.course.findUnique({
          where: { id: course.id },
          select: {
            id: true,
            title: true,
            pdfUrl: true,
            createdAt: true,
            options: true,
          },
        });

        if (!courseWithPdf || !courseWithPdf.pdfUrl) {
          console.warn(
            `[Coach Request] Course ${course.id} has no PDF URL, skipping email`
          );
          return { emailSent: false, reason: "no_pdf_url" };
        }

        const options =
          typeof courseWithPdf.options === "string"
            ? JSON.parse(courseWithPdf.options)
            : courseWithPdf.options;

        const emailSent = await sendCourseEmailByUrl({
          courseId: course.id,
          userId,
          pdfUrl: courseWithPdf.pdfUrl,
          courseTitle: courseWithPdf.title || "Fitness Program",
          createdAt: courseWithPdf.createdAt,
          options: {
            weeks: options?.weeks,
            sessionsPerWeek: options?.sessionsPerWeek,
          },
        });

        console.log(
          `[Coach Request] Email sent for course ${course.id}: ${emailSent}`
        );
        return { emailSent };
      });
    }

    return {
      success: true,
      requestId,
      courseId: course.id,
      message: "Coach request processed successfully",
    };
  }
);
