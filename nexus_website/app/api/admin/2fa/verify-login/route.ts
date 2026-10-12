import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { TOTP, NobleCryptoPlugin, ScureBase32Plugin } from "otplib";
import crypto from "node:crypto";
import { prisma } from "@/lib/db";
import { decrypt, encrypt } from "@/lib/encryption";
import { createSessionWithExpiry, SafeAdminUser } from "@/lib/admin-auth";
import { checkFailedAttemptLimit, consumeChallengeAttempt, recordAttempt } from "@/lib/rate-limit";
import { logAdminAction } from "@/lib/audit";

const totp = new TOTP({
  issuer: "NEXUS",
  crypto: new NobleCryptoPlugin(),
  base32: new ScureBase32Plugin(),
});

const PENDING_LOGIN_COOKIE = "nexus_admin_2fa_pending";
const CHALLENGE_ATTEMPT_LIMIT = 5;
const ACCOUNT_ATTEMPT_LIMIT = 10;
const IP_ATTEMPT_LIMIT = 30;
const ATTEMPT_WINDOW_MS = 15 * 60 * 1000;
const VERIFIED_REPLACEMENT_TTL_MS = 2 * 60 * 1000;

interface PendingLoginPayload {
  challengeId: string;
  challengeStartedAt: number;
  userId: string;
  email: string;
  name: string;
  role: string;
  phone: string;
  rememberMe?: boolean;
  twoFactorVerifiedAt?: number;
  expiresAt: number;
}

