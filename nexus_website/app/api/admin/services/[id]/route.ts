import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/permissions-server";

import prisma from "@/lib/db";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, authorized } = await requirePermission("techhub:services:*");
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!authorized) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const service = await prisma.service.findUnique({ where: { id } });

  if (!service) {
    return NextResponse.json({ error: "Service not found" }, { status: 404 });
  }

  return NextResponse.json(service);
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, authorized } = await requirePermission("techhub:services:*");
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!authorized) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const { id } = await params;
    const data = await request.json();

    const update: Record<string, unknown> = {};
    if (typeof data.title === "string") update.title = data.title;
    if (typeof data.tagline === "string") update.tagline = data.tagline;
    if (typeof data.description === "string") update.description = data.description;
    if (typeof data.imageUrl === "string") update.imageUrl = data.imageUrl;
    if (typeof data.iconKey === "string") update.iconKey = data.iconKey;
    if (Array.isArray(data.features)) update.features = data.features;
    if (Array.isArray(data.deliverables)) update.deliverables = data.deliverables;
    if (typeof data.status === "string") update.status = data.status;
    if (typeof data.sortOrder === "number") update.sortOrder = data.sortOrder;

    const service = await prisma.service.update({
      where: { id },
      data: update,
    });

    return NextResponse.json(service);
  } catch (error) {
    console.error("Update service failed:", error);
    return NextResponse.json(
      { error: "Failed to update service" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, authorized } = await requirePermission("techhub:services:*");
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!authorized) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const { id } = await params;
    await prisma.service.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete service failed:", error);
    return NextResponse.json(
      { error: "Failed to delete service" },
      { status: 500 }
    );
  }
}