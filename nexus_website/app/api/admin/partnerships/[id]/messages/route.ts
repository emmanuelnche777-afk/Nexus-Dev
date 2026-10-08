import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { logAdminAction } from "@/lib/audit";
import { requirePermission } from "@/lib/permissions-server";
import { PERMISSIONS } from "@/lib/permissions-data";
import { sendEmail } from "@/lib/notifications";
import { CONTACT } from "@/lib/site";

const unauthorized = () => NextResponse.json({ error: "Unauthorized" }, { status: 401 });
const forbidden = () => NextResponse.json({ error: "Forbidden" }, { status: 403 });

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, authorized } = await requirePermission(PERMISSIONS.PARTNERSHIP_INQUIRIES_READ);
  if (!user) return unauthorized();
  if (!authorized) return forbidden();

  const { id } = await params;
  const inquiry = await prisma.partnerInquiry.findUnique({ where: { id }, select: { id: true } });
  if (!inquiry) return NextResponse.json({ error: "Partnership request not found" }, { status: 404 });

  const messages = await prisma.partnershipInquiryEmail.findMany({
    where: { inquiryId: id },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      direction: true,
      subject: true,
      body: true,
      deliveryStatus: true,
      createdAt: true,
    },
  });

  return NextResponse.json({ messages });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, authorized } = await requirePermission(PERMISSIONS.PARTNERSHIP_INQUIRIES_RESPOND);
  if (!user) return unauthorized();
  if (!authorized) return forbidden();

  const { id } = await params;
  try {
    const inquiry = await prisma.partnerInquiry.findUnique({
      where: { id },
      select: { id: true, name: true, email: true, organization: true, status: true },
    });
    if (!inquiry) return NextResponse.json({ error: "Partnership request not found" }, { status: 404 });

    const payload = (await request.json().catch(() => null)) as { body?: unknown } | null;
    const body = typeof payload?.body === "string" ? payload.body.trim() : "";
    if (!body) return NextResponse.json({ error: "Write a message before sending" }, { status: 400 });
    if (body.length > 12000) return NextResponse.json({ error: "Message is too long" }, { status: 400 });

    const subject = `Re: NEXUS partnership proposal — ${inquiry.organization}`;
    const message = await prisma.partnershipInquiryEmail.create({
      data: { inquiryId: inquiry.id, subject, body, deliveryStatus: "pending" },
    });

    const paragraphs = body
      .split(/\n{2,}/)
      .map((paragraph) => `<p>${escapeHtml(paragraph).replace(/\n/g, "<br>")}</p>`)
      .join("");
    const result = await sendEmail({
      to: inquiry.email,
      subject,
      replyTo: process.env.PARTNERSHIP_REPLY_TO || CONTACT.email,
      html: `<p>Hello ${escapeHtml(inquiry.name)},</p>${paragraphs}<p>— The NEXUS Team</p>`,
    });

    if (!("success" in result) || !result.success) {
      const skipped = "skipped" in result && result.skipped;
      const reason = skipped
        ? "Email sending is not configured yet. Set RESEND_API_KEY before sending replies."
        : "The email provider could not send this reply. Please try again.";
      await prisma.partnershipInquiryEmail.update({
        where: { id: message.id },
        data: { deliveryStatus: "failed", deliveryError: reason },
      });
      return NextResponse.json({ error: reason }, { status: skipped ? 503 : 502 });
    }

    const [sentMessage] = await prisma.$transaction([
      prisma.partnershipInquiryEmail.update({
        where: { id: message.id },
        data: {
          deliveryStatus: "sent",
          providerMessageId: result.id ?? null,
          deliveryError: null,
        },
      }),
      prisma.partnerInquiry.update({
        where: { id },
        data: {
          status: inquiry.status === "approved" || inquiry.status === "rejected" ? inquiry.status : "contacted",
          reviewedAt: new Date(),
        },
      }),
    ]);

    await logAdminAction({
      adminEmail: user.email,
      action: "reply",
      resourceType: "partnership",
      resourceId: id,
      newValue: { messageId: sentMessage.id, subject, deliveryStatus: "sent" },
    });

    return NextResponse.json({ message: sentMessage }, { status: 201 });
  } catch (error) {
    console.error("Failed to send partnership reply:", error);
    return NextResponse.json({ error: "Failed to send partnership reply" }, { status: 500 });
  }
}
