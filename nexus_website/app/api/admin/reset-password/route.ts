import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import crypto from "node:crypto";
import { prisma } from "@/lib/db";
import { hashPassword, invalidateUserSessions } from "@/lib/admin-auth";
import { enforceActorRateLimit, enforceOutboundRateLimit } from "@/lib/rate-limit";
import { hashPasswordResetToken } from "@/lib/password-reset";
import { logAdminAction } from "@/lib/audit";

const PASSWORD_MIN_LENGTH = 10;
const RESET_ATTEMPT_LIMIT = 5;
const RESET_ATTEMPT_WINDOW_MS = 15 * 60 * 1000;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, password, email } = body as { token: string; password: string; email?: string };

    if (
      typeof token !== "string" ||
      typeof password !== "string" ||
      !token ||
      !password ||
      token.length > 128 ||
      password.length > 1024
    ) {
      return NextResponse.json({ error: "A valid token and password are required" }, { status: 400 });
    }

    const tokenHash = hashPasswordResetToken(token);
    const legacyTokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const limited = await enforceOutboundRateLimit(request, tokenHash, {
      scope: "admin-password-reset-submit",
      ipLimit: 20,
      ipWindowMs: RESET_ATTEMPT_WINDOW_MS,
      recipientLimit: RESET_ATTEMPT_LIMIT,
      recipientWindowMs: RESET_ATTEMPT_WINDOW_MS,
    });
    if (limited) return limited;

    if (password.length < PASSWORD_MIN_LENGTH) {
      return NextResponse.json(
        { error: `Password must be at least ${PASSWORD_MIN_LENGTH} characters` },
        { status: 400 }
      );
    }

    const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
    const user = normalizedEmail
      ? await prisma.adminUser.findUnique({ where: { email: normalizedEmail, deletedAt: null } })
      : await prisma.adminUser.findFirst({
          where: { passwordResetTokenHash: { in: [tokenHash, legacyTokenHash] }, deletedAt: null },
        });

    if (user && normalizedEmail) {
      const attempts = await enforceActorRateLimit(user.id, "password-reset-code-verification", 5, RESET_ATTEMPT_WINDOW_MS);
      if (attempts) return attempts;
    }

    if (!user || !user.passwordResetTokenExpiresAt || user.passwordResetTokenExpiresAt < new Date()) {
      return NextResponse.json(
        { error: "Invalid or expired reset link" },
        { status: 401 }
      );
    }
    if (user.passwordResetTokenHash !== tokenHash && user.passwordResetTokenHash !== legacyTokenHash) {
      return NextResponse.json({ error: "Invalid or expired reset code" }, { status: 401 });
    }

    const passwordHash = await hashPassword(password);

    await prisma.$transaction(async (tx) => {
      await tx.adminUser.update({
        where: { id: user.id },
        data: {
          passwordHash,
          passwordResetTokenHash: null,
          passwordResetTokenExpiresAt: null,
        },
      });
      await tx.adminSession.deleteMany({ where: { userId: user.id } });
    });

    await invalidateUserSessions(user.id);

    await logAdminAction({
      actorId: user.id,
      adminEmail: user.email,
      action: "password_reset_completed",
      resourceType: "admin_account",
      resourceId: user.id,
      ipAddress: request.headers.get("x-real-ip") || request.headers.get("x-forwarded-for")?.split(",")[0]?.trim(),
      userAgent: request.headers.get("user-agent") || undefined,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[reset-password] Error:", error);
    return NextResponse.json({ error: "Failed to reset password" }, { status: 500 });
  }
}
