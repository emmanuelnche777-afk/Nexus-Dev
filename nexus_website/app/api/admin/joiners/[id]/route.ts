import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { requirePermission } from "@/lib/permissions-server";
import { PERMISSIONS } from "@/lib/permissions-data";
import { canSeePathway } from "@/lib/intake-scope";
import { resolveOwners } from "@/lib/intake-owners";
import { computeSla } from "@/lib/intake-sla";
import { logAdminAction } from "@/lib/audit";
import { sendEmail, sendWhatsApp } from "@/lib/notifications";
import { describeDelivery } from "@/lib/notifications/outcome";
import { PathwayInquiryStatus } from "@prisma/client";
import {
  PATHWAY_LABELS,
  clean,
  describeDetails,
  isPathwayId,
} from "@/lib/join-us-pathways";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const UNAUTHORIZED = () => NextResponse.json({ error: "Unauthorized" }, { status: 401 });
const FORBIDDEN = () => NextResponse.json({ error: "Forbidden" }, { status: 403 });

/** GET a single inquiry with its `details` JSON flattened for display. */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, authorized } = await requirePermission(PERMISSIONS.PATHWAY_INQUIRIES_READ);
  if (!user) return UNAUTHORIZED();
  if (!authorized) return FORBIDDEN();

  const { id } = await params;
  const inquiry = await prisma.pathwayInquiry.findUnique({ where: { id } });
  if (!inquiry) {
    return NextResponse.json({ error: "Inquiry not found" }, { status: 404 });
  }

  if (!canSeePathway(user.role, inquiry.pathway)) {
    return FORBIDDEN();
  }

  const owners = await resolveOwners([inquiry.ownerId]);

  return NextResponse.json({
    inquiry: {
      ...inquiry,
      owner: inquiry.ownerId ? owners.get(inquiry.ownerId) ?? null : null,
      sla: computeSla({
        status: inquiry.status,
        stageEnteredAt: inquiry.stageEnteredAt,
      }),
      pathwayLabel: isPathwayId(inquiry.pathway)
        ? PATHWAY_LABELS[inquiry.pathway]
        : inquiry.pathway,
      detailRows: describeDetails(inquiry.pathway, inquiry.details),
    },
  });
}

