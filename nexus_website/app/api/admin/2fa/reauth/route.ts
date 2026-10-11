import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { TOTP, NobleCryptoPlugin, ScureBase32Plugin } from "otplib";
import { prisma } from "@/lib/db";
import { decrypt } from "@/lib/encryption";
import { markTwoFactorVerified } from "@/lib/admin-auth";
import { requirePermission } from "@/lib/permissions-server";
import { checkFailedAttemptLimit, recordAttempt } from "@/lib/rate-limit";
import { logAdminAction } from "@/lib/audit";

const totp = new TOTP({ issuer: "NEXUS", crypto: new NobleCryptoPlugin(), base32: new ScureBase32Plugin() });
const ATTEMPT_WINDOW_MS = 15 * 60 * 1000;

export async function POST(request: NextRequest) {
  const { user, authorized } = await requirePermission("account:security");
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!authorized || user.sessionLocked) return NextResponse.json({ error: "Unlock your session first" }, { status: 423 });
  if (!user.twoFactorEnabled) return NextResponse.json({ error: "Set up two-factor authentication first" }, { status: 403 });

  const attemptKey = `sensitive-action-2fa:${user.id}`;
  const limit = await checkFailedAttemptLimit(attemptKey, 5, ATTEMPT_WINDOW_MS);
  if (limit.limited) {
    return NextResponse.json({ error: "Too many verification attempts. Try again later." }, {
      status: 429,
      headers: { "Retry-After": String(Math.ceil(limit.retryAfterMs / 1000)) },
    });
  }

  const body = await request.json().catch(() => null);
  const code = body?.code;
  if (typeof code !== "string" || !/^\d{6}$/.test(code)) {
    await recordAttempt(attemptKey, false, request.headers.get("x-real-ip") || undefined, request.headers.get("user-agent") || undefined);
    return NextResponse.json({ error: "Enter the 6-digit code from your authenticator" }, { status: 400 });
  }

  const account = await prisma.adminUser.findUnique({ where: { id: user.id }, select: { twoFactorSecret: true } });
  if (!account?.twoFactorSecret) return NextResponse.json({ error: "Authenticator is not configured" }, { status: 403 });
  const result = await totp.verify(code, { secret: decrypt(account.twoFactorSecret) });
  const valid = result.valid;
  await recordAttempt(attemptKey, valid, request.headers.get("x-real-ip") || undefined, request.headers.get("user-agent") || undefined);
  if (!valid) {
    await logAdminAction({
      actorId: user.id,
      adminEmail: user.email,
      action: "sensitive_action_2fa_failed",
      resourceType: "admin_account",
      resourceId: user.id,
      ipAddress: request.headers.get("x-real-ip") || request.headers.get("x-forwarded-for")?.split(",")[0]?.trim(),
      userAgent: request.headers.get("user-agent") || undefined,
    });
    return NextResponse.json({ error: "That authenticator code is not valid" }, { status: 401 });
  }

  await markTwoFactorVerified();
  await logAdminAction({
    actorId: user.id,
    adminEmail: user.email,
    action: "sensitive_action_2fa_verified",
    resourceType: "admin_account",
    resourceId: user.id,
    ipAddress: request.headers.get("x-real-ip") || request.headers.get("x-forwarded-for")?.split(",")[0]?.trim(),
    userAgent: request.headers.get("user-agent") || undefined,
  });
  return NextResponse.json({ success: true });
}
