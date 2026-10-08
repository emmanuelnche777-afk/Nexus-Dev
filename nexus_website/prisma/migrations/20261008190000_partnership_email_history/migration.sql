CREATE TABLE "PartnershipInquiryEmail" (
  "id" TEXT NOT NULL,
  "inquiryId" TEXT NOT NULL,
  "direction" TEXT NOT NULL DEFAULT 'outbound',
  "subject" TEXT NOT NULL,
  "body" TEXT NOT NULL,
  "deliveryStatus" TEXT NOT NULL DEFAULT 'pending',
  "providerMessageId" TEXT,
  "deliveryError" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "PartnershipInquiryEmail_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "PartnershipInquiryEmail_inquiryId_createdAt_idx"
  ON "PartnershipInquiryEmail"("inquiryId", "createdAt");

CREATE INDEX "PartnershipInquiryEmail_deliveryStatus_idx"
  ON "PartnershipInquiryEmail"("deliveryStatus");

ALTER TABLE "PartnershipInquiryEmail"
  ADD CONSTRAINT "PartnershipInquiryEmail_inquiryId_fkey"
  FOREIGN KEY ("inquiryId") REFERENCES "PartnerInquiry"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
