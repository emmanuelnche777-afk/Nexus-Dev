import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/permissions-server";

import prisma from "@/lib/db";
import { logAdminAction } from "@/lib/audit";
import { containsObviousSensitiveKnowledge } from "@/lib/ai/security";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, authorized } = await requirePermission("content:ai-knowledge:*");
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!authorized) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const { id } = await params;
    const entry = await prisma.aiKnowledge.findUnique({ where: { id } });

    if (!entry) {
      return NextResponse.json({ error: "Knowledge entry not found" }, { status: 404 });
    }

    return NextResponse.json(entry);
  } catch {
    return NextResponse.json({ error: "Failed to load knowledge entry" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, authorized } = await requirePermission("content:ai-knowledge:*");
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!authorized) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const { id } = await params;
    const updates = await request.json();

    const oldEntry = await prisma.aiKnowledge.findUnique({
      where: { id },
      select: { approved: true, content: true },
    });
    if (!oldEntry) return NextResponse.json({ error: "Knowledge entry not found" }, { status: 404 });

    const nextContent = typeof updates.content === "string" ? updates.content : oldEntry.content;
    const willBePublic = typeof updates.approved === "boolean" ? updates.approved : oldEntry.approved;
    if (willBePublic && containsObviousSensitiveKnowledge(`${updates.title || ""}\n${nextContent}`)) {
      return NextResponse.json(
        { error: "This entry contains contact details, credentials, or client-specific fields. Remove them before approving it for the public assistant." },
        { status: 400 }
      );
    }

    const entry = await prisma.aiKnowledge.update({
      where: { id },
      data: updates,
    });

    await logAdminAction({
      adminEmail: user.email,
      action: "update",
      resourceType: "ai-knowledge",
      resourceId: id,
      oldValue: { approved: oldEntry?.approved },
      newValue: updates,
    });

    return NextResponse.json(entry);
  } catch {
    return NextResponse.json({ error: "Failed to update knowledge entry" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, authorized } = await requirePermission("content:ai-knowledge:*");
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!authorized) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const { id } = await params;

    await prisma.aiKnowledge.update({
      where: { id },
      data: {
        approved: false,
        content: "(archived)",
      },
    });

    await logAdminAction({
      adminEmail: user.email,
      action: "archive",
      resourceType: "ai-knowledge",
      resourceId: id,
      newValue: { approved: false, content: "(archived)" },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete knowledge entry" }, { status: 500 });
  }
}
