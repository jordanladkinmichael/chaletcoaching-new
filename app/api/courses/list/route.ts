import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Находим все courseId, которые связаны с CoachRequest (курсы коуча)
  const coachRequestCourses = await prisma.coachRequest.findMany({
    where: { 
      userId: session.user.id,
      courseId: { not: null },
    },
    select: { courseId: true },
  });

  const coachRequestCourseIds = coachRequestCourses
    .map(cr => cr.courseId)
    .filter((id): id is string => id !== null);

  // Получаем все курсы пользователя, исключая курсы коуча
  const items = await prisma.course.findMany({
    where: { 
      userId: session.user.id,
      // Исключаем курсы, которые связаны с CoachRequest
      ...(coachRequestCourseIds.length > 0 && {
        id: { notIn: coachRequestCourseIds },
      }),
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      tokensSpent: true,
      pdfUrl: true,
      createdAt: true,
      options: true,
    },
  });

  // Приводим createdAt к ISO-строке (как ждёт Dashboard)
  const payload = items.map(i => ({
    ...i,
    createdAt: i.createdAt.toISOString(),
  }));

  return NextResponse.json({ items: payload });
}
