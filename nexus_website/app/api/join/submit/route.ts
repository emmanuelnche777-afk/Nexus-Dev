import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { PaymentProvider } from "@prisma/client";
import { prisma } from "@/lib/db";
import { sendEmail } from "@/lib/notifications";
import { triggerNotification } from "@/lib/notification-triggers";
import { getAdminUrl } from "@/lib/urls";
import { enforceOutboundRateLimit } from "@/lib/rate-limit";
import { escapeHtml } from "@/lib/email-html";

export async function POST(req: Request) {
  try {
    const data = await req.json();
    if (!data || typeof data !== "object" || Array.isArray(data)) {
      return NextResponse.json({ ok: false, error: "Invalid request body" }, { status: 400 });
    }

    const name = typeof data.fullName === "string" ? data.fullName.trim() : "";
    const email = typeof data.email === "string" ? data.email.trim().toLowerCase() : "";
    const phone = typeof data.phone === "string" ? data.phone.trim() : "";
    const programSlug = typeof (data.programSlug || data.pathway) === "string"
      ? String(data.programSlug || data.pathway).trim()
      : "";
    const paymentMethod = data.paymentProvider;
    const cohortId = typeof data.cohortId === "string" ? data.cohortId.trim() : "";

    if (!name || name.length > 120 || !email || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) || !phone || phone.length > 40 || !programSlug || !cohortId) {
      return NextResponse.json(
        { ok: false, error: "Enter a valid name, email, phone, program, and cohort" },
        { status: 400 }
      );
    }

    if (paymentMethod !== PaymentProvider.MTN && paymentMethod !== PaymentProvider.ORANGE) {
      return NextResponse.json({ ok: false, error: "Choose a valid payment method" }, { status: 400 });
    }

    const program = await prisma.program.findUnique({ where: { slug: programSlug } });
    if (!program || program.status !== "active") {
      return NextResponse.json({ ok: false, error: "This program is unavailable" }, { status: 404 });
    }

    const cohort = await prisma.cohort.findFirst({
      where: { id: cohortId, programSlug },
      include: { _count: { select: { students: { where: { paymentStatus: "Paid" } } } } },
    });
    if (!cohort || cohort.status !== "open") {
      return NextResponse.json({ ok: false, error: "This cohort is not accepting applications" }, { status: 409 });
    }
    const deadline = new Date(cohort.applicationDeadline);
    deadline.setUTCHours(23, 59, 59, 999);
    if (deadline < new Date()) {
      return NextResponse.json({ ok: false, error: "The application deadline for this cohort has passed" }, { status: 409 });
    }
    if (cohort._count.students >= cohort.maxStudents) {
      return NextResponse.json({ ok: false, error: "This cohort is full" }, { status: 409 });
    }

    const limited = await enforceOutboundRateLimit(req, email);
    if (limited) return limited;

    const reference = `NEXUS-APP-${randomUUID().replace(/-/g, "").slice(0, 16).toUpperCase()}`;
    const registrationId = `reg-${randomUUID()}`;

    const { registration, payment } = await prisma.$transaction(async (tx) => {
      await tx.pendingApplication.create({
        data: {
          id: reference,
          name,
          email,
          phone,
          message: `Academy application for ${programSlug}`,
          status: "new",
        },
      });

      const registration = await tx.registration.create({
        data: {
          id: registrationId,
          programSlug,
          cohortId,
          fullName: name,
          email,
          phone,
          status: "new",
        },
      });

      const payment = await tx.payment.create({
        data: {
          registrationId: registration.id,
          studentId: null,
          studentCode: null,
          amount: cohort.price,
          currency: cohort.currency,
          method: paymentMethod,
          reference,
          status: "Pending",
          notes: "Awaiting manual payment and proof",
          programSlug,
        },
      });

      return { registration, payment };
    });

    // Notifications are best effort. A mail provider outage must not make a
    // successfully saved payment attempt look like a failed registration.
    const safeName = escapeHtml(name);
    const safeTitle = escapeHtml(program.title);
    const noticeTasks = [
      sendEmail({
        to: email,
        subject: "NEXUS Academy — Payment instructions",
        html: `<p>Hello ${safeName},</p>
               <p>Your application for <strong>${safeTitle}</strong> has been received.</p>
               <p>Your payment reference is <strong>${reference}</strong>. Follow the payment instructions on the confirmation page and include this reference when you send your proof.</p>
               <p>— The NEXUS Academy Team</p>`,
      }),
      triggerNotification("new_registration", {
          summary: `${name} applied for ${programSlug} (${cohort.name})`,
        referenceId: reference,
        link: `${getAdminUrl()}/admin/academy/payments`,
      }),
    ];
    const noticeResults = await Promise.allSettled(noticeTasks);
    for (const result of noticeResults) {
      if (result.status === "rejected") {
        console.error("[academy registration] notification failed:", result.reason);
      }
    }

    return NextResponse.json({
      ok: true,
      applicationID: reference,
      registrationId: registration.id,
      paymentId: payment.id,
      amount: cohort.price,
      currency: cohort.currency,
    });
  } catch (error) {
    console.error("Manual academy registration failed:", error);
    return NextResponse.json({ ok: false, error: "Unable to submit registration" }, { status: 500 });
  }
}
