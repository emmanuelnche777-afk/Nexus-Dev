import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/permissions-server";
import prisma from "@/lib/db";
import { parseFaqInput } from "@/lib/faq-validation";
import { logAdminAction } from "@/lib/audit";

const NO_STORE = { "Cache-Control": "no-store, max-age=0, must-revalidate" };

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, authorized } = await requirePermission("content:faq:*");
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!authorized) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const { id } = await params;
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400, headers: NO_STORE });
    }
    const parsed = parseFaqInput(body);
    if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });
    const existing = await prisma.faq.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "FAQ not found" }, { status: 404 });
    }
    const updated = await prisma.faq.update({
      where: { id },
      data: parsed.value,
    });
    await logAdminAction({
      adminEmail: user.email,
      action: "update",
      resourceType: "faq",
      resourceId: id,
      oldValue: { category: existing.category, order: existing.order, published: existing.published },
      newValue: { category: updated.category, order: updated.order, published: updated.published },
    });
    return NextResponse.json(updated, { headers: NO_STORE });
  } catch (error) {
    console.error("Failed to update FAQ:", error);
    return NextResponse.json({ error: "Failed to update FAQ" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, authorized } = await requirePermission("content:faq:*");
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!authorized) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const { id } = await params;
    const existing = await prisma.faq.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "FAQ not found" }, { status: 404 });
    }
    await prisma.faq.delete({ where: { id } });
    await logAdminAction({
      adminEmail: user.email,
      action: "delete",
      resourceType: "faq",
      resourceId: id,
      oldValue: { category: existing.category, order: existing.order, published: existing.published },
    });
    return NextResponse.json({ success: true }, { headers: NO_STORE });
  } catch (error) {
    console.error("Failed to delete FAQ:", error);
    return NextResponse.json({ error: "Failed to delete FAQ" }, { status: 500 });
  }
}
