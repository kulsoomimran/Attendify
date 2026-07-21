import { NextResponse } from "next/server";
import { validateRole } from "@/server/auth-guards";
import { Role } from "@prisma/client";
import { deleteHoliday } from "@/server/services/holiday-service";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function DELETE(req: Request, { params }: RouteParams) {
  try {
    await validateRole([Role.ADMIN]);
    const { id } = await params;

    const holiday = await deleteHoliday(id);

    return NextResponse.json({
      success: true,
      data: holiday,
    }, { status: 200 });

  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    let status = 500;
    if (message === "UNAUTHORIZED") status = 401;
    else if (message === "FORBIDDEN") status = 403;
    else if (message === "HOLIDAY_NOT_FOUND") status = 404;

    return NextResponse.json({
      success: false,
      error: message,
    }, { status });
  }
}
