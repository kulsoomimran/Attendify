import { NextResponse } from "next/server";
import { validateRole } from "@/server/auth-guards";
import { Role } from "@prisma/client";
import { updateEmployeeSchema } from "@/server/validators/employee";
import { getEmployeeById, updateEmployee, deleteEmployee } from "@/server/services/employee-service";
import { ZodError } from "zod";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(req: Request, { params }: RouteParams) {
  try {
    await validateRole([Role.ADMIN]);
    const { id } = await params;

    const employee = await getEmployeeById(id);
    if (!employee) {
      return NextResponse.json({ success: false, error: "Employee not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: employee }, { status: 200 });

  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    const status = message === "UNAUTHORIZED" ? 401 : message === "FORBIDDEN" ? 403 : 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}

export async function PATCH(req: Request, { params }: RouteParams) {
  try {
    await validateRole([Role.ADMIN]);
    const { id } = await params;

    const body = await req.json();
    const parsedData = updateEmployeeSchema.parse(body);

    const updatedEmployee = await updateEmployee(id, parsedData);

    return NextResponse.json({ success: true, data: updatedEmployee }, { status: 200 });

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
    return NextResponse.json({ success: false, error: message }, { status });
  }
}

export async function DELETE(req: Request, { params }: RouteParams) {
  try {
    await validateRole([Role.ADMIN]);
    const { id } = await params;

    await deleteEmployee(id);

    return NextResponse.json({ success: true, message: "Employee deleted successfully" }, { status: 200 });

  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    const status = message === "UNAUTHORIZED" ? 401 : message === "FORBIDDEN" ? 403 : 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}
