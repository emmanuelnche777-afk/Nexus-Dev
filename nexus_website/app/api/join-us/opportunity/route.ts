import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendEmail } from "@/lib/notifications";
import { triggerNotification } from "@/lib/notification-triggers";
import { getAdminUrl } from "@/lib/urls";
import {
  uploadOpportunityDoc,
  deleteOpportunityDoc,
  type DocUploadResult,
} from "@/lib/opportunity-docs-upload";
import { clean, cleanEmail, isValidEmail } from "@/lib/join-us-pathways";
import { isAcceptingApplications } from "@/lib/opportunity-listing";
import { enforceOutboundRateLimit } from "@/lib/rate-limit";

const MAX_DOCS = 5;

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Public application against a single Opportunity listing.
 *
 * Whether the listing is open is decided by `isAcceptingApplications`, imported
 * from `lib/opportunity-listing` — the same function the public listing feed in
 * `app/api/opportunities/route.ts` uses. That rule requires an explicit OPEN
 * lifecycle, so a DRAFT listing cannot be applied to even by guessing its id.
 *
 * Accepts `multipart/form-data` so optional document uploads travel with the
 * form in one request.
 *
 * Independent of the Academy pipeline: no Student / Registration / Payment /
 * Program interaction, and no payment initiation.
 */
export async function POST(req: Request) {
  try {
    const settings = await prisma.siteSettings.findUnique({
      where: { id: "singleton" },
      select: { metadata: true },
    });
    const metadata = (settings?.metadata as Record<string, unknown> | null) ?? {};
    if (metadata.opportunitiesSectionEnabled === false) {
      return NextResponse.json(
        { ok: false, message: "Opportunity applications are currently paused." },
        { status: 409 }
      );
    }
  } catch (error) {
    console.error("Failed to check Opportunities availability:", error);
    return NextResponse.json(
      { ok: false, message: "Opportunity applications are temporarily unavailable." },
      { status: 503 }
    );
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json(
      { ok: false, message: "Invalid request body." },
      { status: 400 }
    );
  }

  const opportunityId = clean(form.get("opportunityId"), 60);
  const fullName = clean(form.get("fullName"), 120);
  const email = cleanEmail(form.get("email"));
  const phone = clean(form.get("phone"), 40);
  const message = clean(form.get("message"), 5000);
  const files = form.getAll("documents").filter(isFileWithContent);

  if (!opportunityId) {
    return NextResponse.json(
      { ok: false, message: "Please choose a role to apply for." },
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
  if (message.length < 10) {
    return NextResponse.json(
      { ok: false, message: "Please tell us a little about yourself." },
      { status: 400 }
    );
  }
  if (files.length > MAX_DOCS) {
    return NextResponse.json(
      { ok: false, message: `You can attach at most ${MAX_DOCS} documents.` },
      { status: 400 }
    );
  }

  const opportunity = await prisma.opportunity.findUnique({
    where: { id: opportunityId },
    select: {
      id: true,
      title: true,
      lifecycle: true,
      deadline: true,
    },
  });

  if (!opportunity) {
    return NextResponse.json(
      { ok: false, message: "That role could not be found." },
      { status: 404 }
    );
  }

  // Exactly the rule the public feed uses, imported from one module rather than
  // reimplemented here. A DRAFT listing is not published and cannot be applied to.
  if (!isAcceptingApplications(opportunity)) {
    return NextResponse.json(
      { ok: false, message: "This role is no longer accepting applications." },
      { status: 409 }
    );
  }

  const limited = await enforceOutboundRateLimit(req, email);
  if (limited) return limited;

  // Upload first so a rejected document never leaves an orphaned DB row.
  const uploaded: DocUploadResult[] = [];
  try {
    for (const file of files) {
      uploaded.push(await uploadOpportunityDoc(file));
    }
  } catch (uploadError) {
    // Roll back anything already uploaded for this submission.
    await Promise.all(uploaded.map((doc) => deleteOpportunityDoc(doc)));
    const reason =
      uploadError instanceof Error ? uploadError.message : "Upload failed";
    return NextResponse.json(
      { ok: false, message: `Document upload failed: ${reason}` },
      { status: 400 }
    );
  }

  try {
    const application = await prisma.opportunityApplication.create({
      data: {
        opportunityId,
        fullName,
        email,
        phone: phone || null,
        message,
        documentUrls: uploaded.map((doc) => doc.url),
      },
    });

    try {
      await sendEmail({
        to: email,
        subject: `NEXUS — we received your application for ${opportunity.title}`,
        html: `<p>Hello ${escapeHtml(fullName)},</p>
               <p>Thank you for applying for <strong>${escapeHtml(
                 opportunity.title
               )}</strong>. We have received your application and our team will review it and get back to you.</p>
               <p>Your reference: <strong>${escapeHtml(application.id)}</strong></p>
               <p>— The NEXUS Team</p>`,
      });

      await triggerNotification("new_opportunity_application", {
        summary: `${fullName} applied for ${opportunity.title}`,
        referenceId: application.id,
        link: `${getAdminUrl()}/admin/opportunity-applications/${application.id}`,
      });
    } catch (notifyError) {
      console.error(
        "[join-us/opportunity] acknowledgment failed:",
        notifyError
      );
    }

    return NextResponse.json({
      ok: true,
      id: application.id,
      message:
        "Thank you, we've received your application and will be in touch.",
    });
  } catch (error) {
    console.error("[join-us/opportunity] submission failed:", error);
    // Don't leave orphaned uploads behind on a DB failure either.
    await Promise.all(uploaded.map((doc) => deleteOpportunityDoc(doc)));
    return NextResponse.json(
      {
        ok: false,
        message: "We couldn't save your application. Please try again.",
      },
      { status: 500 }
    );
  }
}

function isFileWithContent(value: FormDataEntryValue): value is File {
  return (
    typeof value !== "string" &&
    typeof value.arrayBuffer === "function" &&
    value.size > 0
  );
}
