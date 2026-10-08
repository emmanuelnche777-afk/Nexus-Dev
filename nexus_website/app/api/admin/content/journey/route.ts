import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { requirePermission } from "@/lib/permissions-server";
import prisma from "@/lib/db";
import { validateVideoUrl } from "@/lib/video-url";
import { deleteCloudinaryVideoIfUnused, managedCloudinaryVideoPublicId } from "@/lib/cloudinary-video";

const SOCIAL_PLATFORMS = ["instagram", "linkedin", "youtube", "tiktok"] as const;

function entryData(body: Record<string, unknown>) {
  const media = Array.isArray(body.media) ? body.media.map((item) => {
    if (!item || typeof item !== "object" || Array.isArray(item)) return item;
    const record = item as Record<string, unknown>;
    if (record.type !== "video") return item;
    const url = validateVideoUrl(record.url);
    if (!url) throw new Error("Enter a YouTube or Vimeo video link, or an MP4, WebM, or OGG video file URL.");
    return { ...record, url, publicId: managedCloudinaryVideoPublicId(url) };
  }) : [];
  return {
    date: body.date as string,
    title: body.title as string,
    description: body.description as string,
    fullContent: (body.fullContent as string) || null,
    status: body.status as string,
    category: body.category as string,
    priority: Number(body.priority) || 0,
    tags: Array.isArray(body.tags) ? body.tags.filter((tag): tag is string => typeof tag === "string") : [],
    media,
    projectName: typeof body.projectName === "string" && body.projectName.trim() ? body.projectName.trim() : null,
    phaseOrder: body.phaseOrder === "" || body.phaseOrder == null ? null : Number(body.phaseOrder),
    progress: body.progress === "" || body.progress == null ? null : Number(body.progress),
    outcome: typeof body.outcome === "string" && body.outcome.trim() ? body.outcome.trim() : null,
  };
}

function videoPublicIds(media: unknown): Set<string> {
  if (!Array.isArray(media)) return new Set();
  return new Set(media.flatMap((item) => {
    if (!item || typeof item !== "object" || Array.isArray(item)) return [];
    const record = item as Record<string, unknown>;
    if (record.type !== "video") return [];
    const publicId = managedCloudinaryVideoPublicId(record.url);
    return publicId ? [publicId] : [];
  }));
}

async function cleanupRemovedJourneyVideos(previousMedia: unknown, nextMedia: unknown) {
  const nextIds = videoPublicIds(nextMedia);
  const removedIds = [...videoPublicIds(previousMedia)].filter((id) => !nextIds.has(id));
  await Promise.all(removedIds.map((id) => deleteCloudinaryVideoIfUnused(id).catch((error) => {
    console.error("Failed to clean up removed Journey video:", error);
  })));
}

async function syncJourneySocialPosts(
  tx: Prisma.TransactionClient,
  entryId: string,
  captions: unknown,
  entry: ReturnType<typeof entryData>,
  createdBy: string
) {
  const captionMap = captions && typeof captions === "object" && !Array.isArray(captions)
    ? captions as Record<string, unknown>
    : {};
  const selected = Object.entries(captionMap).filter(
    ([platform, caption]) => SOCIAL_PLATFORMS.includes(platform as (typeof SOCIAL_PLATFORMS)[number]) && typeof caption === "string" && caption.trim()
  ) as Array<[typeof SOCIAL_PLATFORMS[number], string]>;
  const activePlatforms = selected.map(([platform]) => platform);
  const existingPosts = await tx.socialPost.findMany({
    where: { journeyEntryId: entryId },
    select: { id: true, platform: true, title: true, content: true, mediaUrl: true, status: true, scheduledAt: true, approvedAt: true, approvedBy: true },
  });
  const removedIds = existingPosts
    .filter((post) => !activePlatforms.includes(post.platform as (typeof SOCIAL_PLATFORMS)[number]) && ["draft", "pending_approval"].includes(post.status))
    .map((post) => post.id);
  if (removedIds.length) await tx.socialPost.deleteMany({ where: { id: { in: removedIds } } });

  const media = Array.isArray(entry.media) ? entry.media as Array<{ url?: string }> : [];
  for (const [platform, caption] of selected) {
    const existing = existingPosts.find((post) => post.platform === platform);
    const nextCaption = caption.trim();
    const nextMediaUrl = media[0]?.url || null;
    const captionChanged = !existing || existing.title !== entry.title || existing.content !== nextCaption || existing.mediaUrl !== nextMediaUrl;
    await tx.socialPost.upsert({
      where: { journeyEntryId_platform: { journeyEntryId: entryId, platform } },
      create: {
        journeyEntryId: entryId,
        platform,
        title: entry.title,
        content: nextCaption,
        mediaUrl: nextMediaUrl,
        tags: entry.tags,
        status: "draft",
        createdBy,
      },
      update: {
        title: entry.title,
        content: nextCaption,
        mediaUrl: nextMediaUrl,
        tags: entry.tags,
        ...(captionChanged ? {
          status: "draft",
          scheduledAt: null,
          approvedAt: null,
          approvedBy: null,
        } : {}),
      },
    });
  }
}

