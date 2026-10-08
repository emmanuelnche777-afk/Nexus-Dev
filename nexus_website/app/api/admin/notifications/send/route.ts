import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/permissions-server";
import { sendEmail, sendWhatsApp, sendSms } from "@/lib/notifications";
import prisma from "@/lib/db";
import type { Prisma } from "@prisma/client";
import { escapeHtmlWithBreaks } from "@/lib/email-html";
import { enforceActorRateLimit, enforceOutboundRateLimit } from "@/lib/rate-limit";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function POST(request: NextRequest) {
  const { user, authorized } = await requirePermission("*");
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!authorized) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const body = await request.json();
    const type = body?.type;
    let to = typeof body?.to === "string" ? body.to.trim() : "";
    const subject = typeof body?.subject === "string" ? body.subject.trim().replace(/[\r\n]+/g, " ") : "";
    const textBody = typeof body?.body === "string" ? body.body.trim() : "";

    if (type !== "email" && type !== "sms" && type !== "whatsapp") {
      return NextResponse.json({ error: "Invalid notification type" }, { status: 400 });
    }
    if (!textBody || textBody.length > (type === "email" ? 10000 : 1600)) {
      return NextResponse.json({ error: "Message body is missing or exceeds the allowed length" }, { status: 400 });
    }
    if (type === "email") {
      to = to.toLowerCase();
      if (to.length > 254 || !EMAIL_RE.test(to) || !subject || subject.length > 150) {
        return NextResponse.json({ error: "Enter one valid email address and a subject under 150 characters" }, { status: 400 });
      }
    } else {
      const digits = to.replace(/\D/g, "");
      if (digits.length < 8 || digits.length > 15) {
        return NextResponse.json({ error: "Enter one valid phone number" }, { status: 400 });
      }
      to = `+${digits}`;
    }

    const actorLimit = await enforceActorRateLimit(user.id, "manual-notifications", 20, 60 * 60 * 1000);
    if (actorLimit) return actorLimit;
    const recipientLimit = await enforceOutboundRateLimit(request, to, {
      scope: "admin-manual-notification",
      ipLimit: 30,
      ipWindowMs: 60 * 60 * 1000,
      recipientLimit: 5,
      recipientWindowMs: 60 * 60 * 1000,
    });
    if (recipientLimit) return recipientLimit;

    let result: Record<string, unknown> | undefined;
    let status = "sent";
    try {
      if (type === "email") {
        result = await sendEmail({ to, subject, html: `<div>${escapeHtmlWithBreaks(textBody)}</div>` });
      } else if (type === "sms") {
        result = await sendSms({ to, body: textBody });
      } else {
        result = await sendWhatsApp({ to, body: textBody });
      }
      if (result?.skipped) status = "skipped";
      else if (result?.success === false) status = "failed";
    } catch (sendError) {
      status = "failed";
      result = { success: false, error: sendError instanceof Error ? sendError.message : "Send failed" };
    }

    let logEntry;
    try {
      logEntry = await prisma.notificationLog.create({
        data: {
          id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          type,
          to,
          subject: type === "email" ? subject : null,
          body: textBody,
          status,
          result: result ? (result as unknown as Prisma.InputJsonValue) : undefined,
          error: status === "failed" && typeof result?.error === "string" ? result.error : null,
          sentById: user.id,
        },
      });
    } catch (logError) {
      console.error("[notifications] Failed to write log:", logError);
    }

    if (status === "failed") {
      return NextResponse.json({ ...result, logged: logEntry?.id, status }, { status: 502 });
    }
    return NextResponse.json({ ...result, logged: logEntry?.id, status });
  } catch (error) {
    console.error("Notification error:", error);
    return NextResponse.json({ error: "Failed to send notification" }, { status: 500 });
  }
}
