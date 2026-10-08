import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/permissions-server";

import prisma from "@/lib/db";

export async function GET() {
  const { user, authorized } = await requirePermission("ai-live-support:*");
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!authorized) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const sessions = await prisma.liveSupportSession.findMany({
    where: { endedAt: null },
    orderBy: { createdAt: "desc" },
  });

  const active = sessions.map((s) => ({
    id: s.id,
    clientId: s.clientPhone || "",
    clientName: s.clientName,
    clientEmail: s.clientEmail,
    startedAt: s.createdAt.toISOString(),
    adminName: s.adminName || undefined,
    reason: s.reason,
    endTime: s.endedAt ? s.endedAt.toISOString() : undefined,
  }));

  return NextResponse.json({ sessions: active });
}

export async function POST(request: Request) {
  const { user, authorized } = await requirePermission("ai-live-support:*");
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!authorized) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const form = await request.json();

    const existingActive = await prisma.liveSupportSession.findFirst({
      where: {
        clientEmail: form.clientEmail,
        endedAt: null,
      },
    });

    if (existingActive) {
      return NextResponse.json(
        { error: "Client already has active live session" },
        { status: 400 }
      );
    }

    const session = await prisma.liveSupportSession.create({
      data: {
        clientName: form.clientName,
        clientEmail: form.clientEmail,
        clientPhone: form.clientPhone || null,
        reason: form.reason,
      },
    });

    return NextResponse.json(
      {
        id: session.id,
        clientId: session.clientPhone || "",
        clientName: session.clientName,
        clientEmail: session.clientEmail,
        startedAt: session.createdAt.toISOString(),
        adminName: session.adminName || undefined,
        reason: session.reason,
        endTime: session.endedAt ? session.endedAt.toISOString() : undefined,
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json({ error: "Failed to create live session" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const { user, authorized } = await requirePermission("ai-live-support:*");
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!authorized) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const { sessionId, adminId, adminName, endSession } = await request.json();

    const existing = await prisma.liveSupportSession.findUnique({
      where: { id: sessionId },
    });
    if (!existing) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    const updated = await prisma.liveSupportSession.update({
      where: { id: sessionId },
      data: {
        adminName: adminName || adminId || undefined,
        ...(endSession ? { endedAt: new Date() } : {}),
      },
    });

    return NextResponse.json({
      id: updated.id,
      clientId: updated.clientPhone || "",
      clientName: updated.clientName,
      clientEmail: updated.clientEmail,
      startedAt: updated.createdAt.toISOString(),
      adminName: updated.adminName || undefined,
      reason: updated.reason,
      endTime: updated.endedAt ? updated.endedAt.toISOString() : undefined,
    });
  } catch {
    return NextResponse.json({ error: "Failed to update live session" }, { status: 500 });
  }
}
