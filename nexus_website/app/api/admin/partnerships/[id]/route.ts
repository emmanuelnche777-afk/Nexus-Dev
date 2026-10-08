import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/permissions-server";
import { PERMISSIONS } from "@/lib/permissions-data";

import prisma from "@/lib/db";
import { logAdminAction } from "@/lib/audit";

const PARTNERSHIP_STATUSES = ["new", "under-review", "contacted", "approved", "rejected"] as const;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, authorized } = await requirePermission(PERMISSIONS.PARTNERSHIP_INQUIRIES_READ);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!authorized) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const requestRecord = await prisma.partnerInquiry.findUnique({ where: { id } });

  if (!requestRecord) {
    return NextResponse.json({ error: "Partnership request not found" }, { status: 404 });
  }

  return NextResponse.json(requestRecord);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, authorized } = await requirePermission(PERMISSIONS.PARTNERSHIP_INQUIRIES_TRIAGE);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!authorized) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const { id } = await params;
    const body = await request.json();
    const existing = await prisma.partnerInquiry.findUnique({ where: { id } });

    if (!existing) {
      return NextResponse.json({ error: "Partnership request not found" }, { status: 404 });
    }

    const update: Record<string, unknown> = {};
    if (body.status !== undefined) {
      if (typeof body.status !== "string" || !PARTNERSHIP_STATUSES.includes(body.status as typeof PARTNERSHIP_STATUSES[number])) {
        return NextResponse.json(
          { error: `Status must be one of: ${PARTNERSHIP_STATUSES.join(", ")}` },
          { status: 400 }
        );
      }
      update.status = body.status;
      update.reviewedAt = body.status === "new" ? null : new Date();
    }
    if (body.proposedValue !== undefined) {
      if (body.proposedValue !== null && (!Number.isInteger(body.proposedValue) || body.proposedValue < 0)) {
        return NextResponse.json({ error: "Proposed value must be a non-negative whole number" }, { status: 400 });
      }
      update.proposedValue = body.proposedValue;
    }
    if (body.adminNotes !== undefined) {
      if (typeof body.adminNotes !== "string") {
        return NextResponse.json({ error: "Admin notes must be text" }, { status: 400 });
      }
      update.adminNotes = body.adminNotes;
    }

    const updated = await prisma.partnerInquiry.update({
      where: { id },
      data: update,
    });

    await logAdminAction({
      adminEmail: user.email,
      action: "update",
      resourceType: "partnership",
      resourceId: id,
      newValue: update,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Update partnership request failed:", error);
    return NextResponse.json(
      { error: "Failed to update partnership request" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, authorized } = await requirePermission(PERMISSIONS.PARTNERSHIP_INQUIRIES_RESPOND);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!authorized) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const { id } = await params;
    const existing = await prisma.partnerInquiry.findUnique({ where: { id } });

    if (!existing) {
      return NextResponse.json({ error: "Partnership request not found" }, { status: 404 });
    }

    await prisma.partnerInquiry.delete({ where: { id } });

    await logAdminAction({
      adminEmail: user.email,
      action: "delete",
      resourceType: "partnership",
      resourceId: id,
      oldValue: existing,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete partnership request failed:", error);
    return NextResponse.json(
      { error: "Failed to delete partnership request" },
      { status: 500 }
    );
  }
}
