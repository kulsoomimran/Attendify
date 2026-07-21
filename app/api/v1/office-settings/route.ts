import { NextResponse } from "next/server";
import { getSessionOrThrow, validateRole } from "@/server/auth-guards";
import { db } from "@/lib/db";
import { Role } from "@prisma/client";
import { z } from "zod";

const updateOfficeSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  radiusMeters: z.number().int().min(50).max(10000),
});

// Get-or-create the singleton office setting
async function getOrCreateOfficeSetting() {
  const existing = await db.officeSetting.findFirst();
  if (existing) return existing;
  return db.officeSetting.create({ data: {} });
}

export async function GET() {
  try {
    // Any authenticated user can read office settings (needed by VerificationOverlay)
    await getSessionOrThrow();
    const setting = await getOrCreateOfficeSetting();
    return NextResponse.json({ success: true, data: setting });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    const status = message === "UNAUTHORIZED" ? 401 : 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}

export async function PATCH(req: Request) {
  try {
    await validateRole([Role.ADMIN]);
    const body = await req.json();
    const parsed = updateOfficeSchema.parse(body);

    const existing = await getOrCreateOfficeSetting();
    const updated = await db.officeSetting.update({
      where: { id: existing.id },
      data: parsed,
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    const message = error instanceof Error ? error.message : "Internal Server Error";
    const status = message === "UNAUTHORIZED" ? 401 : message === "FORBIDDEN" ? 403 : 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}
