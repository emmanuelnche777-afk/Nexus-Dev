ALTER TABLE "JourneyEntry"
  ADD COLUMN "projectName" TEXT,
  ADD COLUMN "phaseOrder" INTEGER,
  ADD COLUMN "progress" INTEGER,
  ADD COLUMN "outcome" TEXT;

ALTER TABLE "SocialPost"
  ADD COLUMN "approvedAt" TIMESTAMP(3),
  ADD COLUMN "approvedBy" TEXT,
  ADD COLUMN "journeyEntryId" TEXT;

CREATE INDEX "SocialPost_journeyEntryId_idx" ON "SocialPost"("journeyEntryId");
CREATE UNIQUE INDEX "SocialPost_journeyEntryId_platform_key"
  ON "SocialPost"("journeyEntryId", "platform");

ALTER TABLE "SocialPost"
  ADD CONSTRAINT "SocialPost_journeyEntryId_fkey"
  FOREIGN KEY ("journeyEntryId") REFERENCES "JourneyEntry"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
