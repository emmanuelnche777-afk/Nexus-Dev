import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { requirePermission } from "@/lib/permissions-server";
import { hasPermission } from "@/lib/permissions";
import { PERMISSIONS } from "@/lib/permissions-data";
import { getContactDepartmentsForRole } from "@/lib/contact-routing";
import { applicationWhereFor, pathwayWhereFor } from "@/lib/intake-scope";

export async function GET() {
  const { user } = await requirePermission("inbox:messages");
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const role = user.role;
  const can = (permission: string) => hasPermission(role, permission);
  const queues: Record<string, number> = {};
  const tasks: Promise<void>[] = [];

  if (can(PERMISSIONS.CONTACT_INQUIRIES_READ)) {
    const departments = getContactDepartmentsForRole(role);
    tasks.push(prisma.contactMessage.count({
      where: { department: { in: departments }, status: { in: ["new", "read"] } },
    }).then((count) => { queues.contact = count; }));
  }
  if (can(PERMISSIONS.PATHWAY_INQUIRIES_READ)) {
    tasks.push(prisma.pathwayInquiry.count({
      where: pathwayWhereFor(role, { status: { in: ["NEW", "REVIEWED"] } }),
    }).then((count) => { queues.joiners = count; }));
  }
  if (can(PERMISSIONS.APPLICATIONS_READ)) {
    tasks.push(prisma.opportunityApplication.count({
      where: applicationWhereFor(role, { status: { in: ["NEW", "UNDER_REVIEW"] } }),
    }).then((count) => { queues.opportunities = count; }));
  }
  if (can(PERMISSIONS.MENTORSHIP_INQUIRIES_READ)) {
    tasks.push(Promise.all([
      prisma.pendingApplication.count({ where: { role: { startsWith: "mentorship" }, status: "new" } }),
      prisma.pathwayInquiry.count({ where: { pathway: { in: ["mentor", "volunteer"] }, status: { in: ["NEW", "REVIEWED"] } } }),
    ]).then(([mentees, mentors]) => {
      queues.mentees = mentees;
      queues.mentors = mentors;
    }));
  }
  if (can(PERMISSIONS.PARTNERSHIP_INQUIRIES_READ)) {
    tasks.push(prisma.partnerInquiry.count({
      where: { status: { notIn: ["approved", "rejected", "not-interested"] } },
    }).then((count) => { queues.partnerships = count; }));
  }
  if (can(PERMISSIONS.SERVICE_INQUIRIES_READ) || can("techhub:*")) {
    tasks.push(prisma.serviceOrder.count({
      where: { status: { in: ["new", "in_progress"] } },
    }).then((count) => { queues.services = count; }));
  }

  if (tasks.length === 0) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    await Promise.all(tasks);
    return NextResponse.json({ queues });
  } catch (error) {
    console.error("Failed to load request overview counts:", error);
    return NextResponse.json({ error: "Failed to load request counts" }, { status: 500 });
  }
}
