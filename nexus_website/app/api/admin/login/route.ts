import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { validateCredentials, createSessionWithExpiry, clearSession } from "@/lib/admin-auth";
import { checkRateLimit, recordAttempt } from "@/lib/rate-limit";
import { encrypt } from "@/lib/encryption";
import { prisma } from "@/lib/db";
import crypto from "node:crypto";

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
    return NextResponse.json(
      { success: false, error: `Too many attempts. Try again in ${Math.ceil(retryAfterMs / 60000)} minutes.` },
      { status: 429 }
    );
  }

  const user = await validateCredentials(email, password);

  if (!user) {
    await recordAttempt(email, false, ip, userAgent);
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

    return NextResponse.json({ success: true, requires2FA: true });
  }

  await createSessionWithExpiry(user, ip, userAgent, !!rememberMe);
  return NextResponse.json({ success: true, requires2FA: false });
}
