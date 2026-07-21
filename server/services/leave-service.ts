import { db } from "@/lib/db";
import { LeaveType, LeaveStatus } from "@prisma/client";

interface CreateLeaveRequestInput {
  type: LeaveType;
  startDate: string;
  endDate: string;
  reason?: string | null;
}

export async function createLeaveRequest(userId: string, data: CreateLeaveRequestInput) {
  const profile = await db.employeeProfile.findUnique({
    where: { userId },
  });

  if (!profile) {
    throw new Error("EMPLOYEE_PROFILE_NOT_FOUND");
  }

  const start = new Date(data.startDate);
  const end = new Date(data.endDate);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    throw new Error("INVALID_DATE_FORMAT");
  }

  // Calculate requested duration in days (inclusive)
  const diffMs = end.getTime() - start.getTime();
  const requestedDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24)) + 1;

  if (requestedDays <= 0) {
    throw new Error("INVALID_DATE_RANGE: End date must be on or after start date.");
  }

  // Calculate sum of approved and pending leaves in the current year
  const currentYear = new Date().getFullYear();
  const startOfYear = new Date(currentYear, 0, 1);
  const endOfYear = new Date(currentYear, 11, 31, 23, 59, 59);

  const existingLeaves = await db.leaveRequest.findMany({
    where: {
      employeeId: profile.id,
      status: { in: [LeaveStatus.PENDING, LeaveStatus.APPROVED] },
      startDate: { gte: startOfYear },
      endDate: { lte: endOfYear },
    },
  });

  let totalTakenDays = 0;
  for (const lv of existingLeaves) {
    const ms = lv.endDate.getTime() - lv.startDate.getTime();
    const days = Math.ceil(ms / (1000 * 60 * 60 * 24)) + 1;
    totalTakenDays += days;
  }

  const annualAllowance = 20; // Default leave allowance limit
  if (totalTakenDays + requestedDays > annualAllowance) {
    const remaining = Math.max(0, annualAllowance - totalTakenDays);
    throw new Error(`INSUFFICIENT_LEAVE_BALANCE: This request is for ${requestedDays} days, but you only have ${remaining} days of annual leave allowance remaining.`);
  }

  return await db.leaveRequest.create({
    data: {
      employeeId: profile.id,
      type: data.type,
      startDate: start,
      endDate: end,
      reason: data.reason || null,
      status: LeaveStatus.PENDING,
    },
  });
}

export async function getLeaveRequestsForUser(userId: string) {
  const profile = await db.employeeProfile.findUnique({
    where: { userId },
  });

  if (!profile) {
    return [];
  }

  return await db.leaveRequest.findMany({
    where: {
      employeeId: profile.id,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getAllLeaveRequests() {
  return await db.leaveRequest.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      employee: {
        include: {
          user: true,
        },
      },
    },
  });
}

export async function reviewLeaveRequest(
  requestId: string,
  adminUserId: string,
  status: LeaveStatus
) {
  const request = await db.leaveRequest.findUnique({
    where: { id: requestId },
  });

  if (!request) {
    throw new Error("LEAVE_REQUEST_NOT_FOUND");
  }

  if (request.status !== LeaveStatus.PENDING) {
    throw new Error("LEAVE_REQUEST_ALREADY_REVIEWED");
  }

  return await db.leaveRequest.update({
    where: { id: requestId },
    data: {
      status,
      approvedById: adminUserId,
      reviewedAt: new Date(),
    },
    include: {
      employee: {
        include: {
          user: true,
        },
      },
    },
  });
}
