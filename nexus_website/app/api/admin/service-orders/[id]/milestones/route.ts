import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/permissions-server";
import prisma from "@/lib/db";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, authorized } = await requirePermission("techhub:*");
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!authorized) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const { id } = await params;
    const order = await prisma.serviceOrder.findUnique({ where: { id } });
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    const milestones = await prisma.milestone.findMany({
      where: { orderId: id },
      orderBy: { createdAt: "asc" },
    });
    return NextResponse.json({ milestones });
  } catch {
    return NextResponse.json({ milestones: [] });
  }
}

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, authorized } = await requirePermission("techhub:*");
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!authorized) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const { id } = await params;
    const body = await _request.json();
    const order = await prisma.serviceOrder.findUnique({ where: { id } });
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const title = (body.title || "").toString().trim();
    if (!title) {
      return NextResponse.json({ error: "Milestone title is required" }, { status: 400 });
    }

    const milestone = await prisma.milestone.create({
      data: {
        id: `mile-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        title,
        description: (body.description || "").toString().trim(),
        status: (body.status || "pending").toString(),
        dueDate: body.dueDate || null,
        orderId: id,
      },
    });

    return NextResponse.json(milestone, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to add milestone" }, { status: 500 });
  }
}