import { z } from "zod";

export const createHolidaySchema = z.object({
  name: z.string().min(1, "Holiday name is required").max(100),
  date: z.string().min(1, "Holiday date is required"),
  description: z.string().max(500).optional().nullable(),
});

export type CreateHolidayInput = z.infer<typeof createHolidaySchema>;
