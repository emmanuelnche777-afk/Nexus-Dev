CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Existing client links contain the original token. Hashing the stored value
-- preserves those links while ensuring the database no longer stores the raw
-- signing secret.
UPDATE "Contract"
SET "signatureToken" = encode(digest("signatureToken", 'sha256'), 'hex')
WHERE "signatureToken" IS NOT NULL;
