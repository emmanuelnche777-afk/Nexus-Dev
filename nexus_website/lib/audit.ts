import prisma from "@/lib/db";
import type { Prisma } from "@prisma/client";

export async function logAdminAction(params: {
  adminEmail?: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  oldValue?: unknown;
  newValue?: unknown;
}) {
  try {
    await prisma.activityLog.create({
      data: {
        action: params.action,
        entity: params.resourceType,
        entityId: params.resourceId,
        metadata: {
          adminEmail: params.adminEmail,
          oldValue: params.oldValue,
          newValue: params.newValue,
        } as unknown as Prisma.InputJsonValue,
      },
    });
  } catch (error) {
    console.error("Failed to write audit log:", error);
  }
}