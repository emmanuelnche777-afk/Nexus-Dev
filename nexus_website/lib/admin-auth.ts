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
};

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
): Promise<void> {
  const token = crypto.randomBytes(32).toString("hex");
  const maxAge = rememberMe ? SESSION_MAX_AGE_REMEMBERED : SESSION_MAX_AGE;

  await prisma.adminSession.create({
    data: {
      token,
      userId: user.id,
      expiresAt: new Date(Date.now() + maxAge * 1000),
      lastActiveAt: new Date(),
      ipAddress: ip,
      userAgent: userAgent,
    },
  });

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

    await prisma.adminSession.update({
      where: { token: cookie.value },
      data: { lastActiveAt: new Date() },
    });

    return {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
      role: session.user.role as AdminRole,
      phone: session.user.phone,
    };
  } catch {
    return null;
  }
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

