import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";
import bcrypt from "bcryptjs";

const UpdateSchema = z.object({
  firstName: z.string().min(1).max(50).optional(),
  lastName: z.string().min(1).max(50).optional(),
  phone: z.string().max(20).optional(),
  dateOfBirth: z.string().optional(),
  street: z.string().max(200).optional(),
  city: z.string().max(100).optional(),
  country: z.string().max(100).optional(),
  postalCode: z.string().max(20).optional(),
  email: z.string().email().optional(),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(6).optional(),
});

/** GET /api/user/profile — Fetch current user profile */
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      dateOfBirth: true,
      street: true,
      city: true,
      country: true,
      postalCode: true,
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json(user);
}

/** PATCH /api/user/profile — Update current user profile */
export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const data = UpdateSchema.parse(body);

    const updateData: Record<string, unknown> = {};

    // Profile fields
    if (data.firstName !== undefined)
      updateData.firstName = data.firstName.trim();
    if (data.lastName !== undefined) updateData.lastName = data.lastName.trim();
    if (data.phone !== undefined)
      updateData.phone = data.phone.trim() || null;
    if (data.dateOfBirth !== undefined)
      updateData.dateOfBirth = data.dateOfBirth
        ? new Date(data.dateOfBirth)
        : null;
    if (data.street !== undefined)
      updateData.street = data.street.trim() || null;
    if (data.city !== undefined) updateData.city = data.city.trim() || null;
    if (data.country !== undefined)
      updateData.country = data.country.trim() || null;
    if (data.postalCode !== undefined)
      updateData.postalCode = data.postalCode.trim() || null;

    // Keep `name` field in sync for backward compat
    if (data.firstName !== undefined || data.lastName !== undefined) {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { firstName: true, lastName: true },
      });
      const fn = data.firstName ?? user?.firstName ?? "";
      const ln = data.lastName ?? user?.lastName ?? "";
      updateData.name = `${fn} ${ln}`.trim();
    }

    // Email change
    if (data.email) {
      const normalizedEmail = data.email.toLowerCase();
      const existing = await prisma.user.findUnique({
        where: { email: normalizedEmail },
        select: { id: true },
      });
      if (existing && existing.id !== session.user.id) {
        return NextResponse.json(
          { error: "Email already in use" },
          { status: 409 }
        );
      }
      updateData.email = normalizedEmail;
    }

    // Password change (requires current password)
    if (data.newPassword) {
      if (!data.currentPassword) {
        return NextResponse.json(
          { error: "Current password is required to set a new password" },
          { status: 400 }
        );
      }
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { password: true },
      });
      if (!user?.password) {
        return NextResponse.json(
          { error: "Cannot change password for OAuth accounts" },
          { status: 400 }
        );
      }
      const valid = await bcrypt.compare(data.currentPassword, user.password);
      if (!valid) {
        return NextResponse.json(
          { error: "Current password is incorrect" },
          { status: 403 }
        );
      }
      updateData.password = await bcrypt.hash(data.newPassword, 10);
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "No fields to update" },
        { status: 400 }
      );
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: e.errors },
        { status: 400 }
      );
    }
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
