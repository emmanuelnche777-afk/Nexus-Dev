import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/permissions-server";
import { prisma } from "@/lib/db";
import { sendEmail } from "@/lib/notifications";
import { escapeHtml } from "@/lib/email-html";
import { enforceActorRateLimit } from "@/lib/rate-limit";
import { logAdminAction } from "@/lib/audit";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ paymentId: string }> }
) {
  const { user, authorized } = await requirePermission("academy:payments:notify");
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!authorized) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const { paymentId } = await params;
    const limited = await enforceActorRateLimit(
      user.id,
      `academy-proof-reminder:${paymentId}`,
      3,
      60 * 60 * 1000
    );
    if (limited) return limited;

    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        registration: {
          include: { cohort: { select: { name: true } } },
        },
        student: true,
      },
    });
    if (!payment) return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    if (payment.status === "Paid") {
      return NextResponse.json({ error: "This payment is already marked Paid" }, { status: 409 });
    }

    const recipient = payment.registration?.email || payment.student?.email;
    if (!recipient) return NextResponse.json({ error: "No email address is saved for this payment" }, { status: 400 });

    const name = payment.registration?.fullName || payment.student?.fullName || "Student";
    const program = payment.registration?.programSlug || payment.programSlug || "your program";
    const cohort = payment.registration?.cohort?.name;
    const subject = "NEXUS Academy — Payment proof required";
    const html = `
      <p>Hello ${escapeHtml(name)},</p>
      <p>We have received your application for <strong>${escapeHtml(program)}</strong>${cohort ? `, cohort <strong>${escapeHtml(cohort)}</strong>` : ""}.</p>
      <p>After making your manual payment, please send a screenshot of the payment confirmation to the NEXUS team and include this reference:</p>
      <p style="font-size:20px;font-weight:bold;font-family:monospace">${escapeHtml(payment.reference || "Reference unavailable")}</p>
      <p>Our Finance team will verify the proof before your registration is approved.</p>
      <p>— NEXUS Academy Team</p>
    `;

    const result = await sendEmail({ to: recipient, subject, html });
    const status = result?.skipped ? "skipped" : result?.success === false ? "failed" : "sent";
    await prisma.notificationLog.create({
      data: {
        id: `notif-${Date.now()}-${randomUUID().slice(0, 8)}`,
        type: "academy_payment_proof_required",
        to: recipient,
        subject,
        body: html,
        status,
        result: result ? JSON.parse(JSON.stringify(result)) : undefined,
        sentById: user.id,
      },
    });
    await logAdminAction({
      adminEmail: user.email,
      action: "request_payment_proof",
      resourceType: "payment",
      resourceId: payment.id,
      newValue: { status },
    });

    if (status === "failed") {
      return NextResponse.json({ error: "Failed to send payment reminder" }, { status: 502 });
    }
    return NextResponse.json({ success: true, status });
  } catch (error) {
    console.error("Failed to send payment proof reminder:", error);
    return NextResponse.json({ error: "Failed to send payment reminder" }, { status: 500 });
  }
}
