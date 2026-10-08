import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/permissions-server";
import prisma from "@/lib/db";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { user, authorized } = await requirePermission("techhub:conversations:*");
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!authorized) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const { id } = await params;
    const { action } = await request.json();
    if (action !== "archive" && action !== "restore") {
      return NextResponse.json({ error: "Action must be archive or restore" }, { status: 400 });
    }
    const conversation = await prisma.techHubConversation.findUnique({ where: { id } });
    if (!conversation) return NextResponse.json({ error: "Conversation not found" }, { status: 404 });

    const archivedAt = action === "archive" ? new Date() : null;
    await prisma.techHubConversation.update({ where: { id }, data: { archivedAt } });
    await prisma.activityLog.create({
      data: {
        action: action === "archive" ? "conversation.archived" : "conversation.restored",
        entity: "TechHubConversation",
        entityId: id,
        userId: user.id,
        metadata: { orderId: conversation.orderId },
      },
    });
    return NextResponse.json({ success: true, archivedAt });
  } catch (error) {
    console.error("Failed to update conversation archive state:", error);
    return NextResponse.json({ error: "Failed to update conversation" }, { status: 500 });
  }
}
