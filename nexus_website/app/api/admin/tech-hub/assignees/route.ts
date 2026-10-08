import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/permissions-server";
import prisma from "@/lib/db";

export async function GET() {
  const { user, authorized } = await requirePermission("techhub:orders:read");
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!authorized) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const staff = await prisma.adminUser.findMany({
    where: { active: true, status: "ACTIVE", deletedAt: null },
    orderBy: { name: "asc" },
    select: { id: true, name: true, email: true, role: true },
  });
  return NextResponse.json({ staff });
}
