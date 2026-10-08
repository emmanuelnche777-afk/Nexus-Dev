import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/permissions-server";
import prisma from "@/lib/db";
import { publishInstagramPhoto } from "@/lib/instagram-publisher";

export async function POST(request: Request) {
  const { user, authorized } = await requirePermission("content:social-media:*");
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!authorized) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  let postId = "";
  try {
    const body = await request.json() as { postId?: string };
    postId = typeof body.postId === "string" ? body.postId : "";
    if (!postId) return NextResponse.json({ error: "Post ID is required." }, { status: 400 });
    const post = await prisma.socialPost.findUnique({ where: { id: postId } });
    if (!post) return NextResponse.json({ error: "Post not found." }, { status: 404 });
    if (post.platform !== "instagram") return NextResponse.json({ error: "This publisher only supports Instagram posts." }, { status: 400 });
    if (post.status !== "approved") return NextResponse.json({ error: "Only approved posts can be published." }, { status: 400 });

    const claimed = await prisma.socialPost.updateMany({ where: { id: postId, status: "approved" }, data: { status: "publishing" } });
    if (!claimed.count) return NextResponse.json({ error: "This post is already being handled or is no longer approved." }, { status: 409 });

    try {
      await publishInstagramPhoto(post.mediaUrl || "", post.content);
      const updated = await prisma.socialPost.update({ where: { id: postId }, data: { status: "published", publishedAt: new Date() } });
      return NextResponse.json({ success: true, post: updated });
    } catch (error) {
      await prisma.socialPost.update({ where: { id: postId }, data: { status: "failed" } });
      const message = error instanceof Error ? error.message : "Instagram publishing failed.";
      return NextResponse.json({ error: message }, { status: 502 });
    }
  } catch (error) {
    console.error("Instagram publish request failed:", error instanceof Error ? error.message : "Unknown error", postId);
    return NextResponse.json({ error: "Could not publish this Instagram post." }, { status: 500 });
  }
}
