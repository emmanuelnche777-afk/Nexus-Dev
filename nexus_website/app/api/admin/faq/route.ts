import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/permissions-server";
import prisma from "@/lib/db";
import { randomUUID } from "node:crypto";
import { parseFaqInput } from "@/lib/faq-validation";
import { logAdminAction } from "@/lib/audit";

const NO_STORE = { "Cache-Control": "no-store, max-age=0, must-revalidate" };

export async function GET() {
  const { user, authorized } = await requirePermission("content:faq:*");
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!authorized) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  try {
    const faqs = await prisma.faq.findMany({ orderBy: [{ order: "asc" }, { createdAt: "asc" }] });
    return NextResponse.json({ faqs }, { headers: NO_STORE });
  } catch (error) {
    console.error("Failed to load FAQs:", error);
    return NextResponse.json({ error: "Failed to load FAQs." }, { status: 500, headers: NO_STORE });
  }
}

export async function POST(request: NextRequest) {
  const { user, authorized } = await requirePermission("content:faq:*");
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!authorized) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400, headers: NO_STORE });
    }
    const parsed = parseFaqInput(body);
    if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });
    const lastFaq = await prisma.faq.findFirst({ orderBy: { order: "desc" }, select: { order: true } });
    const newFaq = await prisma.faq.create({
      data: {
        id: randomUUID(),
        ...parsed.value,
        order: parsed.value.order ?? (lastFaq?.order ?? 0) + 1,
        published: parsed.value.published ?? false,
      },
    });
    await logAdminAction({
      adminEmail: user.email,
      action: "create",
      resourceType: "faq",
      resourceId: newFaq.id,
      newValue: { category: newFaq.category, order: newFaq.order, published: newFaq.published },
    });
    return NextResponse.json(newFaq, { status: 201, headers: NO_STORE });
  } catch (error) {
    console.error("Failed to create FAQ:", error);
    return NextResponse.json({ error: "Failed to create FAQ" }, { status: 500, headers: NO_STORE });
  }
}
