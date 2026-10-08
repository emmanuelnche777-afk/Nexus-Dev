import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/permissions-server";
import prisma from "@/lib/db";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, authorized } = await requirePermission("techhub:conversations:*");
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!authorized) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const { id } = await params;
    const conversation = await prisma.techHubConversation.findUnique({
      where: { id },
      include: {
        order: { select: { id: true, serviceType: true, status: true } },
        messages: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!conversation) return NextResponse.json({ error: "Conversation not found" }, { status: 404 });

    return NextResponse.json({ conversation });
  } catch (error) {
    console.error("Failed to load conversation:", error);
    return NextResponse.json({ error: "Failed to load conversation" }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, authorized } = await requirePermission("techhub:conversations:*");
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!authorized) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const { id } = await params;
    const { content, sender, senderName, isInternal, channel } = await request.json();

    if (!content?.trim()) {
      return NextResponse.json({ error: "Message content is required" }, { status: 400 });
    }

    const conversation = await prisma.techHubConversation.findUnique({ where: { id } });
    if (!conversation) return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    if (conversation.archivedAt) return NextResponse.json({ error: "Restore this archived conversation before sending a message" }, { status: 409 });

    const message = await prisma.techHubMessage.create({
      data: {
        conversationId: id,
        content: content.trim(),
        sender: sender || "admin",
        senderName: senderName || user.name || user.email || "Admin",
        isInternal: !!isInternal,
        channel: channel || "chat-session",
      },
      include: { conversation: true },
    });

    await prisma.techHubConversation.update({
      where: { id },
      data: { lastMessageAt: new Date(), status: "active" },
    });

    return NextResponse.json({ message });
  } catch (error) {
    console.error("Failed to send message:", error);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}
