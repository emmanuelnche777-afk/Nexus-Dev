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
    });

    const logs = entries.map((entry) => {
      const metadata = (entry.metadata as Record<string, unknown>) || {};
      return {
        id: entry.id,
        admin: typeof metadata.admin === "string" ? metadata.admin : undefined,
        action: entry.action,
        resource: entry.entity || undefined,
        previousValue: metadata.previousValue,
        newValue: metadata.newValue,
        timestamp: entry.createdAt.toISOString(),
        ip: entry.ipAddress || "unknown",
      };
    });

    return NextResponse.json({ logs });
  } catch {
    return NextResponse.json({ logs: [] });
  }
}

export async function POST(request: Request) {
  const { user, authorized } = await requirePermission("*");
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!authorized) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const body = await request.json();
    const { admin, action, resource, previousValue, newValue } = body;

    const entry = await prisma.activityLog.create({
      data: {
        action,
        entity: resource || null,
        entityId: body.entityId || null,
        metadata: { admin, previousValue, newValue },
        ipAddress: body?.ip || null,
        userId: body?.userId || null,
      },
    });

    const logEntry = {
      id: entry.id,
      admin,
      action: entry.action,
      resource: entry.entity || undefined,
      previousValue,
      newValue,
      timestamp: entry.createdAt.toISOString(),
      ip: entry.ipAddress || "unknown",
    };

    return NextResponse.json({ success: true, logEntry });
  } catch {
    return NextResponse.json({ error: "Failed to log action" }, { status: 500 });
  }
}
