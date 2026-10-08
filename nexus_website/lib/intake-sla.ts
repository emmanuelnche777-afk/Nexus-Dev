/**
 * Response-time targets for the Join Us intake queues.
 *
 * Without an owner and a stage clock there is no way to answer "is anyone
 * actually handling this?", so each record carries `ownerId` and
 * `stageEnteredAt`, and SLA state is derived from those two columns rather than
 * stored. Deriving means a stale SLA can never disagree with the record it
 * describes.
 *
 * Targets are overridable per deployment without a code change.
 */

const HOUR_MS = 60 * 60 * 1000;

function envHours(name: string, fallback: number): number {
  const raw = process.env[name];
  const parsed = raw ? Number(raw) : NaN;
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

/** Hours a record may sit untouched before it counts as awaiting triage. */
export const TRIAGE_TARGET_HOURS = envHours("NEXUS_SLA_TRIAGE_HOURS", 24);

/** Hours a record may sit reviewed but unanswered. */
export const RESPONSE_TARGET_HOURS = envHours("NEXUS_SLA_RESPONSE_HOURS", 72);

/** Statuses that are still waiting on a human, i.e. not a terminal outcome. */
const OPEN_STATUSES = new Set(["NEW", "REVIEWED", "UNDER_REVIEW"]);

export type SlaState = "on_track" | "due_soon" | "overdue" | "done" | "none";

export interface SlaResult {
  state: SlaState;
  /** Whole hours in the current stage. Null when the clock is not running. */
  ageHours: number | null;
  /** The target that applies, in hours. Null when not applicable. */
  targetHours: number | null;
  /** True when the stage is still open and the target has passed. */
  overdue: boolean;
}

/**
 * How long a record may sit in its current stage before it breaches.
 *
 *   NEW / no owner triage  -> TRIAGE_TARGET_HOURS
 *   anything else open     -> RESPONSE_TARGET_HOURS
 *   terminal statuses      -> no target
 */
function targetFor(status: string): number | null {
  if (!OPEN_STATUSES.has(status)) return null;
  return status === "NEW" ? TRIAGE_TARGET_HOURS : RESPONSE_TARGET_HOURS;
}

/**
 * Derive SLA state for one record.
 *
 * `MATCHED` and `NOT_A_FIT` are decisions, not pending work, so they report
 * `done` rather than `overdue` — a rejected applicant is not a missed response.
 */
export function computeSla(
  record: { status: string; stageEnteredAt?: Date | null },
  now: Date = new Date()
): SlaResult {
  const targetHours = targetFor(record.status);

  if (!targetHours) {
    return { state: "done", ageHours: null, targetHours: null, overdue: false };
  }

  const since = record.stageEnteredAt;
  if (!since) {
    // No clock running. Not reported as overdue: there is no evidence of a delay.
    return { state: "none", ageHours: null, targetHours, overdue: false };
  }

  const ageMs = now.getTime() - since.getTime();
  // A clock skewed into the future should not read as negative age.
  const ageHours = Math.max(0, Math.floor(ageMs / HOUR_MS));

  // Warn before the breach, not only after it.
  const dueSoonThreshold = Math.max(1, Math.floor(targetHours * 0.75));
  const overdue = ageMs >= targetHours * HOUR_MS;

  return {
    state: overdue ? "overdue" : ageHours >= dueSoonThreshold ? "due_soon" : "on_track",
    ageHours,
    targetHours,
    overdue,
  };
}

/** Format an SLA result for display, e.g. "3d 4h overdue (target 72h)". */
export function describeSla(sla: SlaResult): string {
  if (sla.state === "done") return "Complete";
  if (sla.state === "none") return "No clock";
  if (sla.ageHours === null || sla.targetHours === null) return "—";

  const age =
    sla.ageHours >= 24
      ? `${Math.floor(sla.ageHours / 24)}d ${sla.ageHours % 24}h`
      : `${sla.ageHours}h`;

  if (sla.overdue) return `${age} in stage — target ${sla.targetHours}h`;
  if (sla.state === "due_soon") return `${age} in stage — due soon (${sla.targetHours}h)`;
  return `${age} in stage (target ${sla.targetHours}h)`;
}
