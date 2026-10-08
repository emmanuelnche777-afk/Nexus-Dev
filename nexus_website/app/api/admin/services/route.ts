import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/permissions-server";

import prisma from "@/lib/db";

export async function GET() {
  const { user, authorized } = await requirePermission("techhub:services:*");
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!authorized) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const services = await prisma.service.findMany({
      orderBy: { sortOrder: "asc" },
    });
    return NextResponse.json({ services });
  } catch {
    return NextResponse.json({ services: [] });
  }
}

export async function POST(request: Request) {
  const { user, authorized } = await requirePermission("techhub:services:*");
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!authorized) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const data = await request.json();

    if (!data.title || !data.slug) {
      return NextResponse.json(
        { error: "Title and slug are required" },
        { status: 400 }
      );
    }

    const slug = String(data.slug)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    const existing = await prisma.service.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json(
        { error: "A service with this slug already exists" },
        { status: 409 }
      );
    }

    const service = await prisma.service.create({
      data: {
        slug,
        title: data.title,
        tagline: data.tagline,
        description: data.description || "",
        imageUrl: data.imageUrl,
        iconKey: data.iconKey || "Code2",
        features: data.features || [],
        deliverables: data.deliverables || [],
        status: data.status || "active",
        sortOrder: data.sortOrder ?? 0,
      },
    });

    return NextResponse.json(service, { status: 201 });
  } catch (error) {
    console.error("Create service failed:", error);
    return NextResponse.json(
      { error: "Failed to create service" },
      { status: 500 }
    );
  }
}