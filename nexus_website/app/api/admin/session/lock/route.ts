import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSession, lockCurrentSession } from "@/lib/admin-auth";
import { logAdminAction } from "@/lib/audit";

export async function POST(request: NextRequest) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Sign in again to continue" }, { status: 401 });

  const locked = user.sessionLocked || await lockCurrentSession();
  if (!locked) return NextResponse.json({ error: "This session is no longer available" }, { status: 409 });

  if (!user.sessionLocked) {
    await logAdminAction({
      actorId: user.id,
      adminEmail: user.email,
      action: "session_locked_manually",
      resourceType: "admin_session",
      ipAddress: request.headers.get("x-real-ip") || request.headers.get("x-forwarded-for")?.split(",")[0]?.trim(),
      userAgent: request.headers.get("user-agent") || undefined,
    });
  }

  return NextResponse.json({ success: true });
}
