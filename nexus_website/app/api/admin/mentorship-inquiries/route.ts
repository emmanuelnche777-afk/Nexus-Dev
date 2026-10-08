import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/permissions-server";
import { PERMISSIONS } from "@/lib/permissions-data";
import prisma from "@/lib/db";

export async function GET() {
  const { user, authorized } = await requirePermission(PERMISSIONS.MENTORSHIP_INQUIRIES_READ);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!authorized) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const inquiries = await prisma.pathwayInquiry.findMany({
      where: { pathway: { in: ["mentor", "volunteer"] } },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        pathway: true,
        fullName: true,
        email: true,
        phone: true,
        details: true,
        status: true,
        adminNotes: true,
        responseMessage: true,
        respondedAt: true,
        reviewedAt: true,
        stageEnteredAt: true,
        ownerId: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ inquiries });
  } catch (error) {
    console.error("Failed to load mentorship inquiries:", error);
    return NextResponse.json({ inquiries: [] });
  }
}

export async function PUT(request: Request) {
  const { user, authorized } = await requirePermission(PERMISSIONS.MENTORSHIP_INQUIRIES_RESPOND);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!authorized) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const body = await request.json();
    const { id, ...data } = body;

    const inquiry = await prisma.pathwayInquiry.update({
      where: { id },
      data,
    });

    return NextResponse.json(inquiry);
  } catch (error) {
    console.error("Failed to update mentorship inquiry:", error);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const { user, authorized } = await requirePermission(PERMISSIONS.MENTORSHIP_INQUIRIES_RESPOND);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!authorized) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const body = await request.json();
    await prisma.pathwayInquiry.delete({ where: { id: body.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete mentorship inquiry:", error);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
