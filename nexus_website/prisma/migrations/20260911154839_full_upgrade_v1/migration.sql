-- AlterTable
ALTER TABLE "Program" ADD COLUMN     "awards" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "curriculumModules" JSONB NOT NULL DEFAULT '[]',
ADD COLUMN     "featured" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "instructors" JSONB NOT NULL DEFAULT '[]',
ADD COLUMN     "overviewVideoUrl" TEXT,
ADD COLUMN     "requirements" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "ServiceOrder" ADD COLUMN     "desiredTimeline" TEXT,
ADD COLUMN     "quoteAmount" INTEGER,
ADD COLUMN     "quoteCurrency" TEXT NOT NULL DEFAULT 'XAF',
ADD COLUMN     "quoteDurationWeeks" INTEGER,
ADD COLUMN     "source" TEXT NOT NULL DEFAULT 'web';

-- AlterTable
ALTER TABLE "SiteSettings" ADD COLUMN     "academyOverviewVideoPoster" TEXT,
ADD COLUMN     "academyOverviewVideoUrl" TEXT;

-- CreateTable
CREATE TABLE "Service" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "tagline" TEXT,
    "description" TEXT NOT NULL,
    "imageUrl" TEXT,
    "iconKey" TEXT NOT NULL DEFAULT 'Code2',
    "features" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "deliverables" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "status" TEXT NOT NULL DEFAULT 'active',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Service_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiEscalation" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "clientName" TEXT NOT NULL,
    "clientEmail" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "aiMessages" JSONB NOT NULL DEFAULT '[]',
    "status" TEXT NOT NULL DEFAULT 'new',
    "assignedTo" TEXT,
    "adminResponse" TEXT,
    "respondedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AiEscalation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiKnowledge" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'general',
    "approved" BOOLEAN NOT NULL DEFAULT false,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AiKnowledge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminChatMessage" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "language" TEXT NOT NULL DEFAULT 'en',
    "userMessage" TEXT NOT NULL,
    "aiReply" TEXT NOT NULL,
    "hasImage" BOOLEAN NOT NULL DEFAULT false,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminChatMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SocialPost" (
    "id" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "mediaUrl" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "scheduledAt" TIMESTAMP(3),
    "publishedAt" TIMESTAMP(3),
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SocialPost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LiveSupportSession" (
    "id" TEXT NOT NULL,
    "clientName" TEXT NOT NULL,
    "clientEmail" TEXT NOT NULL,
    "clientPhone" TEXT,
    "reason" TEXT NOT NULL,
    "adminName" TEXT,
    "endedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LiveSupportSession_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Service_slug_key" ON "Service"("slug");

-- CreateIndex
CREATE INDEX "Service_status_idx" ON "Service"("status");

-- CreateIndex
CREATE INDEX "Service_sortOrder_idx" ON "Service"("sortOrder");

-- CreateIndex
CREATE INDEX "AiEscalation_status_idx" ON "AiEscalation"("status");

-- CreateIndex
CREATE INDEX "AiEscalation_createdAt_idx" ON "AiEscalation"("createdAt");

-- CreateIndex
CREATE INDEX "AiKnowledge_category_idx" ON "AiKnowledge"("category");

-- CreateIndex
CREATE INDEX "AiKnowledge_approved_idx" ON "AiKnowledge"("approved");

-- CreateIndex
CREATE INDEX "AdminChatMessage_sessionId_idx" ON "AdminChatMessage"("sessionId");

-- CreateIndex
CREATE INDEX "AdminChatMessage_timestamp_idx" ON "AdminChatMessage"("timestamp");

-- CreateIndex
CREATE INDEX "SocialPost_platform_idx" ON "SocialPost"("platform");

-- CreateIndex
CREATE INDEX "SocialPost_status_idx" ON "SocialPost"("status");

-- CreateIndex
CREATE INDEX "LiveSupportSession_createdAt_idx" ON "LiveSupportSession"("createdAt");
