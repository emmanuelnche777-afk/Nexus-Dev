/*
  Warnings:

  - The `role` column on the `AdminUser` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `phone` to the `AdminUser` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "AdminRole" AS ENUM ('SUPER_ADMIN', 'ACADEMY_MANAGER', 'TECH_HUB_MANAGER', 'FOUNDATION_MANAGER', 'MENTORSHIP_COORDINATOR', 'CONTENT_EDITOR', 'SUPPORT_STAFF', 'FINANCE');

-- CreateEnum
CREATE TYPE "AdminStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'DELETED');

-- AlterTable
ALTER TABLE "AdminSession" ADD COLUMN     "ipAddress" TEXT,
ADD COLUMN     "lastActiveAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "userAgent" TEXT;

-- AlterTable
ALTER TABLE "AdminUser" ADD COLUMN     "createdBy" TEXT,
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "invitedAt" TIMESTAMP(3),
ADD COLUMN     "invitedTokenExpiresAt" TIMESTAMP(3),
ADD COLUMN     "invitedTokenHash" TEXT,
ADD COLUMN     "momoPayoutName" TEXT,
ADD COLUMN     "momoPayoutNumber" TEXT,
ADD COLUMN     "passwordHash" TEXT,
ADD COLUMN     "passwordResetTokenExpiresAt" TIMESTAMP(3),
ADD COLUMN     "passwordResetTokenHash" TEXT,
ADD COLUMN     "phone" TEXT NOT NULL,
ADD COLUMN     "salaryAmount" DECIMAL(65,30),
ADD COLUMN     "salaryCurrency" TEXT DEFAULT 'XAF',
ADD COLUMN     "status" "AdminStatus" NOT NULL DEFAULT 'ACTIVE',
ADD COLUMN     "twoFactorEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "twoFactorSecret" TEXT,
DROP COLUMN "role",
ADD COLUMN     "role" "AdminRole" NOT NULL DEFAULT 'SUPPORT_STAFF';

-- CreateTable
CREATE TABLE "LoginAttempt" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "attemptedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "success" BOOLEAN NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,

    CONSTRAINT "LoginAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminMessage" (
    "id" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "recipientId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LoginAttempt_identifier_attemptedAt_idx" ON "LoginAttempt"("identifier", "attemptedAt");

-- CreateIndex
CREATE INDEX "LoginAttempt_attemptedAt_idx" ON "LoginAttempt"("attemptedAt");

-- CreateIndex
CREATE INDEX "AdminMessage_recipientId_readAt_idx" ON "AdminMessage"("recipientId", "readAt");

-- CreateIndex
CREATE INDEX "AdminMessage_senderId_recipientId_idx" ON "AdminMessage"("senderId", "recipientId");

-- CreateIndex
CREATE INDEX "AdminUser_status_idx" ON "AdminUser"("status");

-- CreateIndex
CREATE INDEX "AdminUser_deletedAt_idx" ON "AdminUser"("deletedAt");

-- AddForeignKey
ALTER TABLE "AdminMessage" ADD CONSTRAINT "AdminMessage_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "AdminUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminMessage" ADD CONSTRAINT "AdminMessage_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "AdminUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;
