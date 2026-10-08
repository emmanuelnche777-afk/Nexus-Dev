ALTER TABLE "ContactMessage"
  ADD COLUMN "department" TEXT NOT NULL DEFAULT 'general';

-- Existing messages with an explicit partnership subject already belong in
-- the Support Staff partnership queue. Other historic messages remain General.
UPDATE "ContactMessage"
SET "department" = 'partnership'
WHERE LOWER(TRIM("subject")) = 'partnership';

CREATE INDEX "ContactMessage_department_status_createdAt_idx"
  ON "ContactMessage"("department", "status", "createdAt");
