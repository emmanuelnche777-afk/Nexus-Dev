import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/permissions-server";

import prisma from "@/lib/db";

export async function GET() {
  const { user, authorized } = await requirePermission("*");
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!authorized) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const [
      programs,
      cohorts,
      faqs,
      blogPosts,
      journey,
      serviceOrders,
      milestones,
      aiVideos,
      aiConversations,
      contactMessages,
      partnerInquiries,
      newsletter,
      liveChats,
      pendingApplications,
      opportunities,
      notificationLogs,
      siteSettings,
    ] = await Promise.all([
      prisma.program.count(),
      prisma.cohort.count(),
      prisma.faq.count(),
      prisma.blogPost.count(),
      prisma.journeyEntry.count(),
      prisma.serviceOrder.count(),
      prisma.milestone.count(),
      prisma.aiVideo.count(),
      prisma.aiConversation.count(),
      prisma.contactMessage.count(),
      prisma.partnerInquiry.count(),
      prisma.newsletterSubscriber.count(),
      prisma.liveChat.count(),
      prisma.pendingApplication.count(),
      prisma.opportunity.count(),
      prisma.notificationLog.count(),
      prisma.siteSettings.count(),
    ]);

    return NextResponse.json({
      ok: true,
      database: "connected",
      counts: {
        programs,
        cohorts,
        faqs,
        blogPosts,
        journey,
        serviceOrders,
        milestones,
        aiVideos,
        aiConversations,
        contactMessages,
        partnerInquiries,
        newsletter,
        liveChats,
        pendingApplications,
        opportunities,
        notificationLogs,
        siteSettings,
      },
    });
  } catch (err: unknown) {
    return NextResponse.json(
      {
        ok: false,
        database: "error",
        error: err instanceof Error ? err.message : "Database query failed",
        hint: "Run `npm run db:push && npm run db:seed` to set up the database",
      },
      { status: 500 }
    );
  }
}