export async function GET() {
  const { user, authorized } = await requirePermission("content:journey:*");
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!authorized) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const entries = await prisma.journeyEntry.findMany({
      include: { socialPosts: { orderBy: { createdAt: "asc" } } },
      orderBy: [{ projectName: "asc" }, { phaseOrder: "asc" }, { date: "desc" }],
    });
    return NextResponse.json({ entries });
  } catch {
    return NextResponse.json({ entries: [] });
  }
}

export async function POST(request: Request) {
  const { user, authorized } = await requirePermission("content:journey:*");
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!authorized) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const body = await request.json() as Record<string, unknown>;
    const data = entryData(body);
    if ((data.progress !== null && (!Number.isInteger(data.progress) || data.progress < 0 || data.progress > 100)) || (data.phaseOrder !== null && (!Number.isInteger(data.phaseOrder) || data.phaseOrder < 1))) {
      return NextResponse.json({ error: "Phase order must be positive and progress must be between 0 and 100." }, { status: 400 });
    }
    const entry = await prisma.$transaction(async (tx) => {
      const created = await tx.journeyEntry.create({ data });
      await syncJourneySocialPosts(tx, created.id, body.socialCaptions, data, user.id);
      return tx.journeyEntry.findUnique({ where: { id: created.id }, include: { socialPosts: true } });
    });
    return NextResponse.json(entry, { status: 201 });
  } catch (error) {
    if (error instanceof Error && (error.message.startsWith("Enter a YouTube") || error.message.startsWith("Localhost video"))) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create entry" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const { user, authorized } = await requirePermission("content:journey:*");
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!authorized) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const body = await request.json() as Record<string, unknown>;
    const id = typeof body.id === "string" ? body.id : "";
    if (!id) return NextResponse.json({ error: "Entry id is required." }, { status: 400 });
    const data = entryData(body);
    const previous = await prisma.journeyEntry.findUnique({ where: { id }, select: { media: true } });
    if (!previous) return NextResponse.json({ error: "Journey entry not found." }, { status: 404 });
    if ((data.progress !== null && (!Number.isInteger(data.progress) || data.progress < 0 || data.progress > 100)) || (data.phaseOrder !== null && (!Number.isInteger(data.phaseOrder) || data.phaseOrder < 1))) {
      return NextResponse.json({ error: "Phase order must be positive and progress must be between 0 and 100." }, { status: 400 });
    }
    const entry = await prisma.$transaction(async (tx) => {
      const updated = await tx.journeyEntry.update({ where: { id }, data });
      await syncJourneySocialPosts(tx, id, body.socialCaptions, data, user.id);
      return tx.journeyEntry.findUnique({ where: { id: updated.id }, include: { socialPosts: true } });
    });
    await cleanupRemovedJourneyVideos(previous.media, data.media);
    return NextResponse.json(entry);
  } catch (error) {
    if (error instanceof Error && (error.message.startsWith("Enter a YouTube") || error.message.startsWith("Localhost video"))) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to update entry" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const { user, authorized } = await requirePermission("content:journey:*");
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!authorized) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const body = await request.json();
    const existing = await prisma.journeyEntry.findUnique({ where: { id: body.id }, select: { media: true } });
    if (!existing) return NextResponse.json({ error: "Journey entry not found." }, { status: 404 });
    await prisma.journeyEntry.delete({ where: { id: body.id } });
    await cleanupRemovedJourneyVideos(existing.media, []);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete entry" }, { status: 500 });
  }
}
