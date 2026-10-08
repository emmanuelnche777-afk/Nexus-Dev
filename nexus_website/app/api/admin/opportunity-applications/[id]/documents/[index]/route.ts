import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { v2 as cloudinary } from "cloudinary";
import prisma from "@/lib/db";
import { requirePermission } from "@/lib/permissions-server";
import { PERMISSIONS } from "@/lib/permissions-data";
import { canSeeListingType } from "@/lib/intake-scope";
import { logAdminAction } from "@/lib/audit";
import {
  LOCAL_DOCS_DIR,
  OPPORTUNITY_DOCS_FOLDER,
  isDocsCloudinaryConfigured,
} from "@/lib/opportunity-docs-upload";

/**
 * Serves one applicant-uploaded document.
 *
 * Applicant CVs are private. Documents are stored outside `public/` (local
 * fallback) or as Cloudinary `authenticated` assets, neither of which is
 * readable from a bare URL. This endpoint is the only way to read one, and it
 * requires the applications read permission *and* the caller's listing-type
 * scope, and it writes an audit row naming the admin who opened the document.
 */

const CONTENT_TYPES: Record<string, string> = {
  ".pdf": "application/pdf",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
};

export async function GET(
  _request: NextRequest,
  {
    params,
  }: { params: Promise<{ id: string; index: string }> }
) {
  const { user, authorized } = await requirePermission(PERMISSIONS.APPLICATIONS_READ);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!authorized) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id, index } = await params;

  const application = await prisma.opportunityApplication.findUnique({
    where: { id },
    select: {
      id: true,
      documentUrls: true,
      opportunity: { select: { title: true, type: true } },
    },
  });

  if (!application) {
    return NextResponse.json({ error: "Application not found" }, { status: 404 });
  }

  if (!canSeeListingType(user.role, application.opportunity.type)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const position = Number.parseInt(index, 10);
  if (!Number.isInteger(position) || position < 0) {
    return NextResponse.json({ error: "Invalid document index" }, { status: 400 });
  }

  const url = application.documentUrls[position];
  if (!url) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }

  // Reading an applicant's document is sensitive, so it is recorded who did it
  // and when, separately from the record's own change history.
  await logAdminAction({
    adminEmail: user.email,
    action: "view_document",
    resourceType: "opportunity_application",
    resourceId: id,
    newValue: { documentIndex: position },
  });

  if (url.startsWith("private://opportunity-applications/")) {
    const name = path.basename(url.split("/").pop() || "");
    if (!name) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    try {
      const filePath = path.join(LOCAL_DOCS_DIR, name);
      const data = await fs.readFile(filePath);

      return new NextResponse(new Uint8Array(data), {
        headers: {
          "Content-Type": CONTENT_TYPES[path.extname(name).toLowerCase()] || "application/octet-stream",
          "Content-Disposition": `inline; filename="${name}"`,
          "Cache-Control": "private, no-store, max-age=0, must-revalidate",
          "X-Content-Type-Options": "nosniff",
        },
      });
    } catch {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }
  }

  if (url.includes("res.cloudinary.com")) {
    if (!isDocsCloudinaryConfigured()) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    const publicId = publicIdFromUrl(url);
    if (!publicId) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    const resourceType = url.includes("/raw/") ? "raw" : "image";
    const signedUrl = cloudinary.url(publicId, {
      resource_type: resourceType,
      type: "authenticated",
      sign_url: true,
      secure: true,
    });

    return NextResponse.redirect(signedUrl, { status: 302 });
  }

  return NextResponse.json({ error: "Document not found" }, { status: 404 });
}

function publicIdFromUrl(url: string): string {
  try {
    const parsed = new URL(url);
    const marker = `/${OPPORTUNITY_DOCS_FOLDER}/`;
    const at = parsed.pathname.indexOf(marker);
    if (at === -1) return "";
    return `${OPPORTUNITY_DOCS_FOLDER}/${parsed.pathname
      .slice(at + marker.length)
      .replace(/\.[^.]+$/, "")}`;
  } catch {
    return "";
  }
}