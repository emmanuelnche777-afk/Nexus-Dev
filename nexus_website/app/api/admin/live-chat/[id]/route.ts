import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/permissions-server";
import { logAdminAction } from "@/lib/audit";
import prisma from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, authorized } = await requirePermission("ai-live-support:*");
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!authorized) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const chat = await prisma.liveChat.findUnique({ where: { id } });

  if (!chat) {
    return NextResponse.json({ error: "Chat not found" }, { status: 404 });
  }

  return NextResponse.json(chat);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, authorized } = await requirePermission("ai-live-support:*");
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!authorized) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const body = await request.json();
    const { id } = await params;

    const existing = await prisma.liveChat.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }

    const oldMessages = Array.isArray(existing.messages) ? existing.messages as Array<Record<string, unknown>> : [];
    const oldIds = new Set(oldMessages.map((message) => message.id).filter((id): id is string => typeof id === "string"));
    const messages = Array.isArray(body.messages)
      ? (body.messages as Array<Record<string, unknown>>).map((message) =>
          message.sender === "admin" && typeof message.id === "string" && !oldIds.has(message.id)
            ? { ...message, adminName: user.name }
            : message
        )
      : existing.messages;

    const chat = await prisma.liveChat.update({
      where: { id },
      data: {
        ...body,
        id,
        messages,
        updatedAt: new Date(),
      },
    });
    return NextResponse.json(chat);
  } catch {
    return NextResponse.json({ error: "Failed to update chat" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, authorized } = await requirePermission("ai-live-support:*");
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!authorized) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const { id } = await params;
    const existing = await prisma.liveChat.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }

    await prisma.liveChat.delete({ where: { id } });
    await logAdminAction({ actorId: user.id, adminEmail: user.email, action: "record_deleted", resourceType: "live_chat", resourceId: id });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete chat" }, { status: 500 });
  }
}
