-- Public listing vs internal deal, real lifecycle, applicant-record protection.
--
-- Additive only. Nothing is dropped except the `Opportunity_status_idx` index,
-- which is superseded by `Opportunity_lifecycle_idx`. Every legacy column is
-- retained so this migration is reversible without a restore.
--
-- Backfills at the end handle a database that already has Opportunity rows. On
-- the current database the table is empty, so they are no-ops; they exist so this
-- migration is also correct anywhere else.

-- CreateEnum
CREATE TYPE "OpportunityStatus" AS ENUM ('DRAFT', 'OPEN', 'CLOSED', 'ARCHIVED');

-- OpportunityApplication previously used ON DELETE CASCADE, so deleting an
-- Opportunity destroyed every applicant's record. Restrict makes the database
-- refuse the delete instead.
ALTER TABLE "OpportunityApplication" DROP CONSTRAINT "OpportunityApplication_opportunityId_fkey";

DROP INDEX "Opportunity_status_idx";

-- AlterTable
ALTER TABLE "Opportunity"
  ADD COLUMN "lifecycle" "OpportunityStatus" NOT NULL DEFAULT 'DRAFT',
  ADD COLUMN "publishedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "OpportunityApplication"
  ADD COLUMN "ownerAssignedAt" TIMESTAMP(3),
  ADD COLUMN "ownerId" TEXT,
  ADD COLUMN "stageEnteredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "PathwayInquiry"
  ADD COLUMN "ownerAssignedAt" TIMESTAMP(3),
  ADD COLUMN "ownerId" TEXT,
  ADD COLUMN "stageEnteredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "Deal" (
    "id" TEXT NOT NULL,
    "opportunityId" TEXT,
    "value" INTEGER,
    "probability" INTEGER,
    "expectedValue" INTEGER,
    "nextSteps" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "contactName" TEXT,
    "contactEmail" TEXT,
    "contactPhone" TEXT,
    "assignedToId" TEXT,
    "notes" TEXT,
    "source" TEXT NOT NULL DEFAULT 'website',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Deal_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Deal_opportunityId_key" ON "Deal"("opportunityId");

-- CreateIndex
CREATE INDEX "Deal_assignedToId_idx" ON "Deal"("assignedToId");

-- CreateIndex
CREATE INDEX "Opportunity_lifecycle_idx" ON "Opportunity"("lifecycle");

-- CreateIndex
CREATE INDEX "Opportunity_createdAt_idx" ON "Opportunity"("createdAt");

-- CreateIndex
CREATE INDEX "OpportunityApplication_ownerId_status_idx" ON "OpportunityApplication"("ownerId", "status");

-- CreateIndex
CREATE INDEX "OpportunityApplication_status_stageEnteredAt_idx" ON "OpportunityApplication"("status", "stageEnteredAt");

-- CreateIndex
CREATE INDEX "PathwayInquiry_ownerId_status_idx" ON "PathwayInquiry"("ownerId", "status");

-- CreateIndex
CREATE INDEX "PathwayInquiry_status_stageEnteredAt_idx" ON "PathwayInquiry"("status", "stageEnteredAt");

-- AddForeignKey
ALTER TABLE "Deal" ADD CONSTRAINT "Deal_opportunityId_fkey" FOREIGN KEY ("opportunityId") REFERENCES "Opportunity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "OpportunityApplication" ADD CONSTRAINT "OpportunityApplication_opportunityId_fkey" FOREIGN KEY ("opportunityId") REFERENCES "Opportunity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- ── Backfill: lifecycle from the legacy free-text status ──────────────────────
-- Case-insensitive, so 'open', 'Open', 'OPEN' all become OPEN. Anything
-- unrecognised becomes DRAFT rather than being published by default.
UPDATE "Opportunity"
SET "lifecycle" = CASE
  WHEN lower(btrim("status")) IN ('open', 'published', 'active') THEN 'OPEN'::"OpportunityStatus"
  WHEN lower(btrim("status")) IN ('closed', 'filled', 'expired')  THEN 'CLOSED'::"OpportunityStatus"
  WHEN lower(btrim("status")) = 'archived'                      THEN 'ARCHIVED'::"OpportunityStatus"
  ELSE 'DRAFT'::"OpportunityStatus"
END;

UPDATE "Opportunity"
SET "publishedAt" = COALESCE("publishedAt", "createdAt")
WHERE "lifecycle" = 'OPEN'::"OpportunityStatus";

-- ── Backfill: internal deal data off the listing row ─────────────────────────
INSERT INTO "Deal" (
  "id", "opportunityId", "value", "probability", "expectedValue",
  "nextSteps", "tags", "contactName", "contactEmail", "contactPhone",
  "notes", "source", "createdAt", "updatedAt"
)
SELECT
  'deal_' || md5(o."id"),
  o."id",
  o."value",
  o."probability",
  o."expectedValue",
  COALESCE(o."nextSteps", ARRAY[]::TEXT[]),
  COALESCE(o."tags", ARRAY[]::TEXT[]),
  o."contactName",
  o."contactEmail",
  o."contactPhone",
  o."notes",
  COALESCE(o."source", 'website'),
  o."createdAt",
  CURRENT_TIMESTAMP
FROM "Opportunity" o
WHERE o."value"         IS NOT NULL
   OR o."probability"   IS NOT NULL
   OR o."contactEmail"  IS NOT NULL
   OR o."contactName"   IS NOT NULL
   OR o."notes"         IS NOT NULL
   OR o."expectedValue" IS NOT NULL
ON CONFLICT ("opportunityId") DO NOTHING;

-- ── Backfill: owner/stage bookkeeping for rows created before these columns ───
UPDATE "OpportunityApplication" SET "stageEnteredAt" = COALESCE("reviewedAt", "createdAt");
UPDATE "PathwayInquiry"        SET "stageEnteredAt" = COALESCE("reviewedAt", "createdAt");