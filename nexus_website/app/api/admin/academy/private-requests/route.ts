import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { requirePermission } from "@/lib/permissions-server";

export async function GET() {
  const { user, authorized } = await requirePermission("academy:registrations:*");
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!authorized) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const requests = await prisma.academyPrivateEnrollmentRequest.findMany({
      orderBy: [{ status: "asc" }, { createdAt: "desc" }],
      include: { program: { select: { title: true, slug: true } } },
    });
    return NextResponse.json({ requests });
  } catch (error) {
    console.error("[academy-private-requests] Failed to load:", error);
    return NextResponse.json({ error: "Failed to load private enrollment requests." }, { status: 500 });
  }
}
