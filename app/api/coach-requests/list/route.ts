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

    return NextResponse.json({
      items: requests,
    });
  } catch (error) {
    console.error("Error fetching coach requests:", error);
    return NextResponse.json(
      { error: "Failed to fetch coach requests" },
      { status: 500 }
    );
  }
}

