import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/permissions-server";

import prisma from "@/lib/db";

export async function GET() {
  const { user, authorized } = await requirePermission("session:self");
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!authorized || !["SUPER_ADMIN", "ACADEMY_MANAGER", "FINANCE", "CONTENT_EDITOR"].includes(user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  // Query only the data this role may see. Filtering the response after a
  // cross-domain query would still expose those totals to this route's process.
  if (user.role === "ACADEMY_MANAGER") {
    const [totalPrograms, activePrograms, totalStudents, activeStudents, newStudentsThisMonth, completedStudentsThisMonth, totalRegistrations, pendingRegistrations, programs] = await Promise.all([
      prisma.program.count(),
      prisma.program.count({ where: { status: "active" } }),
      prisma.student.count(),
      prisma.student.count({ where: { status: { not: "Suspended" } } }),
      prisma.student.count({ where: { createdAt: { gte: startOfMonth } } }),
      prisma.student.count({ where: { status: "Completed", updatedAt: { gte: startOfMonth } } }),
      prisma.registration.count(),
      prisma.registration.count({ where: { status: "new" } }),
      prisma.program.findMany({ select: { id: true, title: true, slug: true } }),
    ]);
    const programsWithStats = await Promise.all(programs.map(async (program) => {
      const [enrolled, completed, dropped] = await Promise.all([
        prisma.student.count({ where: { programSlug: program.slug } }),
        prisma.student.count({ where: { programSlug: program.slug, status: "Completed" } }),
        prisma.student.count({ where: { programSlug: program.slug, status: "Suspended" } }),
      ]);
      return {
        programId: program.id,
        programName: program.title,
        enrolled,
        completed,
        dropped,
        conversionRate: enrolled > 0 ? Math.round((completed / enrolled) * 100) : 0,
      };
    }));

    return NextResponse.json({ metrics: {
      role: user.role,
      programs: programsWithStats,
      totalPrograms,
      activePrograms,
      registrations: { total: totalRegistrations, pending: pendingRegistrations },
      students: {
        totalStudents,
        activeStudents,
        newThisMonth: newStudentsThisMonth,
        completedThisMonth: completedStudentsThisMonth,
        suspensionRate: totalStudents > 0 ? Math.round(((totalStudents - activeStudents) / totalStudents) * 100) : 0,
      },
      lastUpdated: now.toISOString(),
    } });
  }

  if (user.role === "FINANCE") {
    const [totalPayments, pending, processed, paid, failed, refunded, paymentSums] = await Promise.all([
      prisma.payment.count(),
      prisma.payment.count({ where: { status: "Pending" } }),
      prisma.payment.count({ where: { status: "Processed" } }),
      prisma.payment.count({ where: { status: "Paid" } }),
      prisma.payment.count({ where: { status: "Failed" } }),
      prisma.payment.count({ where: { status: "Refunded" } }),
      prisma.payment.aggregate({ _sum: { amount: true }, where: { status: { in: ["Paid", "Processed"] } } }),
    ]);
    return NextResponse.json({ metrics: {
      role: user.role,
      payments: { totalPayments, pending, processed, paid, failed, refunded, totalRevenue: paymentSums._sum.amount || 0 },
      lastUpdated: now.toISOString(),
    } });
  }

  if (user.role === "CONTENT_EDITOR") {
    const [totalOpportunities, open, won, lost, expired] = await Promise.all([
      prisma.opportunity.count(),
      prisma.opportunity.count({ where: { status: "open" } }),
      prisma.opportunity.count({ where: { status: "won" } }),
      prisma.opportunity.count({ where: { status: "lost" } }),
      prisma.opportunity.count({ where: { status: "expired" } }),
    ]);
    return NextResponse.json({ metrics: {
      role: user.role,
      opportunities: { totalOpportunities, open, won, lost, expired, totalValue: 0, totalExpectedValue: 0 },
      lastUpdated: now.toISOString(),
    } });
  }

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

  // Only the Super Admin reaches this combined cross-domain query.
  return NextResponse.json({ metrics: { ...metrics, role: user.role } });
}
