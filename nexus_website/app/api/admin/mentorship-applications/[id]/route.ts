import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { requirePermission } from "@/lib/permissions-server";
import { PERMISSIONS } from "@/lib/permissions-data";

const allowedStatuses = new Set(["new", "reviewing", "approved", "rejected"]);

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { user, authorized } = await requirePermission(PERMISSIONS.MENTORSHIP_INQUIRIES_TRIAGE);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!authorized) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const { id } = await context.params;
    const body = await request.json();
    const status = typeof body.status === "string" ? body.status : "";
    const adminNotes = typeof body.adminNotes === "string" ? body.adminNotes.trim() : "";
    if (!allowedStatuses.has(status) || adminNotes.length > 4000) {
      return NextResponse.json({ error: "Invalid status or notes are too long." }, { status: 400 });
    }

    const existing = await prisma.pendingApplication.findFirst({
      where: { id, role: { startsWith: "mentorship" } },
      select: { id: true },
    });
    if (!existing) return NextResponse.json({ error: "Application not found." }, { status: 404 });

    const application = await prisma.pendingApplication.update({
      where: { id },
      data: { status, adminNotes: adminNotes || null },
      select: { id: true, status: true, adminNotes: true, updatedAt: true },
    });
    return NextResponse.json({ application });
  } catch (error) {
    console.error("Failed to update mentee application:", error);
    return NextResponse.json({ error: "Failed to update application." }, { status: 500 });
  }
}
