-- Foundation Manager is not an active staff role. Refuse to guess what to do
-- with any legacy account that still has it; an operator must resolve those
-- accounts explicitly before this migration is applied.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM "AdminUser"
    WHERE "role"::text = 'FOUNDATION_MANAGER'
  ) THEN
    RAISE EXCEPTION 'Cannot remove FOUNDATION_MANAGER while AdminUser rows still use it. Resolve those accounts explicitly, then retry this migration.';
  END IF;
END $$;

ALTER TABLE "AdminUser" ALTER COLUMN "role" DROP DEFAULT;
ALTER TYPE "AdminRole" RENAME TO "AdminRole_old";
CREATE TYPE "AdminRole" AS ENUM (
  'SUPER_ADMIN',
  'ACADEMY_MANAGER',
  'TECH_HUB_MANAGER',
  'MENTORSHIP_COORDINATOR',
  'CONTENT_EDITOR',
  'SUPPORT_STAFF',
  'NEWSLETTER_MANAGER',
  'FINANCE'
);
ALTER TABLE "AdminUser"
  ALTER COLUMN "role" TYPE "AdminRole"
  USING ("role"::text::"AdminRole");
DROP TYPE "AdminRole_old";
ALTER TABLE "AdminUser" ALTER COLUMN "role" SET DEFAULT 'SUPPORT_STAFF';
