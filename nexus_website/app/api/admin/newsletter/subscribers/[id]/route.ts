import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { requirePermission } from "@/lib/permissions-server";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { user, authorized } = await requirePermission("newsletter:manage");
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!authorized) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const body = await request.json();
    if (body?.status !== "unsubscribed" && body?.status !== "active") {
      return NextResponse.json({ error: "Status must be active or unsubscribed." }, { status: 400 });
    }
    const { id } = await params;
    const result = await prisma.newsletterSubscriber.updateMany({
      where: { id, status: body.status === "active" ? "unsubscribed" : "active" },
      data: { status: body.status },
    });
    if (result.count === 0) {
      return NextResponse.json({ error: "Active subscriber not found." }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[newsletter] Failed to update subscriber:", error);
    return NextResponse.json({ error: "Failed to update subscriber." }, { status: 500 });
  }
}
