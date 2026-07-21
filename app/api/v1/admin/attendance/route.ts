import { NextResponse } from "next/server";
import { validateRole } from "@/server/auth-guards";
import { Role, AttendanceStatus } from "@prisma/client";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  try {
    await validateRole([Role.ADMIN]);

    const { searchParams } = new URL(req.url);
    const search   = searchParams.get("search") || undefined;
    const status   = searchParams.get("status") as AttendanceStatus | null;
    const dateFrom = searchParams.get("dateFrom") || undefined;
    const dateTo   = searchParams.get("dateTo")   || undefined;
    const page     = Math.max(1, parseInt(searchParams.get("page")  || "1",  10));
    const limit    = Math.min(50, parseInt(searchParams.get("limit") || "20", 10));
    const skip     = (page - 1) * limit;

    // Build where clause for AttendanceLog
    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (dateFrom || dateTo) {
      where.date = {};
      if (dateFrom) where.date.gte = new Date(dateFrom);
      if (dateTo) {
        const end = new Date(dateTo);
        end.setUTCHours(23, 59, 59, 999);
        where.date.lte = end;
      }
    }

    // Search by employee name/email — filter through the profile relation
    if (search) {
      where.employee = {
        user: {
          OR: [
            { name:  { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
          ],
        },
      };
    }

    const [logs, total] = await Promise.all([
      db.attendanceLog.findMany({
        where,
        orderBy: { date: "desc" },
        skip,
        take: limit,
        include: {
          employee: {
            include: {
              user:  { select: { id: true, name: true, email: true } },
              shift: { select: { id: true, name: true, startTime: true, endTime: true } },
            },
          },
        },
      }),
      db.attendanceLog.count({ where }),
    ]);

    // KPI aggregates (all-time, unfiltered by date/search for summary cards)
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const [todayPresent, todayLate, todayAbsent] = await Promise.all([
      db.attendanceLog.count({ where: { date: today, status: { in: [AttendanceStatus.PRESENT, AttendanceStatus.LATE] } } }),
      db.attendanceLog.count({ where: { date: today, status: AttendanceStatus.LATE } }),
      db.attendanceLog.count({ where: { date: today, status: AttendanceStatus.ABSENT } }),
    ]);

    return NextResponse.json({
      success: true,
      data: logs,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
      todayStats: { present: todayPresent, late: todayLate, absent: todayAbsent },
    }, { status: 200 });

  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    const status  = message === "UNAUTHORIZED" ? 401 : message === "FORBIDDEN" ? 403 : 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}
