import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { requirePermission } from "@/lib/permissions-server";
import { PERMISSIONS } from "@/lib/permissions-data";
import { canSeeListingType } from "@/lib/intake-scope";
import { resolveOwners } from "@/lib/intake-owners";
import { computeSla } from "@/lib/intake-sla";
import { logAdminAction } from "@/lib/audit";
import { sendEmail, sendWhatsApp } from "@/lib/notifications";
import { describeDelivery } from "@/lib/notifications/outcome";
import { OpportunityApplicationStatus } from "@prisma/client";
import { clean } from "@/lib/join-us-pathways";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const UNAUTHORIZED = () => NextResponse.json({ error: "Unauthorized" }, { status: 401 });
const FORBIDDEN = () => NextResponse.json({ error: "Forbidden" }, { status: 403 });

const APPLICATION_SELECT = {
  id: true,
  opportunityId: true,
  fullName: true,
  email: true,
  phone: true,
  message: true,
  documentUrls: true,
  status: true,
  adminNotes: true,
  responseMessage: true,
  respondedAt: true,
  reviewedAt: true,
  stageEnteredAt: true,
  ownerId: true,
  ownerAssignedAt: true,
  createdAt: true,
  updatedAt: true,
} as const;

/** GET a single application, including the listing it targets. */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, authorized } = await requirePermission(PERMISSIONS.APPLICATIONS_READ);
  if (!user) return UNAUTHORIZED();
  if (!authorized) return FORBIDDEN();

  const { id } = await params;
  const application = await prisma.opportunityApplication.findUnique({
    where: { id },
    select: {
      ...APPLICATION_SELECT,
      opportunity: {
        select: {
          id: true,
          title: true,
          type: true,
          status: true,
          location: true,
          deadline: true,
        },
      },
    },
  });

  if (!application) {
    return NextResponse.json(
      { error: "Application not found" },
      { status: 404 }
    );
  }

  if (!canSeeListingType(user.role, application.opportunity.type)) {
    return FORBIDDEN();
  }

  const owners = await resolveOwners([application.ownerId]);

  return NextResponse.json({
    application: {
      ...application,
      owner: application.ownerId ? owners.get(application.ownerId) ?? null : null,
      sla: computeSla({
        status: application.status,
        stageEnteredAt: application.stageEnteredAt,
      }),
    },
  });
}

