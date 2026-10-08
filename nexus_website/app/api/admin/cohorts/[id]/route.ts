import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/permissions-server";

import prisma from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, authorized } = await requirePermission("academy:cohorts:*");
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!authorized) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const cohort = await prisma.cohort.findUnique({ where: { id } });

  if (!cohort) {
    return NextResponse.json({ error: "Cohort not found" }, { status: 404 });
  }

  return NextResponse.json(cohort);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, authorized } = await requirePermission("academy:cohorts:*");
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!authorized) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const body = await request.json();
    const { id } = await params;
    if (body.maxStudents !== undefined) {
      const existing = await prisma.cohort.findUnique({ where: { id }, select: { currentStudents: true } });
      if (!existing) return NextResponse.json({ error: "Cohort not found" }, { status: 404 });
      if (!Number.isInteger(body.maxStudents) || body.maxStudents < existing.currentStudents) {
        return NextResponse.json({ error: "Capacity cannot be lower than the number of registered students" }, { status: 400 });
      }
    }
    const cohortData = { ...body };
    delete cohortData.currentStudents;
    const cohort = await prisma.cohort.update({
      where: { id },
      data: cohortData,
    });
    return NextResponse.json(cohort);
  } catch {
    return NextResponse.json({ error: "Failed to update cohort" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, authorized } = await requirePermission("academy:cohorts:*");
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!authorized) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const { id } = await params;
    const [registrations, students] = await Promise.all([
      prisma.registration.count({ where: { cohortId: id } }),
      prisma.student.count({ where: { cohortId: id } }),
    ]);
    if (registrations > 0 || students > 0) {
      return NextResponse.json(
        { error: "This cohort has registration history. Close it instead of deleting it." },
        { status: 409 }
      );
    }
    await prisma.cohort.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete cohort" }, { status: 500 });
  }
}
