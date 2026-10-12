import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { requirePermission } from "@/lib/permissions-server";
import { getEmailProviderStatus } from "@/lib/notifications/email";
import { logSensitiveAccess } from "@/lib/audit";

export async function GET(request: Request) {
  const { user, authorized } = await requirePermission("newsletter:read");
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!authorized) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const [subscribers, activeCount, unsubscribedCount, campaigns] = await Promise.all([
      prisma.newsletterSubscriber.findMany({
        orderBy: { createdAt: "desc" },
        take: 1000,
        select: { id: true, email: true, status: true, source: true, createdAt: true },
      }),
      prisma.newsletterSubscriber.count({ where: { status: "active" } }),
      prisma.newsletterSubscriber.count({ where: { status: "unsubscribed" } }),
      prisma.newsletterCampaign.findMany({
        orderBy: { createdAt: "desc" },
        take: 25,
        select: {
          id: true,
          subject: true,
          status: true,
          recipientCount: true,
          sentCount: true,
          failedCount: true,
          skippedCount: true,
          createdAt: true,
          completedAt: true,
          _count: { select: { deliveries: true } },
        },
      }),
    ]);

    await logSensitiveAccess({
      actorId: user.id,
      adminEmail: user.email,
      action: "sensitive_list_view",
      resourceType: "newsletter_subscriber",
      request,
      details: { resultCount: subscribers.length },
    });

    return NextResponse.json({
      subscribers,
      activeCount,
      unsubscribedCount,
      campaigns,
      emailConfigured: getEmailProviderStatus().configured,
      emailProvider: getEmailProviderStatus().provider,
    }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("[newsletter] Failed to load admin data:", error);
    return NextResponse.json({ error: "Failed to load newsletter data" }, { status: 500 });
  }
}
