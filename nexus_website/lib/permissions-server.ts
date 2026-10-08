import { getSession, SESSION_COOKIE } from "@/lib/admin-auth";
import type { SafeAdminUser } from "@/lib/admin-auth";
import { hasPermission } from "./permissions";
import { ROLE_PERMISSIONS, ROLE_DESCRIPTIONS, type AdminRole, type AdminStatus } from "./permissions-data";

export type AuthedUser = SafeAdminUser;
export { AdminRole, AdminStatus, ROLE_PERMISSIONS, ROLE_DESCRIPTIONS };

export async function requirePermission(
  permission: string
): Promise<{ user: AuthedUser | null; authorized: boolean }> {
  const user = await getSession();
  if (!user) {
    return { user: null, authorized: false };
  }

  const authorized = hasPermission(user.role, permission);
  return { user, authorized };
}

export { SESSION_COOKIE };