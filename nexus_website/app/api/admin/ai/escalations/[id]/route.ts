import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/permissions-server";

import prisma from "@/lib/db";
import { logAdminAction } from "@/lib/audit";
import { triggerNotification } from "@/lib/notification-triggers";
import { getAdminUrl } from "@/lib/urls";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, authorized } = await requirePermission("ai-escalations:*");
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!authorized) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const { id } = await params;
    const escalation = await prisma.aiEscalation.findUnique({ where: { id } });

    if (!escalation) {
      return NextResponse.json({ error: "Escalation not found" }, { status: 404 });
    }

    return NextResponse.json(escalation);
  } catch {
    return NextResponse.json({ error: "Failed to load escalation" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, authorized } = await requirePermission("ai-escalations:*");
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!authorized) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const { id } = await params;
    const { status, adminResponse, assignedTo } = await request.json();

    const oldValue = await prisma.aiEscalation.findUnique({
      where: { id },
      select: { status: true },
    });

    const escalation = await prisma.aiEscalation.update({
      where: { id },
      data: {
        status,
        adminResponse,
        assignedTo,
        ...(status !== "new" && { respondedAt: new Date() }),
      },
    });

    await logAdminAction({
      adminEmail: user.email,
      action: status === "resolved" || status === "closed" ? "resolve" : "update",
      resourceType: "ai-escalation",
      resourceId: id,
      oldValue: { status: oldValue?.status },
      newValue: { status, adminResponse, assignedTo },
    });

    if (status === "resolved" || status === "closed") {
      await triggerNotification("ai_escalation", {
        summary: `Escalation ${id} ${status} by ${user.email}`,
        referenceId: id,
        link: `${getAdminUrl()}/admin/ai/escalations/${id}`,
      });
    }

    return NextResponse.json(escalation);
  } catch {
    return NextResponse.json({ error: "Failed to update escalation" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, authorized } = await requirePermission("ai-escalations:*");
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!authorized) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const { id } = await params;
    await prisma.aiEscalation.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete escalation" }, { status: 500 });
  }
}
