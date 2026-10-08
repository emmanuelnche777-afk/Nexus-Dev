import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendEmail } from "@/lib/notifications";
import { triggerNotification } from "@/lib/notification-triggers";
import { getAdminUrl } from "@/lib/urls";
import { enforceOutboundRateLimit } from "@/lib/rate-limit";
import {
  PATHWAY_LABELS,
  clean,
  cleanEmail,
  extractDetails,
  isPathwayId,
  isValidEmail,
  type PathwayId,
} from "@/lib/join-us-pathways";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Public "Join Us" pathway submission (student / client / volunteer / mentor /
 * partner / investor).
 *
 * Intentionally independent of the Academy pipeline: this route never touches
 * Student, Registration, Payment or Program, and never initiates a payment.
 */
export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { ok: false, message: "Invalid request body." },
      { status: 400 }
    );
  }

  const pathway = clean(body.pathway, 40);
  const fullName = clean(body.fullName ?? body.name, 120);
  const email = cleanEmail(body.email);
  const phone = clean(body.phone, 40);

  if (!isPathwayId(pathway)) {
    return NextResponse.json(
      { ok: false, message: "Please choose a valid pathway." },
      { status: 400 }
    );
  }

  if (fullName.length < 2) {
    return NextResponse.json(
      { ok: false, message: "Please enter your full name." },
      { status: 400 }
    );
  }

  if (!isValidEmail(email)) {
    return NextResponse.json(
      { ok: false, message: "Please enter a valid email address." },
      { status: 400 }
    );
  }

  const limited = await enforceOutboundRateLimit(req, email);
  if (limited) return limited;

  const details = extractDetails(pathway, body);

  try {
    const inquiry = await prisma.pathwayInquiry.create({
      data: {
        pathway,
        fullName,
        email,
        phone: phone || null,
        details: details as never,
      },
    });

    // Best-effort acknowledgment. The submission is already stored, so a
    // notification failure must not be reported back as a failed submission.
    try {
      const label = PATHWAY_LABELS[pathway as PathwayId];
      await sendEmail({
        to: email,
        subject: `NEXUS — we received your ${label.toLowerCase()} application`,
        html: `<p>Hello ${escapeHtml(fullName)},</p>
               <p>Thank you for getting in touch with NEXUS. We have received your <strong>${escapeHtml(
                 label.toLowerCase()
               )}</strong> submission and will be in touch shortly.</p>
               <p>Your reference: <strong>${escapeHtml(inquiry.id)}</strong></p>
               <p>— The NEXUS Team</p>`,
      });

      await triggerNotification("new_pathway_inquiry", {
        summary: `${fullName} applied via the Join Us ${label} pathway`,
        referenceId: inquiry.id,
        link: `${getAdminUrl()}/admin/joiners/${inquiry.id}`,
      });
    } catch (notifyError) {
      console.error("[join-us/pathway] acknowledgment failed:", notifyError);
    }

    return NextResponse.json({
      ok: true,
      id: inquiry.id,
      message: "Thank you, we've received your submission and will be in touch.",
    });
  } catch (error) {
    console.error("[join-us/pathway] submission failed:", error);
    return NextResponse.json(
      { ok: false, message: "We couldn't save your submission. Please try again." },
      { status: 500 }
    );
  }
}
