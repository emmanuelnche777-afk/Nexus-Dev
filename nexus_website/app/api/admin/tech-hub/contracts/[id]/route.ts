import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/permissions-server";
import prisma from "@/lib/db";
import type { Prisma } from "@prisma/client";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, authorized } = await requirePermission("techhub:contracts:*");
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!authorized) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const { id } = await params;
    const contract = await prisma.contract.findUnique({
      where: { id },
          include: {
        order: {
          select: {
            id: true,
            status: true,
            priority: true,
            budget: true,
            timeline: true,
            desiredTimeline: true,
            source: true,
            assignedTo: true,
            notes: true,
            milestones: { select: { id: true, title: true, description: true, status: true, dueDate: true, completedAt: true } },
          },
        },
      },
    });

    if (!contract) return NextResponse.json({ error: "Contract not found" }, { status: 404 });
    return NextResponse.json({ contract });
  } catch (error) {
    console.error("Failed to load contract:", error);
    return NextResponse.json({ error: "Failed to load contract" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, authorized } = await requirePermission("techhub:contracts:*");
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!authorized) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const { id } = await params;
    const existing = await prisma.contract.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: "Contract not found" }, { status: 404 });

    // Signed contracts are read-only
    if (existing.status === "signed") {
      return NextResponse.json({ error: "Cannot edit a signed contract" }, { status: 403 });
    }
    if (existing.archivedAt) return NextResponse.json({ error: "Restore this contract before editing" }, { status: 403 });

    const body = (await request.json()) as Record<string, unknown>;
    const allowedFields = [
      "clientName",
      "clientEmail",
      "clientPhone",
      "company",
      "contractType",
      "serviceType",
      "serviceTypeKey",
      "templateKey",
      "bodyTemplate",
      "totalAmount",
      "currency",
      "depositPercent",
      "depositAmount",
      "milestones",
      "scopeText",
      "bodyText",
    ] as const;
    const data: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) data[field] = body[field];
    }

    const contract = await prisma.contract.update({
      where: { id },
      data,
      select: {
        id: true,
        orderId: true,
        contractType: true,
        templateKey: true,
        bodyTemplate: true,
        status: true,
        clientName: true,
        clientEmail: true,
        clientPhone: true,
        company: true,
        serviceType: true,
        serviceTypeKey: true,
        totalAmount: true,
        currency: true,
        depositPercent: true,
        depositAmount: true,
        milestones: true,
        scopeText: true,
        bodyText: true,
        pdfUrl: true,
        signedPdfUrl: true,
        signatureClientAt: true,
        signatureTechHubAt: true,
        signedAt: true,
        sentAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    await prisma.activityLog.create({
      data: {
        action: "contract.updated",
        entity: "Contract",
        entityId: contract.id,
        userId: user.id,
        metadata: data as Prisma.InputJsonValue,
      },
    });

    return NextResponse.json({ contract });
  } catch (error) {
    console.error("Failed to update contract:", error);
    return NextResponse.json({ error: "Failed to update contract" }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, authorized } = await requirePermission("techhub:contracts:*");
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!authorized) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const { id } = await params;
    const { action } = await request.json();
    if (action !== "archive" && action !== "restore") {
      return NextResponse.json({ error: "Action must be archive or restore" }, { status: 400 });
    }
    const contract = await prisma.contract.findUnique({ where: { id } });
    if (!contract) return NextResponse.json({ error: "Contract not found" }, { status: 404 });
    const archivedAt = action === "archive" ? new Date() : null;
    await prisma.contract.update({ where: { id }, data: { archivedAt } });
    await prisma.activityLog.create({
      data: {
        action: action === "archive" ? "contract.archived" : "contract.restored",
        entity: "Contract",
        entityId: id,
        userId: user.id,
        metadata: { status: contract.status },
      },
    });
    return NextResponse.json({ success: true, archivedAt });
  } catch (error) {
    console.error("Failed to update contract archive state:", error);
    return NextResponse.json({ error: "Failed to update contract" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, authorized } = await requirePermission("techhub:contracts:*");
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!authorized) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const { id } = await params;
    const existing = await prisma.contract.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: "Contract not found" }, { status: 404 });

    // Signed contracts are read-only
    if (existing.status === "signed") {
      return NextResponse.json({ error: "Cannot delete a signed contract" }, { status: 403 });
    }
    if (existing.archivedAt) return NextResponse.json({ error: "Restore this contract before deleting it" }, { status: 403 });

    await prisma.contract.delete({ where: { id } });

    await prisma.activityLog.create({
      data: {
        action: "contract.deleted",
        entity: "Contract",
        entityId: id,
        userId: user.id,
        metadata: { clientEmail: existing.clientEmail },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete contract:", error);
    return NextResponse.json({ error: "Failed to delete contract" }, { status: 500 });
  }
}
