import { NextResponse } from "next/server";
import { getSessionOrThrow } from "@/server/auth-guards";
import { db } from "@/lib/db";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

const updateProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100).optional(),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(8, "New password must be at least 8 characters").optional(),
}).refine(
  (data) => {
    // If newPassword is provided, currentPassword must be too
    if (data.newPassword && !data.currentPassword) return false;
    return true;
  },
  { message: "Current password is required to set a new password", path: ["currentPassword"] }
);

export async function GET() {
  try {
    const session = await getSessionOrThrow();
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });

    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: user });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    const status = message === "UNAUTHORIZED" ? 401 : message === "USER_INACTIVE" ? 403 : 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getSessionOrThrow();
    const body = await req.json();
    const parsed = updateProfileSchema.parse(body);

    // Update name if provided
    if (parsed.name) {
      await db.user.update({
        where: { id: session.user.id },
        data: { name: parsed.name },
      });
    }

    // Change password if provided using better-auth's built-in endpoint
    if (parsed.newPassword && parsed.currentPassword) {
      const response = await auth.api.changePassword({
        body: {
          currentPassword: parsed.currentPassword,
          newPassword: parsed.newPassword,
        },
        headers: await headers(),
      });

      if (!response) {
        return NextResponse.json({ success: false, error: "Current password is incorrect" }, { status: 400 });
      }
    }

    return NextResponse.json({ success: true, message: "Profile updated successfully" });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    const message = error instanceof Error ? error.message : "Internal Server Error";
    const status = message === "UNAUTHORIZED" ? 401 : message === "USER_INACTIVE" ? 403 : 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}
