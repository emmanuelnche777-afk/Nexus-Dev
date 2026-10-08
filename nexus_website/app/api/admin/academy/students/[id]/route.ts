import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/permissions-server";

import { prisma } from "@/lib/db";
import { logAdminAction } from "@/lib/audit";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, authorized } = await requirePermission("academy:students:*");
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!authorized) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const { id } = await params;
    const student = await prisma.student.findUnique({
      where: { id },
      include: {
        program: true,
        notificationDeliveries: {
          where: { template: "student_welcome" },
          orderBy: { updatedAt: "desc" },
        },
      },
    });

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    return NextResponse.json(student);
  } catch (error) {
    console.error("Failed to load student:", error);
    return NextResponse.json({ error: "Failed to load student" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, authorized } = await requirePermission("academy:students:*");
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!authorized) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const { id } = await params;
    const body = await request.json();

    const student = await prisma.$transaction(async (tx) => {
      const existing = await tx.student.findUnique({ where: { id } });
      if (!existing) throw new Error("STUDENT_NOT_FOUND");
      const nextCohortId = body.cohortId || null;
      const nextPaymentStatus = body.paymentStatus || existing.paymentStatus;
      const previouslyCounted = existing.cohortId && existing.paymentStatus === "Paid";
      const shouldCount = nextCohortId && nextPaymentStatus === "Paid";

      if (shouldCount && (!previouslyCounted || existing.cohortId !== nextCohortId)) {
        const cohort = await tx.cohort.findUnique({ where: { id: nextCohortId }, select: { maxStudents: true } });
        if (!cohort) throw new Error("COHORT_NOT_FOUND");
        const reserved = await tx.cohort.updateMany({
          where: { id: nextCohortId, currentStudents: { lt: cohort.maxStudents } },
          data: { currentStudents: { increment: 1 } },
        });
        if (reserved.count !== 1) throw new Error("COHORT_FULL");
      }
      if (previouslyCounted && (!shouldCount || existing.cohortId !== nextCohortId)) {
        await tx.cohort.updateMany({
          where: { id: existing.cohortId!, currentStudents: { gt: 0 } },
          data: { currentStudents: { decrement: 1 } },
        });
      }

      return tx.student.update({
        where: { id },
        data: {
          fullName: body.fullName,
          email: body.email,
          phone: body.phone,
          programSlug: body.programSlug,
          cohortId: nextCohortId,
          status: body.status,
          paymentStatus: nextPaymentStatus,
          notes: body.notes || null,
        },
      });
    });

    await logAdminAction({
      adminEmail: user.email,
      action: "update",
      resourceType: "student",
      resourceId: id,
      newValue: body,
    });

    return NextResponse.json(student);
  } catch (error) {
    console.error("Failed to update student:", error);
    if (error instanceof Error && error.message === "COHORT_FULL") {
      return NextResponse.json({ error: "The selected cohort is full" }, { status: 409 });
    }
    return NextResponse.json({ error: "Failed to update student" }, { status: 500 });
  }
}
