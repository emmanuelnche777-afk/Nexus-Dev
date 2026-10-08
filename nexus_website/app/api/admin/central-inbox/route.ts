import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/permissions-server";

import prisma from "@/lib/db";

interface AggregatedMessage {
  id: string;
  sender: string;
  senderEmail: string;
  subject: string;
  message: string;
  type: "contact" | "partnership" | "newsletter" | "general";
  status: "unread" | "read" | "replied" | "archived";
  category: "urgent" | "high" | "normal" | "low";
  createdAt: string;
}

function mapStatus(status: string): AggregatedMessage["status"] {
  if (status === "replied") return "replied";
  if (status === "archived") return "archived";
  if (status === "read") return "read";
  return "unread";
}

export async function GET() {
  const { user, authorized } = await requirePermission("central-inbox:*");
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!authorized) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const [contactMessages, partnerInquiries, liveChats] = await Promise.all([
    prisma.contactMessage.findMany({ orderBy: { createdAt: "desc" }, take: 100 }),
    prisma.partnerInquiry.findMany({ orderBy: { createdAt: "desc" }, take: 100 }),
    prisma.liveChat.findMany({ orderBy: { updatedAt: "desc" }, take: 50 }),
  ]);

  const messages: AggregatedMessage[] = [
    ...contactMessages.map((m): AggregatedMessage => ({
      id: m.id,
      sender: m.name,
      senderEmail: m.email,
      subject: m.subject,
      message: m.message,
      type: "contact",
      status: mapStatus(m.status),
      category: "normal",
      createdAt: m.createdAt.toISOString(),
    })),
    ...partnerInquiries.map((p): AggregatedMessage => ({
      id: p.id,
      sender: p.name,
      senderEmail: p.email,
      subject: `${p.type} Partnership Inquiry`,
      message: p.message,
      type: "partnership",
      status: mapStatus(p.status),
      category: "high",
      createdAt: p.createdAt.toISOString(),
    })),
    ...liveChats.map((c): AggregatedMessage => ({
      id: c.id,
      sender: c.visitorName,
      senderEmail: c.visitorEmail,
      subject: "Live Chat",
      message: typeof c.messages === "string" ? c.messages : JSON.stringify(c.messages),
      type: "general",
      status: c.status === "active" ? ("unread" as const) : ("read" as const),
      category: c.status === "active" ? ("urgent" as const) : ("normal" as const),
      createdAt: c.createdAt.toISOString(),
    })),
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const unread = messages.filter(
    (m) => m.status === "unread" || ["urgent", "high"].includes(m.category)
  );

  return NextResponse.json({ messages: unread });
}

export async function POST(request: Request) {
  const { user, authorized } = await requirePermission("central-inbox:*");
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!authorized) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const form = await request.json();
    const message = await prisma.contactMessage.create({
      data: {
        id: `msg-${Date.now()}`,
        name: form.sender,
        email: form.senderEmail,
        subject: form.subject,
        message: form.message,
        source: form.type || "admin",
      },
    });

    return NextResponse.json(
      {
        id: message.id,
        sender: message.name,
        senderEmail: message.email,
        subject: message.subject,
        message: message.message,
        type: form.type || "contact",
        status: "unread",
        category: "normal",
        createdAt: message.createdAt.toISOString(),
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json({ error: "Failed to add message to inbox" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const { user, authorized } = await requirePermission("central-inbox:*");
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!authorized) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const { messageId, status } = await request.json();

    const updated = await prisma.contactMessage.update({
      where: { id: messageId },
      data: { status },
    });

    return NextResponse.json({
      id: updated.id,
      sender: updated.name,
      senderEmail: updated.email,
      subject: updated.subject,
      message: updated.message,
      status: mapStatus(updated.status),
    });
  } catch {
    return NextResponse.json({ error: "Failed to update message status" }, { status: 500 });
  }
}
