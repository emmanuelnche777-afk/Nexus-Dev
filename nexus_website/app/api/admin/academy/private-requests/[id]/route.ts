import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { requirePermission } from "@/lib/permissions-server";
import { logAdminAction } from "@/lib/audit";

const allowedStatuses = new Set(["new", "reviewing", "approved", "declined"]);

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const { user, authorized } = await requirePermission("academy:registrations:*");
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

    const existing = await prisma.academyPrivateEnrollmentRequest.findUnique({ where: { id }, select: { status: true, adminNotes: true } });
    if (!existing) return NextResponse.json({ error: "Request not found." }, { status: 404 });
    const updated = await prisma.academyPrivateEnrollmentRequest.update({
      where: { id },
      data: { status, adminNotes: adminNotes || null, reviewedAt: status === "new" ? null : new Date() },
    });
    await logAdminAction({
      adminEmail: user.email,
      action: "update",
      resourceType: "academy_private_enrollment_request",
      resourceId: id,
      oldValue: existing,
      newValue: { status, adminNotes: adminNotes || null },
    });
    return NextResponse.json({ request: updated });
  } catch (error) {
    console.error("[academy-private-requests] Failed to update:", error);
    return NextResponse.json({ error: "Failed to update request." }, { status: 500 });
  }
}
