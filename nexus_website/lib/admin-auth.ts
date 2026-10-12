import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { encrypt, decrypt } from "@/lib/encryption";
import type { AdminRole } from "@/lib/permissions";

export const SESSION_COOKIE = "nexus_admin_session";
export const SESSION_MAX_AGE = 24 * 60 * 60; // 24 hours in seconds
export const SESSION_MAX_AGE_REMEMBERED = 30 * 24 * 60 * 60; // 30 days in seconds

export type SafeAdminUser = {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
  phone: string;
  twoFactorEnabled: boolean;
  requiresTwoFactorSetup: boolean;
  sessionLocked: boolean;
  requiresFreshTwoFactor: boolean;
};

const TWO_FACTOR_REAUTH_MS = 5 * 60 * 1000;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function validateCredentials(
  email: string,
  password: string
): Promise<SafeAdminUser | null> {
  const user = await prisma.adminUser.findUnique({
    where: { email, deletedAt: null },
  });

  if (!user || user.status !== "ACTIVE" || !user.passwordHash) {
    return null;
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return null;

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role as AdminRole,
    phone: user.phone,
    twoFactorEnabled: user.twoFactorEnabled,
    requiresTwoFactorSetup: !user.twoFactorEnabled,
    sessionLocked: false,
    requiresFreshTwoFactor: true,
  };
}

export async function createSession(
  user: SafeAdminUser,
  ip?: string,
  userAgent?: string
): Promise<void> {
  await createSessionWithExpiry(user, ip, userAgent, false);
}

