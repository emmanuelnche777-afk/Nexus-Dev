import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/permissions-server";

import prisma from "@/lib/db";
import { triggerNotification } from "@/lib/notification-triggers";
import { getAdminUrl } from "@/lib/urls";

export async function GET() {
  const { user, authorized } = await requirePermission("ai-escalations:*");
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!authorized) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const escalations = await prisma.aiEscalation.findMany({
    where: {
      status: { in: ["new", "pending"] },
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ escalations });
}

export async function POST(request: Request) {
  const { user, authorized } = await requirePermission("ai-escalations:*");
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!authorized) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const form = await request.json();

    const newEscalation = await prisma.aiEscalation.create({
      data: {
        conversationId: form.conversationId,
        clientName: form.clientName,
        clientEmail: form.clientEmail,
        reason: form.reason,
        aiMessages: form.aiMessages ?? [],
        status: "new",
      },
    });

    await triggerNotification("ai_escalation", {
      summary: `New AI escalation from ${form.clientName}: ${form.reason}`,
      referenceId: newEscalation.id,
      link: `${getAdminUrl()}/admin/ai/escalations/${newEscalation.id}`,
    });

    return NextResponse.json(newEscalation, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create escalation" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const { user, authorized } = await requirePermission("ai-escalations:*");
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!authorized) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const { escalationId, status, adminResponse, assignedTo } = await request.json();

    const escalation = await prisma.aiEscalation.update({
      where: { id: escalationId },
      data: {
        status,
        adminResponse,
        assignedTo,
        ...(status !== "new" && { respondedAt: new Date() }),
      },
    });

    return NextResponse.json(escalation);
  } catch {
    return NextResponse.json({ error: "Failed to update escalation" }, { status: 500 });
  }
}
