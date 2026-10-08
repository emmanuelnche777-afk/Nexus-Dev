import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { requirePermission } from "@/lib/permissions-server";
import { PERMISSIONS } from "@/lib/permissions-data";

export async function GET() {
  const { user, authorized } = await requirePermission(PERMISSIONS.MENTORSHIP_INQUIRIES_READ);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!authorized) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const applications = await prisma.pendingApplication.findMany({
      where: { role: { startsWith: "mentorship" } },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        message: true,
        status: true,
        adminNotes: true,
        createdAt: true,
      },
    });
    return NextResponse.json({ applications });
  } catch (error) {
    console.error("Failed to load mentee applications:", error);
    return NextResponse.json({ error: "Failed to load mentee applications." }, { status: 500 });
  }
}
