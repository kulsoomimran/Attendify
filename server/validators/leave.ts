import { z } from "zod";
import { LeaveType, LeaveStatus } from "@prisma/client";

export const createLeaveRequestSchema = z.object({
  type: z.nativeEnum(LeaveType),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  reason: z.string().max(1000).optional().nullable(),
}).refine(data => {
  const start = new Date(data.startDate);
  const end = new Date(data.endDate);
  return end >= start;
}, {
  message: "End date must be on or after start date",
  path: ["endDate"],
});

export const reviewLeaveRequestSchema = z.object({
  requestId: z.string().min(1, "Request ID is required"),
  status: z.nativeEnum(LeaveStatus),
});

export type CreateLeaveRequestInput = z.infer<typeof createLeaveRequestSchema>;
export type ReviewLeaveRequestInput = z.infer<typeof reviewLeaveRequestSchema>;
