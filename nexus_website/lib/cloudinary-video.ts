import "server-only";

import { cloudinary, isCloudinaryConfigured } from "@/lib/cloudinary";
import prisma from "@/lib/db";

export const MAX_CLOUDINARY_VIDEO_BYTES = 40 * 1024 * 1024;
export const CLOUDINARY_VIDEO_PUBLIC_ID_PREFIX = "nexus-videos/";
export const VIDEO_EAGER_TRANSFORM = "f_mp4,vc_h264,q_auto";

export function managedCloudinaryVideoPublicId(value: unknown): string | null {
  if (typeof value !== "string" || !value) return null;

  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return null;
  }

  if (url.protocol !== "https:" || url.hostname !== "res.cloudinary.com") return null;
  const segments = url.pathname.split("/").filter(Boolean);
  const uploadIndex = segments.findIndex((segment, index) => segment === "video" && segments[index + 1] === "upload");
  if (uploadIndex < 0) return null;

  const folderIndex = segments.indexOf("nexus-videos", uploadIndex + 2);
  if (folderIndex < 0 || folderIndex + 1 >= segments.length) return null;
  const assetName = segments.slice(folderIndex + 1).join("/").replace(/\.(?:mp4|webm|ogg)$/i, "");
  if (!/^[a-f0-9-]{36}$/i.test(assetName)) return null;
  return `${CLOUDINARY_VIDEO_PUBLIC_ID_PREFIX}${assetName}`;
}

export function createCloudinaryVideoUploadSignature() {
  if (!isCloudinaryConfigured()) throw new Error("Cloudinary video uploads are not configured.");

  const timestamp = Math.floor(Date.now() / 1000);
  const publicId = `${CLOUDINARY_VIDEO_PUBLIC_ID_PREFIX}${crypto.randomUUID()}`;
  const paramsToSign = {
    allowed_formats: "mp4",
    eager: VIDEO_EAGER_TRANSFORM,
    overwrite: false,
    public_id: publicId,
    timestamp,
  };
  const signature = cloudinary.utils.api_sign_request(paramsToSign, process.env.CLOUDINARY_API_SECRET!);

  return {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME!,
    apiKey: process.env.CLOUDINARY_API_KEY!,
    timestamp,
    signature,
    publicId,
    allowedFormats: paramsToSign.allowed_formats,
    eager: paramsToSign.eager,
    maxBytes: MAX_CLOUDINARY_VIDEO_BYTES,
  };
}

export async function verifyCloudinaryVideoUpload(input: {
  publicId: unknown;
  version: unknown;
  signature: unknown;
  bytes: unknown;
  format: unknown;
  eagerUrl: unknown;
}) {
  if (!isCloudinaryConfigured()) throw new Error("Cloudinary video uploads are not configured.");
  if (typeof input.publicId !== "string" || !input.publicId.startsWith(CLOUDINARY_VIDEO_PUBLIC_ID_PREFIX)) {
    throw new Error("Invalid Cloudinary video identifier.");
  }
  const publicIdSuffix = input.publicId.slice(CLOUDINARY_VIDEO_PUBLIC_ID_PREFIX.length);
  if (!/^[a-f0-9-]{36}$/i.test(publicIdSuffix)) throw new Error("Invalid Cloudinary video identifier.");
  const version = Number(input.version);
  const bytes = Number(input.bytes);
  if (!Number.isInteger(version) || version < 1) throw new Error("Invalid Cloudinary upload response.");
  if (!Number.isInteger(bytes) || bytes < 1 || bytes > MAX_CLOUDINARY_VIDEO_BYTES) {
    throw new Error("Video files must be 40 MB or smaller.");
  }
  if (input.format !== "mp4" || typeof input.signature !== "string") {
    throw new Error("Cloudinary did not return a valid MP4 video upload.");
  }

  const expectedSignature = cloudinary.utils.api_sign_request(
    { public_id: input.publicId, version },
    process.env.CLOUDINARY_API_SECRET!
  );
  if (expectedSignature !== input.signature) throw new Error("Cloudinary upload signature verification failed.");

  const storedAsset = await cloudinary.api.resource(input.publicId, { resource_type: "video", type: "upload" });
  if (storedAsset.public_id !== input.publicId || storedAsset.resource_type !== "video") {
    throw new Error("Cloudinary could not confirm the uploaded video.");
  }
  if (storedAsset.format !== "mp4" || storedAsset.bytes > MAX_CLOUDINARY_VIDEO_BYTES) {
    throw new Error("Video files must be MP4 and 40 MB or smaller.");
  }

  const publicIdFromUrl = managedCloudinaryVideoPublicId(input.eagerUrl);
  if (publicIdFromUrl !== input.publicId) throw new Error("Cloudinary returned an unexpected video URL.");
  return { publicId: input.publicId, url: input.eagerUrl as string };
}

async function isVideoPublicIdInUse(publicId: string): Promise<boolean> {
  const [programs, siteSettings, journeyEntries, aiVideos, socialPosts] = await Promise.all([
    prisma.program.findMany({ where: { overviewVideoPublicId: publicId }, select: { id: true } }),
    prisma.siteSettings.findMany({ where: { academyOverviewVideoPublicId: publicId }, select: { id: true } }),
    prisma.journeyEntry.findMany({ select: { media: true } }),
    prisma.aiVideo.findMany({ select: { videoUrl: true } }),
    prisma.socialPost.findMany({ select: { mediaUrl: true } }),
  ]);

  if (programs.length || siteSettings.length) return true;
  for (const entry of journeyEntries) {
    if (!Array.isArray(entry.media)) continue;
    if (entry.media.some((item) => {
      if (!item || typeof item !== "object" || Array.isArray(item)) return false;
      const media = item as Record<string, unknown>;
      return media.publicId === publicId || managedCloudinaryVideoPublicId(media.url) === publicId;
    })) return true;
  }
  return aiVideos.some((video) => managedCloudinaryVideoPublicId(video.videoUrl) === publicId) ||
    socialPosts.some((post) => managedCloudinaryVideoPublicId(post.mediaUrl) === publicId);
}

export async function deleteCloudinaryVideoIfUnused(publicId: string): Promise<"deleted" | "in_use" | "not_found"> {
  if (!publicId.startsWith(CLOUDINARY_VIDEO_PUBLIC_ID_PREFIX) ||
      !/^[a-f0-9-]{36}$/i.test(publicId.slice(CLOUDINARY_VIDEO_PUBLIC_ID_PREFIX.length))) {
    throw new Error("Only videos uploaded through NEXUS can be deleted here.");
  }
  if (!isCloudinaryConfigured()) throw new Error("Cloudinary video storage is not configured.");
  if (await isVideoPublicIdInUse(publicId)) return "in_use";

  const result = await cloudinary.uploader.destroy(publicId, {
    resource_type: "video",
    type: "upload",
    invalidate: true,
  });
  return result.result === "ok" ? "deleted" : "not_found";
}
