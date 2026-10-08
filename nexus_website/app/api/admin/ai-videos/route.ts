import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/permissions-server";
import prisma from "@/lib/db";
import { validateVideoUrl } from "@/lib/video-url";

export async function GET() {
  const { user, authorized } = await requirePermission("content:ai-videos:*");
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!authorized) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const videos = await prisma.aiVideo.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ videos });
  } catch {
    return NextResponse.json({ videos: [] });
  }
}

export async function POST(request: NextRequest) {
  const { user, authorized } = await requirePermission("content:ai-videos:*");
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!authorized) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const body = await request.json();
    const videoUrl = validateVideoUrl(body.videoUrl);
    if (!videoUrl) return NextResponse.json({ error: "Video URL is required." }, { status: 400 });
    const status = body.status ?? "published";
    if (!["published", "draft", "archived"].includes(status)) {
      return NextResponse.json({ error: "Invalid video status." }, { status: 400 });
    }
    const newVideo = await prisma.aiVideo.create({
      data: {
        title: body.title ?? "",
        description: body.description ?? "",
        videoUrl,
        thumbnailUrl: body.thumbnailUrl ?? null,
        category: body.category ?? "tutorial",
        duration: body.duration ?? null,
        tags: body.tags ?? [],
        status,
        views: body.views ?? 0,
      },
    });
    return NextResponse.json(newVideo, { status: 201 });
  } catch (error) {
    if (error instanceof Error && (error.message.startsWith("Enter a YouTube") || error.message.startsWith("Localhost video"))) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create video" }, { status: 500 });
  }
}
