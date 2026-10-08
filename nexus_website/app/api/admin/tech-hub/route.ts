import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/permissions-server";
import prisma from "@/lib/db";

export async function GET(request: Request) {
  const { user, authorized } = await requirePermission("techhub:services:*");
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!authorized) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const url = new URL(request.url);
    const path = url.pathname;

    if (path.includes("/contracts")) {
      // Return contracts
      const contracts = await prisma.serviceOrder.findMany({
        where: {
          status: { in: ["in-progress", "pending", "completed"] },
        },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          clientName: true,
          clientEmail: true,
          clientPhone: true,
          serviceType: true,
          serviceTypeKey: true,
          description: true,
          status: true,
          priority: true,
          createdAt: true,
        },
      });

      return NextResponse.json({ contracts });
    }

    if (path.includes("/communication-tools")) {
      // Return communication tools
      const tools = [
        {
          id: "email",
          toolName: "Email Templates",
          description: "Email templates for service updates, confirmations, and communications",
          icon: "mail",
          status: "active",
        },
        {
          id: "slack",
          toolName: "Slack Integration",
          description: "Slack integration for real-time team communication and notifications",
          icon: "message-square",
          status: "active",
        },
        {
          id: "whatsapp",
          toolName: "WhatsApp Business API",
          description: "WhatsApp Business API for client communication and updates",
          icon: "message-square",
          status: "active",
        },
        {
          id: "sms",
          toolName: "SMS Notifications",
          description: "SMS notifications for urgent service updates and alerts",
          icon: "message-square",
          status: "active",
        },
      ];

      return NextResponse.json({ tools });
    }

    // Default: return service orders/messages
    const messages = await prisma.serviceOrder.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        clientName: true,
        clientEmail: true,
        clientPhone: true,
        serviceType: true,
        serviceTypeKey: true,
        description: true,
        status: true,
        priority: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ messages });
  } catch (error) {
    console.error("Failed to load tech hub communications:", error);
    return NextResponse.json({ 
      messages: [], 
      contracts: [], 
      tools: [] 
    });
  }
}

export async function PUT(request: Request) {
  const { user, authorized } = await requirePermission("techhub:services:*");
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!authorized) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const body = await request.json();
    const { id, ...data } = body;

    const message = await prisma.serviceOrder.update({
      where: { id },
      data,
    });

    return NextResponse.json(message);
  } catch (error) {
    console.error("Failed to update tech hub communication:", error);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const { user, authorized } = await requirePermission("techhub:services:*");
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!authorized) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const body = await request.json();
    await prisma.serviceOrder.delete({ where: { id: body.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete tech hub communication:", error);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
