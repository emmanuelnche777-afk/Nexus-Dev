import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/permissions-server";

import prisma from "@/lib/db";
import { containsObviousSensitiveKnowledge } from "@/lib/ai/security";

export async function GET() {
  const { user, authorized } = await requirePermission("content:ai-knowledge:*");
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!authorized) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const knowledge = await prisma.aiKnowledge.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ knowledge });
}

export async function POST(request: Request) {
  const { user, authorized } = await requirePermission("content:ai-knowledge:*");
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!authorized) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const entry = await request.json();

    const newEntry = await prisma.aiKnowledge.create({
      data: {
        title: entry.title ?? "Untitled",
        content: entry.content ?? "",
        category: entry.category ?? "general",
        approved: false,
        createdBy: "admin",
      },
    });

    return NextResponse.json(newEntry, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to add knowledge entry" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const { user, authorized } = await requirePermission("content:ai-knowledge:*");
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!authorized) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const { id, approved, ...updates } = await request.json();
    const existing = await prisma.aiKnowledge.findUnique({
      where: { id },
      select: { content: true, approved: true },
    });
    if (!existing) return NextResponse.json({ error: "Knowledge entry not found" }, { status: 404 });

    const nextContent = typeof updates.content === "string" ? updates.content : existing.content;
    const willBePublic = typeof approved === "boolean" ? approved : existing.approved;
    if (willBePublic && containsObviousSensitiveKnowledge(`${updates.title || ""}\n${nextContent}`)) {
      return NextResponse.json(
        { error: "This entry contains contact details, credentials, or client-specific fields. Remove them before approving it for the public assistant." },
        { status: 400 }
      );
    }

    const entry = await prisma.aiKnowledge.update({
      where: { id },
      data: {
        ...updates,
        approved,
      },
    });

    return NextResponse.json(entry);
  } catch {
    return NextResponse.json({ error: "Failed to update knowledge entry" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const { user, authorized } = await requirePermission("content:ai-knowledge:*");
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!authorized) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    await prisma.aiKnowledge.update({
      where: { id: id! },
      data: {
        approved: false,
        content: "(archived)",
      },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete knowledge entry" }, { status: 500 });
  }
}