export async function createSessionWithExpiry(
  user: SafeAdminUser,
  ip: string | undefined,
  userAgent: string | undefined,
  rememberMe: boolean
): Promise<boolean> {
  const token = crypto.randomBytes(32).toString("hex");
  const maxAge = rememberMe ? SESSION_MAX_AGE_REMEMBERED : SESSION_MAX_AGE;
  const now = new Date();
  const created = await prisma.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${user.id})::bigint)`;
    const active = await tx.adminSession.count({
      where: { userId: user.id, expiresAt: { gt: now } },
    });
    if (active > 0) return false;

    await tx.adminSession.create({
      data: {
        token,
        userId: user.id,
        expiresAt: new Date(now.getTime() + maxAge * 1000),
        lastActiveAt: now,
        reauthenticatedAt: user.twoFactorEnabled ? now : null,
        ipAddress: ip,
        userAgent,
      },
    });
    return true;
  });

  if (!created) return false;

  const cookieStore = await cookies();
  (cookieStore as unknown as { set: (name: string, value: string, opts: Record<string, unknown>) => void }).set(
    SESSION_COOKIE,
    token,
    {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: maxAge,
      path: "/",
    }
  );
  return true;
}

export async function getSession(): Promise<SafeAdminUser | null> {
  const cookieStore = await cookies();
  const cookie = (
    cookieStore as unknown as {
      get: (name: string) => { value?: string } | undefined;
      delete: (name: string, opts?: Record<string, unknown>) => void;
    }
  ).get(SESSION_COOKIE);

  if (!cookie?.value) return null;

  try {
    const session = await prisma.adminSession.findFirst({
      where: {
        token: cookie.value,
        expiresAt: { gt: new Date() },
      },
      include: { user: true },
    });

    if (!session || session.user.status !== "ACTIVE" || session.user.deletedAt) {
      await clearSession();
      return null;
    }

    // Existing installations may have more than one session from before the
    // one-session policy. Honor only the most recently active one.
    const winner = await prisma.adminSession.findFirst({
      where: { userId: session.userId, expiresAt: { gt: new Date() } },
      orderBy: [{ lastActiveAt: "desc" }, { createdAt: "desc" }],
      select: { id: true },
    });
    if (winner?.id !== session.id) {
      await clearSession();
      return null;
    }

    const now = new Date();
    const sessionLocked = Boolean(session.lockedAt);

    return {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
      role: session.user.role as AdminRole,
      phone: session.user.phone,
      twoFactorEnabled: session.user.twoFactorEnabled,
      requiresTwoFactorSetup: !session.user.twoFactorEnabled,
      sessionLocked,
      requiresFreshTwoFactor: !session.reauthenticatedAt || now.getTime() - session.reauthenticatedAt.getTime() > TWO_FACTOR_REAUTH_MS,
    };
  } catch {
    return null;
  }
}

/** Records explicit foreground input. Background API traffic does not extend idle time. */
export async function recordSessionActivity(): Promise<boolean> {
  const cookieStore = await cookies();
  const cookie = (cookieStore as unknown as { get: (name: string) => { value?: string } | undefined })
    .get(SESSION_COOKIE);
  if (!cookie?.value) return false;

  const now = new Date();
  const result = await prisma.adminSession.updateMany({
    where: {
      token: cookie.value,
      expiresAt: { gt: now },
      lockedAt: null,
    },
    data: { lastActiveAt: now },
  });
  return result.count === 1;
}

/** Locks the current session immediately while keeping it available for password unlock. */
export async function lockCurrentSession(): Promise<boolean> {
  const cookieStore = await cookies();
  const cookie = (cookieStore as unknown as { get: (name: string) => { value?: string } | undefined })
    .get(SESSION_COOKIE);
  if (!cookie?.value) return false;

  const now = new Date();
  const result = await prisma.adminSession.updateMany({
    where: { token: cookie.value, expiresAt: { gt: now }, lockedAt: null },
    data: { lockedAt: now },
  });
  return result.count === 1;
}

export async function hasRecentTwoFactorVerification(maxAgeMs = 5 * 60 * 1000): Promise<boolean> {
  const cookieStore = await cookies();
  const cookie = (cookieStore as unknown as { get: (name: string) => { value?: string } | undefined })
    .get(SESSION_COOKIE);
  if (!cookie?.value) return false;

  const session = await prisma.adminSession.findFirst({
    where: { token: cookie.value, expiresAt: { gt: new Date() }, lockedAt: null },
    select: { reauthenticatedAt: true },
  });
  return Boolean(session?.reauthenticatedAt && Date.now() - session.reauthenticatedAt.getTime() <= maxAgeMs);
}

export async function markTwoFactorVerified(): Promise<void> {
  const cookieStore = await cookies();
  const cookie = (cookieStore as unknown as { get: (name: string) => { value?: string } | undefined })
    .get(SESSION_COOKIE);
  if (!cookie?.value) return;
  await prisma.adminSession.updateMany({
    where: { token: cookie.value, expiresAt: { gt: new Date() }, lockedAt: null },
    data: { reauthenticatedAt: new Date() },
  });
}

export type UnlockSessionResult = "unlocked" | "invalid_password" | "session_unavailable";

export async function unlockCurrentSession(password: string): Promise<UnlockSessionResult> {
  const cookieStore = await cookies();
  const cookie = (cookieStore as unknown as { get: (name: string) => { value?: string } | undefined })
    .get(SESSION_COOKIE);
  if (!cookie?.value) return "session_unavailable";

  const session = await prisma.adminSession.findFirst({
    where: { token: cookie.value, expiresAt: { gt: new Date() } },
    include: { user: true },
  });
  if (!session || session.user.status !== "ACTIVE" || session.user.deletedAt || !session.user.passwordHash) {
    return "session_unavailable";
  }
  if (!(await comparePassword(password, session.user.passwordHash))) return "invalid_password";

  const now = new Date();
  // Another request may have cleared lockedAt after the lock overlay appeared.
  // A valid password should restore this same session instead of trapping the user.
  const updated = await prisma.adminSession.updateMany({
    where: {
      id: session.id,
      token: cookie.value,
      userId: session.userId,
      expiresAt: { gt: now },
      lockedAt: session.lockedAt,
    },
    data: { lockedAt: null, lastActiveAt: now },
  });
  if (updated.count === 1) return "unlocked";

  const current = await prisma.adminSession.findFirst({
    where: { id: session.id, token: cookie.value, userId: session.userId, expiresAt: { gt: now } },
    select: { lockedAt: true },
  });
  if (!current || current.lockedAt) return "session_unavailable";

  const touched = await prisma.adminSession.updateMany({
    where: { id: session.id, token: cookie.value, userId: session.userId, expiresAt: { gt: now }, lockedAt: null },
    data: { lastActiveAt: now },
  });
  return touched.count === 1 ? "unlocked" : "session_unavailable";
}

export async function clearSession(): Promise<void> {
  try {
    const cookieStore = await cookies();
    const cookie = (
      cookieStore as unknown as {
        get: (name: string) => { value?: string } | undefined;
        delete: (name: string, opts?: Record<string, unknown>) => void;
      }
    ).get(SESSION_COOKIE);

    if (cookie?.value) {
      await prisma.adminSession.deleteMany({ where: { token: cookie.value } });
    }

    (cookieStore as unknown as { delete: (name: string, opts?: Record<string, unknown>) => void }).delete(SESSION_COOKIE, {
      path: "/",
    });
  } catch {
    // ignore cleanup errors
  }
}

export async function isValidSession(): Promise<boolean> {
  const session = await getSession();
  return session !== null;
}

export async function isAuthenticated(): Promise<boolean> {
  return isValidSession();
}

export async function invalidateUserSessions(userId: string): Promise<void> {
  await prisma.adminSession.deleteMany({ where: { userId } });
}

export function encryptField(value: string): string {
  return encrypt(value);
}

export function decryptField(value: string): string {
  return decrypt(value);
}

