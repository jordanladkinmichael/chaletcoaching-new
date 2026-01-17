import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

/**
 * GET /api/coach-requests/list
 * Returns all coach requests for the authenticated user
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const requests = await prisma.coachRequest.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        coachId: true,
        coachSlug: true,
        goal: true,
        level: true,
        trainingType: true,
        equipment: true,
        daysPerWeek: true,
        status: true,
        tokensCharged: true,
        courseId: true,
        error: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Получаем информацию о курсах (pdfUrl) для запросов со статусом "done"
    const courseIds = requests
      .filter(req => req.courseId && req.status === "done")
      .map(req => req.courseId!)
      .filter((id): id is string => id !== null);

    const courses = courseIds.length > 0
      ? await prisma.course.findMany({
          where: { id: { in: courseIds } },
          select: { id: true, pdfUrl: true },
        })
      : [];

    const courseMap = new Map(courses.map(c => [c.id, c.pdfUrl]));

    // Добавляем pdfUrl к каждому запросу
    const itemsWithPdf = requests.map(req => ({
      ...req,
      pdfUrl: req.courseId ? courseMap.get(req.courseId) || null : null,
      createdAt: req.createdAt.toISOString(),
      updatedAt: req.updatedAt.toISOString(),
    }));

    return NextResponse.json({
      items: itemsWithPdf,
    });
  } catch (error) {
    console.error("Error fetching coach requests:", error);
    return NextResponse.json(
      { error: "Failed to fetch coach requests" },
      { status: 500 }
    );
  }
}

