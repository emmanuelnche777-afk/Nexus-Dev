import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { requirePermission } from "@/lib/permissions-server";
import { PERMISSIONS } from "@/lib/permissions-data";
import { OpportunityStatus } from "@prisma/client";
import {
  lifecycleSideEffects,
  parseDeadlineInput,
  parseLifecycle,
} from "@/lib/opportunity-listing";

/**
 * Fields an admin may set on a listing. Anything not listed here is ignored —
 * the previous implementation spread the whole request body into
 * `prisma.opportunity.update`, which let a caller set any column on the row.
 */
const LISTING_FIELDS = [
  "title",
  "description",
  "type",
  "category",
  "location",
  "url",
] as const;

/** Fields an admin may set on the internal deal attached to a listing. */
const DEAL_FIELDS = [
  "value",
  "probability",
  "contactName",
  "contactEmail",
  "contactPhone",
  "notes",
  "nextSteps",
  "tags",
  "source",
] as const;

const UNAUTHORIZED = () => NextResponse.json({ error: "Unauthorized" }, { status: 401 });
const FORBIDDEN = () => NextResponse.json({ error: "Forbidden" }, { status: 403 });

const ADMIN_LISTING_SELECT = {
  id: true,
  title: true,
  description: true,
  type: true,
  category: true,
  location: true,
  url: true,
  deadline: true,
  lifecycle: true,
  publishedAt: true,
  closedAt: true,
  createdAt: true,
  updatedAt: true,
  _count: { select: { applications: true } },
  deal: {
    select: {
      id: true,
      value: true,
      probability: true,
      expectedValue: true,
      nextSteps: true,
      tags: true,
      contactName: true,
      contactEmail: true,
      contactPhone: true,
      notes: true,
      source: true,
      assignedToId: true,
    },
  },
} as const;

export async function GET() {
  const { user, authorized } = await requirePermission(PERMISSIONS.LISTINGS_WRITE);
  if (!user) return UNAUTHORIZED();
  if (!authorized) return FORBIDDEN();

  try {
    // Auto-close on read instead of on a schedule. There is no cron in this
    // project, so the previous `autoCloseDate` column was written and never acted
    // on. Closing here is idempotent and needs no scheduler.
    const expired = await prisma.opportunity.findMany({
      where: {
        lifecycle: OpportunityStatus.OPEN,
        deadline: { not: null, lte: new Date() },
      },
      select: { id: true },
    });

    if (expired.length > 0) {
      await prisma.opportunity.updateMany({
        where: { id: { in: expired.map((o) => o.id) } },
        data: { lifecycle: OpportunityStatus.CLOSED, closedAt: new Date() },
      });
    }

    const opportunities = await prisma.opportunity.findMany({
      select: ADMIN_LISTING_SELECT,
      orderBy: [{ createdAt: "desc" }],
    });

    const settings = await prisma.siteSettings.findUnique({
      where: { id: "singleton" },
      select: { metadata: true },
    });
    const metadata = (settings?.metadata as Record<string, unknown> | null) ?? {};

    return NextResponse.json({
      opportunities,
      sectionEnabled: metadata.opportunitiesSectionEnabled !== false,
    });
  } catch (error) {
    console.error("Failed to load opportunities:", error);
    return NextResponse.json({ opportunities: [], sectionEnabled: true });
  }
}

export async function PATCH(request: Request) {
  const { user, authorized } = await requirePermission(PERMISSIONS.LISTINGS_WRITE);
  if (!user) return UNAUTHORIZED();
  if (!authorized) return FORBIDDEN();

  try {
    const body = await request.json();
    if (typeof body.sectionEnabled !== "boolean") {
      return NextResponse.json({ error: "A boolean sectionEnabled value is required" }, { status: 400 });
    }

    const existing = await prisma.siteSettings.findUnique({ where: { id: "singleton" } });
    const metadata = (existing?.metadata as Record<string, unknown> | null) ?? {};
    await prisma.siteSettings.upsert({
      where: { id: "singleton" },
      create: { id: "singleton", metadata: { ...metadata, opportunitiesSectionEnabled: body.sectionEnabled } },
      update: { metadata: { ...metadata, opportunitiesSectionEnabled: body.sectionEnabled } },
    });

    return NextResponse.json({ sectionEnabled: body.sectionEnabled });
  } catch (error) {
    console.error("Failed to update Opportunities section visibility:", error);
    return NextResponse.json({ error: "Failed to update Opportunities section visibility" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const { user, authorized } = await requirePermission(PERMISSIONS.LISTINGS_WRITE);
  if (!user) return UNAUTHORIZED();
  if (!authorized) return FORBIDDEN();

  try {
    const body = await request.json();
    const now = new Date();

    const title = typeof body.title === "string" ? body.title.trim() : "";
    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    // New listings default to DRAFT unless an admin explicitly publishes, so an
    // internal record cannot become public by omission. Previously this hardcoded
    // status "open", which published every row on creation.
    const lifecycle = parseLifecycle(body.lifecycle ?? body.status) ?? OpportunityStatus.DRAFT;
    const deadline = parseDeadlineInput(body.deadline);

    const dealInput = pickDealFields(body);
    const hasDeal = Object.values(dealInput).some(
      (v) => v !== undefined && v !== null && !(Array.isArray(v) && v.length === 0)
    );

    const opportunity = await prisma.$transaction(async (tx) => {
      const listingFields = pickListingFields(body);

      const created = await tx.opportunity.create({
        data: {
          ...listingFields,
          title,
          // Required by the schema; previously defaulted server-side.
          description:
            typeof body.description === "string" ? body.description : "",
          type: typeof body.type === "string" && body.type ? body.type : "job",
          deadline,
          lifecycle,
          ...lifecycleSideEffects(lifecycle, null, now),
        },
      });

      if (hasDeal) {
        await tx.deal.create({
          data: {
            opportunityId: created.id,
            ...dealInput,
            expectedValue: computeExpectedValue(dealInput),
          } as never,
        });
      }

      return tx.opportunity.findUniqueOrThrow({
        where: { id: created.id },
        select: ADMIN_LISTING_SELECT,
      });
    });

    return NextResponse.json(opportunity, { status: 201 });
  } catch (error) {
    console.error("Create opportunity failed:", error);
    return NextResponse.json(
      { error: "Failed to create opportunity" },
      { status: 500 }
    );
  }
}

type DealInput = Partial<Record<(typeof DEAL_FIELDS)[number], unknown>>;

function pickListingFields(body: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const field of LISTING_FIELDS) {
    if (body[field] !== undefined) out[field] = body[field];
  }
  return out;
}

/** Only ever returns the DEAL_FIELDS keys present on the body. */
function pickDealFields(body: Record<string, unknown>): DealInput {
  const out: DealInput = {};
  for (const field of DEAL_FIELDS) {
    if (body[field] !== undefined) out[field] = body[field];
  }
  return out;
}

function computeExpectedValue(deal: DealInput): number | undefined {
  const value = deal.value;
  const probability = deal.probability;
  if (typeof value !== "number" || typeof probability !== "number") return undefined;
  return Math.round((value * probability) / 100);
}
