import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/permissions-server";
import prisma from "@/lib/db";
import { validateVideoUrl } from "@/lib/video-url";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, authorized } = await requirePermission("content:ai-videos:*");
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!authorized) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const video = await prisma.aiVideo.findUnique({ where: { id } });

  if (!video) {
    return NextResponse.json({ error: "Video not found" }, { status: 404 });
  }

  return NextResponse.json(video);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, authorized } = await requirePermission("content:ai-videos:*");
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!authorized) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const body = await request.json();
    const { id } = await params;

    if (body.status !== undefined && !["published", "draft", "archived"].includes(body.status)) {
      return NextResponse.json({ error: "Invalid video status." }, { status: 400 });
    }
    const videoUrl = body.videoUrl !== undefined ? validateVideoUrl(body.videoUrl) : undefined;
    if (body.videoUrl !== undefined && !videoUrl) {
      return NextResponse.json({ error: "Video URL is required." }, { status: 400 });
    }

    const video = await prisma.aiVideo.update({
      where: { id },
      data: {
        ...(body.title !== undefined && { title: body.title }),
        ...(body.description !== undefined && { description: body.description }),
        ...(typeof videoUrl === "string" && { videoUrl }),
        ...(body.thumbnailUrl !== undefined && { thumbnailUrl: body.thumbnailUrl }),
        ...(body.category !== undefined && { category: body.category }),
        ...(body.duration !== undefined && { duration: body.duration }),
        ...(body.tags !== undefined && { tags: body.tags }),
        ...(body.status !== undefined && { status: body.status }),
        ...(body.views !== undefined && { views: body.views }),
      },
    });
    return NextResponse.json(video);
  } catch (error) {
    if (error instanceof Error && (error.message.startsWith("Enter a YouTube") || error.message.startsWith("Localhost video"))) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to update video" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, authorized } = await requirePermission("content:ai-videos:*");
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!authorized) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const { id } = await params;
    await prisma.aiVideo.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete video" }, { status: 500 });
  }
}
