import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/permissions-server";
import prisma from "@/lib/db";

export async function GET() {
  const { user, authorized } = await requirePermission("techhub:*");
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!authorized) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const orders = await prisma.serviceOrder.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        milestones: true,
        assignee: { select: { id: true, name: true, email: true } },
      },
    });
    return NextResponse.json({ orders });
  } catch {
    return NextResponse.json({ orders: [] });
  }
}

export async function POST(request: NextRequest) {
  const { user, authorized } = await requirePermission("techhub:*");
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!authorized) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const body = await request.json();
    const newOrder = await prisma.serviceOrder.create({
      data: {
        ...body,
        id: body.id || `so-${Date.now()}`,
      },
    });
    return NextResponse.json(newOrder, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}
