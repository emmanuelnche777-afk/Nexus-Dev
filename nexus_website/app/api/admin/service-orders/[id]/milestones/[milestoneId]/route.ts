import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/permissions-server";
import prisma from "@/lib/db";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; milestoneId: string }> }
) {
  const { user, authorized } = await requirePermission("techhub:*");
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!authorized) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const { milestoneId } = await params;
    const body = await request.json();
    const existing = await prisma.milestone.findUnique({ where: { id: milestoneId } });
    if (!existing) {
      return NextResponse.json({ error: "Milestone not found" }, { status: 404 });
    }

    const nextStatus = body.status || existing.status;
    const updated = await prisma.milestone.update({
      where: { id: milestoneId },
      data: {
        ...body,
        id: milestoneId,
        completedAt:
          nextStatus === "completed"
            ? existing.completedAt || new Date()
            : nextStatus !== "completed"
              ? null
              : existing.completedAt,
      },
    });

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Failed to update milestone" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; milestoneId: string }> }
) {
  const { user, authorized } = await requirePermission("techhub:*");
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!authorized) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const { milestoneId } = await params;
    const existing = await prisma.milestone.findUnique({ where: { id: milestoneId } });
    if (!existing) {
      return NextResponse.json({ error: "Milestone not found" }, { status: 404 });
    }

    await prisma.milestone.delete({ where: { id: milestoneId } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete milestone" }, { status: 500 });
  }
}