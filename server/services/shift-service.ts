import { db } from "@/lib/db";
import { CreateShiftInput, UpdateShiftInput } from "../validators/shift";

export async function getShifts() {
  return await db.shift.findMany({
    orderBy: { createdAt: "desc" },
  });
}

export async function getShiftById(id: string) {
  return await db.shift.findUnique({
    where: { id },
  });
}

export async function createShift(data: CreateShiftInput) {
  return await db.shift.create({
    data: {
      name: data.name,
      startTime: data.startTime,
      endTime: data.endTime,
      gracePeriod: data.gracePeriod ?? 15,
    },
  });
}

export async function updateShift(id: string, data: UpdateShiftInput) {
  return await db.shift.update({
    where: { id },
    data,
  });
}

export async function deleteShift(id: string) {
  // Before deleting a shift, check if any employee profiles are currently assigned to it.
  // If so, their shiftId will be set to Null on cascade because we configured setNull in schema.prisma.
  return await db.shift.delete({
    where: { id },
  });
}
