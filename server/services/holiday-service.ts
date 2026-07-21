import { db } from "@/lib/db";

interface CreateHolidayInput {
  name: string;
  date: string;
  description?: string | null;
}

export async function createHoliday(data: CreateHolidayInput) {
  const holidayDate = new Date(data.date);
  
  if (isNaN(holidayDate.getTime())) {
    throw new Error("INVALID_DATE_FORMAT");
  }

  // Normalize date to midnight (00:00:00.000) in UTC/local to ensure consistent uniqueness check
  const normalizedDate = new Date(holidayDate.getFullYear(), holidayDate.getMonth(), holidayDate.getDate(), 0, 0, 0, 0);

  const existing = await db.holiday.findUnique({
    where: { date: normalizedDate },
  });

  if (existing) {
    throw new Error("HOLIDAY_ALREADY_EXISTS: A holiday is already registered on this date.");
  }

  return await db.holiday.create({
    data: {
      name: data.name,
      date: normalizedDate,
      description: data.description || null,
    },
  });
}

export async function getAllHolidays() {
  return await db.holiday.findMany({
    orderBy: {
      date: "asc",
    },
  });
}

export async function deleteHoliday(id: string) {
  const existing = await db.holiday.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new Error("HOLIDAY_NOT_FOUND");
  }

  return await db.holiday.delete({
    where: { id },
  });
}
