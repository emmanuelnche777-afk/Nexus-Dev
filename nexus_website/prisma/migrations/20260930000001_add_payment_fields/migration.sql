-- Payment Migration - Add payment processing fields
-- Add payment processing fields to Payment table

-- Do NOT delete existing migrations or reset the database

ALTER TABLE "Payment" 
ADD COLUMN IF NOT EXISTS "externalTransactionId" TEXT,
ADD COLUMN IF NOT EXISTS "providerResponse" JSONB,
ADD COLUMN IF NOT EXISTS "webhookPayload" JSONB,
ADD COLUMN IF NOT EXISTS "autoVerifiedAt" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "method" "PaymentProvider" NOT NULL DEFAULT 'MTN',
ADD COLUMN IF NOT EXISTS "provider" TEXT,
ADD COLUMN IF NOT EXISTS "verifiedBy" TEXT,
ADD COLUMN IF NOT EXISTS "verifiedAt" TIMESTAMP(3);

-- Add unique index for externalTransactionId if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE c.relname = 'Payment_externalTransactionId_key' AND n.nspname = 'public') THEN
        CREATE UNIQUE INDEX "Payment_externalTransactionId_key" ON "Payment"("externalTransactionId");
    END IF;
END $$;

-- Add indexes for common query patterns
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE c.relname = 'Payment_studentId_idx' AND n.nspname = 'public') THEN
        CREATE INDEX "Payment_studentId_idx" ON "Payment"("studentId");
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE c.relname = 'Payment_studentCode_idx' AND n.nspname = 'public') THEN
        CREATE INDEX "Payment_studentCode_idx" ON "Payment"("studentCode");
    END IF;
END $$;