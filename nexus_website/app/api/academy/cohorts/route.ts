import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const programSlug = searchParams.get("program");

    const [cohorts, settings] = await Promise.all([prisma.cohort.findMany({
      where: {
        ...(status ? { status } : {}),
        ...(programSlug ? { programSlug } : {}),
      },
      include: { _count: { select: { students: { where: { paymentStatus: "Paid" } } } } },
      orderBy: { startDate: "asc" },
    }), prisma.siteSettings.findUnique({ where: { id: "singleton" }, select: { metadata: true } })]);
    const metadata = (settings?.metadata as Record<string, unknown> | null) ?? {};

    return NextResponse.json({
      sectionEnabled: metadata.academyCohortsSectionEnabled !== false,
      cohorts: cohorts.map(({ _count, ...cohort }) => ({
        ...cohort,
        currentStudents: _count.students,
        acceptingApplications:
          cohort.status === "open" &&
          new Date(cohort.applicationDeadline).setUTCHours(23, 59, 59, 999) >= Date.now() &&
          _count.students < cohort.maxStudents,
      })),
    });
  } catch {
    return NextResponse.json({ error: "Failed to load Academy cohorts." }, { status: 500 });
  }
}
