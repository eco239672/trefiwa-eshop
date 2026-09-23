import { getSession } from "../../app/authActions";
import { db } from "../db";

export class AdminAuthorizationError extends Error {}

export function isAdminRole(role: string | null | undefined) {
  return role === "ADMIN";
}

/** Resolves the role from the database on every privileged request. */
export async function requireAdmin() {
  const session = await getSession();
  if (!session) throw new AdminAuthorizationError("Prihlásenie správcu je potrebné.");

  const user = await db.user.findUnique({
    where: { id: session.id },
    select: { id: true, role: true },
  });
  if (!user || !isAdminRole(user.role)) {
    throw new AdminAuthorizationError("Nemáte oprávnenie správcu.");
  }
  return user;
}
