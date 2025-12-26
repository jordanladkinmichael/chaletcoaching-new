import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { inngest } from "@/inngest/client";

export const runtime = 'nodejs';
export const maxDuration = 30; // Сократили, так как теперь используем Inngest

export async function POST(req: Request) {
  console.log("=== PDF GENERATION REQUEST ===");
  
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    console.log("❌ Unauthorized access attempt");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    console.log("✅ User authenticated:", session.user.id);
    const body = await req.json();
    const { courseId } = body;

    if (!courseId) {
      return NextResponse.json({ error: "Course ID is required" }, { status: 400 });
    }

    // Проверяем существование курса
    const course = await prisma.course.findFirst({
      where: {
        id: courseId,
        userId: session.user.id,
      },
      select: {
        id: true,
        title: true,
        pdfUrl: true,
      },
    });

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // Если PDF уже существует, возвращаем его
    if (course.pdfUrl) {
      console.log("PDF already exists for course:", courseId);
      return NextResponse.json({
        success: true,
        pdfUrl: course.pdfUrl,
        message: "PDF already generated",
        status: "completed",
      });
    }

    // Запускаем асинхронную генерацию через Inngest
    console.log("🚀 Triggering Inngest function for PDF generation");
    await inngest.send({
      name: "pdf/generate",
      data: {
        courseId,
        userId: session.user.id,
      },
    });

    console.log("✅ Inngest event sent successfully");

    return NextResponse.json({
      success: true,
      message: "PDF generation started",
      status: "processing",
      courseId,
    });

  } catch (error) {
    console.error("=== PDF GENERATION REQUEST FAILED ===", error);
    
    return NextResponse.json(
      { 
        error: "Failed to start PDF generation",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

// Endpoint для проверки статуса PDF (polling)
export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get("courseId");

    if (!courseId) {
      return NextResponse.json({ error: "Course ID is required" }, { status: 400 });
    }

    const course = await prisma.course.findFirst({
      where: {
        id: courseId,
        userId: session.user.id,
      },
      select: {
        id: true,
        pdfUrl: true,
      },
    });

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // Определяем статус по наличию pdfUrl
    const status = course.pdfUrl ? "completed" : "processing";

    return NextResponse.json({
      status,
      pdfUrl: course.pdfUrl || null,
      courseId,
    });
  } catch (error) {
    console.error("Error checking PDF status:", error);
    return NextResponse.json(
      { 
        error: "Failed to check PDF status",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
