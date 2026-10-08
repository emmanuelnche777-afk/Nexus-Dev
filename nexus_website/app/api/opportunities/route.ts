import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { OpportunityStatus } from "@prisma/client";
import { isAcceptingApplications } from "@/lib/opportunity-listing";

// Public, cache-free read of the Admin-managed Opportunity listings so the public
// /join-us "Open Opportunities" section reflects Admin changes immediately.
const NO_STORE = { "Cache-Control": "no-store, max-age=0, must-revalidate" };

/**
 * Lists publicly visible opportunities.
 *
 * Only rows whose lifecycle is explicitly OPEN are eligible — DRAFT is the
 * schema default, so a listing is invisible until an admin publishes it. Before
 * this, any row left at the old default of "open" was served here, which meant an
 * internal sponsorship negotiation could surface on /join-us.
 *
 * Selection is an explicit field list. Internal deal data now lives on `Deal`,
 * which is not reachable from this query at all, so no internal field can leak.
 */
export async function GET() {
  try {
    const now = new Date();
    const settings = await prisma.siteSettings.findUnique({
      where: { id: "singleton" },
      select: { metadata: true },
    });
    const metadata = (settings?.metadata as Record<string, unknown> | null) ?? {};
    const enabled = metadata.opportunitiesSectionEnabled !== false;

    const opportunities = await prisma.opportunity.findMany({
      where: { lifecycle: OpportunityStatus.OPEN },
      select: {
        id: true,
        title: true,
        description: true,
        type: true,
        location: true,
        deadline: true,
        // Needed to evaluate the open rule. Not returned: the response below maps
        // to an explicit field list.
        lifecycle: true,
      },
      orderBy: [{ deadline: { sort: "asc", nulls: "last" } }, { createdAt: "desc" }],
    });

    // A null deadline means "no deadline set", so it stays visible. A deadline in
    // the past hides the listing without needing a scheduled job to flip it.
    const visible = opportunities.filter((o) => isAcceptingApplications(o, now));

    return NextResponse.json(
      {
        enabled,
        opportunities: enabled ? visible.map((o) => ({
          id: o.id,
          title: o.title,
          description: o.description,
          type: o.type,
          location: o.location,
          deadline: o.deadline ? o.deadline.toISOString() : null,
        })) : [],
      },
      { headers: NO_STORE }
    );
  } catch (err) {
    // Degrade to an empty list so the public page can render its empty state
    // instead of crashing.
    console.error("Public opportunities fetch failed:", err);
    return NextResponse.json({ enabled: true, opportunities: [] }, { headers: NO_STORE });
  }
}
