import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { validateCredentials, createSessionWithExpiry, clearSession } from "@/lib/admin-auth";
import { checkRateLimit, recordAttempt } from "@/lib/rate-limit";
import { encrypt } from "@/lib/encryption";
import { prisma } from "@/lib/db";
import crypto from "node:crypto";
import { logAdminAction } from "@/lib/audit";

const PENDING_LOGIN_COOKIE = "nexus_admin_2fa_pending";
const PENDING_LOGIN_TTL = 5 * 60; // 5 minutes in seconds

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { email, password, rememberMe } = body as { email: string; password: string; rememberMe?: boolean };

  if (!email || !password) {
    return NextResponse.json(
      { success: false, error: "Email and password are required" },
      { status: 400 }
    );
  }

  const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";
  const userAgent = request.headers.get("user-agent") || undefined;

  const { limited, retryAfterMs } = await checkRateLimit(email);
  if (limited) {
    await logAdminAction({
      action: "sign_in_rate_limited",
      resourceType: "admin_authentication",
      newValue: { loginIdentifierHash: crypto.createHash("sha256").update(email.trim().toLowerCase()).digest("hex") },
      ipAddress: ip,
      userAgent,
    });
    return NextResponse.json(
      { success: false, error: `Too many attempts. Try again in ${Math.ceil(retryAfterMs / 60000)} minutes.` },
      { status: 429 }
    );
  }

  const user = await validateCredentials(email, password);

  if (!user) {
    await recordAttempt(email, false, ip, userAgent);
    await logAdminAction({
      action: "sign_in_failed",
      resourceType: "admin_authentication",
      newValue: { loginIdentifierHash: crypto.createHash("sha256").update(email.trim().toLowerCase()).digest("hex") },
      ipAddress: ip,
      userAgent,
    });
    return NextResponse.json(
      { success: false, error: "Invalid email or password" },
      { status: 401 }
    );
  }

  await recordAttempt(email, true, ip, userAgent);

  const dbUser = await prisma.adminUser.findUnique({
    where: { email: user.email, deletedAt: null },
    select: { twoFactorEnabled: true },
  });

  if (dbUser?.twoFactorEnabled) {
    await clearSession();
    const pendingPayload = JSON.stringify({
      challengeId: crypto.randomUUID(),
      challengeStartedAt: Date.now(),
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      phone: user.phone,
      rememberMe: !!rememberMe,
      expiresAt: Date.now() + PENDING_LOGIN_TTL * 1000,
    });

    const cookieStore = await cookies();
    (cookieStore as unknown as { set: (name: string, value: string, opts: Record<string, unknown>) => void }).set(
      PENDING_LOGIN_COOKIE,
      encrypt(pendingPayload),
      {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: PENDING_LOGIN_TTL,
        path: "/",
      }
    );

    await logAdminAction({
      actorId: user.id,
      adminEmail: user.email,
      action: "two_factor_challenge_started",
      resourceType: "admin_account",
      resourceId: user.id,
      ipAddress: ip,
      userAgent,
    });

    return NextResponse.json({ success: true, requires2FA: true });
  }

  const created = await createSessionWithExpiry(user, ip, userAgent, !!rememberMe);
  if (!created) {
    await logAdminAction({
      actorId: user.id,
      adminEmail: user.email,
      action: "sign_in_blocked_active_session",
      resourceType: "admin_account",
      resourceId: user.id,
      ipAddress: ip,
      userAgent,
    });
    return NextResponse.json({
      success: false,
      code: "SESSION_ALREADY_ACTIVE",
      error: "This account already has an active session. Sign out from that session before signing in here, or reset your password if that device is lost.",
    }, { status: 409 });
  }
  await logAdminAction({
    actorId: user.id,
    adminEmail: user.email,
    action: "sign_in_completed_account_setup_required",
    resourceType: "admin_account",
    resourceId: user.id,
    ipAddress: ip,
    userAgent,
  });
  return NextResponse.json({ success: true, requires2FA: false, requiresTwoFactorSetup: true });
}
