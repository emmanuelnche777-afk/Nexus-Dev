import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { requirePermission } from "@/lib/permissions-server";
import { PERMISSIONS } from "@/lib/permissions-data";
import {
  applicationWhereFor,
  canSeeAnyListingType,
} from "@/lib/intake-scope";

/**
 * Distinct listings that have at least one application, for the filter control
 * on the applications page.
 *
 * This page previously called `/api/admin/opportunities`, which requires the
 * listings-write permission. Intake roles such as SUPPORT_STAFF and
 * MENTORSHIP_COORDINATOR do not hold it, so their filter dropdown was empty even
 * though they could see the applications. This endpoint is gated on the
 * applications read permission the page already requires, and scoped the same way
 * as the list.
 */
export async function GET() {
  const { user, authorized } = await requirePermission(PERMISSIONS.APPLICATIONS_READ);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!authorized) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  if (!canSeeAnyListingType(user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const rows = await prisma.opportunityApplication.findMany({
      where: applicationWhereFor(user.role),
      distinct: ["opportunityId"],
      select: {
        opportunity: { select: { id: true, title: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 200,
    });

    const seen = new Set<string>();
    const opportunities: Array<{ id: string; title: string }> = [];

    for (const row of rows) {
      if (seen.has(row.opportunity.id)) continue;
      seen.add(row.opportunity.id);
      opportunities.push(row.opportunity);
    }

    return NextResponse.json({ opportunities });
  } catch (error) {
    console.error("Failed to load listing options:", error);
    return NextResponse.json({ opportunities: [] });
  }
}