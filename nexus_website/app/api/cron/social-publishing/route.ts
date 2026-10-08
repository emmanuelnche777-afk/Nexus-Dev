import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { publishInstagramPhoto } from "@/lib/instagram-publisher";

export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const duePosts = await prisma.socialPost.findMany({
    where: { platform: "instagram", status: "scheduled", scheduledAt: { lte: new Date() } },
    orderBy: { scheduledAt: "asc" },
    take: 5,
  });
  const results: Array<{ id: string; result: "published" | "failed" | "skipped" }> = [];

  for (const post of duePosts) {
    const claim = await prisma.socialPost.updateMany({
      where: { id: post.id, status: "scheduled", scheduledAt: { lte: new Date() } },
      data: { status: "publishing" },
    });
    if (!claim.count) {
      results.push({ id: post.id, result: "skipped" });
      continue;
    }
    try {
      await publishInstagramPhoto(post.mediaUrl || "", post.content);
      await prisma.socialPost.update({ where: { id: post.id }, data: { status: "published", publishedAt: new Date() } });
      results.push({ id: post.id, result: "published" });
    } catch (error) {
      await prisma.socialPost.update({ where: { id: post.id }, data: { status: "failed" } });
      console.error("Scheduled Instagram post failed:", post.id, error instanceof Error ? error.message : "Unknown error");
      results.push({ id: post.id, result: "failed" });
    }
  }

  return NextResponse.json({ processed: results.length, results });
}
