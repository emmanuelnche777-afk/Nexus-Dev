import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/permissions-server";
import prisma from "@/lib/db";

interface ChatConversation {
  id: string;
  sessionId: string;
  language: string;
  startedAt: Date;
  lastMessageAt: Date;
  messageCount: number;
  messages: Array<{
    id: string;
    role: "user" | "assistant";
    text: string;
    timestamp: Date;
    hasImage: boolean;
  }>;
  hasImage: boolean;
}

export async function GET() {
  const { user, authorized } = await requirePermission("ai-chat:*");
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!authorized) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const messages = await prisma.adminChatMessage.findMany({
      orderBy: { timestamp: "desc" },
    });

    const grouped = new Map<string, ChatConversation>();
    for (const item of messages) {
      const key = item.sessionId;
      if (!grouped.has(key)) {
        grouped.set(key, {
          id: key,
          sessionId: item.sessionId,
          language: item.language,
          startedAt: item.timestamp,
          lastMessageAt: item.timestamp,
          messageCount: 0,
          messages: [],
          hasImage: false,
        });
      }
      const conv = grouped.get(key)!;
      conv.messages.push({
        id: item.id,
        role: "user" as const,
        text: item.userMessage,
        timestamp: item.timestamp,
        hasImage: item.hasImage,
      });
      conv.messages.push({
        id: `${item.id}-ai`,
        role: "assistant" as const,
        text: item.aiReply,
        timestamp: item.timestamp,
        hasImage: item.hasImage,
      });
      conv.messageCount += 2;
      conv.lastMessageAt = item.timestamp;
      if (item.hasImage) conv.hasImage = true;
    }

    const sorted = Array.from(grouped.values()).sort(
      (a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
    );
    const totalMessages = sorted.reduce((sum, c) => sum + c.messageCount, 0);

    return NextResponse.json({
      conversations: sorted,
      stats: {
        total: sorted.length,
        totalMessages,
        withImages: sorted.filter((c) => c.hasImage).length,
      },
    });
  } catch {
    return NextResponse.json({ conversations: [], stats: { total: 0, totalMessages: 0, withImages: 0 } });
  }
}

export async function DELETE(request: Request) {
  const { user, authorized } = await requirePermission("ai-chat:*");
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!authorized) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const body = await request.json();
    await prisma.adminChatMessage.deleteMany({
      where: {
        sessionId: body.id,
      },
    });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
