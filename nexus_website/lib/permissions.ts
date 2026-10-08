import { ROLE_PERMISSIONS, ROLE_DESCRIPTIONS, type AdminRole, type AdminStatus } from "./permissions-data";

export type AuthedUser = {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
  phone: string;
};
export { AdminRole, AdminStatus, ROLE_PERMISSIONS, ROLE_DESCRIPTIONS };

/**
 * Whether a role holds a permission.
 *
 * Three forms are accepted, tried in order:
 *   exact match          "joiners:pathways:read"
 *   resource wildcard    "joiners:pathways:*" grants every verb on that resource
 *   global wildcard      "*" grants everything (SUPER_ADMIN)
 */
export function hasPermission(role: AdminRole, permission: string): boolean {
  const perms = ROLE_PERMISSIONS[role] || [];

  if (perms.includes("*")) {
    return true;
  }

  if (perms.includes(permission)) {
    return true;
  }

  // "joiners:pathways:read" -> "joiners:pathways"
  const resource = permission.replace(/:[^:]*$/, "");
  if (
    perms.includes(`${resource}:*`) ||
    perms.includes(`${resource}:*.*`)
  ) {
    return true;
  }

  // A wildcard on an ancestor resource grants a nested one, e.g. "joiners:*"
  // grants "joiners:pathways:read".
  return perms.some(
    (p) => p.endsWith(":*") && permission.startsWith(p.slice(0, -2))
  );
}