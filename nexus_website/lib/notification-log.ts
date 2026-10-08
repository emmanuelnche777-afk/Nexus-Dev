import prisma from "@/lib/db";
import type { Prisma } from "@prisma/client";
import { randomUUID } from "node:crypto";

export interface NotificationLogEntry {
  type: string;
  to: string;
  subject?: string;
  body?: string;
  status: "sent" | "failed" | "pending" | "skipped";
  result?: unknown;
  error?: string;
}

export async function logNotification(entry: NotificationLogEntry) {
  try {
    await prisma.notificationLog.create({
      data: {
        id: randomUUID(),
        type: entry.type,
        to: entry.to,
        subject: entry.subject ?? null,
        body: entry.body ?? null,
        status: entry.status,
        result: entry.result as Prisma.InputJsonValue,
        error: entry.error ?? null,
      },
    });
  } catch (error) {
    console.error("Failed to log notification:", error);
  }
}
