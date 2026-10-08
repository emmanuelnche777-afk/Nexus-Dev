import { OpportunityStatus } from "@prisma/client";

/**
 * Single definition of what it means for a public Opportunity listing to be
 * accepting applications.
 *
 * Three places used to answer this question independently — the public feed, the
 * public application endpoint, and the admin create route — and they already
 * disagreed. One definition, imported everywhere.
 */

/** NEXUS operates on West Africa Time (UTC+1). Cameroon observes no DST, so a
 * fixed offset is exact here and avoids a date library for one calculation. */
const NEXUS_UTC_OFFSET_MINUTES = 60;

/**
 * Parse an `<input type="date">` value into the end of that day in NEXUS time.
 *
 * `new Date("2026-10-05")` is midnight UTC. The public feed then compares
 * `deadline >= now`, so a listing given today's date was invisible the instant it
 * was created. A deadline is a date the listing is open *through*, so it must
 * resolve to the last moment of that day.
 *
 * Returns null for empty input, meaning "no deadline set".
 */
export function parseDeadlineInput(value: unknown): Date | null {
  if (value === null || value === undefined) return null;

  const raw = String(value).trim();
  if (!raw) return null;

  // Accept a full ISO timestamp as-is; only bare dates need the end-of-day shift.
  if (raw.includes("T")) {
    const parsed = new Date(raw);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(raw);
  if (!match) return null;

  const [, year, month, day] = match;
  const endOfDayUtcMs = Date.UTC(
    Number(year),
    Number(month) - 1,
    Number(day),
    23,
    59,
    59,
    999
  );

  return new Date(endOfDayUtcMs - NEXUS_UTC_OFFSET_MINUTES * 60 * 1000);
}

/**
 * Whether a listing is currently accepting applications.
 *
 * Requires an explicit OPEN lifecycle *and* an unexpired deadline. A null
 * deadline means "no deadline set" and stays open.
 */
export function isAcceptingApplications(
  listing: { lifecycle: OpportunityStatus | string; deadline?: Date | null },
  now: Date = new Date()
): boolean {
  if (String(listing.lifecycle).toUpperCase() !== OpportunityStatus.OPEN) {
    return false;
  }
  if (!listing.deadline) return true;
  return listing.deadline.getTime() > now.getTime();
}

/** Whether the deadline has passed but the row is still marked OPEN. */
export function isExpiredButStillOpen(
  listing: { lifecycle: OpportunityStatus | string; deadline?: Date | null },
  now: Date = new Date()
): boolean {
  return (
    String(listing.lifecycle).toUpperCase() === OpportunityStatus.OPEN &&
    Boolean(listing.deadline) &&
    listing.deadline!.getTime() <= now.getTime()
  );
}

/**
 * Timestamps implied by a lifecycle change: entering OPEN stamps `publishedAt`,
 * leaving OPEN stamps `closedAt`, and returning to OPEN clears the close stamp so
 * a re-opened listing is not permanently marked closed.
 *
 * Returns only the fields that should change, so it composes with a partial
 * update.
 */
export function lifecycleSideEffects(
  lifecycle: OpportunityStatus,
  previous: { lifecycle: OpportunityStatus | string; publishedAt?: Date | null; closedAt?: Date | null } | null,
  now: Date = new Date()
): { publishedAt?: Date; closedAt?: Date | null } {
  if (lifecycle === OpportunityStatus.OPEN) {
    return {
      publishedAt: previous?.publishedAt ?? now,
      closedAt: null,
    };
  }
  if (lifecycle === OpportunityStatus.DRAFT) {
    // Never published, so it was never closed.
    return {};
  }
  return { closedAt: now };
}

/** Normalise an admin-supplied status string to the enum, or null if invalid. */
export function parseLifecycle(value: unknown): OpportunityStatus | null {
  if (typeof value !== "string") return null;
  const upper = value.trim().toUpperCase();
  const match = Object.values(OpportunityStatus).find((s) => s === upper);
  return match ?? null;
}