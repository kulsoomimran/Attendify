import { z } from "zod";
import { Role } from "@prisma/client";

export const createEmployeeSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  email: z.string().email("Invalid email address"),
  role: z.nativeEnum(Role).default(Role.EMPLOYEE),
  department: z.string().max(100).optional().nullable(),
  shiftId: z.string().cuid("Invalid shift selection").optional().nullable(),
  password: z.string().min(6, "Password must be at least 6 characters").optional(),
  isRemote: z.boolean().default(false),
});

export const updateEmployeeSchema = z.object({
  name: z.string().min(1, "Name is required").max(100).optional(),
  email: z.string().email("Invalid email address").optional(),
  role: z.nativeEnum(Role).optional(),
  department: z.string().max(100).optional().nullable(),
  isActive: z.boolean().optional(),
  shiftId: z.string().cuid("Invalid shift selection").optional().nullable(),
  isRemote: z.boolean().optional(),
});

export const assignShiftSchema = z.object({
  employeeId: z.string().cuid("Invalid employee ID"),
  shiftId: z.string().cuid("Invalid shift ID").nullable(),
});

export type CreateEmployeeInput = z.infer<typeof createEmployeeSchema>;
export type UpdateEmployeeInput = z.infer<typeof updateEmployeeSchema>;
export type AssignShiftInput = z.infer<typeof assignShiftSchema>;
