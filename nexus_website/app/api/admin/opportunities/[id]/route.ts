import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { requirePermission } from "@/lib/permissions-server";
import { PERMISSIONS } from "@/lib/permissions-data";
import { logAdminAction } from "@/lib/audit";
import { OpportunityStatus } from "@prisma/client";
import {
  lifecycleSideEffects,
  parseDeadlineInput,
  parseLifecycle,
} from "@/lib/opportunity-listing";

const UNAUTHORIZED = () => NextResponse.json({ error: "Unauthorized" }, { status: 401 });
const FORBIDDEN = () => NextResponse.json({ error: "Forbidden" }, { status: 403 });

const LISTING_FIELDS = [
  "title",
  "description",
  "type",
  "category",
  "location",
  "url",
] as const;

const DEAL_FIELDS = [
  "value",
  "probability",
  "contactName",
  "contactEmail",
  "contactPhone",
  "notes",
  "nextSteps",
  "tags",
  "source",
] as const;

const ADMIN_LISTING_SELECT = {
  id: true,
  title: true,
  description: true,
  type: true,
  category: true,
  location: true,
  url: true,
  deadline: true,
  lifecycle: true,
  publishedAt: true,
  closedAt: true,
  createdAt: true,
  updatedAt: true,
  _count: { select: { applications: true } },
  deal: { select: { id: true } },
} as const;

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, authorized } = await requirePermission(PERMISSIONS.LISTINGS_WRITE);
  if (!user) return UNAUTHORIZED();
  if (!authorized) return FORBIDDEN();

  const { id } = await params;
  const item = await prisma.opportunity.findUnique({
    where: { id },
    select: {
      ...ADMIN_LISTING_SELECT,
      deal: {
        select: {
          id: true,
          value: true,
          probability: true,
          expectedValue: true,
          nextSteps: true,
          tags: true,
          contactName: true,
          contactEmail: true,
          contactPhone: true,
          notes: true,
          source: true,
          assignedToId: true,
        },
      },
    },
  });

  if (!item) {
    return NextResponse.json(
      { error: "Opportunity not found" },
      { status: 404 }
    );
  }

  return NextResponse.json(item);
}

