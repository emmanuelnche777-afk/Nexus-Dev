import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/permissions-server";

import prisma from "@/lib/db";

export async function GET(request: Request) {
  const { user, authorized } = await requirePermission("content:*");
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!authorized) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const status = searchParams.get("status");
    const limit = parseInt(searchParams.get("limit") || "50", 10);

    const where: Record<string, string> = {};
    if (type) where.type = type;
    if (status) where.status = status;

    const logs = await prisma.notificationLog.findMany({
      where,
      orderBy: { sentAt: "desc" },
      take: Math.min(limit, 200),
    });

    const allLogs = await prisma.notificationLog.findMany({ select: { type: true, status: true } });
    const stats = {
      total: allLogs.length,
      sent: allLogs.filter((l) => l.status === "sent").length,
      skipped: allLogs.filter((l) => l.status === "skipped").length,
      failed: allLogs.filter((l) => l.status === "failed").length,
      email: allLogs.filter((l) => l.type === "email").length,
      sms: allLogs.filter((l) => l.type === "sms").length,
      whatsapp: allLogs.filter((l) => l.type === "whatsapp").length,
    };

    return NextResponse.json({ logs, stats });
  } catch {
    return NextResponse.json({
      logs: [],
      stats: { total: 0, sent: 0, skipped: 0, failed: 0, email: 0, sms: 0, whatsapp: 0 },
    });
  }
}

export async function DELETE(request: Request) {
  const { user, authorized } = await requirePermission("content:*");
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!authorized) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const body = await request.json();
    await prisma.notificationLog.delete({ where: { id: body.id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
