import { NextResponse } from "next/server";
import prisma from "@/lib/db";

function newSessionId() {
  return `ai-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export async function GET() {
  try {
    const conversations = await prisma.aiConversation.findMany({
      orderBy: { lastMessageAt: "desc" },
      take: 500,
    });
    return NextResponse.json({ conversations });
  } catch {
    return NextResponse.json({ conversations: [] });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { sessionId, role, text, language, hasImage } = body || {};

    if (!role || typeof text !== "string") {
      return NextResponse.json(
        { ok: false, error: "role and text are required" },
        { status: 400 }
      );
    }
    if (role !== "user" && role !== "assistant") {
      return NextResponse.json(
        { ok: false, error: "role must be 'user' or 'assistant'" },
        { status: 400 }
      );
    }

    const id = typeof sessionId === "string" && sessionId.length > 0 ? sessionId : newSessionId();
    const now = new Date();

    const existing = await prisma.aiConversation.findUnique({ where: { id } });

    const message = {
      id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      role,
      text: text.slice(0, 4000),
      hasImage: Boolean(hasImage),
      timestamp: now.toISOString(),
    };

    if (!existing) {
      await prisma.aiConversation.create({
        data: {
          id,
          language: language || "en",
          startedAt: now,
          lastMessageAt: now,
          messageCount: 1,
          messages: [message],
        },
      });
    } else {
      const messages = Array.isArray(existing.messages) ? existing.messages : [];
      await prisma.aiConversation.update({
        where: { id },
        data: {
          messages: [...messages, message],
          messageCount: messages.length + 1,
          lastMessageAt: now,
          ...(language && existing.language === "en" ? { language } : {}),
        },
      });
    }

    return NextResponse.json({ ok: true, sessionId: id, messageId: message.id });
  } catch (error) {
    console.error("AI chat log failed:", error);
    return NextResponse.json({ ok: false, error: "Logging failed" }, { status: 500 });
  }
}