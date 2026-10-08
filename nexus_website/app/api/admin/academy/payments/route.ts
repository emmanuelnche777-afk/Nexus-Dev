import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/permissions-server";

import { prisma } from "@/lib/db";
import { logAdminAction } from "@/lib/audit";
import { PaymentProvider } from "@prisma/client";
import { triggerNotification } from "@/lib/notification-triggers";
import { getAdminUrl } from "@/lib/urls";

export async function GET() {
  const { user, authorized } = await requirePermission("academy:payments:read");
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!authorized) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const payments = await prisma.payment.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        student: true,
        registration: { include: { cohort: true } },
      },
    });
    
    return NextResponse.json({ payments });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ payments: [] });
  }
}

export async function PUT(request: Request) {
  const { user, authorized } = await requirePermission("academy:payments:verify");
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!authorized) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const body = await request.json();
    const { paymentId, status, verificationNotes, amount, currency, method } = body;
    
    // Define the 4 allowed statuses
    const ALLOWED_STATUSES = ["Pending", "Processing", "Requires Verification", "Paid"];
    
    if (!ALLOWED_STATUSES.includes(status)) {
        return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    if (!paymentId || !Number.isInteger(amount) || amount < 0) {
      return NextResponse.json({ error: "A valid payment and amount are required" }, { status: 400 });
    }

    if (currency !== "XAF" && currency !== "USD" && currency !== "EUR") {
      return NextResponse.json({ error: "Invalid currency" }, { status: 400 });
    }

    if (method !== PaymentProvider.MTN && method !== PaymentProvider.ORANGE) {
      return NextResponse.json({ error: "Invalid payment method" }, { status: 400 });
    }

    // Begin Transaction
    const { payment, previousStatus, reference, programSlug } = await prisma.$transaction(async (tx) => {
        const existingPayment = await tx.payment.findUnique({
          where: { id: paymentId },
          select: {
            status: true,
            reference: true,
            programSlug: true,
            registration: { select: { programSlug: true } },
          },
        });
        if (!existingPayment) throw new Error("PAYMENT_NOT_FOUND");

        const updatedPayment = await tx.payment.update({
          where: { id: paymentId },
          data: {
            status,
            notes: verificationNotes,
            amount,
            currency,
            method,
            verifiedAt: status === "Paid" ? new Date() : null,
            verifiedBy: status === "Paid" ? user.email : null,
          },
        });

        // Existing students remain linked to their verified payment. New
        // applicants do not get a Student row until the registration action.
        if (updatedPayment.studentId) {
          await tx.student.update({
            where: { id: updatedPayment.studentId },
            data: {
              paymentStatus: status,
              status: status === "Paid" ? "Active" : "Pending",
            },
          });
        }
        return {
          payment: updatedPayment,
          previousStatus: existingPayment.status,
          reference: existingPayment.reference,
          programSlug: existingPayment.registration?.programSlug || existingPayment.programSlug,
        };
    });

    await logAdminAction({
      adminEmail: user.email,
      action: "update",
      resourceType: "payment",
      resourceId: paymentId,
      newValue: { status, verificationNotes, amount, currency, method },
    });

    if (status === "Paid" && previousStatus !== "Paid") {
      await triggerNotification("payment_verified", {
        summary: `Academy payment verified${programSlug ? ` for ${programSlug}` : ""}`,
        referenceId: reference || payment.id,
        link: `${getAdminUrl()}/admin/academy/registrations`,
      });
    } else if (status === "Requires Verification" && previousStatus !== "Requires Verification") {
      await triggerNotification("payment_requires_review", {
        summary: `Academy payment requires verification${programSlug ? ` for ${programSlug}` : ""}`,
        referenceId: reference || payment.id,
        link: `${getAdminUrl()}/admin/academy/payments`,
      });
    }

    return NextResponse.json(payment);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to update payment" }, { status: 500 });
  }
}