/**
 * Update the admin-owned fields: status and internal notes.
 *
 * Requires `triage`, not the blanket read grant.
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, authorized } = await requirePermission(PERMISSIONS.APPLICATIONS_TRIAGE);
  if (!user) return UNAUTHORIZED();
  if (!authorized) return FORBIDDEN();

  const { id } = await params;

  try {
    const body = await request.json();
    const existing = await prisma.opportunityApplication.findUnique({
      where: { id },
      include: { opportunity: { select: { type: true } } },
    });
    if (!existing) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    if (!canSeeListingType(user.role, existing.opportunity.type)) {
      return FORBIDDEN();
    }

    const update: Record<string, unknown> = {};

    if (typeof body.status === "string") {
      if (
        !Object.values(OpportunityApplicationStatus).includes(
          body.status as OpportunityApplicationStatus
        )
      ) {
        return NextResponse.json({ error: "Invalid status" }, { status: 400 });
      }
      update.status = body.status;
      update.reviewedAt =
        body.status === OpportunityApplicationStatus.NEW ? null : new Date();
      // Resets the SLA clock on every status change, so "time in current stage"
      // is answerable without reconstructing it from a history.
      update.stageEnteredAt = new Date();
    }

    if (typeof body.adminNotes === "string") {
      update.adminNotes = clean(body.adminNotes, 5000);
    }

    const updated = await prisma.opportunityApplication.update({
      where: { id },
      data: update,
    });

    await logAdminAction({
      adminEmail: user.email,
      action: "update",
      resourceType: "opportunity_application",
      resourceId: id,
      newValue: update,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Failed to update opportunity application:", error);
    return NextResponse.json(
      { error: "Failed to update application" },
      { status: 500 }
    );
  }
}

/**
 * Claim or hand off an application.
 *
 * Requires `triage`. Mirrors `/api/admin/joiners/[id]`: the assignee must be an
 * active admin, an empty `ownerId` returns the record to the shared queue, and a
 * no-op reassignment does not reset `ownerAssignedAt`.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, authorized } = await requirePermission(PERMISSIONS.APPLICATIONS_TRIAGE);
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

    const existing = await prisma.opportunityApplication.findUnique({
      where: { id },
      select: { id: true, ownerId: true, opportunity: { select: { type: true } } },
    });
    if (!existing) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    if (!canSeeListingType(user.role, existing.opportunity.type)) {
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

    const updated = await prisma.opportunityApplication.update({
      where: { id },
      data: {
        ownerId,
        ownerAssignedAt:
          ownerId === existing.ownerId ? undefined : ownerId ? new Date() : null,
      },
    });

    await logAdminAction({
      adminEmail: user.email,
      action: "assign",
      resourceType: "opportunity_application",
      resourceId: id,
      oldValue: { ownerId: existing.ownerId },
      newValue: { ownerId },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Failed to assign opportunity application:", error);
    return NextResponse.json(
      { error: "Failed to assign application" },
      { status: 500 }
    );
  }
}

/**
 * Respond to the applicant. `status` selects the outcome — MATCHED or
 * NOT_A_FIT — and is stamped onto the record alongside respondedAt.
 *
 * Requires `respond`. Message bodies are not logged.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, authorized } = await requirePermission(PERMISSIONS.APPLICATIONS_RESPOND);
  if (!user) return UNAUTHORIZED();
  if (!authorized) return FORBIDDEN();

  const { id } = await params;

  try {
    const body = await request.json();
    const message = clean(body.message, 5000);
    const outcome = body.status as OpportunityApplicationStatus;

    if (message.length < 1) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }
    if (
      outcome !== OpportunityApplicationStatus.MATCHED &&
      outcome !== OpportunityApplicationStatus.NOT_A_FIT
    ) {
      return NextResponse.json(
        { error: "Respond must set status to MATCHED or NOT_A_FIT" },
        { status: 400 }
      );
    }

    const application = await prisma.opportunityApplication.findUnique({
      where: { id },
      include: {
        opportunity: { select: { title: true, type: true } },
      },
    });

    if (!application) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    if (!canSeeListingType(user.role, application.opportunity.type)) {
      return FORBIDDEN();
    }

    const subject = `NEXUS — update on your application for ${application.opportunity.title}`;
    const html = `<p>Hello ${escapeHtml(application.fullName)},</p>
                  <p>${escapeHtml(message).replace(/\n/g, "<br />")}</p>
                  <p>— The NEXUS Team</p>`;

    console.info("[opportunity-application-response] sending", {
      applicationId: id,
      to: application.email,
      whatsapp: Boolean(application.phone?.trim()),
      chars: message.length,
    });

    const emailResult = await sendEmail({
      to: application.email,
      subject,
      html,
    });

    let whatsappResult: Awaited<ReturnType<typeof sendWhatsApp>> | null = null;
    if (application.phone?.trim()) {
      whatsappResult = await sendWhatsApp({ to: application.phone, body: message });
    }

    console.info("[opportunity-application-response] delivery", {
      applicationId: id,
      emailResult,
      whatsappResult,
    });

    const updated = await prisma.opportunityApplication.update({
      where: { id },
      data: {
        status: outcome,
        respondedAt: new Date(),
        reviewedAt: application.reviewedAt ?? new Date(),
        responseMessage: message,
        stageEnteredAt: new Date(),
      },
    });

    await logAdminAction({
      adminEmail: user.email,
      action: "respond",
      resourceType: "opportunity_application",
      resourceId: id,
      newValue: {
        status: outcome,
        chars: message.length,
        whatsappAttempted: Boolean(application.phone?.trim()),
      },
    });

    return NextResponse.json({
      application: updated,
      emailResult,
      whatsappResult,
      whatsappAttempted: Boolean(application.phone?.trim()),
      delivery: describeDelivery(
        emailResult,
        whatsappResult,
        Boolean(application.phone?.trim())
      ),
    });
  } catch (error) {
    console.error("Failed to respond to opportunity application:", error);
    return NextResponse.json(
      { error: "Failed to send response" },
      { status: 500 }
    );
  }
}