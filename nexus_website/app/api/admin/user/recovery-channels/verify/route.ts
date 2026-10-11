import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requirePermission } from "@/lib/permissions-server";
import { checkFailedAttemptLimit, recordAttempt } from "@/lib/rate-limit";
import { logAdminAction } from "@/lib/audit";

export async function POST(request: NextRequest) {
  const { user, authorized } = await requirePermission("account:security");
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!authorized) return NextResponse.json({ error: "Unlock your session first" }, { status: 423 });

  const attemptKey = `recovery-contact-code:${user.id}`;
  const limit = await checkFailedAttemptLimit(attemptKey, 5, 15 * 60 * 1000);
  if (limit.limited) {
    return NextResponse.json({ error: "Too many code attempts. Try again later." }, {
      status: 429,
      headers: { "Retry-After": String(Math.ceil(limit.retryAfterMs / 1000)) },
    });
  }

  const body = await request.json().catch(() => null);
  const code = body?.code;
  if (typeof code !== "string" || !/^\d{6}$/.test(code)) {
    await recordAttempt(attemptKey, false);
    return NextResponse.json({ error: "Enter the 6-digit verification code" }, { status: 400 });
  }

  const account = await prisma.adminUser.findUnique({ where: { id: user.id } });
  const pending = account?.pendingRecoveryCodeHash && account.pendingRecoveryExpiresAt && account.pendingRecoveryExpiresAt > new Date();
  if (!account || !pending || !account.pendingRecoveryType || !account.pendingRecoveryTarget) {
    return NextResponse.json({ error: "No active recovery verification. Request a new code." }, { status: 400 });
  }

  const valid = await bcrypt.compare(code, account.pendingRecoveryCodeHash!);
  await recordAttempt(attemptKey, valid);
  if (!valid) return NextResponse.json({ error: "That verification code is not valid" }, { status: 401 });

  const now = new Date();
  const data = account.pendingRecoveryType === "email"
    ? { recoveryEmail: account.pendingRecoveryTarget, recoveryEmailVerifiedAt: now }
    : { recoveryPhone: account.pendingRecoveryTarget, recoveryPhoneVerifiedAt: now };
  await prisma.adminUser.update({
    where: { id: user.id },
    data: {
      ...data,
      pendingRecoveryTarget: null,
      pendingRecoveryType: null,
      pendingRecoveryChannel: null,
      pendingRecoveryCodeHash: null,
      pendingRecoveryExpiresAt: null,
    },
  });
  await logAdminAction({ actorId: user.id, adminEmail: user.email, action: "recovery_contact_verified", resourceType: "admin_account", resourceId: user.id, newValue: { type: account.pendingRecoveryType } });
  return NextResponse.json({ success: true, type: account.pendingRecoveryType });
}
