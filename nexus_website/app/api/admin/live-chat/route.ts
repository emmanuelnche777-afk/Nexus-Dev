import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/permissions-server";
import prisma from "@/lib/db";

export async function GET() {
  const { user, authorized } = await requirePermission("ai-live-support:*");
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!authorized) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const chats = await prisma.liveChat.findMany({
      orderBy: { updatedAt: "desc" },
    });
    return NextResponse.json({ chats });
  } catch {
    return NextResponse.json({ chats: [] });
  }
}

export async function POST(request: NextRequest) {
  const { user, authorized } = await requirePermission("ai-live-support:*");
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!authorized) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const body = await request.json();
    const chat = await prisma.liveChat.create({
      data: {
        id: body.id || `chat-${Date.now()}`,
        visitorName: body.visitorName || "",
        visitorEmail: body.visitorEmail || "",
        visitorPhone: body.visitorPhone || null,
        messages: body.messages ?? [],
        status: body.status || "active",
      },
    });
    return NextResponse.json(chat, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create chat" }, { status: 500 });
  }
}
