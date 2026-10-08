import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { resolveVideoUrl } from "@/lib/video-url";

export async function GET() {
  try {
    const records = await prisma.journeyEntry.findMany({
      orderBy: [{ priority: "desc" }, { date: "desc" }],
    });
    const entries = records.map((entry) => ({
      ...entry,
      media: Array.isArray(entry.media)
        ? entry.media.filter((item) => {
            if (!item || typeof item !== "object" || Array.isArray(item)) return false;
            const media = item as Record<string, unknown>;
            return media.type !== "video" || (typeof media.url === "string" && Boolean(resolveVideoUrl(media.url)));
          })
        : [],
    }));
    return NextResponse.json({ entries });
  } catch {
    return NextResponse.json({ entries: [] });
  }
}
