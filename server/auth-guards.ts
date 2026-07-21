import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { Role } from "@prisma/client";

export async function getSessionOrThrow() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user) {
    throw new Error("UNAUTHORIZED");
  }

  if (!session.user.isActive) {
    throw new Error("USER_INACTIVE");
  }

  return session;
}

export async function validateRole(allowedRoles: Role[]) {
  const session = await getSessionOrThrow();
  if (!allowedRoles.includes(session.user.role as Role)) {
    throw new Error("FORBIDDEN");
  }
  return session;
}
