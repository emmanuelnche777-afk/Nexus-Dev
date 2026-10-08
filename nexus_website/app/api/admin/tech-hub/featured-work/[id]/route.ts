import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/permissions-server";
import prisma from "@/lib/db";

const LINK_TYPES = new Set(["website", "app_store", "google_play", "custom"]);
const STATUSES = new Set(["draft", "published", "archived"]);

function validateProject(data: Record<string, unknown>) {
  const features = Array.isArray(data.features)
    ? data.features.map((item) => String(item).trim()).filter(Boolean)
    : [];
  const featuresFr = Array.isArray(data.featuresFr)
    ? data.featuresFr.map((item) => String(item).trim()).filter(Boolean)
    : [];
  let validLink = false;
  try {
    const url = new URL(String(data.linkUrl ?? ""));
    validLink = url.protocol === "https:" || url.protocol === "http:";
  } catch { /* invalid link */ }
  const imageUrl = String(data.imageUrl ?? "");
  let validImage = imageUrl.startsWith("/") && !imageUrl.startsWith("//");
  if (!validImage) {
    try {
      const image = new URL(imageUrl);
      validImage = image.protocol === "https:" || image.protocol === "http:";
    } catch { /* invalid image */ }
  }

  if (!String(data.title ?? "").trim() || !String(data.category ?? "").trim() ||
      !String(data.description ?? "").trim() || !validImage ||
      (!validLink && !(data.status !== "published" && !String(data.linkUrl ?? "").trim())) || !LINK_TYPES.has(String(data.linkType)) ||
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

export async function PATCH(request: Request, context: RouteContext<"/api/admin/tech-hub/featured-work/[id]">) {
  const { user, authorized } = await requirePermission("techhub:*");
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!authorized) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await context.params;

  try {
    const result = validateProject(await request.json());
    if ("error" in result) return NextResponse.json({ error: result.error }, { status: 400 });
    const project = await prisma.techHubFeaturedWork.update({ where: { id }, data: result.values });
    return NextResponse.json({ project });
  } catch (error) {
    console.error("Failed to update featured work:", error);
    return NextResponse.json({ error: "Failed to update Featured Work item" }, { status: 500 });
  }
}
