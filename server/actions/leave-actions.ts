"use server";

import { createLeaveRequest, reviewLeaveRequest } from "../services/leave-service";
import { createLeaveRequestSchema, reviewLeaveRequestSchema } from "../validators/leave";
import { validateRole, getSessionOrThrow } from "@/server/auth-guards";
import { Role } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function createLeaveRequestAction(formData: any) {
  try {
    const session = await getSessionOrThrow();
    const parsed = createLeaveRequestSchema.parse(formData);
    const result = await createLeaveRequest(session.user.id, parsed);
    revalidatePath("/employee");
    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: error.message || "Something went wrong" };
  }
}

export async function reviewLeaveRequestAction(formData: any) {
  try {
    const session = await validateRole([Role.ADMIN]);
    const parsed = reviewLeaveRequestSchema.parse(formData);
    const result = await reviewLeaveRequest(parsed.requestId, session.user.id, parsed.status);
    revalidatePath("/admin/leave-requests");
    revalidatePath("/admin");
    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: error.message || "Something went wrong" };
  }
}
