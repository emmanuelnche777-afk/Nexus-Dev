import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requirePermission } from "@/lib/permissions-server";
import { logSensitiveAccess } from "@/lib/audit";
import { logAdminAction } from "@/lib/audit";

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

    await logSensitiveAccess({
      actorId: user.id,
      adminEmail: user.email,
      action: "staff_sessions_view",
      resourceType: "staff_account",
      resourceId: id,
      request,
      details: { resultCount: sessions.length },
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
      const deleted = await prisma.adminSession.deleteMany({
        where: { id: sessionId, userId: id },
      });
      await logAdminAction({
        actorId: user.id,
        adminEmail: user.email,
        action: "staff_session_revoked",
        resourceType: "admin_session",
        resourceId: sessionId,
        newValue: { resultCount: deleted.count, revoked: deleted.count },
        ipAddress: request.headers.get("x-real-ip") || request.headers.get("x-forwarded-for")?.split(",")[0]?.trim(),
        userAgent: request.headers.get("user-agent") || undefined,
      });
      return NextResponse.json({ success: true, revoked: deleted.count });
    } else {
      const result = await prisma.adminSession.deleteMany({
        where: { userId: id },
      });
      await logAdminAction({
        actorId: user.id,
        adminEmail: user.email,
        action: "staff_sessions_revoked",
        resourceType: "admin_account",
        resourceId: id,
        newValue: { resultCount: result.count, revoked: result.count },
        ipAddress: request.headers.get("x-real-ip") || request.headers.get("x-forwarded-for")?.split(",")[0]?.trim(),
        userAgent: request.headers.get("user-agent") || undefined,
      });
      return NextResponse.json({ success: true, revoked: result.count });
    }
  } catch (error) {
    console.error("[staff/[id]/sessions] Delete error:", error);
    return NextResponse.json({ error: "Failed to revoke sessions" }, { status: 500 });
  }
}
