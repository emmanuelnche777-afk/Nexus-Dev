import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/permissions-server";

import prisma from "@/lib/db";

export async function GET() {
  const { user, authorized } = await requirePermission("content:social-media:*");
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!authorized) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const posts = await prisma.socialPost.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      journeyEntry: { select: { id: true, title: true, projectName: true, phaseOrder: true } },
    },
  });
  return NextResponse.json({ posts });
}

export async function POST(request: Request) {
  const { user, authorized } = await requirePermission("content:social-media:*");
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!authorized) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const form = await request.json();
    const newPost = await prisma.socialPost.create({
      data: {
        ...form,
        status: form.status || "draft",
        tags: form.tags || [],
        createdBy: "admin",
      },
    });
    return NextResponse.json(newPost, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create social post" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const { user, authorized } = await requirePermission("content:social-media:*");
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!authorized) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const { postId, status, scheduledAt } = await request.json();
    const existing = await prisma.socialPost.findUnique({ where: { id: postId } });
    if (!existing) return NextResponse.json({ error: "Post not found." }, { status: 404 });

    const transitions: Record<string, string[]> = {
      draft: ["pending_approval"],
      pending_approval: ["approved", "draft"],
      approved: ["scheduled", "draft"],
      scheduled: ["approved", "draft"],
      failed: ["draft"],
      published: [],
    };
    if (!(transitions[existing.status] || []).includes(status)) {
      return NextResponse.json({ error: "That approval or scheduling step is not allowed." }, { status: 400 });
    }

    const updateData: Record<string, unknown> = { status };
    if (status === "approved") {
      updateData.approvedAt = new Date();
      updateData.approvedBy = user.id;
    } else if (status === "scheduled") {
      const date = new Date(scheduledAt);
      if (!scheduledAt || Number.isNaN(date.getTime()) || date.getTime() <= Date.now()) {
        return NextResponse.json({ error: "Choose a future date and time to schedule this post." }, { status: 400 });
      }
      updateData.scheduledAt = date;
    } else if (status === "draft") {
      updateData.approvedAt = null;
      updateData.approvedBy = null;
      updateData.scheduledAt = null;
    }

    const updated = await prisma.socialPost.update({ where: { id: postId }, data: updateData });
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Failed to update social post" }, { status: 500 });
  }
}
