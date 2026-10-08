ALTER TYPE "AdminRole" ADD VALUE 'NEWSLETTER_MANAGER';

CREATE TABLE "NewsletterCampaign" (
    "id" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "recipientCount" INTEGER NOT NULL DEFAULT 0,
    "sentCount" INTEGER NOT NULL DEFAULT 0,
    "failedCount" INTEGER NOT NULL DEFAULT 0,
    "skippedCount" INTEGER NOT NULL DEFAULT 0,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),
    CONSTRAINT "NewsletterCampaign_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "NewsletterDelivery" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "providerMessageId" TEXT,
    "unsubscribeTokenEncrypted" TEXT,
    "unsubscribeTokenHash" TEXT,
    "error" TEXT,
    "claimedAt" TIMESTAMP(3),
    "sentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "NewsletterDelivery_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "NewsletterDelivery_campaignId_email_key" ON "NewsletterDelivery"("campaignId", "email");
CREATE UNIQUE INDEX "NewsletterDelivery_unsubscribeTokenHash_key" ON "NewsletterDelivery"("unsubscribeTokenHash");
CREATE INDEX "NewsletterCampaign_status_createdAt_idx" ON "NewsletterCampaign"("status", "createdAt");
CREATE INDEX "NewsletterCampaign_createdById_idx" ON "NewsletterCampaign"("createdById");
CREATE INDEX "NewsletterDelivery_campaignId_status_createdAt_idx" ON "NewsletterDelivery"("campaignId", "status", "createdAt");
CREATE INDEX "NewsletterDelivery_email_idx" ON "NewsletterDelivery"("email");

ALTER TABLE "NewsletterCampaign"
ADD CONSTRAINT "NewsletterCampaign_createdById_fkey"
FOREIGN KEY ("createdById") REFERENCES "AdminUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "NewsletterDelivery"
ADD CONSTRAINT "NewsletterDelivery_campaignId_fkey"
FOREIGN KEY ("campaignId") REFERENCES "NewsletterCampaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;
