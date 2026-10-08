CREATE TABLE "AcademyPrivateEnrollmentRequest" (
    "id" TEXT NOT NULL,
    "programSlug" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "preferredFormat" TEXT NOT NULL,
    "preferredSchedule" TEXT NOT NULL,
    "message" TEXT,
    "status" TEXT NOT NULL DEFAULT 'new',
    "adminNotes" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "AcademyPrivateEnrollmentRequest_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "AcademyPrivateEnrollmentRequest_status_createdAt_idx"
    ON "AcademyPrivateEnrollmentRequest"("status", "createdAt");
CREATE INDEX "AcademyPrivateEnrollmentRequest_programSlug_idx"
    ON "AcademyPrivateEnrollmentRequest"("programSlug");
CREATE INDEX "AcademyPrivateEnrollmentRequest_email_idx"
    ON "AcademyPrivateEnrollmentRequest"("email");
ALTER TABLE "AcademyPrivateEnrollmentRequest"
    ADD CONSTRAINT "AcademyPrivateEnrollmentRequest_programSlug_fkey"
    FOREIGN KEY ("programSlug") REFERENCES "Program"("slug") ON DELETE CASCADE ON UPDATE CASCADE;
