import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/permissions-server";
import { PERMISSIONS } from "@/lib/permissions-data";
import prisma from "@/lib/db";
import { logAdminAction } from "@/lib/audit";
import { sendStudentWelcome } from "@/lib/academy-notifications";
import { enforceActorRateLimit } from "@/lib/rate-limit";

const MAX_STUDENTS_PER_SEND = 10;

export async function POST(request: Request) {
  const { user, authorized } = await requirePermission(PERMISSIONS.ACADEMY_STUDENT_NOTIFICATIONS_SEND);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!authorized) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const limited = await enforceActorRateLimit(user.id, "academy-student-notifications-send", 10, 60 * 60 * 1000);
  if (limited) return limited;

  try {
    const body = await request.json();
    const requested: unknown[] = Array.isArray(body?.studentIds) ? body.studentIds : [];
    const studentIds = Array.from(new Set<string>(
      requested.filter((id): id is string => typeof id === "string" && id.length > 0)
    ));
    if (studentIds.length === 0 || studentIds.length > MAX_STUDENTS_PER_SEND) {
      return NextResponse.json(
        { error: `Select between 1 and ${MAX_STUDENTS_PER_SEND} students to send welcome messages.` },
        { status: 400 }
      );
    }

    const students = await prisma.student.findMany({
      where: {
        id: { in: studentIds },
        status: "Active",
        paymentStatus: "Paid",
      },
      select: {
        id: true,
        studentCode: true,
        fullName: true,
        email: true,
        phone: true,
        programSlug: true,
        program: { select: { title: true } },
      },
    });

    if (students.length !== studentIds.length) {
      return NextResponse.json(
        { error: "Every selected student must be active and have a verified Paid status." },
        { status: 409 }
      );
    }

    const results = await Promise.allSettled(students.map((student) =>
      sendStudentWelcome({
        ...student,
        programTitle: student.program.title,
      }, user.id)
    ));

    const deliveries = results.map((result, index) => result.status === "fulfilled"
      ? result.value
      : {
          studentId: students[index].id,
          studentCode: students[index].studentCode,
          email: { status: "failed", error: "Failed to process email delivery", attemptCount: 0 },
          whatsapp: { status: "failed", error: "Failed to process WhatsApp delivery", attemptCount: 0 },
        });

    const counts = {
      students: deliveries.length,
      sent: deliveries.reduce((sum, item) => sum + Number(item.email.status === "sent") + Number(item.whatsapp.status === "sent"), 0),
      failed: deliveries.reduce((sum, item) => sum + Number(item.email.status === "failed") + Number(item.whatsapp.status === "failed"), 0),
      skipped: deliveries.reduce((sum, item) => sum + Number(item.email.status === "skipped") + Number(item.whatsapp.status === "skipped"), 0),
      alreadySent: deliveries.reduce((sum, item) => sum + Number(item.email.status === "already_sent") + Number(item.whatsapp.status === "already_sent"), 0),
    };

    await logAdminAction({
      adminEmail: user.email,
      action: "send_academy_student_welcome",
      resourceType: "student",
      newValue: { studentCount: deliveries.length, ...counts },
    });

    return NextResponse.json({ success: counts.failed === 0, counts, deliveries });
  } catch (error) {
    console.error("Failed to send Academy welcome messages:", error);
    return NextResponse.json({ error: "Failed to process Academy welcome messages" }, { status: 500 });
  }
}
