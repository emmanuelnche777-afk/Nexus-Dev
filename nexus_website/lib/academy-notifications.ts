import { randomUUID } from "node:crypto";
import prisma from "@/lib/db";
import { escapeHtml } from "@/lib/email-html";
import { sendEmail, sendWhatsApp } from "@/lib/notifications";
import { getNotificationPublicUrl } from "@/lib/urls";

const WELCOME_TEMPLATE = "student_welcome";
const STALE_SENDING_MS = 10 * 60 * 1000;

type DeliveryChannel = "email" | "whatsapp";
type ProviderResult = {
  success?: boolean;
  skipped?: boolean;
  reason?: string;
  id?: string;
  sid?: string;
  error?: unknown;
};

export type StudentWelcomeResult = {
  studentId: string;
  studentCode: string;
  email: { status: string; error?: string; attemptCount: number };
  whatsapp: { status: string; error?: string; attemptCount: number };
};

function normalizePhone(phone: string): string | null {
  const digits = phone.replace(/\D/g, "");
  if (!digits) return null;
  if (phone.startsWith("+")) return `+${digits}`;
  if (/^6\d{8}$/.test(digits)) return `+237${digits}`;
  return `+${digits}`;
}

function welcomeEmailHtml(studentName: string, programTitle: string, code: string, verifyUrl = `${getNotificationPublicUrl()}/academy/verify`): string {
  return `
  <!DOCTYPE html>
  <html><head><meta charset="utf-8" /></head>
  <body style="margin:0;padding:24px;background:#f1f5f9;font-family:Arial,Helvetica,sans-serif;color:#0f172a">
    <main style="max-width:600px;margin:auto;background:#fff;border:1px solid #e2e8f0;border-radius:14px;padding:32px">
      <h1 style="font-size:22px">Welcome to NEXUS Academy</h1>
      <p>Hello ${escapeHtml(studentName)},</p>
      <p>Your payment has been verified and your registration for <strong>${escapeHtml(programTitle)}</strong> is confirmed.</p>
      <p style="font-size:12px;color:#475569">YOUR UNIQUE VERIFICATION ID</p>
      <p style="font:700 24px monospace;color:#0ea5e9">${escapeHtml(code)}</p>
      <p>Verify your enrollment at <a href="${verifyUrl}">${verifyUrl}</a>.</p>
      <p>— NEXUS Academy Team</p>
    </main>
  </body></html>`;
}

function welcomeWhatsAppMessage(studentName: string, programTitle: string, code: string, verifyUrl = `${getNotificationPublicUrl()}/academy/verify`): string {
  return [
    `Welcome to NEXUS Academy, ${studentName}!`,
    `Your registration for ${programTitle} is confirmed.`,
    `Your unique verification ID: ${code}`,
    `Verify your enrollment: ${verifyUrl}`,
    `— NEXUS Academy Team`,
  ].join("\n\n");
}

function errorText(value: unknown): string | undefined {
  if (value instanceof Error) return value.message.slice(0, 1000);
  if (typeof value === "string") return value.slice(0, 1000);
  if (value && typeof value === "object" && "message" in value && typeof value.message === "string") {
    return value.message.slice(0, 1000);
  }
  return value ? "Provider returned an unsuccessful result" : undefined;
}

async function claimDelivery(
  studentId: string,
  channel: DeliveryChannel,
  recipient: string,
  sentById: string
) {
  const delivery = await prisma.academyNotificationDelivery.upsert({
    where: {
      studentId_template_channel: {
        studentId,
        template: WELCOME_TEMPLATE,
        channel,
      },
    },
    create: {
      id: randomUUID(),
      studentId,
      template: WELCOME_TEMPLATE,
      channel,
      recipient,
      status: "pending",
      updatedAt: new Date(),
    },
    update: { recipient, updatedAt: new Date() },
  });

  const staleBefore = new Date(Date.now() - STALE_SENDING_MS);
  const claim = await prisma.academyNotificationDelivery.updateMany({
    where: {
      id: delivery.id,
      OR: [
        { status: { in: ["pending", "failed", "skipped"] } },
        { status: "sending", lastAttemptAt: { lt: staleBefore } },
      ],
    },
    data: {
      status: "sending",
      recipient,
      error: null,
      sentById,
      lastAttemptAt: new Date(),
      attemptCount: { increment: 1 },
      updatedAt: new Date(),
    },
  });

  if (claim.count === 1) {
    return { claimed: true as const, deliveryId: delivery.id, previous: delivery };
  }

  const current = await prisma.academyNotificationDelivery.findUnique({ where: { id: delivery.id } });
  return { claimed: false as const, deliveryId: delivery.id, current };
}

async function deliverChannel(args: {
  student: { id: string; studentCode: string; fullName: string; email: string; phone: string; programTitle: string };
  channel: DeliveryChannel;
  recipient: string;
  sentById: string;
}) {
  const claim = await claimDelivery(args.student.id, args.channel, args.recipient, args.sentById);
  if (!claim.claimed) {
    const current = claim.current;
    return {
      status: current?.status === "sent" ? "already_sent" : current?.status || "unknown",
      error: current?.error || undefined,
      attemptCount: current?.attemptCount || 0,
    };
  }

  let providerResult: ProviderResult;
  try {
    if (!args.recipient) {
      providerResult = {
        skipped: true,
        reason: args.channel === "email" ? "Student has no email address" : "Student has no valid phone number",
      };
    } else if (args.channel === "email") {
      providerResult = await sendEmail({
        to: args.recipient,
        subject: `NEXUS Academy — ${args.student.programTitle} Registration Confirmed`,
        html: welcomeEmailHtml(args.student.fullName, args.student.programTitle, args.student.studentCode),
      });
    } else {
      providerResult = await sendWhatsApp({
        to: args.recipient,
        body: welcomeWhatsAppMessage(args.student.fullName, args.student.programTitle, args.student.studentCode),
      });
    }
  } catch (error) {
    providerResult = { success: false, error };
  }

  const status = providerResult.skipped ? "skipped" : providerResult.success ? "sent" : "failed";
  const error = providerResult.skipped
    ? providerResult.reason || "Channel is not configured"
    : status === "failed" ? errorText(providerResult.error) : undefined;
  const sentAt = status === "sent" ? new Date() : null;
  const updated = await prisma.academyNotificationDelivery.update({
    where: { id: claim.deliveryId },
    data: {
      status,
      error: error || null,
      providerMessageId: providerResult.id || providerResult.sid || null,
      sentAt,
      updatedAt: new Date(),
    },
    select: { status: true, error: true, attemptCount: true },
  });

  return {
    status: updated.status,
    error: updated.error || undefined,
    attemptCount: updated.attemptCount,
  };
}

export async function sendStudentWelcome(student: {
  id: string;
  studentCode: string;
  fullName: string;
  email: string;
  phone: string;
  programTitle: string;
}, sentById: string): Promise<StudentWelcomeResult> {
  const email = await deliverChannel({
    student,
    channel: "email",
    recipient: student.email.trim().toLowerCase(),
    sentById,
  });
  const normalizedPhone = student.phone ? normalizePhone(student.phone) : null;
  const whatsapp = await deliverChannel({
    student,
    channel: "whatsapp",
    recipient: normalizedPhone || "",
    sentById,
  });

  return {
    studentId: student.id,
    studentCode: student.studentCode,
    email,
    whatsapp,
  };
}

export function buildAcademyTestEmailHtml(verifyUrl: string): string {
  return welcomeEmailHtml("Test Student", "Sample Academy Program", "NEXUS-TEST-26-0000", verifyUrl);
}
