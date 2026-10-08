import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { requirePermission } from "@/lib/permissions-server";
import { PERMISSIONS } from "@/lib/permissions-data";
import { PathwayInquiryStatus } from "@prisma/client";
import { PATHWAY_IDS } from "@/lib/join-us-pathways";
import {
  canSeeAnyPathway,
  canSeePathway,
  pathwayScopeFor,
  pathwayWhereFor,
} from "@/lib/intake-scope";
import { resolveOwners } from "@/lib/intake-owners";
import { computeSla } from "@/lib/intake-sla";

const MAX_LIMIT = 100;
const DEFAULT_LIMIT = 50;

/**
 * Paginated list of public "Join Us" pathway inquiries, filterable by status,
 * pathway and a name/email search term.
 *
 * Results are narrowed to the caller's pathway scope in the query. `total` is the
 * count of rows matching the filters, so the UI can page instead of silently
 * truncating at a fixed cap.
 */
export async function GET(request: Request) {
  const { user, authorized } = await requirePermission(PERMISSIONS.PATHWAY_INQUIRIES_READ);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!authorized) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  if (!canSeeAnyPathway(user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const params = new URL(request.url).searchParams;
  const status = params.get("status");
  const pathway = params.get("pathway");
  const search = (params.get("search") || "").trim();
  const owner = params.get("owner");
  const limit = clampLimit(params.get("limit"));
  const cursor = params.get("cursor");

  if (
    status &&
    status !== "all" &&
    !Object.values(PathwayInquiryStatus).includes(status as PathwayInquiryStatus)
  ) {
    return NextResponse.json({ error: "Invalid status filter" }, { status: 400 });
  }

  if (pathway && pathway !== "all") {
    if (!(PATHWAY_IDS as readonly string[]).includes(pathway)) {
      return NextResponse.json({ error: "Invalid pathway filter" }, { status: 400 });
    }
    // Reject an out-of-scope filter explicitly rather than returning an empty
    // list that reads like "no results".
    if (!canSeePathway(user.role, pathway)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  const filters = {
    ...(status && status !== "all"
      ? { status: status as PathwayInquiryStatus }
      : {}),
    ...(pathway && pathway !== "all" ? { pathway } : {}),
    ...ownerFilterFor(owner, user.id),
    ...(search
      ? {
          OR: [
            { fullName: { contains: search, mode: "insensitive" as const } },
            { email: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  try {
    const where = pathwayWhereFor(user.role, filters);

    const [inquiries, total] = await Promise.all([
      prisma.pathwayInquiry.findMany({
        where,
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        take: limit + 1,
        ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      }),
      prisma.pathwayInquiry.count({ where }),
    ]);

    const hasMore = inquiries.length > limit;
    const rows = hasMore ? inquiries.slice(0, limit) : inquiries;

    const now = new Date();
    const owners = await resolveOwners(rows.map((r) => r.ownerId));

    // SLA is derived here rather than stored, so it can never go stale.
    const enriched = rows.map((r) => ({
      ...r,
      owner: r.ownerId ? owners.get(r.ownerId) ?? null : null,
      sla: computeSla({ status: r.status, stageEnteredAt: r.stageEnteredAt }, now),
    }));

    const overdue = enriched.filter((r) => r.sla.overdue).length;

    return NextResponse.json({
      inquiries: enriched,
      total,
      hasMore,
      nextCursor: hasMore ? rows[rows.length - 1]?.id ?? null : null,
      overdue,
      scope: pathwayScopeFor(user.role),
    });
  } catch (error) {
    console.error("Failed to load pathway inquiries:", error);
    return NextResponse.json({ error: "Failed to load inquiries" }, { status: 500 });
  }
}

/**
 * `owner=me` filters to the caller, `owner=unassigned` to the shared queue, any
 * other non-empty value is an explicit owner id.
 */
function ownerFilterFor(
  owner: string | null,
  callerId: string
): Record<string, unknown> {
  if (!owner || owner === "all") return {};
  if (owner === "me") return { ownerId: callerId };
  if (owner === "unassigned") return { ownerId: null };
  return { ownerId: owner };
}

function clampLimit(raw: string | null): number {
  const parsed = Number.parseInt(raw ?? "", 10);
  if (!Number.isFinite(parsed) || parsed <= 0) return DEFAULT_LIMIT;
  return Math.min(parsed, MAX_LIMIT);
}