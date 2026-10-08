import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/permissions-server";
import { createCloudinaryVideoUploadSignature, MAX_CLOUDINARY_VIDEO_BYTES } from "@/lib/cloudinary-video";

const CONTEXT_PERMISSION = {
  "academy-program": "academy:programs:*",
  "academy-settings": "*",
  journey: "content:journey:*",
} as const;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const context = body?.context as keyof typeof CONTEXT_PERMISSION;
    const permission = CONTEXT_PERMISSION[context];
    if (!permission) return NextResponse.json({ error: "Invalid upload context." }, { status: 400 });

    const { user, authorized } = await requirePermission(permission);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!authorized) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const upload = createCloudinaryVideoUploadSignature();
    return NextResponse.json({ ...upload, context, maxBytes: MAX_CLOUDINARY_VIDEO_BYTES });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not prepare Cloudinary upload.";
    return NextResponse.json({ error: message }, { status: 503 });
  }
}
