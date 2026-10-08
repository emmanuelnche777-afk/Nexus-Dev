import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/permissions-server";

import prisma from "@/lib/db";

export async function GET() {
  const { user, authorized } = await requirePermission("academy:cohorts:*");
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!authorized) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const [cohorts, settings] = await Promise.all([
      prisma.cohort.findMany({
        include: { _count: { select: { students: { where: { paymentStatus: "Paid" } } } } },
      }),
      prisma.siteSettings.findUnique({ where: { id: "singleton" }, select: { metadata: true } }),
    ]);
    const metadata = (settings?.metadata as Record<string, unknown> | null) ?? {};
    return NextResponse.json({
      cohorts: cohorts.map(({ _count, ...cohort }) => ({ ...cohort, currentStudents: _count.students })),
      sectionEnabled: metadata.academyCohortsSectionEnabled !== false,
    });
  } catch (error) {
    console.error("Failed to load academy cohorts:", error);
    return NextResponse.json({ error: "Failed to load cohorts" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const { user, authorized } = await requirePermission("academy:cohorts:*");
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!authorized) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const body = await request.json();
    if (typeof body.sectionEnabled !== "boolean") {
      return NextResponse.json({ error: "A boolean sectionEnabled value is required" }, { status: 400 });
    }
    const existing = await prisma.siteSettings.findUnique({ where: { id: "singleton" } });
    const metadata = (existing?.metadata as Record<string, unknown> | null) ?? {};
    await prisma.siteSettings.upsert({
      where: { id: "singleton" },
      create: { id: "singleton", metadata: { ...metadata, academyCohortsSectionEnabled: body.sectionEnabled } },
      update: { metadata: { ...metadata, academyCohortsSectionEnabled: body.sectionEnabled } },
    });
    return NextResponse.json({ sectionEnabled: body.sectionEnabled });
  } catch (error) {
    console.error("Failed to update Academy cohorts section visibility:", error);
    return NextResponse.json({ error: "Failed to update Upcoming Cohorts visibility" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const { user, authorized } = await requirePermission("academy:cohorts:*");
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!authorized) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const body = await request.json();
    const id = body.id || `cohort-${Date.now()}`;
    const cohortData = { ...body };
    delete cohortData.currentStudents;
    const newCohort = await prisma.cohort.create({ data: { ...cohortData, id, currentStudents: 0 } });
    return NextResponse.json(newCohort, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create cohort" }, { status: 500 });
  }
}
