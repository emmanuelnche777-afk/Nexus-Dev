import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/permissions-server";

import prisma from "@/lib/db";

export async function GET() {
  const { user, authorized } = await requirePermission("content:*");
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!authorized) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    totalPrograms,
    activePrograms,
    totalStudents,
    activeStudents,
    newStudentsThisMonth,
    completedStudentsThisMonth,
    totalRegistrations,
    pendingRegistrations,
    totalPayments,
    pendingPayments,
    processedPayments,
    paidPayments,
    failedPayments,
    refundedPayments,
    paymentSums,
    totalOpportunities,
    openOpportunities,
    wonOpportunities,
    lostOpportunities,
    expiredOpportunities,
    programs,
  ] = await Promise.all([
    prisma.program.count(),
    prisma.program.count({ where: { status: "active" } }),
    prisma.student.count(),
    prisma.student.count({ where: { status: { not: "Suspended" } } }),
    prisma.student.count({ where: { createdAt: { gte: startOfMonth } } }),
    prisma.student.count({ where: { status: "Completed", updatedAt: { gte: startOfMonth } } }),
    prisma.registration.count(),
    prisma.registration.count({ where: { status: "new" } }),
    prisma.payment.count(),
    prisma.payment.count({ where: { status: "Pending" } }),
    prisma.payment.count({ where: { status: "Processed" } }),
    prisma.payment.count({ where: { status: "Paid" } }),
    prisma.payment.count({ where: { status: "Failed" } }),
    prisma.payment.count({ where: { status: "Refunded" } }),
    prisma.payment.aggregate({ _sum: { amount: true }, where: { status: { in: ["Paid", "Processed"] } } }),
    prisma.opportunity.count(),
    prisma.opportunity.count({ where: { status: "open" } }),
    prisma.opportunity.count({ where: { status: "won" } }),
    prisma.opportunity.count({ where: { status: "lost" } }),
    prisma.opportunity.count({ where: { status: "expired" } }),
    prisma.program.findMany({ select: { id: true, title: true, slug: true } }),
  ]);

  const programStats = await Promise.all(
    programs.map(async (p) => {
      const [enrolled, completed, dropped, revenue] = await Promise.all([
        prisma.student.count({ where: { programSlug: p.slug } }),
        prisma.student.count({ where: { programSlug: p.slug, status: "Completed" } }),
        prisma.student.count({ where: { programSlug: p.slug, status: "Suspended" } }),
        prisma.payment.aggregate({
          _sum: { amount: true },
          where: { programSlug: p.slug, status: { in: ["Paid", "Processed"] } },
        }),
      ]);
      return {
        programId: p.id,
        programName: p.title,
        enrolled,
        completed,
        dropped,
        revenue: revenue._sum.amount || 0,
        conversionRate: enrolled > 0 ? Math.round((completed / enrolled) * 100) : 0,
      };
    })
  );

  const metrics = {
    programs: programStats,
    totalPrograms,
    activePrograms,
    registrations: {
      total: totalRegistrations,
      pending: pendingRegistrations,
    },
    students: {
      totalStudents,
      activeStudents,
      newThisMonth: newStudentsThisMonth,
      completedThisMonth: completedStudentsThisMonth,
      suspensionRate: totalStudents > 0 ? Math.round(((totalStudents - activeStudents) / totalStudents) * 100) : 0,
    },
    opportunities: {
      totalOpportunities,
      open: openOpportunities,
      won: wonOpportunities,
      lost: lostOpportunities,
      expired: expiredOpportunities,
      totalValue: 0,
      totalExpectedValue: 0,
    },
    payments: {
      totalPayments,
      pending: pendingPayments,
      processed: processedPayments,
      paid: paidPayments,
      failed: failedPayments,
      refunded: refundedPayments,
      totalRevenue: paymentSums._sum.amount || 0,
    },
    lastUpdated: now.toISOString(),
  };

  return NextResponse.json({ metrics });
}
