import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/permissions-server";

import { prisma } from "@/lib/db";
import { logAdminAction } from "@/lib/audit";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, authorized } = await requirePermission("academy:registrations:*");
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!authorized) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const { id } = await params;
    const registration = await prisma.registration.findUnique({
      where: { id },
      include: {
        cohort: { select: { id: true, name: true, period: true } },
        payment: {
          select: {
            studentId: true,
            studentCode: true,
            status: true,
            student: { select: { studentCode: true } },
          },
        },
      },
    });

    if (!registration) {
      return NextResponse.json({ error: "Registration not found" }, { status: 404 });
    }

    return NextResponse.json({
      ...registration,
      studentId: registration.payment?.studentId ?? null,
      studentCode: registration.payment?.student?.studentCode ?? registration.payment?.studentCode ?? null,
      paymentStatus: registration.payment?.status ?? null,
    });
  } catch (error) {
    console.error("Failed to load registration:", error);
    return NextResponse.json({ error: "Failed to load registration" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, authorized } = await requirePermission("academy:registrations:*");
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!authorized) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const { id } = await params;
    const { status, notes } = await request.json();

    const registration = await prisma.registration.update({
      where: { id },
      data: {
        status,
      },
    });

    await logAdminAction({
      adminEmail: user.email,
      action: "update",
      resourceType: "registration",
      resourceId: id,
      newValue: { status, notes },
    });

    return NextResponse.json(registration);
  } catch (error) {
    console.error("Failed to update registration:", error);
    return NextResponse.json({ error: "Failed to update registration" }, { status: 500 });
  }
}
