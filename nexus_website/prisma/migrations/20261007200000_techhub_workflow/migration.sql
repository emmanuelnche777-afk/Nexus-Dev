ALTER TABLE "Contract" ADD COLUMN "archivedAt" TIMESTAMP(3);

CREATE INDEX "Contract_archivedAt_idx" ON "Contract"("archivedAt");

ALTER TABLE "ServiceOrder" ADD COLUMN "assignedToId" TEXT;

CREATE INDEX "ServiceOrder_assignedToId_idx" ON "ServiceOrder"("assignedToId");

ALTER TABLE "ServiceOrder"
ADD CONSTRAINT "ServiceOrder_assignedToId_fkey"
FOREIGN KEY ("assignedToId") REFERENCES "AdminUser"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
