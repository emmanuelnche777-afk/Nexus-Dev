ALTER TABLE "AdminSession"
  ADD COLUMN "lockedAt" TIMESTAMP(3),
  ADD COLUMN "reauthenticatedAt" TIMESTAMP(3);

ALTER TABLE "AdminUser"
  ADD COLUMN "pendingTwoFactorSecret" TEXT,
  ADD COLUMN "pendingBackupCodes" JSONB;
