-- Add bootstrap audit fields to AdminUser
ALTER TABLE "AdminUser" ADD COLUMN "bootstrappedFromIp" TEXT;
ALTER TABLE "AdminUser" ADD COLUMN "bootstrappedAt" TIMESTAMP(3);

-- Index for bootstrap audit queries
CREATE INDEX "AdminUser_bootstrappedAt_idx" ON "AdminUser"("bootstrappedAt");
