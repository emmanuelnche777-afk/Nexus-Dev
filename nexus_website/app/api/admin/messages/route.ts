import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requirePermission } from "@/lib/permissions-server";
import { sendEmail, sendWhatsApp } from "@/lib/notifications";
import { getAdminUrl } from "@/lib/urls";
import { escapeHtml, escapeHtmlWithBreaks, safeEmailSubject } from "@/lib/email-html";
import { enforceActorRateLimit } from "@/lib/rate-limit";

interface Thread {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  lastMessage: string | null;
  lastMessageAt: string | null;
  unreadCount: number;
}

interface Message {
  id: string;
  body: string;
  readAt: string | null;
  createdAt: string;
  isOwn: boolean;
}

const BASE_URL = getAdminUrl();

function normalizePhone(phone: string): string | null {
  const digits = phone.replace(/\D/g, "");
  if (!digits) return null;
  if (phone.startsWith("+")) return `+${digits}`;
  if (/^6\d{8}$/.test(digits)) return `+237${digits}`;
  return `+${digits}`;
}

export async function GET(request: NextRequest) {
  const { user, authorized } = await requirePermission("inbox:messages");
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!authorized) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const { searchParams } = new URL(request.url);
    const withId = searchParams.get("with");

    if (withId) {
      const messages = await prisma.adminMessage.findMany({
        where: {
          OR: [
            { senderId: user.id, recipientId: withId },
            { senderId: withId, recipientId: user.id },
          ],
        },
        orderBy: { createdAt: "asc" },
      });

      const formatted: Message[] = messages.map((msg) => ({
        id: msg.id,
        body: msg.body,
        readAt: msg.readAt?.toISOString() ?? null,
        createdAt: msg.createdAt.toISOString(),
        isOwn: msg.senderId === user.id,
      }));

      await prisma.adminMessage.updateMany({
        where: { senderId: withId, recipientId: user.id, readAt: null },
        data: { readAt: new Date() },
      });

      return NextResponse.json({ messages: formatted });
    }

    const threads: Thread[] = [];

    if (user.role === "SUPER_ADMIN") {
      const staff = await prisma.adminUser.findMany({
        where: {
          role: { not: "SUPER_ADMIN" },
          status: "ACTIVE",
          deletedAt: null,
        },
        select: { id: true, name: true, role: true, email: true, phone: true },
      });

      for (const s of staff) {
        const lastMsg = await prisma.adminMessage.findFirst({
          where: {
            OR: [
              { senderId: user.id, recipientId: s.id },
              { senderId: s.id, recipientId: user.id },
            ],
          },
          orderBy: { createdAt: "desc" },
        });

        const unreadCount = await prisma.adminMessage.count({
          where: { senderId: s.id, recipientId: user.id, readAt: null },
        });

        threads.push({
          id: s.id,
          name: s.name,
          role: s.role,
          email: s.email,
          phone: s.phone,
          lastMessage: lastMsg?.body ?? null,
          lastMessageAt: lastMsg?.createdAt.toISOString() ?? null,
          unreadCount,
        });
      }
    } else {
      const superAdmin = await prisma.adminUser.findFirst({
        where: { role: "SUPER_ADMIN", status: "ACTIVE", deletedAt: null },
        select: { id: true, name: true, role: true, email: true, phone: true },
      });

      if (superAdmin) {
        const lastMsg = await prisma.adminMessage.findFirst({
          where: {
            OR: [
              { senderId: user.id, recipientId: superAdmin.id },
              { senderId: superAdmin.id, recipientId: user.id },
            ],
          },
          orderBy: { createdAt: "desc" },
        });

        const unreadCount = await prisma.adminMessage.count({
          where: { senderId: superAdmin.id, recipientId: user.id, readAt: null },
        });

        threads.push({
          id: superAdmin.id,
          name: superAdmin.name,
          role: superAdmin.role,
          email: superAdmin.email,
          phone: superAdmin.phone,
          lastMessage: lastMsg?.body ?? null,
          lastMessageAt: lastMsg?.createdAt.toISOString() ?? null,
          unreadCount,
        });
      }
    }

    return NextResponse.json({ threads });
  } catch (error) {
    console.error("[messages] GET error:", error);
    return NextResponse.json({ error: "Failed to load messages" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const { user, authorized } = await requirePermission("inbox:messages");
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!authorized) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const rateLimit = await enforceActorRateLimit(user.id, "admin-inbox-messages", 60, 60 * 60 * 1000);
  if (rateLimit) return rateLimit;

  try {
    const body = await request.json();
    const { recipientId, body: messageBody } = body as {
      recipientId?: string;
      body: string;
    };

    if (!messageBody || !messageBody.trim()) {
      return NextResponse.json({ error: "Message body is required" }, { status: 400 });
    }

    if (messageBody.length > 2000) {
      return NextResponse.json(
        { error: "Message body exceeds the 2000 character limit" },
        { status: 400 }
      );
    }

    let recipient: string;

    if (user.role === "SUPER_ADMIN") {
      if (!recipientId) {
        return NextResponse.json({ error: "recipientId is required for Super Admin" }, { status: 400 });
      }
      const target = await prisma.adminUser.findUnique({
        where: { id: recipientId, deletedAt: null, status: "ACTIVE" },
      });
      if (!target) {
        return NextResponse.json({ error: "Recipient not found" }, { status: 404 });
      }
      recipient = target.id;
    } else {
      const superAdmin = await prisma.adminUser.findFirst({
        where: { role: "SUPER_ADMIN", status: "ACTIVE", deletedAt: null },
      });
      if (!superAdmin) {
        return NextResponse.json({ error: "No active Super Admin found" }, { status: 404 });
      }
      recipient = superAdmin.id;
    }

    const message = await prisma.adminMessage.create({
      data: {
        senderId: user.id,
        recipientId: recipient,
        body: messageBody.trim(),
      },
      include: {
        sender: { select: { name: true, email: true } },
        recipient: { select: { name: true, email: true, phone: true } },
      },
    });

    if (message.recipient.phone && recipient !== user.id) {
      const normalized = normalizePhone(message.recipient.phone);
      if (normalized) {
        const truncatedBody =
          messageBody.length > 1000 ? `${messageBody.substring(0, 1000)}...` : messageBody;

        void sendWhatsApp({
          to: normalized,
          body: `🔔 New message from ${message.sender.name || "NEXUS Admin"}: ${truncatedBody}\n\nReply at ${BASE_URL}/admin/messages`,
        });
      }
    }

    void sendEmail({
      to: message.recipient.email,
      subject: safeEmailSubject(`New message from ${message.sender.name || "NEXUS Admin"}`),
      html: `
        <p>Hello ${escapeHtml(message.recipient.name)},</p>
        <p>You have received a new message from ${escapeHtml(message.sender.name || "NEXUS Admin")}:</p>
        <p style="background:#f4f4f4; padding:16px; border-radius:8px; font-family:monospace;">${escapeHtmlWithBreaks(messageBody)}</p>
        <p><a href="${BASE_URL}/admin/messages" style="display:inline-block; padding:10px 20px; background:#0ea5e9; color:#fff; text-decoration:none; border-radius:6px;">Open Messages</a></p>
        <p>— NEXUS Admin Team</p>
      `,
    });

    return NextResponse.json({
      success: true,
      message: {
        id: message.id,
        body: message.body,
        createdAt: message.createdAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("[messages] POST error:", error);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}
