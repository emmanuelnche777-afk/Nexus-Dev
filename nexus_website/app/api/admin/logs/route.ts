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
    });

    const logs = entries.map((entry) => {
      const metadata = (entry.metadata as Record<string, unknown>) || {};
      return {
        id: entry.id,
        action: entry.action,
        item: entry.entity || "",
        details:
          typeof metadata.details === "string"
            ? metadata.details
            : typeof metadata.newValue !== "undefined"
              ? JSON.stringify(metadata.newValue)
              : undefined,
        user: typeof metadata.admin === "string" ? metadata.admin : undefined,
        timestamp: entry.createdAt.toISOString(),
      };
    });

    return NextResponse.json({ logs });
  } catch {
    return NextResponse.json({ logs: [] });
  }
}

export async function DELETE() {
  const { user, authorized } = await requirePermission("*");
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!authorized) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    await prisma.activityLog.deleteMany();
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to clear logs" }, { status: 500 });
  }
}
