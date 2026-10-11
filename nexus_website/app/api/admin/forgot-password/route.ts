import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import crypto from "node:crypto";
import { prisma } from "@/lib/db";
import { sendEmail, sendSms, sendWhatsApp } from "@/lib/notifications";
import { getAdminUrl } from "@/lib/urls";
import { enforceOutboundRateLimit } from "@/lib/rate-limit";
import { hashPasswordResetToken } from "@/lib/password-reset";

const GENERIC_RESPONSE = {
  success: true,
  message: "If an account has that verified recovery method, instructions have been sent.",
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, channel = "primary_email" } = body as { email: string; channel?: string };

    if (typeof email !== "string" || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      return NextResponse.json({ error: "Valid email is required" }, { status: 400 });
    }
    const normalizedEmail = email.trim().toLowerCase();
    if (!["primary_email", "backup_email", "sms", "whatsapp"].includes(channel)) {
      return NextResponse.json({ error: "Choose a supported recovery method" }, { status: 400 });
    }

    const limited = await enforceOutboundRateLimit(request, normalizedEmail, {
      scope: "admin-password-reset",
      ipLimit: 10,
      ipWindowMs: 60 * 60 * 1000,
      recipientLimit: 3,
      recipientWindowMs: 60 * 60 * 1000,
    });
    if (limited) return limited;

    const account = await prisma.adminUser.findUnique({ where: { email: normalizedEmail, deletedAt: null } });
    if (!account) return NextResponse.json(GENERIC_RESPONSE);

    const useEmail = channel === "primary_email" || channel === "backup_email";
    const recipient = channel === "backup_email"
      ? (account.recoveryEmailVerifiedAt ? account.recoveryEmail : null)
      : channel === "sms" || channel === "whatsapp"
        ? (account.recoveryPhoneVerifiedAt ? account.recoveryPhone : null)
        : account.email;
    if (!recipient) return NextResponse.json(GENERIC_RESPONSE);

    const isCode = !useEmail;
    const token = isCode ? crypto.randomInt(100000, 1000000).toString() : crypto.randomBytes(32).toString("hex");
    const tokenHash = hashPasswordResetToken(token);
    const expiresAt = new Date(Date.now() + (isCode ? 10 * 60 * 1000 : 60 * 60 * 1000));
    await prisma.adminUser.update({ where: { id: account.id }, data: { passwordResetTokenHash: tokenHash, passwordResetTokenExpiresAt: expiresAt } });

    if (useEmail) {
      const resetLink = `${getAdminUrl()}/admin/reset-password?token=${encodeURIComponent(token)}`;
      await sendEmail({
        to: recipient,
        subject: "NEXUS Admin — Password Reset Request",
        html: `<p>You requested a password reset for your NEXUS Admin account.</p><p><a href="${resetLink}">Reset your password</a></p><p>This link expires in one hour. If you did not request this, ignore this message.</p>`,
      });
    } else if (channel === "sms") {
      await sendSms({ to: recipient, body: `NEXUS Admin password reset code: ${token}. It expires in 10 minutes.` });
    } else {
      await sendWhatsApp({ to: recipient, body: `NEXUS Admin password reset code: ${token}. It expires in 10 minutes.` });
    }

    return NextResponse.json(GENERIC_RESPONSE);
  } catch (error) {
    console.error("[forgot-password] Error:", error);
    return NextResponse.json({
      success: true,
      message: "If an account with that email exists, a reset link has been sent.",
    });
  }
}
