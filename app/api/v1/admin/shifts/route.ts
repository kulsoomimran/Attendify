import { NextResponse } from "next/server";
import { validateRole } from "@/server/auth-guards";
import { Role } from "@prisma/client";
import { createShiftSchema } from "@/server/validators/shift";
import { getShifts, createShift } from "@/server/services/shift-service";
import { ZodError } from "zod";

export async function GET(req: Request) {
  try {
    await validateRole([Role.ADMIN]);

    const shifts = await getShifts();

    return NextResponse.json({
      success: true,
      data: shifts,
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
    await validateRole([Role.ADMIN]);

    const body = await req.json();
    const parsedData = createShiftSchema.parse(body);

    const shift = await createShift(parsedData);

    return NextResponse.json({
      success: true,
      data: shift,
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
    const status = message === "UNAUTHORIZED" ? 401 : message === "FORBIDDEN" ? 403 : 500;

    return NextResponse.json({
      success: false,
      error: message,
    }, { status });
  }
}
