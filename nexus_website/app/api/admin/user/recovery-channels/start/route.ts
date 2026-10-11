import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requirePermission } from "@/lib/permissions-server";
import { enforceActorRateLimit } from "@/lib/rate-limit";
import { sendEmail, sendSms, sendWhatsApp } from "@/lib/notifications";
import { escapeHtml } from "@/lib/email-html";

const OTP_TTL_MS = 10 * 60 * 1000;

export async function POST(request: NextRequest) {
  const { user, authorized } = await requirePermission("account:security");
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!authorized) return NextResponse.json({ error: "Unlock your session first" }, { status: 423 });

  const limited = await enforceActorRateLimit(user.id, "recovery-contact-verification", 3, 60 * 60 * 1000);
  if (limited) return limited;

  const body = await request.json().catch(() => null);
  const type = body?.type;
  const channel = body?.channel;
  if (!((type === "email" && channel === "email") ||
        (type === "phone" && (channel === "sms" || channel === "whatsapp")))) {
    return NextResponse.json({ error: "Choose an email address or a phone number and delivery method" }, { status: 400 });
  }

  const account = await prisma.adminUser.findUnique({
    where: { id: user.id, deletedAt: null },
    select: { email: true, recoveryEmail: true, phone: true },
  });
  if (!account) return NextResponse.json({ error: "Account not found" }, { status: 404 });

  let target: string;
  if (type === "email") {
    target = typeof body?.target === "string" ? body.target.trim().toLowerCase() : "";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(target) || target === account.email.toLowerCase()) {
      return NextResponse.json({ error: "Enter a valid backup email that differs from your staff email" }, { status: 400 });
    }
  } else {
    target = account.phone;
    if (!target || !/^\+?[1-9]\d{7,14}$/.test(target.replace(/[\s()-]/g, ""))) {
      return NextResponse.json({ error: "Add a valid phone number to your profile first" }, { status: 400 });
    }
  }

  const code = crypto.randomInt(100000, 1000000).toString();
  const codeHash = await bcrypt.hash(code, 10);
  const expiresAt = new Date(Date.now() + OTP_TTL_MS);
  let delivery: { success?: boolean; skipped?: boolean; reason?: string };

  if (channel === "email") {
    delivery = await sendEmail({
      to: target,
      subject: "NEXUS Admin — Verify your recovery email",
      html: `<p>Your recovery verification code is <strong>${escapeHtml(code)}</strong>.</p><p>It expires in 10 minutes. If you did not request this, ignore this message.</p>`,
    });
  } else if (channel === "sms") {
    delivery = await sendSms({ to: target, body: `NEXUS Admin recovery verification code: ${code}. Expires in 10 minutes.` });
  } else {
    delivery = await sendWhatsApp({ to: target, body: `NEXUS Admin recovery verification code: ${code}. Expires in 10 minutes.` });
  }

  if (!delivery.success) {
    return NextResponse.json({ error: delivery.skipped ? "That recovery delivery provider is not configured yet" : "Could not send the verification code" }, { status: delivery.skipped ? 503 : 502 });
  }

  await prisma.adminUser.update({
    where: { id: user.id },
    data: {
      pendingRecoveryTarget: target,
      pendingRecoveryType: type,
      pendingRecoveryChannel: channel,
      pendingRecoveryCodeHash: codeHash,
      pendingRecoveryExpiresAt: expiresAt,
    },
  });
  return NextResponse.json({ success: true, expiresAt });
}
