import prisma from "@/lib/db";
import type { Prisma } from "@prisma/client";

const SAFE_AUDIT_VALUE_FIELDS = new Set([
  "status", "role", "active", "paymentStatus", "amount", "currency", "method",
  "programSlug", "cohortId", "resultCount", "pageSize", "documentIndex", "channel",
  "deletedCount", "studentCount", "sent", "failed", "skipped", "alreadySent", "revoked", "action",
  "loginIdentifierHash",
]);

/** Keep audit details useful without copying arbitrary form data or PII into logs. */
function summarizeAuditValue(value: unknown): unknown {
  if (Array.isArray(value)) return { itemCount: value.length };
  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    const changedFields = Object.keys(record).sort();
    const safeValues = Object.fromEntries(
      Object.entries(record).filter(([key, item]) =>
        SAFE_AUDIT_VALUE_FIELDS.has(key) &&
        (typeof item === "string" || typeof item === "number" || typeof item === "boolean" || item === null)
      ).map(([key, item]) => [key, typeof item === "string" ? item.slice(0, 100) : item])
    );
    return { changedFields, ...(Object.keys(safeValues).length ? { values: safeValues } : {}) };
  }
  return value === undefined ? undefined : { valueRecorded: true };
}

export async function logSensitiveAccess(params: {
  actorId: string;
  adminEmail: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  request?: Request;
  details?: Record<string, string | number | boolean>;
}) {
  const forwardedIp = params.request?.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return logAdminAction({
    actorId: params.actorId,
    adminEmail: params.adminEmail,
    action: params.action,
    resourceType: params.resourceType,
    resourceId: params.resourceId,
    newValue: params.details,
    ipAddress: params.request?.headers.get("x-real-ip") || forwardedIp,
    userAgent: params.request?.headers.get("user-agent") || undefined,
  });
}

export async function logAdminAction(params: {
  actorId?: string;
  adminEmail?: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  oldValue?: unknown;
  newValue?: unknown;
  ipAddress?: string;
  userAgent?: string;
}) {
  try {
    const actorId = params.actorId || (params.adminEmail
      ? (await prisma.adminUser.findUnique({ where: { email: params.adminEmail }, select: { id: true } }))?.id
      : undefined);
    await prisma.activityLog.create({
      data: {
        action: params.action,
        entity: params.resourceType,
        entityId: params.resourceId,
        metadata: {
          admin: params.adminEmail,
          oldValue: summarizeAuditValue(params.oldValue),
          newValue: summarizeAuditValue(params.newValue),
        } as unknown as Prisma.InputJsonValue,
        userId: actorId,
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
      },
    });
  } catch (error) {
    console.error("Failed to write audit log:", error);
  }
}
