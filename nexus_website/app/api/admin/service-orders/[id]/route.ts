import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/permissions-server";
import prisma from "@/lib/db";
import { sendEmail } from "@/lib/notifications";
import { logAdminAction } from "@/lib/audit";
import { CONTACT } from "@/lib/site";
import { escapeHtml, safeEmailSubject } from "@/lib/email-html";

const ALLOWED_FIELDS = [
  "serviceType",
  "serviceTypeKey",
  "clientName",
  "clientEmail",
  "clientPhone",
  "company",
  "description",
  "budget",
  "timeline",
  "desiredTimeline",
  "status",
  "priority",
  "assignedTo",
  "assignedToId",
  "notes",
  "quoteAmount",
  "quoteCurrency",
  "quoteDurationWeeks",
];

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, authorized } = await requirePermission("techhub:*");
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!authorized) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const order = await prisma.serviceOrder.findUnique({
    where: { id },
    include: { milestones: true, assignee: { select: { id: true, name: true, email: true } } },
  });

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  return NextResponse.json(order);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, authorized } = await requirePermission("techhub:*");
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!authorized) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const body = await request.json();
    const { id } = await params;
    const existing = await prisma.serviceOrder.findUnique({ where: { id } });

    if (!existing) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const data: Record<string, unknown> = {};
    for (const key of ALLOWED_FIELDS) {
      if (key in body && body[key] !== undefined) {
        if (
          (key === "quoteAmount" || key === "quoteDurationWeeks") &&
          body[key] !== null
        ) {
          const num = Number(body[key]);
          data[key] = Number.isFinite(num) ? num : null;
        } else {
          data[key] = body[key];
        }
      }
    }

    if ("assignedToId" in body) {
      if (!body.assignedToId) {
        data.assignedToId = null;
        data.assignedTo = null;
      } else {
        const assignee = await prisma.adminUser.findFirst({
          where: { id: String(body.assignedToId), active: true, status: "ACTIVE", deletedAt: null },
          select: { id: true, name: true },
        });
        if (!assignee) return NextResponse.json({ error: "Choose an active staff member" }, { status: 400 });
        data.assignedToId = assignee.id;
        data.assignedTo = assignee.name;
      }
    }

    // Setting a quote automatically moves the order to "quoted"
    if (data.quoteAmount !== undefined && data.quoteAmount !== null) {
      data.status = "quoted";
    }

    const updated = await prisma.serviceOrder.update({
      where: { id },
      data,
      include: { milestones: true, assignee: { select: { id: true, name: true, email: true } } },
    });

    await logAdminAction({
      adminEmail: user.email,
      action: "update",
      resourceType: "service-order",
      resourceId: id,
      newValue: data,
    });

    // Notify the client by email when a quote is issued
    if (
      data.quoteAmount !== undefined &&
      data.quoteAmount !== null &&
      updated.clientEmail
    ) {
      const amount = Number(updated.quoteAmount || 0);
      const currency = updated.quoteCurrency || "XAF";
      const weeks = updated.quoteDurationWeeks;

      await sendEmail({
        to: updated.clientEmail,
        subject: safeEmailSubject(`Your NEXUS quote for "${updated.serviceType}"`),
        html: `
           <h2>Hi ${escapeHtml(updated.clientName)},</h2>
           <p>Good news — your quote from NEXUS is ready!</p>
           <p><strong>Service:</strong> ${escapeHtml(updated.serviceType)}</p>
           <p><strong>Estimated cost:</strong> ${amount.toLocaleString()} ${escapeHtml(currency)}</p>
           ${weeks ? `<p><strong>Estimated duration:</strong> ${weeks} week${weeks > 1 ? "s" : ""}</p>` : ""}
           <p>We'd love to discuss the details and get started. Just reply to this email or reach us on WhatsApp.</p>
           <hr>
           <p><small>NEXUS Tech Hub — ${CONTACT.email}</small></p>
         `,
      }).catch((error) => {
        console.error("Quote email failed:", error);
      });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Update order failed:", error);
    return NextResponse.json(
      { error: "Failed to update order" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, authorized } = await requirePermission("techhub:*");
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!authorized) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  try {
    await prisma.serviceOrder.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to delete order" },
      { status: 500 }
    );
  }
}
