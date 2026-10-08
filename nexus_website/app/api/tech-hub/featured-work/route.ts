import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET() {
  try {
    const [settings, projects] = await Promise.all([
      prisma.siteSettings.findUnique({ where: { id: "singleton" }, select: { metadata: true } }),
      prisma.techHubFeaturedWork.findMany({
        where: { status: "published" },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      }),
    ]);
    const metadata = (settings?.metadata as Record<string, unknown> | null) ?? {};
    return NextResponse.json({
      enabled: typeof metadata.featuredWorkEnabled === "boolean" ? metadata.featuredWorkEnabled : true,
      projects,
    }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Failed to load featured work:", error);
    return NextResponse.json({ enabled: false, projects: [] }, { status: 500 });
  }
}
