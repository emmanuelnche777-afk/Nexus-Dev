import { randomInt } from "node:crypto";
import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { requirePermission } from "@/lib/permissions-server";
import { prisma } from "@/lib/db";
import { logAdminAction } from "@/lib/audit";

async function generateUniqueStudentCode(
  tx: Prisma.TransactionClient,
  programSlug: string
): Promise<string> {
  const prefix = programSlug.substring(0, 2).toUpperCase();
  const year = new Date().getFullYear().toString().slice(2);

  for (let attempt = 0; attempt < 100; attempt += 1) {
    const code = `NEXUS-${prefix}-${year}-${String(randomInt(1000, 10000))}`;
    const existing = await tx.student.findUnique({ where: { studentCode: code } });
    if (!existing) return code;
  }

  throw new Error("Unable to allocate a unique student code");
}

export async function POST(request: Request) {
  const { user, authorized } = await requirePermission("academy:registrations:*");
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!authorized) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const body = await request.json().catch(() => ({}));
    const registrationId = typeof body.registrationId === "string" ? body.registrationId : null;

    const registrations = await prisma.registration.findMany({
      where: {
        ...(registrationId ? { id: registrationId } : {}),
        payment: { is: { status: "Paid", studentId: null } },
      },
      select: { id: true },
      orderBy: { createdAt: "asc" },
    });

    const enrolled: Array<{
      registrationId: string;
      studentId: string;
      studentCode: string;
      fullName: string;
      email: string;
      phone: string;
      programSlug: string;
    }> = [];

    for (const { id } of registrations) {
      const student = await prisma.$transaction(async (tx) => {
        const registration = await tx.registration.findUnique({
          where: { id },
          include: { payment: { include: { student: true } } },
        });

        if (!registration?.payment || registration.payment.status !== "Paid") return null;

        let studentRecord = registration.payment.student;
        const previousCohortId = studentRecord?.cohortId || null;
        let studentCode = studentRecord?.studentCode || registration.payment.studentCode;

        if (!studentRecord) {
          studentCode = await generateUniqueStudentCode(tx, registration.programSlug);
          studentRecord = await tx.student.create({
            data: {
              studentCode,
              fullName: registration.fullName,
              email: registration.email,
              phone: registration.phone,
              programSlug: registration.programSlug,
              cohortId: registration.cohortId,
              status: "Active",
              paymentStatus: "Paid",
              createdBy: user.id,
            },
          });
        } else {
          if (!studentCode || studentCode === "NEXUS-SO-26-0001") {
            studentCode = await generateUniqueStudentCode(tx, registration.programSlug);
          }
          studentRecord = await tx.student.update({
            where: { id: studentRecord.id },
            data: {
              studentCode,
              fullName: registration.fullName,
              email: registration.email,
              phone: registration.phone,
              programSlug: registration.programSlug,
              cohortId: registration.cohortId,
              status: "Active",
              paymentStatus: "Paid",
            },
          });
        }

        if (registration.cohortId && previousCohortId !== registration.cohortId) {
          const targetCohort = await tx.cohort.findUnique({
            where: { id: registration.cohortId },
            select: { maxStudents: true },
          });
          if (!targetCohort) throw new Error("COHORT_FULL");
          const reserved = await tx.cohort.updateMany({
            where: { id: registration.cohortId, currentStudents: { lt: targetCohort.maxStudents } },
            data: { currentStudents: { increment: 1 } },
          });
          if (reserved.count !== 1) throw new Error("COHORT_FULL");
        }

        if (previousCohortId && previousCohortId !== registration.cohortId) {
          await tx.cohort.updateMany({
            where: { id: previousCohortId, currentStudents: { gt: 0 } },
            data: { currentStudents: { decrement: 1 } },
          });
        }

        await tx.payment.update({
          where: { id: registration.payment.id },
          data: { studentId: studentRecord.id, studentCode },
        });
        await tx.registration.update({
          where: { id: registration.id },
          data: { status: "approved" },
        });

        return studentRecord;
      }, {
        // Hosted database round trips can exceed Prisma's 5-second default
        // while this transaction creates the student, reserves the cohort,
        // and links the payment and registration.
        maxWait: 10_000,
        timeout: 30_000,
      });

      if (student) {
        enrolled.push({
          registrationId: id,
          studentId: student.id,
          studentCode: student.studentCode,
          fullName: student.fullName,
          email: student.email,
          phone: student.phone,
          programSlug: student.programSlug,
        });
      }
    }

    await logAdminAction({
      adminEmail: user.email,
      action: "register_students",
      resourceType: "registration",
      newValue: { count: enrolled.length, registrationIds: enrolled.map((item) => item.registrationId) },
    });

    return NextResponse.json({ success: true, count: enrolled.length, students: enrolled });
  } catch (error) {
    console.error("Failed to register students:", error);
    if (error instanceof Error && error.message === "COHORT_FULL") {
      return NextResponse.json({ error: "The selected cohort is full. Choose another cohort before registering this student." }, { status: 409 });
    }
    return NextResponse.json({ error: "Failed to register students" }, { status: 500 });
  }
}
