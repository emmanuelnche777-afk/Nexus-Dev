-- Add columns to PartnerInquiry if they don't exist (idempotent)
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'PartnerInquiry' AND column_name = 'phone') THEN
    ALTER TABLE "public"."PartnerInquiry" ADD COLUMN "phone" TEXT;
  END IF;
END $$;--> statement-breakpoint
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'PartnerInquiry' AND column_name = 'proposedValue') THEN
    ALTER TABLE "public"."PartnerInquiry" ADD COLUMN "proposedValue" INTEGER;
  END IF;
END $$;--> statement-breakpoint
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'PartnerInquiry' AND column_name = 'adminNotes') THEN
    ALTER TABLE "public"."PartnerInquiry" ADD COLUMN "adminNotes" TEXT;
  END IF;
END $$;--> statement-breakpoint
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'PartnerInquiry' AND column_name = 'reviewedAt') THEN
    ALTER TABLE "public"."PartnerInquiry" ADD COLUMN "reviewedAt" TIMESTAMP(3);
  END IF;
END $$;--> statement-breakpoint