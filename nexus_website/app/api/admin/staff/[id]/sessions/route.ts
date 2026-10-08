import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requirePermission } from "@/lib/permissions-server";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { user, authorized } = await requirePermission("staff:*");
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!authorized) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;

  try {
    if (id !== user.id) {
      const target = await prisma.adminUser.findUnique({
        where: { id, deletedAt: null },
        select: { id: true },
      });
      if (!target) {
        return NextResponse.json({ error: "Staff member not found" }, { status: 404 });
      }
    }

    const sessions = await prisma.adminSession.findMany({
      where: {
        userId: id,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        createdAt: true,
        lastActiveAt: true,
        userAgent: true,
        ipAddress: true,
        expiresAt: true,
      },
    });

    return NextResponse.json({ sessions });
  } catch (error) {
    console.error("[staff/[id]/sessions] List error:", error);
    return NextResponse.json({ error: "Failed to list sessions" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { user, authorized } = await requirePermission("staff:*");
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!authorized) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;

  try {
    const body = await request.json().catch(() => null);
    const { sessionId } = body || {};

    if (id !== user.id) {
      const target = await prisma.adminUser.findUnique({
        where: { id, deletedAt: null },
        select: { id: true },
      });
      if (!target) {
        return NextResponse.json({ error: "Staff member not found" }, { status: 404 });
      }
    }

    if (sessionId) {
      await prisma.adminSession.deleteMany({
        where: { id: sessionId, userId: id },
      });
      return NextResponse.json({ success: true, revoked: 1 });
    } else {
      const result = await prisma.adminSession.deleteMany({
        where: { userId: id },
      });
      return NextResponse.json({ success: true, revoked: result.count });
    }
  } catch (error) {
    console.error("[staff/[id]/sessions] Delete error:", error);
    return NextResponse.json({ error: "Failed to revoke sessions" }, { status: 500 });
  }
}
