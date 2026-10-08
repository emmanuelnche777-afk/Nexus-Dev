import { prisma } from "@/lib/db";
import { createHash } from "node:crypto";
import { NextResponse } from "next/server";

const WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILED_ATTEMPTS = 5;

export async function checkRateLimit(identifier: string): Promise<{ limited: boolean; retryAfterMs: number }> {
  return checkFailedAttemptLimit(identifier, MAX_FAILED_ATTEMPTS, WINDOW_MS);
}

/** Checks a rolling window of failed authentication attempts for one identifier. */
export async function checkFailedAttemptLimit(
  identifier: string,
  maxFailedAttempts: number,
  windowMs: number
): Promise<{ limited: boolean; retryAfterMs: number }> {
  await cleanupOldAttempts();

  const now = Date.now();
  const cutoff = new Date(now - windowMs);
  const failedCount = await prisma.loginAttempt.count({
    where: { identifier, success: false, attemptedAt: { gte: cutoff } },
  });

  return failedCount >= maxFailedAttempts
    ? { limited: true, retryAfterMs: windowMs }
    : { limited: false, retryAfterMs: 0 };
}

/** Atomically counts attempts for one pending 2FA challenge across app instances. */
export async function consumeChallengeAttempt(
  challengeId: string,
  challengeStartedAt: number,
  limit: number
): Promise<{ limited: boolean; count: number; retryAfterMs: number }> {
  const key = createHash("sha256").update(`2fa-challenge:${challengeId}`).digest("hex");
  // The challenge start anchors this bucket, so crossing a clock-window boundary
  // cannot grant a pending login a fresh set of attempts.
  const windowStart = new Date(Math.floor(challengeStartedAt / 60_000) * 60_000);
  const bucket = await prisma.apiRateLimitBucket.upsert({
    where: { key_windowStart: { key, windowStart } },
    create: { key, windowStart, count: 1 },
    update: { count: { increment: 1 } },
    select: { count: true },
  });

  return {
    limited: bucket.count > limit,
    count: bucket.count,
    retryAfterMs: Math.max(1000, challengeStartedAt + 5 * 60_000 - Date.now()),
  };
}

export async function recordAttempt(identifier: string, success: boolean, ip?: string, userAgent?: string) {
  await prisma.loginAttempt.create({
    data: {
      identifier,
      success,
      ipAddress: ip || undefined,
      userAgent: userAgent || undefined,
    },
  });
}

type OutboundLimitOptions = {
  scope?: string;
  ipLimit?: number;
  ipWindowMs?: number;
  recipientLimit?: number;
  recipientWindowMs?: number;
};

const DEFAULT_OUTBOUND_LIMITS = {
  ipLimit: 30,
  ipWindowMs: 15 * 60 * 1000,
  recipientLimit: 4,
  recipientWindowMs: 60 * 60 * 1000,
};

/**
 * Enforces durable limits for public message-producing requests. The database
 * stores digests of identifiers rather than raw IP addresses or email addresses.
 */
export async function enforceOutboundRateLimit(
  request: Request,
  recipient?: string | null,
  options: OutboundLimitOptions = {}
): Promise<NextResponse | null> {
  const scope = options.scope || "public-outbound";
  const ipLimit = options.ipLimit ?? DEFAULT_OUTBOUND_LIMITS.ipLimit;
  const ipWindowMs = options.ipWindowMs ?? DEFAULT_OUTBOUND_LIMITS.ipWindowMs;
  const recipientLimit = options.recipientLimit ?? DEFAULT_OUTBOUND_LIMITS.recipientLimit;
  const recipientWindowMs = options.recipientWindowMs ?? DEFAULT_OUTBOUND_LIMITS.recipientWindowMs;

  const ip = request.headers.get("x-real-ip") ||
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown";
  const ipResult = await consumeBucket(`${scope}:ip:${ip}`, ipLimit, ipWindowMs);
  if (ipResult.limited) return rateLimitedResponse(ipResult.retryAfterMs);

  const normalizedRecipient = recipient?.trim().toLowerCase();
  if (normalizedRecipient) {
    const recipientResult = await consumeBucket(
      `${scope}:recipient:${normalizedRecipient}`,
      recipientLimit,
      recipientWindowMs
    );
    if (recipientResult.limited) return rateLimitedResponse(recipientResult.retryAfterMs);
  }

  return null;
}

/** Limits privileged manual sends per logged-in staff member. */
export async function enforceActorRateLimit(
  actorId: string,
  action: string,
  limit: number,
  windowMs: number
): Promise<NextResponse | null> {
  const result = await consumeBucket(`actor:${action}:${actorId}`, limit, windowMs);
  return result.limited ? rateLimitedResponse(result.retryAfterMs) : null;
}

async function consumeBucket(identifier: string, limit: number, windowMs: number) {
  const now = Date.now();
  const windowStart = new Date(Math.floor(now / windowMs) * windowMs);
  const key = createHash("sha256").update(identifier).digest("hex");
  const bucket = await prisma.apiRateLimitBucket.upsert({
    where: { key_windowStart: { key, windowStart } },
    create: { key, windowStart, count: 1 },
    update: { count: { increment: 1 } },
    select: { count: true },
  });

  if (Math.random() < 0.01) {
    void prisma.apiRateLimitBucket.deleteMany({
      where: { windowStart: { lt: new Date(now - 24 * 60 * 60 * 1000) } },
    }).catch((error) => console.error("[rate-limit] bucket cleanup failed:", error));
  }

  return {
    limited: bucket.count > limit,
    retryAfterMs: Math.max(1000, windowStart.getTime() + windowMs - now),
  };
}

function rateLimitedResponse(retryAfterMs: number): NextResponse {
  const retryAfterSeconds = Math.ceil(retryAfterMs / 1000);
  return NextResponse.json(
    { error: "Too many requests. Please wait before trying again." },
    { status: 429, headers: { "Retry-After": String(retryAfterSeconds) } }
  );
}

async function cleanupOldAttempts() {
  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
  await prisma.loginAttempt.deleteMany({
    where: { attemptedAt: { lt: cutoff } },
  });
}
