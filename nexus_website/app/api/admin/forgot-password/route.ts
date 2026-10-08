import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import crypto from "node:crypto";
import { prisma } from "@/lib/db";
import { sendEmail } from "@/lib/notifications";
import { getAdminUrl } from "@/lib/urls";
import { enforceOutboundRateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body as { email: string };

    if (typeof email !== "string" || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      return NextResponse.json({ error: "Valid email is required" }, { status: 400 });
    }
    const normalizedEmail = email.trim().toLowerCase();

    const limited = await enforceOutboundRateLimit(request, normalizedEmail, {
      scope: "admin-password-reset",
      ipLimit: 10,
      ipWindowMs: 60 * 60 * 1000,
      recipientLimit: 3,
      recipientWindowMs: 60 * 60 * 1000,
    });
    if (limited) return limited;

    const token = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.adminUser.update({
      where: { email: normalizedEmail, deletedAt: null },
      data: {
        passwordResetTokenHash: tokenHash,
        passwordResetTokenExpiresAt: expiresAt,
      },
    });

    const baseUrl = getAdminUrl();
    const resetLink = `${baseUrl}/admin/reset-password?token=${token}`;

    const emailResult = await sendEmail({
      to: normalizedEmail,
      subject: "NEXUS Admin — Password Reset Request",
      html: `
        <p>Hello,</p>
        <p>You requested a password reset for your NEXUS Admin account.</p>
        <p><a href="${resetLink}">Click here to reset your password</a></p>
        <p>This link expires in 1 hour.</p>
        <p>If you did not request this, you can safely ignore this email.</p>
        <p>— NEXUS Admin Team</p>
      `,
    });

    if (emailResult?.skipped && process.env.NODE_ENV !== "production") {
      console.info("[dev] Password reset link (email skipped):", resetLink);
    }

    return NextResponse.json({
      success: true,
      message: "If an account with that email exists, a reset link has been sent.",
    });
  } catch (error) {
    console.error("[forgot-password] Error:", error);
    return NextResponse.json({
      success: true,
      message: "If an account with that email exists, a reset link has been sent.",
    });
  }
}
