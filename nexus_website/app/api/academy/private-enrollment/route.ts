import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { enforceOutboundRateLimit } from "@/lib/rate-limit";
import { triggerNotification } from "@/lib/notification-triggers";
import { getAdminUrl } from "@/lib/urls";

export async function POST(request: Request) {
  let parsedBody: unknown;
  try {
    parsedBody = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }
  if (!parsedBody || typeof parsedBody !== "object" || Array.isArray(parsedBody)) {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }
  const body = parsedBody as Record<string, unknown>;

  const programSlug = typeof body.programSlug === "string" ? body.programSlug.trim() : "";
  const fullName = typeof body.fullName === "string" ? body.fullName.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const phone = typeof body.phone === "string" ? body.phone.trim() : "";
  const preferredFormat = body.preferredFormat;
  const preferredSchedule = typeof body.preferredSchedule === "string" ? body.preferredSchedule.trim() : "";
  const message = typeof body.message === "string" ? body.message.trim() : "";

  if (!programSlug || programSlug.length > 120 || !fullName || fullName.length > 120 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254 ||
      !phone || phone.length > 40 || !["one_to_one", "private_group"].includes(String(preferredFormat)) ||
      !preferredSchedule || preferredSchedule.length > 200 || message.length > 2000) {
    return NextResponse.json({ error: "Please check the required fields and try again." }, { status: 400 });
  }

  try {
    const limited = await enforceOutboundRateLimit(request, email, { scope: "academy-private-enrollment", recipientLimit: 3 });
    if (limited) return limited;

    const program = await prisma.program.findFirst({
      where: { slug: programSlug, status: "active" },
      select: { slug: true },
    });
    if (!program) return NextResponse.json({ error: "This program is not currently available." }, { status: 404 });

    const now = new Date();
    const cohorts = await prisma.cohort.findMany({
      where: { programSlug, status: "open" },
      select: { maxStudents: true, applicationDeadline: true, _count: { select: { students: { where: { paymentStatus: "Paid" } } } } },
    });
    if (cohorts.some((cohort) => {
      const deadline = new Date(cohort.applicationDeadline);
      deadline.setUTCHours(23, 59, 59, 999);
      return deadline >= now && cohort._count.students < cohort.maxStudents;
    })) {
      return NextResponse.json({ error: "An open cohort is accepting applications. Please use the standard cohort registration form." }, { status: 409 });
    }

    const requestRecord = await prisma.academyPrivateEnrollmentRequest.create({
      data: {
        programSlug,
        fullName,
        email,
        phone,
        preferredFormat: String(preferredFormat),
        preferredSchedule,
        message: message || null,
      },
      select: { id: true },
    });
    try {
      await triggerNotification("academy_private_request", {
        summary: `${fullName} requested private training for ${programSlug}`,
        referenceId: requestRecord.id,
        link: `${getAdminUrl()}/admin/academy/private-requests`,
      });
    } catch (error) {
      console.error("[academy-private-enrollment] Notification failed:", error);
    }
    return NextResponse.json({ ok: true, requestId: requestRecord.id }, { status: 201 });
  } catch (error) {
    console.error("[academy-private-enrollment] Failed to create request:", error);
    return NextResponse.json({ error: "We could not save your request. Please try again." }, { status: 500 });
  }
}
