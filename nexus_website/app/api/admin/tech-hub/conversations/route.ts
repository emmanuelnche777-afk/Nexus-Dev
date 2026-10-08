import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/permissions-server";
import prisma from "@/lib/db";
import type { Prisma } from "@prisma/client";

export async function GET(request: Request) {
  const { user, authorized } = await requirePermission("techhub:conversations:*");
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!authorized) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const url = new URL(request.url);
    const status = url.searchParams.get("status");
    const includeArchived = url.searchParams.get("archived") === "true";
    const where: Prisma.TechHubConversationWhereInput = {
      archivedAt: includeArchived ? { not: null } : null,
      ...(status && status !== "all" ? { status } : {}),
    };

    const conversations = await prisma.techHubConversation.findMany({
      where,
      orderBy: { lastMessageAt: "desc" },
      select: {
        id: true,
        orderId: true,
        subject: true,
        clientName: true,
        clientEmail: true,
        clientPhone: true,
        company: true,
        serviceType: true,
        status: true,
        archivedAt: true,
        lastMessageAt: true,
        createdAt: true,
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: { content: true, sender: true, createdAt: true, isInternal: true },
        },
        _count: { select: { messages: true } },
      },
    });

    return NextResponse.json({ conversations });
  } catch (error) {
    console.error("Failed to load conversations:", error);
    return NextResponse.json({ error: "Failed to load conversations" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const { user, authorized } = await requirePermission("techhub:conversations:*");
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!authorized) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const { orderId } = await request.json();

    // A conversation session is always anchored to a Tech Hub service order.
    if (!orderId) {
      return NextResponse.json({ error: "orderId is required" }, { status: 400 });
    }

    const order = await prisma.serviceOrder.findUnique({
      where: { id: orderId },
      select: {
        clientName: true,
        clientEmail: true,
        clientPhone: true,
        company: true,
        serviceType: true,
        serviceTypeKey: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // One session per order — reuse the existing open conversation if present.
    const existing = await prisma.techHubConversation.findFirst({
      where: { orderId, status: { in: ["open", "active"] }, archivedAt: null },
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { messages: true } } },
    });
    if (existing) {
      return NextResponse.json({ conversation: existing }, { status: 200 });
    }

    const conversation = await prisma.techHubConversation.create({
      data: {
        orderId,
        subject: `Conversation for ${order.clientName}`,
        clientName: order.clientName,
        clientEmail: order.clientEmail,
        clientPhone: order.clientPhone || "",
        company: order.company || "",
        serviceType: order.serviceType,
        status: "open",
      },
      include: {
        _count: { select: { messages: true } },
      },
    });

    await prisma.activityLog.create({
      data: {
        action: "conversation.created",
        entity: "TechHubConversation",
        entityId: conversation.id,
        userId: user.id,
        metadata: { clientEmail: conversation.clientEmail, orderId },
      },
    });

    return NextResponse.json({ conversation }, { status: 201 });
  } catch (error) {
    console.error("Failed to create conversation:", error);
    return NextResponse.json({ error: "Failed to create conversation" }, { status: 500 });
  }
}
