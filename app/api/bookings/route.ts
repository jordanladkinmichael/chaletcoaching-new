import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getUserBalance } from "@/lib/balance";
import { z } from "zod";
import { getSessionCost, isValidDuration } from "@/lib/coach-pricing";
import coachesSeedData from "@/coaches_seed_15.json";

// Resolve coach from seed data
function findCoach(coachId: string) {
  return (coachesSeedData as Array<{ id: string; slug: string; name: string; level: string }>)
    .find((c) => c.id === coachId);
}

const HOUR_MS = 60 * 60 * 1000;

// ── POST /api/bookings — Create a booking ───────────────────────────────
const CreateBookingSchema = z.object({
  coachId: z.string().min(1),
  coachSlug: z.string().min(1),
  coachName: z.string().min(1),
  date: z.string().datetime(), // ISO 8601
  durationHours: z.number().int().min(1).max(3),
  notes: z.string().max(500).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = CreateBookingSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid data", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { coachId, coachSlug, coachName, date, durationHours, notes } = parsed.data;

    if (!isValidDuration(durationHours)) {
      return NextResponse.json({ error: "Duration must be 1, 2, or 3 hours" }, { status: 400 });
    }

    // Validate coach exists
    const coach = findCoach(coachId);
    if (!coach) {
      return NextResponse.json({ error: "Coach not found" }, { status: 404 });
    }

    // Validate date is in the future
    const bookingDate = new Date(date);
    if (bookingDate <= new Date()) {
      return NextResponse.json({ error: "Booking date must be in the future" }, { status: 400 });
    }

    // Calculate cost: flat rate × hours
    const cost = getSessionCost(durationHours);

    // Check balance
    const balance = await getUserBalance(session.user.id);
    if (balance < cost) {
      return NextResponse.json(
        { error: "Insufficient tokens", balance, required: cost },
        { status: 400 }
      );
    }

    // Overlap check for multi-hour bookings:
    // New booking occupies [bookingDate, bookingDate + durationHours*HOUR_MS).
    // An existing booking occupies [existing.date, existing.date + existing.durationHours*HOUR_MS).
    // Two intervals overlap iff: existingStart < newEnd AND existingEnd > newStart.
    //
    // Since Prisma can't do computed columns, we use a worst-case approach:
    //  - Find all confirmed bookings for this coach where:
    //    existing.date < newEnd (new end time)
    //    AND existing.date > newStart - maxDuration (3h, covers longest possible existing booking)
    // Then we verify overlap in application code.
    const newStart = bookingDate.getTime();
    const newEnd = newStart + durationHours * HOUR_MS;
    const maxExistingDuration = 3; // hours

    const potentialOverlaps = await prisma.booking.findMany({
      where: {
        coachId,
        status: "confirmed",
        date: {
          gte: new Date(newStart - maxExistingDuration * HOUR_MS),
          lt: new Date(newEnd),
        },
      },
      select: { id: true, date: true, durationHours: true },
    });

    const hasOverlap = potentialOverlaps.some((existing) => {
      const existingStart = existing.date.getTime();
      const existingEnd = existingStart + existing.durationHours * HOUR_MS;
      return existingStart < newEnd && existingEnd > newStart;
    });

    if (hasOverlap) {
      return NextResponse.json(
        { error: "This time slot overlaps with an existing booking for this coach" },
        { status: 409 }
      );
    }

    // Deduct tokens
    await prisma.transaction.create({
      data: {
        userId: session.user.id,
        type: "spend",
        amount: -cost,
        meta: JSON.stringify({
          reason: "booking",
          coachId,
          coachSlug,
          coachName,
          date,
          durationHours,
        }),
      },
    });

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        userId: session.user.id,
        coachId,
        coachSlug,
        coachName,
        date: bookingDate,
        durationHours,
        status: "confirmed",
        tokensCharged: cost,
        notes: notes || null,
      },
    });

    // Updated balance
    const newBalance = await getUserBalance(session.user.id);

    return NextResponse.json({
      success: true,
      booking: {
        id: booking.id,
        coachName: booking.coachName,
        date: booking.date.toISOString(),
        durationHours: booking.durationHours,
        status: booking.status,
        tokensCharged: booking.tokensCharged,
      },
      newBalance,
    });
  } catch (error) {
    console.error("Error creating booking:", error);
    return NextResponse.json({ error: "Failed to create booking" }, { status: 500 });
  }
}

// ── GET /api/bookings — List user bookings ───────────────────────────────
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const bookings = await prisma.booking.findMany({
      where: { userId: session.user.id },
      orderBy: { date: "asc" },
      select: {
        id: true,
        coachId: true,
        coachSlug: true,
        coachName: true,
        date: true,
        durationHours: true,
        status: true,
        tokensCharged: true,
        notes: true,
        createdAt: true,
      },
    });

    const items = bookings.map((b) => ({
      ...b,
      date: b.date.toISOString(),
      createdAt: b.createdAt.toISOString(),
    }));

    return NextResponse.json({ items });
  } catch (error) {
    console.error("Error fetching bookings:", error);
    return NextResponse.json({ error: "Failed to fetch bookings" }, { status: 500 });
  }
}
