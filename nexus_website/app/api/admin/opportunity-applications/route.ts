import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { requirePermission } from "@/lib/permissions-server";
import { PERMISSIONS } from "@/lib/permissions-data";
import {
  applicationWhereFor,
  canSeeAnyListingType,
  listingTypeScopeFor,
} from "@/lib/intake-scope";
import { OpportunityApplicationStatus } from "@prisma/client";
import { resolveOwners } from "@/lib/intake-owners";
import { computeSla } from "@/lib/intake-sla";

const MAX_LIMIT = 100;
const DEFAULT_LIMIT = 50;

/**
 * Paginated list of applications against public Opportunity listings, filterable
 * by status, listing and a name/email/title search term.
 *
 * Scoped to the caller's listing-type scope in the query, and paginated with a
 * real `total` rather than a fixed `take`.
 */
export async function GET(request: Request) {
  const { user, authorized } = await requirePermission(PERMISSIONS.APPLICATIONS_READ);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!authorized) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  if (!canSeeAnyListingType(user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const params = new URL(request.url).searchParams;
  const status = params.get("status");
  const opportunityId = params.get("opportunityId");
  const search = (params.get("search") || "").trim();
  const owner = params.get("owner");
  const limit = clampLimit(params.get("limit"));
  const cursor = params.get("cursor");

  if (
    status &&
    status !== "all" &&
    !Object.values(OpportunityApplicationStatus).includes(
      status as OpportunityApplicationStatus
    )
  ) {
    return NextResponse.json({ error: "Invalid status filter" }, { status: 400 });
  }

  const filters = {
    ...(status && status !== "all"
      ? { status: status as OpportunityApplicationStatus }
      : {}),
    ...(opportunityId && opportunityId !== "all" ? { opportunityId } : {}),
    ...ownerFilterFor(owner, user.id),
    ...(search
      ? {
          OR: [
            { fullName: { contains: search, mode: "insensitive" as const } },
            { email: { contains: search, mode: "insensitive" as const } },
            {
              opportunity: {
                title: { contains: search, mode: "insensitive" as const },
              },
            },
          ],
        }
      : {}),
  };

  try {
    const where = applicationWhereFor(user.role, filters);

    const [applications, total] = await Promise.all([
      prisma.opportunityApplication.findMany({
        where,
        include: {
          opportunity: {
            select: { id: true, title: true, type: true, status: true },
          },
        },
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        take: limit + 1,
        ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      }),
      prisma.opportunityApplication.count({ where }),
    ]);

    const hasMore = applications.length > limit;
    const rows = hasMore ? applications.slice(0, limit) : applications;

    const now = new Date();
    const owners = await resolveOwners(rows.map((r) => r.ownerId));

    const enriched = rows.map((r) => ({
      ...r,
      owner: r.ownerId ? owners.get(r.ownerId) ?? null : null,
      sla: computeSla(
        { status: r.status, stageEnteredAt: r.stageEnteredAt },
        now
      ),
    }));

    return NextResponse.json({
      applications: enriched,
      total,
      hasMore,
      nextCursor: hasMore ? rows[rows.length - 1]?.id ?? null : null,
      overdue: enriched.filter((r) => r.sla.overdue).length,
      scope: listingTypeScopeFor(user.role),
    });
  } catch (error) {
    console.error("Failed to load opportunity applications:", error);
    return NextResponse.json(
      { error: "Failed to load applications" },
      { status: 500 }
    );
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