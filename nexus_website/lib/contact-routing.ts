import type { AdminRole } from "@/lib/permissions-data";

export const CONTACT_DEPARTMENTS = [
  "academy",
  "tech_hub",
  "mentorship",
  "partnership",
  "foundation",
  "general",
] as const;

export type ContactDepartment = (typeof CONTACT_DEPARTMENTS)[number];

export const CONTACT_DEPARTMENT_LABELS: Record<ContactDepartment, string> = {
  academy: "Academy",
  tech_hub: "Tech Hub",
  mentorship: "Mentorship",
  partnership: "Partnership",
  foundation: "Foundation",
  general: "General / Not sure",
};

const DEPARTMENT_ROLES: Record<ContactDepartment, readonly AdminRole[]> = {
  academy: ["ACADEMY_MANAGER"],
  tech_hub: ["TECH_HUB_MANAGER"],
  mentorship: ["MENTORSHIP_COORDINATOR"],
  partnership: ["SUPPORT_STAFF"],
  foundation: ["SUPER_ADMIN"],
  general: ["SUPPORT_STAFF"],
};

export function isContactDepartment(value: unknown): value is ContactDepartment {
  return typeof value === "string" && CONTACT_DEPARTMENTS.includes(value as ContactDepartment);
}

export function getContactDepartmentsForRole(role: AdminRole): ContactDepartment[] {
  if (role === "SUPER_ADMIN") return [...CONTACT_DEPARTMENTS];
  return CONTACT_DEPARTMENTS.filter((department) => DEPARTMENT_ROLES[department].includes(role));
}

export function canAccessContactDepartment(role: AdminRole, department: string): boolean {
  return isContactDepartment(department) && getContactDepartmentsForRole(role).includes(department);
}

export function getContactDepartmentRoles(department: ContactDepartment): readonly AdminRole[] {
  return DEPARTMENT_ROLES[department];
}
