import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSession, unlockCurrentSession } from "@/lib/admin-auth";
import { checkFailedAttemptLimit, recordAttempt } from "@/lib/rate-limit";
import { logAdminAction } from "@/lib/audit";

export async function POST(request: NextRequest) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Sign in again to continue" }, { status: 401 });
  const attemptKey = `session-unlock:${user.id}`;
  const limit = await checkFailedAttemptLimit(attemptKey, 5, 15 * 60 * 1000);
  if (limit.limited) {
    return NextResponse.json({ error: "Too many password attempts. Try again later." }, {
      status: 429,
      headers: { "Retry-After": String(Math.ceil(limit.retryAfterMs / 1000)) },
    });
  }

  const body = await request.json().catch(() => null);
  const password = body?.password;
  if (typeof password !== "string" || password.length === 0 || password.length > 1024) {
    return NextResponse.json({ error: "Enter your password to unlock this session" }, { status: 400 });
  }

  const unlocked = await unlockCurrentSession(password);
  await recordAttempt(attemptKey, unlocked, request.headers.get("x-real-ip") || undefined, request.headers.get("user-agent") || undefined);
  if (!unlocked) {
    await logAdminAction({
      actorId: user.id,
      adminEmail: user.email,
      action: "session_unlock_failed",
      resourceType: "admin_session",
      ipAddress: request.headers.get("x-real-ip") || request.headers.get("x-forwarded-for")?.split(",")[0]?.trim(),
      userAgent: request.headers.get("user-agent") || undefined,
    });
    return NextResponse.json({ error: "The password is incorrect or this session is no longer available" }, { status: 401 });
  }

  await logAdminAction({
    actorId: user.id,
    adminEmail: user.email,
    action: "session_unlocked",
    resourceType: "admin_session",
    ipAddress: request.headers.get("x-real-ip") || request.headers.get("x-forwarded-for")?.split(",")[0]?.trim(),
    userAgent: request.headers.get("user-agent") || undefined,
  });

  return NextResponse.json({ success: true });
}
