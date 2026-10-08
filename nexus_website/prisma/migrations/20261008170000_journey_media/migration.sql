ALTER TABLE "JourneyEntry"
ADD COLUMN "media" JSONB NOT NULL DEFAULT '[]'::jsonb;
