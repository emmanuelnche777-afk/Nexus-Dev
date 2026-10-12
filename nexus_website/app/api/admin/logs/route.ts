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
      include: { user: { select: { email: true } } },
    });

    const logs = entries.map((entry) => {
      const metadata = (entry.metadata as Record<string, unknown>) || {};
      return {
        id: entry.id,
        action: entry.action,
        item: entry.entity || "",
        resourceId: entry.entityId || undefined,
        details:
          typeof metadata.details === "string"
            ? metadata.details
            : typeof metadata.newValue !== "undefined"
              ? JSON.stringify(metadata.newValue)
              : undefined,
        user: typeof metadata.admin === "string" ? metadata.admin : entry.user?.email,
        timestamp: entry.createdAt.toISOString(),
        ip: entry.ipAddress || undefined,
      };
    });

    return NextResponse.json({ logs });
  } catch (error) {
    console.error("Failed to load audit logs:", error);
    return NextResponse.json({ error: "Failed to load audit logs." }, { status: 500 });
  }
}
