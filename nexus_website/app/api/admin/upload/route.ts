import { NextResponse } from "next/server";
import { getSession } from "@/lib/admin-auth";
import { hasPermission } from "@/lib/permissions";

import { uploadFile } from "@/lib/cloudinary";

export async function POST(request: Request) {
  try {
    const user = await getSession();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const canUploadAnyType = ["*", "content:journey:*", "techhub:*"]
      .some((permission) => hasPermission(user.role, permission));
    if (!canUploadAnyType) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const maxRequestSize = 105 * 1024 * 1024;
    const contentLength = Number(request.headers.get("content-length") || 0);
    if (Number.isFinite(contentLength) && contentLength > maxRequestSize) {
      return NextResponse.json({ error: "Upload request is too large." }, { status: 413 });
    }

    const reader = request.body?.getReader();
    if (!reader) return NextResponse.json({ error: "Upload body is required." }, { status: 400 });
    const chunks: BlobPart[] = [];
    let receivedBytes = 0;
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        receivedBytes += value.byteLength;
        if (receivedBytes > maxRequestSize) {
          await reader.cancel();
          return NextResponse.json({ error: "Upload request is too large." }, { status: 413 });
        }
        const chunk = new Uint8Array(value.byteLength);
        chunk.set(value);
        chunks.push(chunk);
      }
    } finally {
      reader.releaseLock();
    }

    const headers = new Headers(request.headers);
    headers.delete("content-length");
    const boundedRequest = new Request(request.url, {
      method: "POST",
      headers,
      body: new Blob(chunks),
    });
    const formData = await boundedRequest.formData();
    const file = formData.get("file") as File | null;
    const type = formData.get("type") as string;
    const isJourneyMedia = formData.get("context") === "journey";
    const isTechHubImage = type === "techhub-image";
    const permission = isTechHubImage
      ? "techhub:*"
      : isJourneyMedia
        ? "content:journey:*"
        : "*";
    if (!hasPermission(user.role, permission)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (type !== "image" && type !== "video" && !isTechHubImage) {
      return NextResponse.json(
        { error: "Invalid upload type. Must be 'image' or 'video'." },
        { status: 400 }
      );
    }

    if (type === "video") {
      return NextResponse.json(
        { error: "Video files must use the signed direct-to-Cloudinary upload flow." },
        { status: 400 }
      );
    }

    const result = await uploadFile(file, "image");
    return NextResponse.json({ url: result.url, fileName: result.fileName });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to upload file";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
