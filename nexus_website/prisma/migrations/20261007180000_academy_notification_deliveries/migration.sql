CREATE TABLE "AcademyNotificationDelivery" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "template" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "recipient" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "attemptCount" INTEGER NOT NULL DEFAULT 0,
    "providerMessageId" TEXT,
    "error" TEXT,
    "lastAttemptAt" TIMESTAMP(3),
    "sentAt" TIMESTAMP(3),
    "sentById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "AcademyNotificationDelivery_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "AcademyNotificationDelivery_studentId_template_channel_key"
ON "AcademyNotificationDelivery"("studentId", "template", "channel");

CREATE INDEX "AcademyNotificationDelivery_status_updatedAt_idx"
ON "AcademyNotificationDelivery"("status", "updatedAt");

CREATE INDEX "AcademyNotificationDelivery_studentId_updatedAt_idx"
ON "AcademyNotificationDelivery"("studentId", "updatedAt");

ALTER TABLE "AcademyNotificationDelivery"
ADD CONSTRAINT "AcademyNotificationDelivery_studentId_fkey"
FOREIGN KEY ("studentId") REFERENCES "Student"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
