import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import crypto from "node:crypto";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/admin-auth";
import { enforceOutboundRateLimit } from "@/lib/rate-limit";
import { logAdminAction } from "@/lib/audit";

const PASSWORD_MIN_LENGTH = 10;

export async function POST(request: NextRequest) {
  try {
    const ipLimit = await enforceOutboundRateLimit(request, null, {
      scope: "admin-invite-accept",
      ipLimit: 10,
      ipWindowMs: 15 * 60 * 1000,
      recipientLimit: 5,
      recipientWindowMs: 15 * 60 * 1000,
    });
    if (ipLimit) return ipLimit;

    const body = await request.json();
    const { token, password } = body as { token: string; password: string };

    if (!token || !password) {
      return NextResponse.json({ error: "Token and password are required" }, { status: 400 });
    }

    if (password.length < PASSWORD_MIN_LENGTH) {
      return NextResponse.json(
        { error: `Password must be at least ${PASSWORD_MIN_LENGTH} characters` },
        { status: 400 }
      );
    }

    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    const tokenLimit = await enforceOutboundRateLimit(request, tokenHash, {
      scope: "admin-invite-token",
      ipLimit: 10,
      ipWindowMs: 15 * 60 * 1000,
      recipientLimit: 5,
      recipientWindowMs: 15 * 60 * 1000,
    });
    if (tokenLimit) return tokenLimit;

    const user = await prisma.adminUser.findFirst({
      where: {
        invitedTokenHash: tokenHash,
        deletedAt: null,
      },
    });

    if (!user || !user.invitedTokenExpiresAt || user.invitedTokenExpiresAt < new Date()) {
      return NextResponse.json(
        { error: "Invalid or expired invitation link" },
        { status: 401 }
      );
    }

    const passwordHash = await hashPassword(password);

    await prisma.adminUser.update({
      where: { id: user.id },
      data: {
        passwordHash,
        status: "ACTIVE",
        invitedTokenHash: null,
        invitedTokenExpiresAt: null,
      },
    });

    await logAdminAction({
      actorId: user.id,
      adminEmail: user.email,
      action: "staff_invitation_accepted",
      resourceType: "admin_account",
      resourceId: user.id,
      ipAddress: request.headers.get("x-real-ip") || request.headers.get("x-forwarded-for")?.split(",")[0]?.trim(),
      userAgent: request.headers.get("user-agent") || undefined,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[accept-invite] Error:", error);
    return NextResponse.json({ error: "Failed to accept invitation" }, { status: 500 });
  }
}
