import { v2 as cloudinary } from "cloudinary";
import { promises as fs } from "fs";
import path from "path";

/**
 * Document uploads for Opportunity Applications (the public "Open
 * Opportunities" form on /join-us).
 *
 * This is deliberately a standalone module rather than an extension of
 * `lib/cloudinary.ts`: that helper is used by the Academy media/video upload
 * path and writes to the `nexus-uploads` / `nexus-videos` Cloudinary folders.
 * Nothing in that file is modified or reused here, so Academy media can never
 * be affected by this feature. Everything written by this module goes to the
 * dedicated `nexus-opportunity-applications` folder.
 *
 * Applicant CVs are private documents. The previous local fallback wrote them to
 * `public/uploads/opportunity-applications`, which Next.js serves as static files:
 * anyone who guessed or received a URL could read every applicant's uploaded
 * document, and the directory was not gitignored. Storage now lives outside
 * `public/`, and Cloudinary is configured for authenticated (non-public)
 * delivery.
 */

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const OPPORTUNITY_DOCS_FOLDER = "nexus-opportunity-applications";

/**
 * Outside `public/` so it is never served statically. Served instead by the
 * permission-checked route at `app/api/admin/opportunity-applications/[id]/documents`.
 */
const LOCAL_DOCS_DIR = path.join(
  process.cwd(),
  "storage",
  "opportunity-applications"
);

export const DOC_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
];

export const MAX_DOC_SIZE = 10 * 1024 * 1024; // 10MB

/** Magic-byte prefixes. The declared MIME type is attacker-controlled, so it is
 * checked against the file's actual signature rather than trusted. */
const MAGIC_BYTES: Array<{ mime: string; bytes: number[] }> = [
  { mime: "application/pdf", bytes: [0x25, 0x50, 0x44, 0x46] }, // %PDF
  { mime: "image/jpeg", bytes: [0xff, 0xd8, 0xff] },
  { mime: "image/png", bytes: [0x89, 0x50, 0x4e, 0x47] },
];

function hasImageSignature(bytes: Uint8Array): boolean {
  // WebP is "RIFF" .... "WEBP".
  if (bytes.length < 12) return false;
  const riff = String.fromCharCode(...bytes.slice(0, 4)) === "RIFF";
  const webp = String.fromCharCode(...bytes.slice(8, 12)) === "WEBP";
  return riff && webp;
}

export function isDocsCloudinaryConfigured(): boolean {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET &&
      !String(process.env.CLOUDINARY_API_SECRET).includes("your_")
  );
}

export interface DocUploadResult {
  url: string;
  fileName: string;
  storage: "cloudinary" | "local";
  /** Cloudinary public_id, or the local filename. Used for cleanup. */
  publicId: string;
}

/**
 * Validate type and size by extension-independent means: declared MIME must be
 * allow-listed *and* the bytes must match that type's signature.
 */
async function validateDoc(file: File) {
  if (!DOC_TYPES.includes(file.type)) {
    throw new Error(
      `Invalid file type "${file.type || "unknown"}". Allowed: ${DOC_TYPES.join(", ")}`
    );
  }

  if (file.size > MAX_DOC_SIZE) {
    throw new Error(
      `File too large (${Math.round(file.size / 1024 / 1024)}MB). Max: ${
        MAX_DOC_SIZE / 1024 / 1024
      }MB`
    );
  }

  const head = new Uint8Array(await file.slice(0, 12).arrayBuffer());

  const matches = MAGIC_BYTES.some(
    (sig) =>
      sig.bytes.length <= head.length &&
      sig.bytes.every((byte, i) => head[i] === byte)
  );
  const matchesDeclared =
    file.type === "image/webp" ? hasImageSignature(head) : matches;

  if (!matchesDeclared) {
    throw new Error(
      `File contents do not match the declared type "${file.type}".`
    );
  }
}

/**
 * Cloudinary must be told the resource type explicitly. With "auto" a PDF can
 * be stored as an image-type asset, which then yields an `/image/upload/...pdf`
 * delivery URL that resolves to 401 — non-image documents are served as raw.
 */
function resourceTypeFor(mimeType: string): "image" | "raw" {
  return mimeType.startsWith("image/") ? "image" : "raw";
}

/**
 * Uploads one certificate / proof-of-work document. Uses Cloudinary when
 * configured, otherwise falls back to a private local folder outside `public/`
 * so the feature still works without cloud credentials — without ever exposing
 * the file over HTTP.
 */
export async function uploadOpportunityDoc(file: File): Promise<DocUploadResult> {
  await validateDoc(file);

  const safeName = file.name
    .replace(/[^a-zA-Z0-9.\-]/g, "-")
    .replace(/\s+/g, "-");
  const fileName = `${Date.now()}-${safeName}`;

  if (isDocsCloudinaryConfigured()) {
    const bytes = Buffer.from(await file.arrayBuffer());
    const base64 = `data:${file.type};base64,${bytes.toString("base64")}`;

    const result = await cloudinary.uploader.upload(base64, {
      folder: OPPORTUNITY_DOCS_FOLDER,
      public_id: fileName.replace(/\.[^.]+$/, ""),
      resource_type: resourceTypeFor(file.type),
      // Authenticated assets are not readable from a bare delivery URL; they
      // require a signed or authorised request.
      type: "authenticated",
      tags: ["nexus-join-us", "opportunity-application"],
      overwrite: false,
    });

    return {
      url: result.secure_url,
      fileName,
      storage: "cloudinary",
      publicId: result.public_id,
    };
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error("Applicant document uploads require Cloudinary to be configured in production.");
  }

  console.warn(
    "[opportunity-docs] Cloudinary not configured — falling back to private local disk."
  );
  await fs.mkdir(LOCAL_DOCS_DIR, { recursive: true });
  await fs.writeFile(
    path.join(LOCAL_DOCS_DIR, fileName),
    Buffer.from(await file.arrayBuffer())
  );

  return {
    // No HTTP route serves this; the admin detail view resolves it through a
    // permission-checked endpoint.
    url: `private://opportunity-applications/${fileName}`,
    fileName,
    storage: "local",
    publicId: fileName,
  };
}

/**
 * Best-effort removal of a previously uploaded document. Accepts either the
 * upload result or the stored URL. Never throws — cleanup must not mask the
 * caller's own error handling.
 */
export async function deleteOpportunityDoc(
  doc: { url?: string; publicId?: string; storage?: string }
): Promise<boolean> {
  try {
    if (doc.storage === "cloudinary" || doc.url?.includes("res.cloudinary.com")) {
      const publicId = doc.publicId || publicIdFromUrl(doc.url || "");
      if (!publicId) return false;
      // The delivery URL's resource-type segment must match how it was stored.
      const resourceType = doc.url?.includes("/raw/upload/") ? "raw" : "image";
      await cloudinary.uploader.destroy(publicId, {
        resource_type: resourceType,
        type: "authenticated",
      });
      return true;
    }
    if (
      doc.url?.startsWith("private://opportunity-applications/") ||
      doc.url?.startsWith("/uploads/opportunity-applications/")
    ) {
      // basename() so a stored value can never escape LOCAL_DOCS_DIR.
      const name = path.basename(
        (doc.url.split("/").pop() || "").replace(/\?.*$/, "")
      );
      if (!name) return false;
      await fs.unlink(path.join(LOCAL_DOCS_DIR, name));
      return true;
    }
    return false;
  } catch (error) {
    console.error("[opportunity-docs] Failed to delete document:", error);
    return false;
  }
}

/** Reconstructs `folder/public_id` from a Cloudinary secure URL. */
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

export { LOCAL_DOCS_DIR };