/**
 * Update a listing and its internal deal.
 *
 * Only the fields named in LISTING_FIELDS / DEAL_FIELDS are read from the body.
 * The previous version passed the request body straight to
 * `prisma.opportunity.update({ data: body })`, so any column on the row could be
 * set by the caller — including the ones the UI never sends.
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, authorized } = await requirePermission(PERMISSIONS.LISTINGS_WRITE);
  if (!user) return UNAUTHORIZED();
  if (!authorized) return FORBIDDEN();

  const { id } = await params;

  try {
    const body = await request.json();
    const existing = await prisma.opportunity.findUnique({
      where: { id },
      select: { id: true, lifecycle: true, publishedAt: true, closedAt: true },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Opportunity not found" },
        { status: 404 }
      );
    }

    const now = new Date();
    const listingData: Record<string, unknown> = {};

    for (const field of LISTING_FIELDS) {
      if (body[field] !== undefined) listingData[field] = body[field];
    }

    if (body.title !== undefined) {
      const title = String(body.title ?? "").trim();
      if (!title) {
        return NextResponse.json({ error: "Title is required" }, { status: 400 });
      }
      listingData.title = title;
    }

    if (body.deadline !== undefined) {
      listingData.deadline = parseDeadlineInput(body.deadline);
    }

    const requestedLifecycle = parseLifecycle(body.lifecycle ?? body.status);
    if (body.lifecycle !== undefined || body.status !== undefined) {
      if (!requestedLifecycle) {
        return NextResponse.json(
          {
            error: `Invalid lifecycle. Expected one of: ${Object.values(
              OpportunityStatus
            ).join(", ")}`,
          },
          { status: 400 }
        );
      }
      listingData.lifecycle = requestedLifecycle;
      Object.assign(
        listingData,
        lifecycleSideEffects(requestedLifecycle, existing, now)
      );
    }

    const dealInput: Record<string, unknown> = {};
    for (const field of DEAL_FIELDS) {
      if (body[field] !== undefined) dealInput[field] = body[field];
    }
    const hasDealFields = Object.keys(dealInput).length > 0;
    if (hasDealFields) {
      if (
        typeof dealInput.value === "number" &&
        typeof dealInput.probability === "number"
      ) {
        dealInput.expectedValue = Math.round(
          (dealInput.value * dealInput.probability) / 100
        );
      }
    }

    const updated = await prisma.$transaction(async (tx) => {
      await tx.opportunity.update({
        where: { id },
        data: listingData as never,
      });

      if (hasDealFields) {
        await tx.deal.upsert({
          where: { opportunityId: id },
          create: { opportunityId: id, ...dealInput } as never,
          update: dealInput as never,
        });
      }

      return tx.opportunity.findUniqueOrThrow({
        where: { id },
        select: {
          ...ADMIN_LISTING_SELECT,
          deal: {
            select: {
              id: true,
              value: true,
              probability: true,
              expectedValue: true,
              nextSteps: true,
              tags: true,
              contactName: true,
              contactEmail: true,
              contactPhone: true,
              notes: true,
              source: true,
              assignedToId: true,
            },
          },
        },
      });
    });

    await logAdminAction({
      adminEmail: user.email,
      action: "update",
      resourceType: "opportunity",
      resourceId: id,
      oldValue: { ...existing },
      newValue: { listingData, dealInput },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Failed to update opportunity:", error);
    return NextResponse.json(
      { error: "Failed to update opportunity" },
      { status: 500 }
    );
  }
}

/**
 * Archive a listing.
 *
 * Applications are no longer cascade-deleted at the database level (the FK is
 * RESTRICT), so a hard delete that still had applicants would be refused by
 * Postgres. Archiving keeps the listing and every applicant record intact while
 * removing it from the public feed, which is what an admin closing a role wants.
 *
 * Pass `?purge=true` to attempt a real delete — only possible when there are no
 * applications and no deal record.
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, authorized } = await requirePermission(PERMISSIONS.LISTINGS_WRITE);
  if (!user) return UNAUTHORIZED();
  if (!authorized) return FORBIDDEN();

  const { id } = await params;
  const purge =
    new URL(request.url).searchParams.get("purge") === "true" &&
    (await requirePermission(PERMISSIONS.DEALS_WRITE)).authorized;

  try {
    const existing = await prisma.opportunity.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        lifecycle: true,
        _count: { select: { applications: true } },
        deal: { select: { id: true } },
      },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Opportunity not found" },
        { status: 404 }
      );
    }

    if (purge) {
      if (existing._count.applications > 0) {
        return NextResponse.json(
          {
            error: `Cannot delete: ${existing._count.applications} application${
              existing._count.applications === 1 ? "" : "s"
            } reference this listing. Archive it instead — applicant records are never deleted.`,
          },
          { status: 409 }
        );
      }

      await prisma.opportunity.delete({ where: { id } });

      await logAdminAction({
        adminEmail: user.email,
        action: "delete",
        resourceType: "opportunity",
        resourceId: id,
        oldValue: { title: existing.title },
      });

      return NextResponse.json({ success: true, archived: false, purged: true });
    }

    const archived = await prisma.opportunity.update({
      where: { id },
      data: { lifecycle: OpportunityStatus.ARCHIVED },
    });

    await logAdminAction({
      adminEmail: user.email,
      action: "archive",
      resourceType: "opportunity",
      resourceId: id,
      oldValue: { lifecycle: existing.lifecycle },
      newValue: { lifecycle: archived.lifecycle },
    });

    return NextResponse.json({
      success: true,
      archived: true,
      purged: false,
      applicationsRetained: existing._count.applications,
    });
  } catch (error) {
    console.error("Failed to remove opportunity:", error);
    return NextResponse.json(
      { error: "Failed to remove opportunity" },
      { status: 500 }
    );
  }
}