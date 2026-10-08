import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/permissions-server";

import prisma from "@/lib/db";
import { validateVideoUrl } from "@/lib/video-url";
import { deleteCloudinaryVideoIfUnused, managedCloudinaryVideoPublicId } from "@/lib/cloudinary-video";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, authorized } = await requirePermission("academy:programs:*");
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!authorized) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const program = await prisma.program.findFirst({
    where: { OR: [{ id }, { slug: id }] },
  });

  if (!program) {
    return NextResponse.json({ error: "Program not found" }, { status: 404 });
  }

  return NextResponse.json(program);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, authorized } = await requirePermission("academy:programs:*");
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!authorized) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const body = await request.json();
    delete body.overviewVideoPublicId;
    if (Object.prototype.hasOwnProperty.call(body, "overviewVideoUrl")) {
      const overviewVideoUrl = validateVideoUrl(body.overviewVideoUrl);
      if (body.overviewVideoUrl != null && !overviewVideoUrl) {
        return NextResponse.json({ error: "Video URL must be a supported link." }, { status: 400 });
      }
      body.overviewVideoUrl = overviewVideoUrl;
      body.overviewVideoPublicId = managedCloudinaryVideoPublicId(overviewVideoUrl);
    }
    const { id } = await params;
    const existing = await prisma.program.findFirst({
      where: { OR: [{ id }, { slug: id }] },
    });

    if (!existing) {
      return NextResponse.json({ error: "Program not found" }, { status: 404 });
    }

    const program = await prisma.program.update({
      where: { id: existing.id },
      data: body,
    });
    const previousVideoId = existing.overviewVideoPublicId || managedCloudinaryVideoPublicId(existing.overviewVideoUrl);
    if (previousVideoId && previousVideoId !== program.overviewVideoPublicId) {
      await deleteCloudinaryVideoIfUnused(previousVideoId).catch((error) => {
        console.error("Failed to clean up replaced program video:", error);
      });
    }
    return NextResponse.json(program);
  } catch (error) {
    if (error instanceof Error && (error.message.startsWith("Enter a YouTube") || error.message.startsWith("Localhost video"))) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to update program" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, authorized } = await requirePermission("academy:programs:*");
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!authorized) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const { id } = await params;
    const existing = await prisma.program.findFirst({
      where: { OR: [{ id }, { slug: id }] },
    });

    if (!existing) {
      return NextResponse.json({ error: "Program not found" }, { status: 404 });
    }

    await prisma.program.delete({ where: { id: existing.id } });
    const videoId = existing.overviewVideoPublicId || managedCloudinaryVideoPublicId(existing.overviewVideoUrl);
    if (videoId) {
      await deleteCloudinaryVideoIfUnused(videoId).catch((error) => {
        console.error("Failed to clean up deleted program video:", error);
      });
    }
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete program" }, { status: 500 });
  }
}
