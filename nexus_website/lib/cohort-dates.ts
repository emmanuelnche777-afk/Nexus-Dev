const COHORT_DATE_FIELDS = ["startDate", "endDate", "applicationDeadline"] as const;

type CohortDateField = (typeof COHORT_DATE_FIELDS)[number];

/** Convert date input values from the admin form into Prisma Date values. */
export function normalizeCohortDates<T extends Record<string, unknown>>(
  values: T,
  requireAll = false,
): { data: T; error?: string } {
  const data: Record<string, unknown> = { ...values };

  for (const field of COHORT_DATE_FIELDS) {
    const value = data[field as CohortDateField];
    if (value === undefined && !requireAll) continue;
    if (typeof value !== "string" || !value.trim()) {
      return { data: data as T, error: `${field} is required` };
    }

    // HTML date inputs submit YYYY-MM-DD; Prisma DateTime expects a full ISO timestamp.
    const isoValue = /^\d{4}-\d{2}-\d{2}$/.test(value)
      ? `${value}T00:00:00.000Z`
      : value;
    const parsed = new Date(isoValue);
    if (!Number.isFinite(parsed.getTime())) {
      return { data: data as T, error: `${field} must be a valid date` };
    }
    if (/^\d{4}-\d{2}-\d{2}$/.test(value) && parsed.toISOString().slice(0, 10) !== value) {
      return { data: data as T, error: `${field} must be a valid date` };
    }
    data[field] = parsed;
  }

  return { data: data as T };
}
