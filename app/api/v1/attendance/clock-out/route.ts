import { NextResponse } from "next/server";
import { getSessionOrThrow } from "@/server/auth-guards";
import { clockOutSchema } from "@/server/validators/attendance";
import { recordClockOut } from "@/server/services/attendance-service";
import { ZodError } from "zod";

export async function POST(req: Request) {
  try {
    // 1. Authenticate & Authorize
    const session = await getSessionOrThrow();
    const userId = session.user.id;

    // 2. Parse and Validate Request Payload
    const body = await req.json();
    const parsedData = clockOutSchema.parse(body);

    // 3. Execute Service Business Logic
    const attendanceRecord = await recordClockOut(userId, parsedData);

    // 4. Return Standard Success Response
    return NextResponse.json({
      success: true,
      data: attendanceRecord,
    }, { status: 200 });

  } catch (error) {
    // 5. Unified Error Response handling
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
