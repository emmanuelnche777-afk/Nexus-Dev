import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/permissions-server";
import { PERMISSIONS } from "@/lib/permissions-data";

import prisma from "@/lib/db";

export async function GET(request: Request) {
  const { user, authorized } = await requirePermission(PERMISSIONS.PARTNERSHIP_INQUIRIES_READ);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!authorized) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const status = new URL(request.url).searchParams.get("status");
  const statusFilters: Record<string, { in: string[] } | { notIn: string[] } | string> = {
    active: { notIn: ["approved", "rejected", "not-interested"] },
    approved: "approved",
    rejected: { in: ["rejected", "not-interested"] },
  };
  if (status && status !== "all" && !statusFilters[status]) {
    return NextResponse.json({ error: "Invalid status filter" }, { status: 400 });
  }

  const where = status === "all" ? undefined : { status: statusFilters[status || "active"]! };
  const requests = await prisma.partnerInquiry.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });

  // Map schema field names to frontend expected field names
  const mappedRequests = requests.map((req) => ({
    id: req.id,
    organizationName: req.organization,
    contactName: req.name,
    contactEmail: req.email,
    contactPhone: req.phone,
    partnershipType: req.type,
    status: normalizePartnershipStatus(req.status),
    proposedValue: req.proposedValue,
    description: req.message,
    website: req.website,
    interest: req.interest,
    createdAt: req.createdAt.toISOString(),
    reviewedAt: req.reviewedAt?.toISOString() ?? null,
    adminNotes: req.adminNotes,
  }));

  return NextResponse.json({ requests: mappedRequests });
}

function normalizePartnershipStatus(status: string): string {
  switch (status) {
    case "pending":
      return "new";
    case "reviewing":
    case "interested":
      return "under-review";
    case "not-interested":
      return "rejected";
    case "new":
    case "contacted":
    case "approved":
    case "rejected":
      return status;
    default:
      // Older unexpected values remain active in the queue and can be reviewed
      // using the current status options.
      return "new";
  }
}
