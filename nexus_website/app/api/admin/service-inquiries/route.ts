import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/permissions-server";
import { PERMISSIONS } from "@/lib/permissions-data";
import prisma from "@/lib/db";

export async function GET() {
  const { user, authorized } = await requirePermission(PERMISSIONS.SERVICE_INQUIRIES_READ);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!authorized) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const inquiries = await prisma.serviceOrder.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        clientName: true,
        clientEmail: true,
        clientPhone: true,
        company: true,
        serviceType: true,
        serviceTypeKey: true,
        description: true,
        budget: true,
        timeline: true,
        status: true,
        priority: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ inquiries });
  } catch (error) {
    console.error("Failed to load service inquiries:", error);
    return NextResponse.json({ inquiries: [] });
  }
}

export async function PUT(request: Request) {
  const { user, authorized } = await requirePermission(PERMISSIONS.SERVICE_INQUIRIES_RESPOND);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!authorized) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const body = await request.json();
    const { id, ...data } = body;

    const inquiry = await prisma.serviceOrder.update({
      where: { id },
      data,
    });

    return NextResponse.json(inquiry);
  } catch (error) {
    console.error("Failed to update service inquiry:", error);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const { user, authorized } = await requirePermission(PERMISSIONS.SERVICE_INQUIRIES_RESPOND);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!authorized) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const body = await request.json();
    await prisma.serviceOrder.delete({ where: { id: body.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete service inquiry:", error);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
