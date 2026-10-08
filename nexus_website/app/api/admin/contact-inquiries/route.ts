import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/permissions-server";
import { PERMISSIONS } from "@/lib/permissions-data";
import prisma from "@/lib/db";
import { getContactDepartmentsForRole } from "@/lib/contact-routing";

export async function GET() {
  const { user, authorized } = await requirePermission(PERMISSIONS.CONTACT_INQUIRIES_READ);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!authorized) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const departments = getContactDepartmentsForRole(user.role);
    const inquiries = await prisma.contactMessage.findMany({
      where: { department: { in: departments } },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        department: true,
        subject: true,
        message: true,
        status: true,
        source: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ inquiries });
  } catch (error) {
    console.error("Failed to load contact inquiries:", error);
    return NextResponse.json({ inquiries: [] });
  }
}

export async function PUT(request: Request) {
  const { user, authorized } = await requirePermission(PERMISSIONS.CONTACT_INQUIRIES_RESPOND);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!authorized) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const body = await request.json();
    const id = typeof body.id === "string" ? body.id : "";
    const status = typeof body.status === "string" ? body.status : "";
    const allowedStatuses = new Set(["new", "read", "replied", "archived"]);
    if (!id || !allowedStatuses.has(status)) {
      return NextResponse.json({ error: "Invalid inquiry or status." }, { status: 400 });
    }

    const departments = getContactDepartmentsForRole(user.role);
    const existing = await prisma.contactMessage.findFirst({
      where: { id, department: { in: departments } },
      select: { id: true },
    });
    if (!existing) return NextResponse.json({ error: "Inquiry not found" }, { status: 404 });

    const inquiry = await prisma.contactMessage.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json(inquiry);
  } catch (error) {
    console.error("Failed to update contact inquiry:", error);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const { user, authorized } = await requirePermission(PERMISSIONS.CONTACT_INQUIRIES_RESPOND);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!authorized) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const body = await request.json();
    const id = typeof body.id === "string" ? body.id : "";
    const departments = getContactDepartmentsForRole(user.role);
    const existing = await prisma.contactMessage.findFirst({
      where: { id, department: { in: departments } },
      select: { id: true },
    });
    if (!existing) return NextResponse.json({ error: "Inquiry not found" }, { status: 404 });
    await prisma.contactMessage.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete contact inquiry:", error);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
