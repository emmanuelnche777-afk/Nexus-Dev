import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/permissions-server";

import prisma from "@/lib/db";

export async function GET() {
  const { user, authorized } = await requirePermission("*");
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!authorized) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const entries = await prisma.activityLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
      include: { user: { select: { email: true } } },
    });

    const logs = entries.map((entry) => {
      const metadata = (entry.metadata as Record<string, unknown>) || {};
      return {
        id: entry.id,
        admin: typeof metadata.admin === "string" ? metadata.admin : entry.user?.email,
        action: entry.action,
        resource: entry.entity || undefined,
        resourceId: entry.entityId || undefined,
        previousValue: metadata.previousValue,
        newValue: metadata.newValue,
        timestamp: entry.createdAt.toISOString(),
        ip: entry.ipAddress || "unknown",
      };
    });

    return NextResponse.json({ logs });
  } catch (error) {
    console.error("Failed to load audit records:", error);
    return NextResponse.json({ error: "Failed to load audit records." }, { status: 500 });
  }
}
