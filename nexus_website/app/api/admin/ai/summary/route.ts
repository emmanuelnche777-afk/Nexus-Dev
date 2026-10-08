import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { requirePermission } from "@/lib/permissions-server";
import { hasPermission } from "@/lib/permissions";

export async function GET() {
  const { user } = await requirePermission("inbox:messages");
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const role = user.role;
  const may = (permission: string) => hasPermission(role, permission);
  const permissions = {
    chats: may("ai-chat:*"),
    escalations: may("ai-escalations:*"),
    liveChats: may("ai-live-support:*"),
    knowledge: may("content:ai-knowledge:*"),
    videos: may("content:ai-videos:*"),
  };
  if (!Object.values(permissions).some(Boolean)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const [conversations, escalations, liveChats, knowledge, videos] = await Promise.all([
      permissions.chats ? prisma.adminChatMessage.count() : 0,
      permissions.escalations ? prisma.aiEscalation.count({ where: { status: { in: ["new", "pending"] } } }) : 0,
      permissions.liveChats ? prisma.liveChat.count({ where: { status: "active" } }) : 0,
      permissions.knowledge ? prisma.aiKnowledge.count({ where: { approved: false } }) : 0,
      permissions.videos ? prisma.aiVideo.count({ where: { status: "published" } }) : 0,
    ]);
    return NextResponse.json({
      counts: { chats: conversations, escalations, liveChats, knowledge, videos },
      permissions,
    });
  } catch (error) {
    console.error("Failed to load AI overview counts:", error);
    return NextResponse.json({ error: "Failed to load AI overview" }, { status: 500 });
  }
}
