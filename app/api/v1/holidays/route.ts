import { NextResponse } from "next/server";
import { getSessionOrThrow, validateRole } from "@/server/auth-guards";
import { Role } from "@prisma/client";
import { getAllHolidays, createHoliday } from "@/server/services/holiday-service";
import { createHolidaySchema } from "@/server/validators/holiday";
import { ZodError } from "zod";

export async function GET() {
  try {
    // Anyone authenticated can view company holidays
    await getSessionOrThrow();

    const holidays = await getAllHolidays();

    return NextResponse.json({
      success: true,
      data: holidays,
    }, { status: 200 });

  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    const status = message === "UNAUTHORIZED" ? 401 : message === "FORBIDDEN" ? 403 : 500;

    return NextResponse.json({
      success: false,
      error: message,
    }, { status });
  }
}

export async function POST(req: Request) {
  try {
    // Only Admin can create holidays
    await validateRole([Role.ADMIN]);

    const body = await req.json();
    const parsedData = createHolidaySchema.parse(body);

    const holiday = await createHoliday(parsedData);

    return NextResponse.json({
      success: true,
      data: holiday,
    }, { status: 201 });

  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({
        success: false,
        error: "Validation failed",
        details: error.flatten().fieldErrors,
      }, { status: 400 });
    }

    const message = error instanceof Error ? error.message : "Internal Server Error";
    let status = 500;
    if (message === "UNAUTHORIZED") status = 401;
    else if (message === "FORBIDDEN") status = 403;
    else if (message.startsWith("HOLIDAY_") || message.startsWith("INVALID_")) status = 400;

    return NextResponse.json({
      success: false,
      error: message,
    }, { status });
  }
}
