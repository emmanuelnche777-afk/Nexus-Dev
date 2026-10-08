import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/permissions-server";
import { verifyCloudinaryVideoUpload } from "@/lib/cloudinary-video";

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

    const video = await verifyCloudinaryVideoUpload({
      publicId: body.public_id,
      version: body.version,
      signature: body.signature,
      bytes: body.bytes,
      format: body.format,
      eagerUrl: body.eager?.[0]?.secure_url,
    });
    return NextResponse.json(video);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Cloudinary upload could not be verified.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
