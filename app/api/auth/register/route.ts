import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { z } from "zod";

const Body = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  firstName: z.string().min(1).max(50),
  lastName: z.string().min(1).max(50),
  phone: z.string().max(20).optional(),
  dateOfBirth: z.string().optional(),
  street: z.string().max(200).optional(),
  city: z.string().max(100).optional(),
  country: z.string().max(100).optional(),
  postalCode: z.string().max(20).optional(),
});

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const {
      email,
      password,
      firstName,
      lastName,
      phone,
      dateOfBirth,
      street,
      city,
      country,
      postalCode,
    } = Body.parse(json);

    const existing = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: { id: true },
    });
    if (existing) {
      return NextResponse.json(
        { error: "Email already in use" },
        { status: 409 }
      );
    }

    const hash = await bcrypt.hash(password, 10);
    await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        name: `${firstName.trim()} ${lastName.trim()}`.trim(),
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone?.trim() || null,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        street: street?.trim() || null,
        city: city?.trim() || null,
        country: country?.trim() || null,
        postalCode: postalCode?.trim() || null,
        password: hash,
      },
    });

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (e: unknown) {
    if (e instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: e.errors },
        { status: 400 }
      );
    }
    const msg = e instanceof Error ? e.message : "Invalid request";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
