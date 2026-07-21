"use server";

import { createEmployee, updateEmployee, deleteEmployee } from "../services/employee-service";
import { createEmployeeSchema, updateEmployeeSchema } from "../validators/employee";
import { validateRole } from "@/server/auth-guards";
import { Role } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function createEmployeeAction(formData: any) {
  try {
    await validateRole([Role.ADMIN]);
    const parsed = createEmployeeSchema.parse(formData);
    const employee = await createEmployee(parsed);
    revalidatePath("/admin/employees");
    return { success: true, data: employee };
  } catch (error: any) {
    return { success: false, error: error.message || "Something went wrong" };
  }
}

export async function updateEmployeeAction(id: string, formData: any) {
  try {
    await validateRole([Role.ADMIN]);
    const parsed = updateEmployeeSchema.parse(formData);
    const employee = await updateEmployee(id, parsed);
    revalidatePath("/admin/employees");
    return { success: true, data: employee };
  } catch (error: any) {
    return { success: false, error: error.message || "Something went wrong" };
  }
}

export async function deleteEmployeeAction(id: string) {
  try {
    await validateRole([Role.ADMIN]);
    const employee = await deleteEmployee(id);
    revalidatePath("/admin/employees");
    return { success: true, data: employee };
  } catch (error: any) {
    return { success: false, error: error.message || "Something went wrong" };
  }
}
