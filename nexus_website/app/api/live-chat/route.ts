import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const chatId = `chat-${Date.now()}`;

    const chat = await prisma.liveChat.create({
      data: {
        id: chatId,
        visitorName: data.name || "Visitor",
        visitorEmail: data.email || "",
        visitorPhone: data.phone || "",
        messages: [
          {
            id: `msg-${Date.now()}`,
            sender: "visitor",
            text: data.message || "",
            timestamp: new Date().toISOString(),
          },
        ],
        status: "active",
      },
    });

    return NextResponse.json({ ok: true, chatId: chat.id });
  } catch (error) {
    console.error("Live chat submission failed:", error);
    return NextResponse.json({ ok: false, error: "Submission failed" }, { status: 500 });
  }
}