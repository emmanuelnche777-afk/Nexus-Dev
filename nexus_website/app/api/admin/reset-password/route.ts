import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import crypto from "node:crypto";
import { prisma } from "@/lib/db";
import { hashPassword, invalidateUserSessions } from "@/lib/admin-auth";
import { enforceOutboundRateLimit } from "@/lib/rate-limit";

const PASSWORD_MIN_LENGTH = 10;
const RESET_ATTEMPT_LIMIT = 5;
const RESET_ATTEMPT_WINDOW_MS = 15 * 60 * 1000;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, password } = body as { token: string; password: string };

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

    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
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

    const user = await prisma.adminUser.findFirst({
      where: {
        passwordResetTokenHash: tokenHash,
        deletedAt: null,
      },
    });

    if (!user || !user.passwordResetTokenExpiresAt || user.passwordResetTokenExpiresAt < new Date()) {
      return NextResponse.json(
        { error: "Invalid or expired reset link" },
        { status: 401 }
      );
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

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[reset-password] Error:", error);
    return NextResponse.json({ error: "Failed to reset password" }, { status: 500 });
  }
}
