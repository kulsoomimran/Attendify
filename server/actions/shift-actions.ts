"use server";

import { createShift, updateShift, deleteShift } from "../services/shift-service";
import { createShiftSchema, updateShiftSchema } from "../validators/shift";
import { validateRole } from "@/server/auth-guards";
import { Role } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function createShiftAction(formData: any) {
  try {
    await validateRole([Role.ADMIN]);
    const parsed = createShiftSchema.parse(formData);
    const shift = await createShift(parsed);
    revalidatePath("/admin/shifts");
    return { success: true, data: shift };
  } catch (error: any) {
    return { success: false, error: error.message || "Something went wrong" };
  }
}

export async function updateShiftAction(id: string, formData: any) {
  try {
    await validateRole([Role.ADMIN]);
    const parsed = updateShiftSchema.parse(formData);
    const shift = await updateShift(id, parsed);
    revalidatePath("/admin/shifts");
    return { success: true, data: shift };
  } catch (error: any) {
    return { success: false, error: error.message || "Something went wrong" };
  }
}

export async function deleteShiftAction(id: string) {
  try {
    await validateRole([Role.ADMIN]);
    const shift = await deleteShift(id);
    revalidatePath("/admin/shifts");
    return { success: true, data: shift };
  } catch (error: any) {
    return { success: false, error: error.message || "Something went wrong" };
  }
}
