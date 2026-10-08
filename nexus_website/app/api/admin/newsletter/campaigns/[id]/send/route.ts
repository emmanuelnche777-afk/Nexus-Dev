import { NextResponse } from "next/server";
import { decrypt, encrypt } from "@/lib/encryption";
import prisma from "@/lib/db";
import { requirePermission } from "@/lib/permissions-server";
import { enforceActorRateLimit } from "@/lib/rate-limit";
import { sendEmail } from "@/lib/notifications";
import { createUnsubscribeToken, renderNewsletterHtml } from "@/lib/newsletter";
import type { Prisma } from "@prisma/client";

const BATCH_SIZE = 10;
const STALE_CLAIM_MS = 10 * 60 * 1000;

type CampaignParams = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: CampaignParams) {
  const { user, authorized } = await requirePermission("newsletter:send");
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!authorized) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json({ error: "Email delivery is not configured. Add RESEND_API_KEY before sending campaigns." }, { status: 503 });
  }

  const { id } = await params;
  let action: "start" | "continue" | "retry-failed";
  try {
    const body = await request.json();
    action = body?.action;
    if (!["start", "continue", "retry-failed"].includes(action)) {
      return NextResponse.json({ error: "Invalid campaign action." }, { status: 400 });
    }
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const limit = await enforceActorRateLimit(user.id, "newsletter-campaign-batches", 120, 60 * 60 * 1000);
  if (limit) return limit;

  try {
    const campaign = await prisma.newsletterCampaign.findUnique({ where: { id } });
    if (!campaign) return NextResponse.json({ error: "Campaign not found." }, { status: 404 });

    if (action === "start") {
      const startLimit = await enforceActorRateLimit(user.id, "newsletter-campaign-starts", 5, 24 * 60 * 60 * 1000);
      if (startLimit) return startLimit;
      if (campaign.status !== "draft") {
        return NextResponse.json({ error: "This campaign has already been started." }, { status: 409 });
      }

      const activeSubscribers = await prisma.newsletterSubscriber.findMany({
        where: { status: "active" },
        select: { email: true },
        orderBy: { createdAt: "asc" },
      });
      if (activeSubscribers.length === 0) {
        return NextResponse.json({ error: "There are no active subscribers to send to." }, { status: 409 });
      }

      await prisma.$transaction(async (tx) => {
        const claimed = await tx.newsletterCampaign.updateMany({
          where: { id, status: "draft" },
          data: { status: "sending", recipientCount: activeSubscribers.length },
        });
        if (claimed.count !== 1) throw new Error("Campaign was started by another request.");
        await tx.newsletterDelivery.createMany({
          data: activeSubscribers.map(({ email }) => ({ campaignId: id, email })),
          skipDuplicates: true,
        });
      });
    } else if (action === "retry-failed") {
      if (campaign.status !== "partial" && campaign.status !== "failed") {
        return NextResponse.json({ error: "Only failed or partial campaigns can be retried." }, { status: 409 });
      }
      await prisma.$transaction(async (tx) => {
        const reset = await tx.newsletterDelivery.updateMany({
          where: { campaignId: id, status: "failed" },
          data: { status: "pending", error: null, claimedAt: null },
        });
        if (!reset.count) throw new Error("This campaign has no failed deliveries to retry.");
        await tx.newsletterCampaign.update({
          where: { id },
          data: { status: "sending", completedAt: null },
        });
      });
    } else if (campaign.status !== "sending") {
      return NextResponse.json({ error: "This campaign is not currently sending." }, { status: 409 });
    }

    const staleBefore = new Date(Date.now() - STALE_CLAIM_MS);
    await prisma.newsletterDelivery.updateMany({
      where: { campaignId: id, status: "sending", claimedAt: { lt: staleBefore } },
      data: { status: "pending", claimedAt: null },
    });

    const pending = await prisma.newsletterDelivery.findMany({
      where: { campaignId: id, status: "pending" },
      orderBy: { createdAt: "asc" },
      take: BATCH_SIZE,
    });

    for (const delivery of pending) {
      const claimed = await prisma.newsletterDelivery.updateMany({
        where: { id: delivery.id, status: "pending" },
        data: { status: "sending", claimedAt: new Date() },
      });
      if (claimed.count !== 1) continue;

      const subscriber = await prisma.newsletterSubscriber.findUnique({
        where: { email: delivery.email },
        select: { status: true },
      });
      if (!subscriber || subscriber.status !== "active") {
        await prisma.newsletterDelivery.update({
          where: { id: delivery.id },
          data: { status: "skipped", error: "Subscriber opted out before this campaign was sent." },
        });
        continue;
      }

      let unsubscribeToken: string;
      let encryptedToken = delivery.unsubscribeTokenEncrypted;
      let tokenHash = delivery.unsubscribeTokenHash;
      if (encryptedToken && tokenHash) {
        // Reuse the same unsubscribe capability when a delivery is resumed.
        unsubscribeToken = decrypt(encryptedToken);
      } else {
        const generated = createUnsubscribeToken();
        unsubscribeToken = generated.token;
        tokenHash = generated.tokenHash;
        encryptedToken = encrypt(generated.token);
      }

      await prisma.newsletterDelivery.update({
        where: { id: delivery.id },
        data: { unsubscribeTokenEncrypted: encryptedToken, unsubscribeTokenHash: tokenHash },
      });

      const outcome = await sendEmail({
        to: delivery.email,
        subject: campaign.subject,
        html: renderNewsletterHtml(campaign.subject, campaign.body, unsubscribeToken),
        replyTo: process.env.NEWSLETTER_REPLY_TO || undefined,
      });

      let status = "sent";
      let error: string | null = null;
      let providerMessageId: string | null = null;
      if (outcome.skipped) {
        status = "skipped";
        error = typeof outcome.reason === "string" ? outcome.reason : "Email delivery was skipped.";
      } else if (outcome.success === false) {
        status = "failed";
        error = outcome.error instanceof Error
          ? outcome.error.message
          : typeof outcome.error === "string"
            ? outcome.error
            : "Email provider rejected the message.";
      } else if (outcome.success) {
        providerMessageId = outcome.id || null;
      } else {
        status = "failed";
        error = "Email provider did not confirm this message.";
      }

      await prisma.newsletterDelivery.update({
        where: { id: delivery.id },
        data: {
          status,
          error,
          providerMessageId,
          unsubscribeTokenEncrypted: encryptedToken,
          unsubscribeTokenHash: tokenHash,
          sentAt: status === "sent" ? new Date() : null,
        },
      });
      try {
        await prisma.notificationLog.create({
          data: {
            id: `newsletter-${delivery.id}`,
            type: "email",
            to: delivery.email,
            subject: campaign.subject,
            body: campaign.body,
            status,
            error,
            result: (providerMessageId ? { providerMessageId } : {}) as Prisma.InputJsonValue,
            sentById: user.id,
          },
        });
      } catch (logError) {
        console.error("[newsletter] Could not write notification log:", logError);
      }
    }

    const statusCounts = await prisma.newsletterDelivery.groupBy({
      by: ["status"],
      where: { campaignId: id },
      _count: { _all: true },
    });
    const counts = Object.fromEntries(statusCounts.map((row) => [row.status, row._count._all]));
    const sentCount = counts.sent || 0;
    const failedCount = counts.failed || 0;
    const skippedCount = counts.skipped || 0;
    const unfinishedCount = (counts.pending || 0) + (counts.sending || 0);
    const status = unfinishedCount > 0
      ? "sending"
      : sentCount > 0 && failedCount === 0
        ? "sent"
        : failedCount === 0
          ? "sent"
          : sentCount > 0
            ? "partial"
            : "failed";

    const updatedCampaign = await prisma.newsletterCampaign.update({
      where: { id },
      data: {
        status,
        sentCount,
        failedCount,
        skippedCount,
        completedAt: unfinishedCount === 0 ? new Date() : null,
      },
      select: { id: true, status: true, recipientCount: true, sentCount: true, failedCount: true, skippedCount: true },
    });
    return NextResponse.json({ campaign: updatedCampaign, unfinishedCount });
  } catch (error) {
    console.error("[newsletter] Campaign processing failed:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Campaign processing failed." }, { status: 500 });
  }
}
