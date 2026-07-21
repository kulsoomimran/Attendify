import { NextResponse } from "next/server";
import { validateRole } from "@/server/auth-guards";
import { Role } from "@prisma/client";
import { assignShiftSchema } from "@/server/validators/employee";
import { assignShift } from "@/server/services/employee-service";
import { ZodError } from "zod";

export async function POST(req: Request) {
  try {
    // 1. Authenticate & Authorize Admin
    await validateRole([Role.ADMIN]);

    // 2. Parse & Validate Payload
    const body = await req.json();
    const parsedData = assignShiftSchema.parse(body);

    // 3. Update shift mapping
    const profile = await assignShift(parsedData.employeeId, parsedData.shiftId);

    return NextResponse.json({
      success: true,
      data: profile,
    }, { status: 200 });

  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({
        success: false,
        error: "Validation failed",
        details: error.flatten().fieldErrors,
      }, { status: 400 });
    }

    const message = error instanceof Error ? error.message : "Internal Server Error";
    const status = message === "UNAUTHORIZED" ? 401 : message === "FORBIDDEN" ? 403 : 500;

    return NextResponse.json({
      success: false,
      error: message,
    }, { status });
  }
}
