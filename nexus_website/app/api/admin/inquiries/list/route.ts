import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/permissions-server";
import prisma from "@/lib/db";

export async function GET() {
  const { user, authorized } = await requirePermission("inquiries:*");
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!authorized) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const [contactMessages, partnerInquiries] = await Promise.all([
      prisma.contactMessage.findMany({ orderBy: { createdAt: "desc" } }),
      prisma.partnerInquiry.findMany({ orderBy: { createdAt: "desc" } }),
    ]);

    return NextResponse.json({
      inquiries: contactMessages,
      applications: partnerInquiries,
      partners: partnerInquiries,
    });
  } catch {
    return NextResponse.json({
      inquiries: [],
      applications: [],
      partners: [],
    });
  }
}