export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  const pendingCookie = (
    cookieStore as unknown as {
      get: (name: string) => { value?: string } | undefined;
      delete: (name: string, opts?: Record<string, unknown>) => void;
      set: (name: string, value: string, opts: Record<string, unknown>) => void;
    }
  ).get(PENDING_LOGIN_COOKIE);

  if (!pendingCookie?.value) {
    return NextResponse.json({ error: "No pending login session" }, { status: 401 });
  }

  let payload: PendingLoginPayload;
  try {
    payload = JSON.parse(decrypt(pendingCookie.value));
  } catch {
    (cookieStore as unknown as { delete: (name: string, opts?: Record<string, unknown>) => void }).delete(PENDING_LOGIN_COOKIE, { path: "/" });
    return NextResponse.json({ error: "Invalid session" }, { status: 401 });
  }

  if (Date.now() > payload.expiresAt) {
    (cookieStore as unknown as { delete: (name: string, opts?: Record<string, unknown>) => void }).delete(PENDING_LOGIN_COOKIE, { path: "/" });
    return NextResponse.json({ error: "Pending login expired" }, { status: 401 });
  }

  if (!payload.challengeId || !Number.isFinite(payload.challengeStartedAt)) {
    (cookieStore as unknown as { delete: (name: string, opts?: Record<string, unknown>) => void }).delete(PENDING_LOGIN_COOKIE, { path: "/" });
    return NextResponse.json({ error: "Invalid session. Please sign in again." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { code, type, replaceActiveSession } = body as {
      code?: string;
      type?: "totp" | "backup";
      replaceActiveSession?: boolean;
    };
    const enteredCode = code?.trim() ?? "";

    const recentlyVerified =
      typeof payload.twoFactorVerifiedAt === "number" &&
      Date.now() - payload.twoFactorVerifiedAt >= 0 &&
      Date.now() - payload.twoFactorVerifiedAt <= VERIFIED_REPLACEMENT_TTL_MS;

    if (replaceActiveSession && !recentlyVerified) {
      return NextResponse.json({ error: "Verify your authenticator code again before replacing the active session." }, { status: 401 });
    }

    if (!replaceActiveSession && !enteredCode) {
      return NextResponse.json({ error: "Verification code is required" }, { status: 400 });
    }

    const forwardedIp = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
    const ip = request.headers.get("x-real-ip")?.trim() || forwardedIp;
    const ipIdentifier = ip
      ? `2fa:ip:${crypto.createHash("sha256").update(ip).digest("hex")}`
      : null;

    const accountLimit = await checkFailedAttemptLimit(
      `2fa:account:${payload.userId}`,
      ACCOUNT_ATTEMPT_LIMIT,
      ATTEMPT_WINDOW_MS
    );
    const ipLimit = ipIdentifier
      ? await checkFailedAttemptLimit(ipIdentifier, IP_ATTEMPT_LIMIT, ATTEMPT_WINDOW_MS)
      : { limited: false, retryAfterMs: 0 };

    if (accountLimit.limited || ipLimit.limited) {
      (cookieStore as unknown as { delete: (name: string, opts?: Record<string, unknown>) => void }).delete(PENDING_LOGIN_COOKIE, { path: "/" });
      const retryAfterMs = Math.max(accountLimit.retryAfterMs, ipLimit.retryAfterMs);
      return NextResponse.json(
        { error: "Too many verification attempts. Please sign in again later." },
        { status: 429, headers: { "Retry-After": String(Math.ceil(retryAfterMs / 1000)) } }
      );
    }

    const challengeAttempt = recentlyVerified && replaceActiveSession
      ? null
      : await consumeChallengeAttempt(
          payload.challengeId,
          payload.challengeStartedAt,
          CHALLENGE_ATTEMPT_LIMIT
        );

    if (challengeAttempt?.limited) {
      (cookieStore as unknown as { delete: (name: string, opts?: Record<string, unknown>) => void }).delete(PENDING_LOGIN_COOKIE, { path: "/" });
      return NextResponse.json(
        { error: "Too many verification attempts. Please sign in again." },
        { status: 429, headers: { "Retry-After": String(Math.ceil(challengeAttempt.retryAfterMs / 1000)) } }
      );
    }

    const user = await prisma.adminUser.findUnique({
      where: { id: payload.userId, deletedAt: null },
    });

    if (!user || !user.twoFactorEnabled || user.status !== "ACTIVE") {
      return NextResponse.json({ error: "Account not eligible for 2FA" }, { status: 403 });
    }

    let valid = recentlyVerified && replaceActiveSession;

    if (!valid && type === "backup") {
      if (!user.backupCodes) {
        return NextResponse.json({ error: "No backup codes available" }, { status: 400 });
      }

      const storedHashes: string[] = JSON.parse(user.backupCodes as string);
      const enteredHash = crypto.createHash("sha256").update(enteredCode).digest("hex");

      const matchIndex = storedHashes.indexOf(enteredHash);
      if (matchIndex !== -1) {
        storedHashes.splice(matchIndex, 1);
        await prisma.adminUser.update({
          where: { id: user.id },
          data: { backupCodes: JSON.stringify(storedHashes) },
        });

        valid = true;
      }
    } else if (!valid) {
      if (!user.twoFactorSecret) {
        return NextResponse.json({ error: "2FA not configured" }, { status: 400 });
      }

      const secret = decrypt(user.twoFactorSecret);
      const result = await totp.verify(enteredCode, { secret });
      valid = result.valid;
    }

    if (!valid) {
      await recordAttempt(`2fa:account:${payload.userId}`, false, undefined, request.headers.get("user-agent") || undefined);
      if (ipIdentifier) {
        await recordAttempt(ipIdentifier, false, undefined, request.headers.get("user-agent") || undefined);
      }
      await logAdminAction({
        actorId: user.id,
        adminEmail: user.email,
        action: "two_factor_login_failed",
        resourceType: "admin_account",
        resourceId: user.id,
        ipAddress: ip || undefined,
        userAgent: request.headers.get("user-agent") || undefined,
      });

      if (challengeAttempt && challengeAttempt.count >= CHALLENGE_ATTEMPT_LIMIT) {
        (cookieStore as unknown as { delete: (name: string, opts?: Record<string, unknown>) => void }).delete(PENDING_LOGIN_COOKIE, { path: "/" });
        return NextResponse.json(
          { error: "Too many verification attempts. Please sign in again." },
          { status: 429, headers: { "Retry-After": String(Math.ceil(challengeAttempt.retryAfterMs / 1000)) } }
        );
      }

      return NextResponse.json({ error: "Invalid verification code" }, { status: 401 });
    }

    const safeUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as SafeAdminUser["role"],
      phone: user.phone,
      twoFactorEnabled: user.twoFactorEnabled,
      requiresTwoFactorSetup: !user.twoFactorEnabled,
      sessionLocked: false,
      requiresFreshTwoFactor: false,
    };

    const created = await createSessionWithExpiry(
      safeUser,
      request.headers.get("x-forwarded-for") || undefined,
      request.headers.get("user-agent") || undefined,
      !!payload.rememberMe,
      Boolean(replaceActiveSession)
    );
    if (!created) {
      const verifiedPayload = JSON.stringify({ ...payload, twoFactorVerifiedAt: Date.now() });
      (cookieStore as unknown as { set: (name: string, value: string, opts: Record<string, unknown>) => void }).set(
        PENDING_LOGIN_COOKIE,
        encrypt(verifiedPayload),
        {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: Math.ceil(VERIFIED_REPLACEMENT_TTL_MS / 1000),
          path: "/",
        }
      );
      await logAdminAction({
        actorId: user.id,
        adminEmail: user.email,
        action: "sign_in_blocked_active_session",
        resourceType: "admin_account",
        resourceId: user.id,
        ipAddress: ip || undefined,
        userAgent: request.headers.get("user-agent") || undefined,
      });
      return NextResponse.json({
        error: "This account already has an active session. Sign out from that session before signing in here, or reset your password if that device is lost.",
        code: "SESSION_ALREADY_ACTIVE",
        canReplaceActiveSession: true,
      }, { status: 409 });
    }

    (cookieStore as unknown as { delete: (name: string, opts?: Record<string, unknown>) => void }).delete(PENDING_LOGIN_COOKIE, { path: "/" });

    await logAdminAction({
      actorId: user.id,
      adminEmail: user.email,
      action: replaceActiveSession ? "sign_in_completed_replaced_active_session" : "sign_in_completed",
      resourceType: "admin_account",
      resourceId: user.id,
      ipAddress: ip || undefined,
      userAgent: request.headers.get("user-agent") || undefined,
    });

    return NextResponse.json({ success: true, requires2FA: false });
  } catch (error) {
    console.error("[2fa/verify-login] Error:", error);
    return NextResponse.json({ error: "Failed to verify 2FA" }, { status: 500 });
  }
}
