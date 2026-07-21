import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { CreateEmployeeInput, UpdateEmployeeInput } from "../validators/employee";
import { Role } from "@prisma/client";

export async function getEmployees(params: {
  search?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}) {
  const { search, isActive, page = 1, limit = 10 } = params;
  const skip = (page - 1) * limit;

  const where: any = {};

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
      {
        employeeProfile: {
          department: { contains: search, mode: "insensitive" },
        },
      },
    ];
  }

  if (isActive !== undefined) {
    where.isActive = isActive;
  }

  // Retrieve matching users along with their employee profiles and current shifts
  const [employees, total] = await Promise.all([
    db.user.findMany({
      where,
      include: {
        employeeProfile: {
          include: {
            shift: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    db.user.count({ where }),
  ]);

  return {
    employees,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getEmployeeById(id: string) {
  return await db.user.findUnique({
    where: { id },
    include: {
      employeeProfile: {
        include: {
          shift: true,
        },
      },
    },
  });
}

export async function createEmployee(data: CreateEmployeeInput) {
  // 1. Create User using Better Auth programmatic sign-up to handle hashing and accounts mapping
  const registerResult = await auth.api.signUpEmail({
    body: {
      email: data.email,
      password: data.password || "TempPass123!",
      name: data.name,
    },
  });

  if (!registerResult || !registerResult.user) {
    throw new Error("FAILED_TO_CREATE_USER");
  }

  const userId = registerResult.user.id;

  // 2. Set additional fields (role, isActive) and create the associated EmployeeProfile
  const updatedUser = await db.user.update({
    where: { id: userId },
    data: {
      role: data.role || Role.EMPLOYEE,
      isActive: true,
      employeeProfile: {
        create: {
          department: data.department || null,
          shiftId: data.shiftId || null,
          isRemote: data.isRemote ?? false,
        },
      },
    },
    include: {
      employeeProfile: {
        include: {
          shift: true,
        },
      },
    },
  });

  return updatedUser;
}

export async function updateEmployee(id: string, data: UpdateEmployeeInput) {
  const userUpdateData: any = {};
  if (data.name !== undefined) userUpdateData.name = data.name;
  if (data.email !== undefined) userUpdateData.email = data.email;
  if (data.role !== undefined) userUpdateData.role = data.role;
  if (data.isActive !== undefined) userUpdateData.isActive = data.isActive;

  const profileUpdateData: any = {};
  if (data.department !== undefined) profileUpdateData.department = data.department;
  if (data.shiftId !== undefined) profileUpdateData.shiftId = data.shiftId;
  if (data.isRemote !== undefined) profileUpdateData.isRemote = data.isRemote;

  return await db.$transaction(async (tx) => {
    const user = await tx.user.update({
      where: { id },
      data: {
        ...userUpdateData,
        employeeProfile: {
          update: {
            data: profileUpdateData,
          },
        },
      },
      include: {
        employeeProfile: {
          include: {
            shift: true,
          },
        },
      },
    });

    return user;
  });
}

export async function deleteEmployee(id: string) {
  return await db.user.delete({
    where: { id },
  });
}

export async function assignShift(employeeId: string, shiftId: string | null) {
  const profile = await db.employeeProfile.findUnique({
    where: { userId: employeeId },
  });

  if (!profile) {
    throw new Error("EMPLOYEE_PROFILE_NOT_FOUND");
  }

  return await db.employeeProfile.update({
    where: { userId: employeeId },
    data: {
      shiftId: shiftId || null,
    },
    include: {
      shift: true,
      user: true,
    },
  });
}
