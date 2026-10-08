import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { triggerNotification } from "@/lib/notification-triggers";
import { getAdminUrl } from "@/lib/urls";
import { enforceOutboundRateLimit } from "@/lib/rate-limit";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const MAX_ABOUT = 4000;

function clean(v: unknown, max = 500): string {
  return String(v ?? "").trim().slice(0, max);
}

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_body" }, { status: 400 });
  }

  const fullName = clean(body.fullName);
  const email = clean(body.email, 254).toLowerCase();
  const phone = clean(body.phone);
  const age = clean(body.age, 10);
  const location = clean(body.location);
  const status = clean(body.status);
  const fieldOfInterest = clean(body.fieldOfInterest);
  const about = clean(body.about, MAX_ABOUT);

  if (!fullName || !email || !status || !about) {
    return NextResponse.json({ ok: false, error: "missing_fields" }, { status: 400 });
  }

  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ ok: false, error: "invalid_email" }, { status: 400 });
  }

  const limited = await enforceOutboundRateLimit(req, email.toLowerCase());
  if (limited) return limited;

  const applicationID = `ment-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  const details = [
    `Status: ${status}`,
    age ? `Age: ${age}` : null,
    location ? `Location: ${location}` : null,
    fieldOfInterest ? `Field of interest: ${fieldOfInterest}` : null,
    "",
    about,
  ]
    .filter((line) => line !== null)
    .join("\n");

  try {
    await prisma.pendingApplication.create({
      data: {
        id: applicationID,
        name: fullName,
        email,
        phone,
        role: fieldOfInterest ? `mentorship:${fieldOfInterest}` : "mentorship",
        message: details,
        status: "new",
      },
    });
  } catch (err) {
    console.error("Mentorship application failed:", err);
    return NextResponse.json(
      { ok: false, error: "storage_failed" },
      { status: 500 }
    );
  }

  // Notifications are best-effort: the application is already stored, so a
  // notification failure must not be reported to the applicant as a failed
  // submission.
  try {
    await triggerNotification("mentorship_application", {
      summary: `${fullName} applied for NEXUS Mentorship`,
      referenceId: applicationID,
      link: `${getAdminUrl()}/admin/mentorship-applications`,
    });
  } catch (err) {
    console.error("Mentorship application notification failed:", err);
  }

  return NextResponse.json({ ok: true, applicationID });
}
