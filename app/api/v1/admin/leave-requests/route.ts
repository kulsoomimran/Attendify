import { NextResponse } from "next/server";
import { validateRole } from "@/server/auth-guards";
import { Role } from "@prisma/client";
import { getAllLeaveRequests } from "@/server/services/leave-service";

export async function GET() {
  try {
    // Authenticate and authorize Admin role
    await validateRole([Role.ADMIN]);

    // Query leave requests using leave-service
    const leaveRequests = await getAllLeaveRequests();

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
