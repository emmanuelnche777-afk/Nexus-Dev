import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { requirePermission } from "@/lib/permissions-server";
import { PERMISSIONS } from "@/lib/permissions-data";
import prisma from "@/lib/db";
import { sendEmail } from "@/lib/notifications";
import { buildAcademyTestEmailHtml } from "@/lib/academy-notifications";
import { getNotificationPublicUrl } from "@/lib/urls";
import { enforceActorRateLimit } from "@/lib/rate-limit";

export async function POST() {
  const { user, authorized } = await requirePermission(PERMISSIONS.ACADEMY_STUDENT_NOTIFICATIONS_SEND);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!authorized) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const limited = await enforceActorRateLimit(user.id, "academy-student-notification-test", 3, 60 * 60 * 1000);
  if (limited) return limited;

  const subject = "TEST ONLY — NEXUS Academy welcome message";
  let result: Awaited<ReturnType<typeof sendEmail>>;
  try {
    const verifyUrl = `${getNotificationPublicUrl()}/academy/verify`;
    result = await sendEmail({
      to: user.email,
      subject,
      html: buildAcademyTestEmailHtml(verifyUrl),
    });
  } catch (error) {
    result = { success: false, error: error instanceof Error ? error.message : "Notification test failed" };
  }

  const safeResult = result as {
    success?: boolean;
    skipped?: boolean;
    reason?: string;
    error?: unknown;
  };
  const status = safeResult.skipped ? "skipped" : safeResult.success === true ? "sent" : "failed";
  const errorMessage = safeResult.error instanceof Error
    ? safeResult.error.message
    : typeof safeResult.error === "string"
      ? safeResult.error
      : safeResult.error && typeof safeResult.error === "object" && "message" in safeResult.error && typeof safeResult.error.message === "string"
        ? safeResult.error.message
        : null;
  try {
    await prisma.notificationLog.create({
      data: {
        id: randomUUID(),
        type: "email",
        to: user.email,
        subject,
        body: "Academy welcome template test. No student record was used.",
        status,
        result: JSON.parse(JSON.stringify(safeResult)) as Prisma.InputJsonValue,
        error: status === "failed" ? errorMessage : null,
        sentById: user.id,
      },
    });
  } catch (error) {
    console.error("Failed to log Academy notification test:", error);
  }

  return NextResponse.json({ status, recipient: user.email, reason: safeResult.reason, error: errorMessage });
}
