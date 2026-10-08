export type CloudinaryVideoUploadContext = "academy-program" | "academy-settings" | "journey";

export type CloudinaryVideoUpload = {
  url: string;
  publicId: string;
};

const MAX_VIDEO_BYTES = 40 * 1024 * 1024;

async function requestVideoDeletion(publicId: string, context: CloudinaryVideoUploadContext) {
  try {
    await fetch("/api/admin/video-upload/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ publicId, context }),
      keepalive: true,
    });
  } catch {
    // Saved-record cleanup also runs on the server after a reference is removed.
  }
}

export async function removeCloudinaryVideo(
  video: CloudinaryVideoUpload | null | undefined,
  context: CloudinaryVideoUploadContext
) {
  if (video?.publicId) await requestVideoDeletion(video.publicId, context);
}

export async function uploadCloudinaryVideo(
  file: File,
  context: CloudinaryVideoUploadContext
): Promise<CloudinaryVideoUpload> {
  if (file.size > MAX_VIDEO_BYTES) throw new Error("Choose an MP4 video that is 40 MB or smaller.");
  if (file.type !== "video/mp4") throw new Error("Only MP4 video files are supported.");
  const header = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  if (header.length < 8 || String.fromCharCode(...header.slice(4, 8)) !== "ftyp") {
    throw new Error("The selected file is not a valid MP4 video.");
  }

  const signatureResponse = await fetch("/api/admin/video-upload/signature", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ context }),
    cache: "no-store",
  });
  const signatureData = await signatureResponse.json().catch(() => ({}));
  if (!signatureResponse.ok) throw new Error(signatureData.error || "Could not prepare the video upload.");

  const formData = new FormData();
  formData.append("file", file);
  formData.append("api_key", signatureData.apiKey);
  formData.append("timestamp", String(signatureData.timestamp));
  formData.append("signature", signatureData.signature);
  formData.append("public_id", signatureData.publicId);
  formData.append("allowed_formats", signatureData.allowedFormats);
  formData.append("eager", signatureData.eager);
  formData.append("overwrite", "false");

  let uploaded: Record<string, unknown> | null = null;
  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${encodeURIComponent(signatureData.cloudName)}/video/upload`,
      { method: "POST", body: formData }
    );
    uploaded = await response.json().catch(() => null);
    if (!response.ok || !uploaded) {
      const error = uploaded?.error as { message?: string } | undefined;
      throw new Error(error?.message || "Cloudinary could not upload this video.");
    }

    const completionResponse = await fetch("/api/admin/video-upload/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        context,
        public_id: uploaded.public_id,
        version: uploaded.version,
        signature: uploaded.signature,
        bytes: uploaded.bytes,
        format: uploaded.format,
        eager: uploaded.eager,
      }),
      cache: "no-store",
    });
    const completion = await completionResponse.json().catch(() => ({}));
    if (!completionResponse.ok) throw new Error(completion.error || "Cloudinary could not verify the uploaded video.");
    return { url: completion.url, publicId: completion.publicId };
  } catch (error) {
    await requestVideoDeletion(signatureData.publicId, context);
    throw error;
  }
}
