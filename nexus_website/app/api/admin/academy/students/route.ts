import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/permissions-server";

import { prisma } from "@/lib/db";
import { logAdminAction } from "@/lib/audit";

export async function GET() {
  const { user, authorized } = await requirePermission("academy:students:*");
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!authorized) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const students = await prisma.student.findMany({
      // Only officially registered students (payment verified as PAID)
      where: {
        OR: [{ paymentStatus: "Paid" }, { status: "Active" }],
      },
      orderBy: { createdAt: "desc" },
      include: {
        notificationDeliveries: {
          where: { template: "student_welcome" },
          select: { channel: true, status: true, attemptCount: true, error: true, sentAt: true, updatedAt: true },
        },
      },
    });
    return NextResponse.json({ students });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ students: [] });
  }
}

export async function POST(request: Request) {
  const { user, authorized } = await requirePermission("academy:students:*");
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!authorized) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const data = await request.json();

    const studentCode =
      data.studentCode ||
      await (async () => {
        const prefix = data.programSlug?.substring(0, 2).toUpperCase() || "NX";
        const year = new Date().getFullYear().toString().slice(2);
        const codePrefix = `NEXUS-${prefix}-${year}-`;
        const count = await prisma.student.count({ where: { studentCode: { startsWith: codePrefix } } });
        for (let i = count + 1; i < count + 100; i++) {
          const candidate = `${codePrefix}${String(i).padStart(4, "0")}`;
          const existing = await prisma.student.findUnique({ where: { studentCode: candidate } });
          if (!existing) return candidate;
        }
        throw new Error("Could not allocate a unique student code");
      })();

    const student = await prisma.$transaction(async (tx) => {
      const paymentStatus = data.paymentStatus || "Pending";
      const cohortId = data.cohortId || null;
      if (cohortId && paymentStatus === "Paid") {
        const cohort = await tx.cohort.findUnique({ where: { id: cohortId }, select: { maxStudents: true } });
        if (!cohort) throw new Error("COHORT_NOT_FOUND");
        const reserved = await tx.cohort.updateMany({
          where: { id: cohortId, currentStudents: { lt: cohort.maxStudents } },
          data: { currentStudents: { increment: 1 } },
        });
        if (reserved.count !== 1) throw new Error("COHORT_FULL");
      }
      return tx.student.create({
        data: {
          studentCode,
          fullName: data.fullName,
          email: data.email,
          phone: data.phone || "",
          programSlug: data.programSlug,
          cohortId,
          status: data.status || "Pending",
          paymentStatus,
          notes: data.notes,
          createdBy: "admin",
        },
      });
    });

    await logAdminAction({
      adminEmail: user.email,
      action: "create",
      resourceType: "student",
      resourceId: student.id,
      newValue: student,
    });

    return NextResponse.json(student, { status: 201 });
  } catch (error) {
    console.error(error);
    if (error instanceof Error && error.message === "COHORT_FULL") {
      return NextResponse.json({ error: "The selected cohort is full" }, { status: 409 });
    }
    return NextResponse.json({ error: "Failed to create student" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const { user, authorized } = await requirePermission("academy:students:*");
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!authorized) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const { id, ...data } = await request.json();
    const student = await prisma.student.update({
      where: { id },
      data,
    });
    return NextResponse.json(student);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to update student" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const { user, authorized } = await requirePermission("academy:students:*");
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!authorized) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const { id, clearAll } = await request.json();
    
    if (clearAll) {
      // Handled by clear-data endpoint, but here for compatibility
      return NextResponse.json({ error: "Use clear-data endpoint" }, { status: 400 });
    }

    await prisma.student.update({
      where: { id },
      data: { status: "Suspended" },
    });

    await logAdminAction({
      adminEmail: user.email,
      action: "suspend",
      resourceType: "student",
      resourceId: id,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to suspend student" }, { status: 500 });
  }
}
