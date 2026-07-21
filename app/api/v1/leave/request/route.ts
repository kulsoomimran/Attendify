import { NextResponse } from "next/server";
import { getSessionOrThrow } from "@/server/auth-guards";
import { createLeaveRequestSchema } from "@/server/validators/leave";
import { createLeaveRequest, getLeaveRequestsForUser } from "@/server/services/leave-service";
import { ZodError } from "zod";

export async function GET() {
  try {
    const session = await getSessionOrThrow();
    const userId = session.user.id;

    const leaveRequests = await getLeaveRequestsForUser(userId);

    return NextResponse.json({
      success: true,
      data: leaveRequests,
    }, { status: 200 });

  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    const status = message === "UNAUTHORIZED" ? 401 : message === "FORBIDDEN" ? 403 : 500;

    return NextResponse.json({
      success: false,
      error: message,
    }, { status });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSessionOrThrow();
    const userId = session.user.id;

    const body = await req.json();
    const parsedData = createLeaveRequestSchema.parse(body);

    const leaveRequest = await createLeaveRequest(userId, parsedData);

    return NextResponse.json({
      success: true,
      data: leaveRequest,
    }, { status: 201 });

  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({
        success: false,
        error: "Validation failed",
        details: error.flatten().fieldErrors,
      }, { status: 400 });
    }

    const message = error instanceof Error ? error.message : "Internal Server Error";
    let status = 500;
    if (message === "UNAUTHORIZED") status = 401;
    else if (message === "FORBIDDEN") status = 403;
    else if (message === "EMPLOYEE_PROFILE_NOT_FOUND") status = 404;
    else if (message.startsWith("INVALID_") || message.startsWith("INSUFFICIENT_")) status = 400;

    return NextResponse.json({
      success: false,
      error: message,
    }, { status });
  }
}
