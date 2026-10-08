import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/permissions-server";
import prisma from "@/lib/db";

const LINK_TYPES = new Set(["website", "app_store", "google_play", "custom"]);
const STATUSES = new Set(["draft", "published", "archived"]);

function validHttpUrl(value: unknown) {
  if (typeof value !== "string") return false;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

function validImageUrl(value: unknown) {
  if (typeof value !== "string") return false;
  if (value.startsWith("/") && !value.startsWith("//")) return true;
  return validHttpUrl(value);
}

function validateProject(data: Record<string, unknown>) {
  const features = Array.isArray(data.features)
    ? data.features.map((item) => String(item).trim()).filter(Boolean)
    : [];
  const featuresFr = Array.isArray(data.featuresFr)
    ? data.featuresFr.map((item) => String(item).trim()).filter(Boolean)
    : [];
  if (!String(data.title ?? "").trim() || !String(data.category ?? "").trim() ||
      !String(data.description ?? "").trim() || !validImageUrl(data.imageUrl) ||
      (!validHttpUrl(data.linkUrl) && !(data.status !== "published" && !String(data.linkUrl ?? "").trim())) || !LINK_TYPES.has(String(data.linkType)) ||
      !STATUSES.has(String(data.status)) || features.length > 4 || featuresFr.length > 4) {
    return { error: "Enter a title, category, description, image, valid destination link and link type. Use up to four highlights." };
  }
  if (data.status === "published" && !String(data.linkLabel ?? "").trim()) {
    return { error: "Add a button label before publishing this project." };
  }
  return {
    values: {
      title: String(data.title).trim(),
      titleFr: String(data.titleFr ?? "").trim() || null,
      category: String(data.category).trim(),
      categoryFr: String(data.categoryFr ?? "").trim() || null,
      description: String(data.description).trim(),
      descriptionFr: String(data.descriptionFr ?? "").trim() || null,
      features,
      featuresFr,
      imageUrl: String(data.imageUrl).trim(),
      linkUrl: String(data.linkUrl).trim(),
      linkType: String(data.linkType),
      linkLabel: String(data.linkLabel ?? "").trim() || null,
      linkLabelFr: String(data.linkLabelFr ?? "").trim() || null,
      status: String(data.status),
      sortOrder: Number.isFinite(Number(data.sortOrder)) ? Math.trunc(Number(data.sortOrder)) : 0,
    },
  };
}

export async function GET() {
  const { user, authorized } = await requirePermission("techhub:*");
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!authorized) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const [projects, settings] = await Promise.all([
      prisma.techHubFeaturedWork.findMany({ orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] }),
      prisma.siteSettings.findUnique({ where: { id: "singleton" }, select: { metadata: true } }),
    ]);
    const metadata = (settings?.metadata as Record<string, unknown> | null) ?? {};
    return NextResponse.json({
      projects,
      enabled: typeof metadata.featuredWorkEnabled === "boolean" ? metadata.featuredWorkEnabled : true,
    });
  } catch (error) {
    console.error("Failed to load admin featured work:", error);
    return NextResponse.json({ error: "Failed to load Featured Work" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const { user, authorized } = await requirePermission("techhub:*");
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!authorized) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const result = validateProject(await request.json());
    if ("error" in result) return NextResponse.json({ error: result.error }, { status: 400 });
    const project = await prisma.techHubFeaturedWork.create({ data: result.values });
    return NextResponse.json({ project }, { status: 201 });
  } catch (error) {
    console.error("Failed to create featured work:", error);
    return NextResponse.json({ error: "Failed to save Featured Work item" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const { user, authorized } = await requirePermission("techhub:*");
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!authorized) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const body = await request.json();
    if (typeof body.enabled !== "boolean") {
      return NextResponse.json({ error: "A boolean enabled value is required" }, { status: 400 });
    }
    const existing = await prisma.siteSettings.findUnique({ where: { id: "singleton" } });
    const metadata = (existing?.metadata as Record<string, unknown> | null) ?? {};
    await prisma.siteSettings.upsert({
      where: { id: "singleton" },
      create: { id: "singleton", metadata: { ...metadata, featuredWorkEnabled: body.enabled } },
      update: { metadata: { ...metadata, featuredWorkEnabled: body.enabled } },
    });
    return NextResponse.json({ enabled: body.enabled });
  } catch (error) {
    console.error("Failed to update Featured Work visibility:", error);
    return NextResponse.json({ error: "Failed to update Featured Work visibility" }, { status: 500 });
  }
}
