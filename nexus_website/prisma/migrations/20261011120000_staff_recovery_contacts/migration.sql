ALTER TABLE "AdminUser"
  ADD COLUMN "recoveryEmail" TEXT,
  ADD COLUMN "recoveryEmailVerifiedAt" TIMESTAMP(3),
  ADD COLUMN "recoveryPhone" TEXT,
  ADD COLUMN "recoveryPhoneVerifiedAt" TIMESTAMP(3),
  ADD COLUMN "pendingRecoveryTarget" TEXT,
  ADD COLUMN "pendingRecoveryType" TEXT,
  ADD COLUMN "pendingRecoveryChannel" TEXT,
  ADD COLUMN "pendingRecoveryCodeHash" TEXT,
  ADD COLUMN "pendingRecoveryExpiresAt" TIMESTAMP(3);
