import { db } from "@/lib/db";
import { AttendanceStatus } from "@prisma/client";
import { ClockInInput, ClockOutInput } from "../validators/attendance";

export function getTodayStartUtc() {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

export async function getAttendanceStatusForUser(userId: string) {
  const profile = await db.employeeProfile.findUnique({
    where: { userId },
  });

  if (!profile) {
    return null;
  }

  const todayStart = getTodayStartUtc();
  const log = await db.attendanceLog.findUnique({
    where: {
      employeeId_date: {
        employeeId: profile.id,
        date: todayStart,
      },
    },
  });

  return log;
}

export async function recordClockIn(userId: string, data: ClockInInput) {
  const profile = await db.employeeProfile.findUnique({
    where: { userId },
    include: { shift: true },
  });

  if (!profile) {
    throw new Error("EMPLOYEE_PROFILE_NOT_FOUND");
  }

  const todayStart = getTodayStartUtc();

  // Check if already clocked in
  const existingLog = await db.attendanceLog.findUnique({
    where: {
      employeeId_date: {
        employeeId: profile.id,
        date: todayStart,
      },
    },
  });

  if (existingLog) {
    throw new Error("ALREADY_CLOCKED_IN");
  }

  const now = new Date();
  let lateMinutes = 0;
  let status: AttendanceStatus = AttendanceStatus.PRESENT;

  // Calculate late minutes if a shift is assigned
  if (profile.shift) {
    const [shiftH, shiftM] = profile.shift.startTime.split(":").map(Number);
    const shiftStart = new Date(now);
    shiftStart.setHours(shiftH, shiftM, 0, 0);

    if (now.getTime() > shiftStart.getTime()) {
      const diffMs = now.getTime() - shiftStart.getTime();
      const diffMins = Math.floor(diffMs / 60000);

      // If they exceeded the grace period, mark them as LATE and record exact late minutes
      if (diffMins > profile.shift.gracePeriod) {
        lateMinutes = diffMins;
        status = AttendanceStatus.LATE;
      }
    }
  }

  const log = await db.attendanceLog.create({
    data: {
      employeeId: profile.id,
      date: todayStart,
      clockIn: now,
      status,
      lateMinutes,
      latitudeIn: data.latitude ?? null,
      longitudeIn: data.longitude ?? null,
      notes: data.notes ?? null,
    },
    include: {
      employee: {
        include: {
          shift: true,
        },
      },
    },
  });

  return log;
}

export async function recordClockOut(userId: string, data: ClockOutInput) {
  const profile = await db.employeeProfile.findUnique({
    where: { userId },
  });

  if (!profile) {
    throw new Error("EMPLOYEE_PROFILE_NOT_FOUND");
  }

  const todayStart = getTodayStartUtc();

  // Find clock-in log
  const log = await db.attendanceLog.findUnique({
    where: {
      employeeId_date: {
        employeeId: profile.id,
        date: todayStart,
      },
    },
  });

  if (!log) {
    throw new Error("NO_CLOCK_IN_FOUND");
  }

  if (log.clockOut) {
    throw new Error("ALREADY_CLOCKED_OUT");
  }

  const now = new Date();
  
  // Calculate working hours as a decimal (e.g. 8.5)
  const durationMs = now.getTime() - log.clockIn.getTime();
  const workingHours = Math.round((durationMs / (1000 * 60 * 60)) * 100) / 100;

  const updatedLog = await db.attendanceLog.update({
    where: { id: log.id },
    data: {
      clockOut: now,
      workingHours,
      latitudeOut: data.latitude ?? null,
      longitudeOut: data.longitude ?? null,
      notes: data.notes ? (log.notes ? `${log.notes} | Summary: ${data.notes}` : data.notes) : log.notes,
    },
    include: {
      employee: {
        include: {
          shift: true,
        },
      },
    },
  });

  return updatedLog;
}

export async function getAttendanceLogsForUser(userId: string) {
  const profile = await db.employeeProfile.findUnique({
    where: { userId },
  });

  if (!profile) {
    return [];
  }

  return await db.attendanceLog.findMany({
    where: {
      employeeId: profile.id,
    },
    orderBy: {
      date: "desc",
    },
    include: {
      employee: {
        include: {
          shift: true,
        },
      },
    },
  });
}
