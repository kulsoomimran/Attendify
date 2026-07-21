import { NextResponse } from "next/server";
import { validateRole } from "@/server/auth-guards";
import { Role } from "@prisma/client";
import { createEmployeeSchema } from "@/server/validators/employee";
import { getEmployees, createEmployee } from "@/server/services/employee-service";
import { ZodError } from "zod";

export async function GET(req: Request) {
  try {
    // 1. Authenticate and authorize Admin role
    await validateRole([Role.ADMIN]);

    // 2. Parse query parameters
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || undefined;
    const isActiveParam = searchParams.get("isActive");
    const isActive = isActiveParam !== null ? isActiveParam === "true" : undefined;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);

    // 3. Query employees using employee-service
    const result = await getEmployees({ search, isActive, page, limit });

    return NextResponse.json({
      success: true,
      data: result.employees,
      pagination: result.pagination,
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
    // 1. Authenticate and authorize Admin role
    await validateRole([Role.ADMIN]);

    // 2. Parse and validate request payload
    const body = await req.json();
    const parsedData = createEmployeeSchema.parse(body);

    // 3. Execute Service Business Logic
    const employee = await createEmployee(parsedData);

    return NextResponse.json({
      success: true,
      data: employee,
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
