import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/permissions-server";

import { prisma } from "@/lib/db";
import { logAdminAction } from "@/lib/audit";

export async function GET() {
  const { user, authorized } = await requirePermission("academy:registrations:*");
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!authorized) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const registrations = await prisma.registration.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        cohort: true,
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
    
    return NextResponse.json({ registrations });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ registrations: [] });
  }
}

export async function PUT(request: Request) {
  const { user, authorized } = await requirePermission("academy:registrations:*");
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!authorized) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const { registrationId, status, notes } = await request.json();
    
    const registration = await prisma.registration.update({
      where: { id: registrationId },
      data: {
        status: status,
      },
    });

    await logAdminAction({
      adminEmail: user.email,
      action: status === "approved" ? "approve" : "update",
      resourceType: "registration",
      resourceId: registrationId,
      newValue: { status, notes },
    });

    return NextResponse.json(registration);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to update registration" }, { status: 500 });
  }
}
