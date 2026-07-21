"use server";

import { createHoliday, deleteHoliday } from "../services/holiday-service";
import { createHolidaySchema } from "../validators/holiday";
import { validateRole } from "@/server/auth-guards";
import { Role } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function createHolidayAction(formData: any) {
  try {
    await validateRole([Role.ADMIN]);
    const parsed = createHolidaySchema.parse(formData);
    const holiday = await createHoliday(parsed);
    revalidatePath("/admin/holidays");
    revalidatePath("/employee");
    revalidatePath("/admin");
    return { success: true, data: holiday };
  } catch (error: any) {
    return { success: false, error: error.message || "Something went wrong" };
  }
}

export async function deleteHolidayAction(id: string) {
  try {
    await validateRole([Role.ADMIN]);
    const holiday = await deleteHoliday(id);
    revalidatePath("/admin/holidays");
    revalidatePath("/employee");
    revalidatePath("/admin");
    return { success: true, data: holiday };
  } catch (error: any) {
    return { success: false, error: error.message || "Something went wrong" };
  }
}
