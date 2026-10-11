import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import type { NextRequest } from "next/server";
import { TOTP, NobleCryptoPlugin, ScureBase32Plugin } from "otplib";
import { prisma } from "@/lib/db";
import { decrypt } from "@/lib/encryption";
import { requirePermission } from "@/lib/permissions-server";
import { markTwoFactorVerified } from "@/lib/admin-auth";
import { checkFailedAttemptLimit, recordAttempt } from "@/lib/rate-limit";
import { logAdminAction } from "@/lib/audit";

const totp = new TOTP({
  issuer: "NEXUS",
  crypto: new NobleCryptoPlugin(),
  base32: new ScureBase32Plugin(),
});

export async function POST(request: NextRequest) {
  // 2FA enrollment belongs to the authenticated account itself, not a staff role.
  const { user, authorized } = await requirePermission("account:security");
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!authorized) return NextResponse.json({ error: "Session locked" }, { status: 423 });
  try {
    const attemptKey = `2fa-enrollment:${user.id}`;
    const limit = await checkFailedAttemptLimit(attemptKey, 5, 15 * 60 * 1000);
    if (limit.limited) {
      return NextResponse.json({ error: "Too many verification attempts. Try again later." }, {
        status: 429,
        headers: { "Retry-After": String(Math.ceil(limit.retryAfterMs / 1000)) },
      });
    }
    const body = await request.json();
    const { code } = body as { code: string };

    if (!code || typeof code !== "string") {
      return NextResponse.json({ error: "Verification code is required" }, { status: 400 });
    }

    const adminUser = await prisma.adminUser.findUnique({
      where: { id: user.id, deletedAt: null },
    });

    if (!adminUser || !adminUser.pendingTwoFactorSecret) {
      return NextResponse.json({ error: "2FA not set up" }, { status: 400 });
    }

    let secret: string;
    try {
      secret = decrypt(adminUser.pendingTwoFactorSecret);
    } catch {
      return NextResponse.json({ error: "Failed to decrypt 2FA secret" }, { status: 500 });
    }

    const result = await totp.verify(code, { secret });
    if (!result.valid) {
      await recordAttempt(attemptKey, false, request.headers.get("x-real-ip") || undefined, request.headers.get("user-agent") || undefined);
      return NextResponse.json({ error: "Invalid verification code" }, { status: 401 });
    }
    await recordAttempt(attemptKey, true, request.headers.get("x-real-ip") || undefined, request.headers.get("user-agent") || undefined);

    await prisma.adminUser.update({
      where: { id: adminUser.id },
      data: {
        twoFactorEnabled: true,
        twoFactorSecret: adminUser.pendingTwoFactorSecret,
        backupCodes: adminUser.pendingBackupCodes ?? Prisma.DbNull,
        pendingTwoFactorSecret: null,
        pendingBackupCodes: Prisma.DbNull,
      },
    });
    await markTwoFactorVerified();
    await logAdminAction({
      actorId: user.id,
      adminEmail: user.email,
      action: "two_factor_enabled",
      resourceType: "admin_account",
      resourceId: user.id,
      ipAddress: request.headers.get("x-real-ip") || request.headers.get("x-forwarded-for")?.split(",")[0]?.trim(),
      userAgent: request.headers.get("user-agent") || undefined,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[2fa/verify] Error:", error);
    return NextResponse.json({ error: "Failed to verify 2FA" }, { status: 500 });
  }
}
