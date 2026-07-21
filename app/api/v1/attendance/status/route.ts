import { NextResponse } from "next/server";
import { getSessionOrThrow } from "@/server/auth-guards";
import { db } from "@/lib/db";
import { getAttendanceStatusForUser, getAttendanceLogsForUser } from "@/server/services/attendance-service";

export async function GET() {
  try {
    const session = await getSessionOrThrow();
    const userId = session.user.id;

    // Retrieve or auto-create EmployeeProfile
    let profile = await db.employeeProfile.findUnique({
      where: { userId },
      include: { shift: true },
    });

    if (!profile) {
      profile = await db.employeeProfile.create({
        data: {
          userId,
          department: "General",
        },
        include: { shift: true },
      });
    }

    const todayLog = await getAttendanceStatusForUser(userId);
    const logs = await getAttendanceLogsForUser(userId);

    return NextResponse.json({
      success: true,
      data: {
        profile,
        todayLog,
        logs,
      },
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
