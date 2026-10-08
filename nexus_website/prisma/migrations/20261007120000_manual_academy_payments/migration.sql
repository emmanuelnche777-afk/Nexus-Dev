-- Academy applicants are not Student records until an admin registers them.
-- Keep pending payments linked to their Registration while studentId is null.
ALTER TABLE "Payment" ALTER COLUMN "studentId" DROP NOT NULL;
ALTER TABLE "Payment" ALTER COLUMN "studentCode" DROP NOT NULL;

-- Earlier mock resolution wrote lower-case completed/failed values without
-- provider confirmation. Return those records to manual review before removing
-- the simulation-only transaction fields.
UPDATE "Payment"
SET "status" = 'Pending',
    "verifiedAt" = NULL,
    "verifiedBy" = NULL,
    "notes" = 'Awaiting manual payment and proof'
WHERE LOWER("status") IN ('completed', 'failed');

ALTER TABLE "Payment"
  DROP COLUMN IF EXISTS "provider",
  DROP COLUMN IF EXISTS "autoVerifiedAt",
  DROP COLUMN IF EXISTS "externalTransactionId",
  DROP COLUMN IF EXISTS "providerResponse",
  DROP COLUMN IF EXISTS "webhookPayload";
