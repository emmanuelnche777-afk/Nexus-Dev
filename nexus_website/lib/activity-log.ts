import prisma from "@/lib/db";

export interface ActivityLogEntry {
  id: string;
  action: string;
  item: string;
  details?: string;
  user?: string;
  timestamp: string;
}

export async function logActivity(entry: Omit<ActivityLogEntry, "id" | "timestamp">) {
  try {
    await prisma.activityLog.create({
      data: {
        action: entry.action,
        entity: entry.item,
        metadata: {
          details: entry.details,
          user: entry.user,
        },
      },
    });
  } catch (error) {
    console.error("Failed to log activity:", error);
  }
}