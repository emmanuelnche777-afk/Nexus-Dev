import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET() {
  try {
    const faqs = await prisma.faq.findMany({
      where: { published: true },
      orderBy: { order: "asc" },
    });
    return NextResponse.json({ faqs }, { headers: { "Cache-Control": "no-store, max-age=0, must-revalidate" } });
  } catch (error) {
    console.error("Failed to load public FAQs:", error);
    return NextResponse.json({ error: "FAQs are temporarily unavailable." }, { status: 500, headers: { "Cache-Control": "no-store, max-age=0, must-revalidate" } });
  }
}
