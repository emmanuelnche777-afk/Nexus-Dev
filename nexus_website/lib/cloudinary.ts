import { v2 as cloudinary } from "cloudinary";
import { promises as fs } from "fs";
import path from "path";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export { cloudinary };

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
const VIDEOS_DIR = path.join(process.cwd(), "public", "videos");

export const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
export const VIDEO_TYPES = [
  "video/mp4",
];

export const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
export const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100MB

export function isCloudinaryConfigured(): boolean {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET &&
      !String(process.env.CLOUDINARY_API_SECRET).includes("your_")
  );
}

export interface UploadResult {
  url: string;
  fileName: string;
  storage: "cloudinary" | "local";
}

/**
 * Uploads an image or video file.
 * Uses Cloudinary whenever configured; otherwise falls back to the
 * local disk (public/uploads or public/videos) so the app keeps working
 * without cloud credentials.
 */
export async function uploadFile(
  file: File,
  type: "image" | "video"
): Promise<UploadResult> {
  const allowed = type === "video" ? VIDEO_TYPES : IMAGE_TYPES;
  const maxSize = type === "video" ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE;

  if (!allowed.includes(file.type)) {
    throw new Error(
      `Invalid file type "${file.type}". Allowed: ${allowed.join(", ")}`
    );
  }

  if (file.size > maxSize) {
    throw new Error(
      `File too large (${Math.round(file.size / 1024 / 1024)}MB). Max: ${
        maxSize / 1024 / 1024
      }MB`
    );
  }

  if (type === "video") {
    const header = new Uint8Array(await file.slice(0, 12).arrayBuffer());
    const isMp4Container =
      header.length >= 8 &&
      header[4] === 0x66 &&
      header[5] === 0x74 &&
      header[6] === 0x79 &&
      header[7] === 0x70;
    if (file.type !== "video/mp4" || !isMp4Container) {
      throw new Error("The uploaded file is not a valid MP4 video.");
    }
  }

  const safeName = file.name.replace(/[^a-zA-Z0-9.\-]/g, "-").replace(/\s+/g, "-");
  const fileName = `${Date.now()}-${safeName}`;

  if (isCloudinaryConfigured()) {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = `data:${file.type};base64,${buffer.toString("base64")}`;
    const folder = type === "video" ? "nexus-videos" : "nexus-uploads";

    const result = await cloudinary.uploader.upload(base64, {
      folder,
      public_id: fileName.replace(/\.[^.]+$/, ""),
      resource_type: type === "video" ? "video" : "auto",
      overwrite: true,
      eager:
        type === "video"
          ? [{ format: "mp4", video_codec: "h264", quality: "auto" }]
          : undefined,
    });

    // Prefer the eagerly-generated H.264 MP4 so the video plays on all
    // browsers (original phone recordings are often HEVC, which won't play).
    const deliveredUrl =
      type === "video" && Array.isArray(result.eager) && result.eager[0]?.secure_url
        ? result.eager[0].secure_url
        : result.secure_url;

    return { url: deliveredUrl, fileName, storage: "cloudinary" };
  }

  if (type === "video" && process.env.NODE_ENV === "production") {
    throw new Error("Video uploads require durable cloud storage to be configured in production.");
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error("Image uploads require Cloudinary to be configured in production.");
  }

  console.warn("[cloudinary] Not configured — falling back to local disk.");
  const targetDir = type === "video" ? VIDEOS_DIR : UPLOAD_DIR;
  try {
    await fs.access(targetDir);
  } catch {
    await fs.mkdir(targetDir, { recursive: true });
  }

  const filePath = path.join(targetDir, fileName);
  const bytes = await file.arrayBuffer();
  await fs.writeFile(filePath, Buffer.from(bytes));

  const publicPath =
    type === "video" ? `/videos/${fileName}` : `/uploads/${fileName}`;
  return { url: publicPath, fileName, storage: "local" };
}
