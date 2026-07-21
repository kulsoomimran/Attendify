import { z } from "zod";

const timeStringRegex = /^([01]\d|2[0-3]):[0-5]\d$/;

export const createShiftSchema = z.object({
  name: z.string().min(1, "Shift name is required").max(100),
  startTime: z.string().regex(timeStringRegex, "Start time must be in HH:MM 24hr format"),
  endTime: z.string().regex(timeStringRegex, "End time must be in HH:MM 24hr format"),
  gracePeriod: z.number().int("Grace period must be an integer").min(0, "Grace period cannot be negative").default(15),
});

export const updateShiftSchema = z.object({
  name: z.string().min(1, "Shift name is required").max(100).optional(),
  startTime: z.string().regex(timeStringRegex, "Start time must be in HH:MM 24hr format").optional(),
  endTime: z.string().regex(timeStringRegex, "End time must be in HH:MM 24hr format").optional(),
  gracePeriod: z.number().int("Grace period must be an integer").min(0, "Grace period cannot be negative").optional(),
});

export type CreateShiftInput = z.infer<typeof createShiftSchema>;
export type UpdateShiftInput = z.infer<typeof updateShiftSchema>;