/**
 * Update the admin-owned fields: status and internal notes.
 *
 * Requires `triage`, not the blanket `joiners:*` — reviewing and annotating a
 * queue is a different capability from contacting the applicant.
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, authorized } = await requirePermission(PERMISSIONS.PATHWAY_INQUIRIES_TRIAGE);
  if (!user) return UNAUTHORIZED();
  if (!authorized) return FORBIDDEN();

  const { id } = await params;

  try {
    const body = await request.json();
    const existing = await prisma.pathwayInquiry.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Inquiry not found" }, { status: 404 });
    }

    if (!canSeePathway(user.role, existing.pathway)) {
      return FORBIDDEN();
    }

    const update: Record<string, unknown> = {};

    if (typeof body.status === "string") {
      if (
        !Object.values(PathwayInquiryStatus).includes(
          body.status as PathwayInquiryStatus
        )
      ) {
        return NextResponse.json({ error: "Invalid status" }, { status: 400 });
      }
      update.status = body.status;
      // RESPONDED is only ever reached via the respond action, which owns the
      // respondedAt timestamp.
      update.reviewedAt =
        body.status === PathwayInquiryStatus.NEW ? null : new Date();
      // Resets the SLA clock on every status change, so "time in current stage"
      // is answerable without reconstructing it from a history.
      update.stageEnteredAt = new Date();
    }

    if (typeof body.adminNotes === "string") {
      update.adminNotes = clean(body.adminNotes, 5000);
    }

    const updated = await prisma.pathwayInquiry.update({
      where: { id },
      data: update,
    });

    await logAdminAction({
      adminEmail: user.email,
      action: "update",
      resourceType: "pathway_inquiry",
      resourceId: id,
      newValue: update,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Failed to update pathway inquiry:", error);
    return NextResponse.json(
      { error: "Failed to update inquiry" },
      { status: 500 }
    );
  }
}

/**
 * Claim or hand off a record.
 *
 * Requires `triage`. The assignee must be an active admin, so work cannot be
 * parked on an account that cannot log in. Passing an empty `ownerId`
 * unassigns and returns the record to the shared queue. Re-assigning the current
 * owner is a no-op that does not reset `ownerAssignedAt`.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, authorized } = await requirePermission(PERMISSIONS.PATHWAY_INQUIRIES_TRIAGE);
  if (!user) return UNAUTHORIZED();
  if (!authorized) return FORBIDDEN();

  const { id } = await params;

  try {
    const body = await request.json();

    if (!("ownerId" in body)) {
      return NextResponse.json(
        { error: "ownerId is required (empty string to unassign)" },
        { status: 400 }
      );
    }

    const rawOwner = body.ownerId;
    const ownerId =
      rawOwner === null || rawOwner === "" ? null : String(rawOwner).trim();

    const existing = await prisma.pathwayInquiry.findUnique({
      where: { id },
      select: { id: true, pathway: true, ownerId: true },
    });
    if (!existing) {
      return NextResponse.json({ error: "Inquiry not found" }, { status: 404 });
    }

    if (!canSeePathway(user.role, existing.pathway)) {
      return FORBIDDEN();
    }

    if (ownerId !== null) {
      const assignee = await prisma.adminUser.findFirst({
        where: {
          id: ownerId,
          deletedAt: null,
          active: true,
          status: "ACTIVE",
        },
        select: { id: true },
      });
      if (!assignee) {
        return NextResponse.json(
          { error: "That staff member cannot own records (inactive, suspended, or deleted)" },
          { status: 400 }
        );
      }
    }

    const updated = await prisma.pathwayInquiry.update({
      where: { id },
      data: {
        ownerId,
        // Preserve the original claim time when the owner is unchanged.
        ownerAssignedAt:
          ownerId === existing.ownerId ? undefined : ownerId ? new Date() : null,
      },
    });

    await logAdminAction({
      adminEmail: user.email,
      action: "assign",
      resourceType: "pathway_inquiry",
      resourceId: id,
      oldValue: { ownerId: existing.ownerId },
      newValue: { ownerId },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Failed to assign pathway inquiry:", error);
    return NextResponse.json(
      { error: "Failed to assign inquiry" },
      { status: 500 }
    );
  }
}

/**
 * Respond to the applicant by email, and by WhatsApp when a phone number was
 * supplied. Sets status to RESPONDED and stamps respondedAt.
 *
 * Requires `respond`. The message body is applicant-adjacent personal data, so it
 * is deliberately not written to the logs — only recipient and outcome.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, authorized } = await requirePermission(PERMISSIONS.PATHWAY_INQUIRIES_RESPOND);
  if (!user) return UNAUTHORIZED();
  if (!authorized) return FORBIDDEN();

  const { id } = await params;

  try {
    const body = await request.json();
    const message = clean(body.message, 5000);
    if (message.length < 1) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const inquiry = await prisma.pathwayInquiry.findUnique({ where: { id } });
    if (!inquiry) {
      return NextResponse.json({ error: "Inquiry not found" }, { status: 404 });
    }

    if (!canSeePathway(user.role, inquiry.pathway)) {
      return FORBIDDEN();
    }

    const pathwayLabel = isPathwayId(inquiry.pathway)
      ? PATHWAY_LABELS[inquiry.pathway]
      : inquiry.pathway;
    const subject = `NEXUS — update on your ${pathwayLabel} application`;
    const html = `<p>Hello ${escapeHtml(inquiry.fullName)},</p>
                  <p>${escapeHtml(message).replace(/\n/g, "<br />")}</p>
                  <p>— The NEXUS Team</p>`;

    console.info("[joiner-response] sending", {
      inquiryId: id,
      to: inquiry.email,
      whatsapp: Boolean(inquiry.phone?.trim()),
      chars: message.length,
    });

    const emailResult = await sendEmail({
      to: inquiry.email,
      subject,
      html,
    });

    let whatsappResult: Awaited<ReturnType<typeof sendWhatsApp>> | null = null;
    if (inquiry.phone?.trim()) {
      whatsappResult = await sendWhatsApp({ to: inquiry.phone, body: message });
    }

    console.info("[joiner-response] delivery", {
      inquiryId: id,
      emailResult,
      whatsappResult,
    });

    const updated = await prisma.pathwayInquiry.update({
      where: { id },
      data: {
        status: PathwayInquiryStatus.RESPONDED,
        respondedAt: new Date(),
        reviewedAt: inquiry.reviewedAt ?? new Date(),
        responseMessage: message,
        stageEnteredAt: new Date(),
      },
    });

    await logAdminAction({
      adminEmail: user.email,
      action: "respond",
      resourceType: "pathway_inquiry",
      resourceId: id,
      newValue: {
        chars: message.length,
        whatsappAttempted: Boolean(inquiry.phone?.trim()),
      },
    });

    return NextResponse.json({
      inquiry: updated,
      emailResult,
      whatsappResult,
      whatsappAttempted: Boolean(inquiry.phone?.trim()),
      delivery: describeDelivery(
        emailResult,
        whatsappResult,
        Boolean(inquiry.phone?.trim())
      ),
    });
  } catch (error) {
    console.error("Failed to respond to pathway inquiry:", error);
    return NextResponse.json(
      { error: "Failed to send response" },
      { status: 500 }
    );
  }
}