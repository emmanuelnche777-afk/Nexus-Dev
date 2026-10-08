-- CreateEnum
CREATE TYPE "PathwayInquiryStatus" AS ENUM ('NEW', 'REVIEWED', 'RESPONDED');

-- CreateEnum
CREATE TYPE "OpportunityApplicationStatus" AS ENUM ('NEW', 'UNDER_REVIEW', 'MATCHED', 'NOT_A_FIT');

-- CreateTable
CREATE TABLE "PathwayInquiry" (
    "id" TEXT NOT NULL,
    "pathway" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "details" JSONB NOT NULL,
    "status" "PathwayInquiryStatus" NOT NULL DEFAULT 'NEW',
    "adminNotes" TEXT,
    "responseMessage" TEXT,
    "respondedAt" TIMESTAMP(3),
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

CONSTRAINT "PathwayInquiry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OpportunityApplication" (
    "id" TEXT NOT NULL,
    "opportunityId" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "message" TEXT,
    "documentUrls" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "status" "OpportunityApplicationStatus" NOT NULL DEFAULT 'NEW',
    "adminNotes" TEXT,
    "responseMessage" TEXT,
    "respondedAt" TIMESTAMP(3),
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

CONSTRAINT "OpportunityApplication_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PathwayInquiry_status_idx" ON "PathwayInquiry"("status");

-- CreateIndex
CREATE INDEX "PathwayInquiry_pathway_idx" ON "PathwayInquiry"("pathway");

-- CreateIndex
CREATE INDEX "PathwayInquiry_email_idx" ON "PathwayInquiry"("email");

-- CreateIndex
CREATE INDEX "PathwayInquiry_createdAt_idx" ON "PathwayInquiry"("createdAt");

-- CreateIndex
CREATE INDEX "OpportunityApplication_status_idx" ON "OpportunityApplication"("status");

-- CreateIndex
CREATE INDEX "OpportunityApplication_opportunityId_idx" ON "OpportunityApplication"("opportunityId");

-- CreateIndex
CREATE INDEX "OpportunityApplication_email_idx" ON "OpportunityApplication"("email");

-- CreateIndex
CREATE INDEX "OpportunityApplication_createdAt_idx" ON "OpportunityApplication"("createdAt");

-- AddForeignKey
ALTER TABLE "OpportunityApplication" ADD CONSTRAINT "OpportunityApplication_opportunityId_fkey" FOREIGN KEY ("opportunityId") REFERENCES "Opportunity"("id") ON DELETE CASCADE ON UPDATE CASCADE;
