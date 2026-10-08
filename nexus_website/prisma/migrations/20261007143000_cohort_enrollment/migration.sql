-- Tie official students to cohorts and reconcile historical cohort occupancy.
UPDATE "Student" AS student
SET "cohortId" = NULL
WHERE student."cohortId" IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM "Cohort" AS cohort WHERE cohort.id = student."cohortId");

UPDATE "Cohort" AS cohort
SET "currentStudents" = (
  SELECT COUNT(*)::integer
  FROM "Student" AS student
  WHERE student."cohortId" = cohort.id
    AND student."paymentStatus" = 'Paid'
);

CREATE INDEX IF NOT EXISTS "Student_cohortId_idx" ON "Student"("cohortId");

ALTER TABLE "Student"
  ADD CONSTRAINT "Student_cohortId_fkey"
  FOREIGN KEY ("cohortId") REFERENCES "Cohort"(id)
  ON DELETE SET NULL ON UPDATE CASCADE;
