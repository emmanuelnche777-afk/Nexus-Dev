import {
  ROLE_LISTING_TYPE_SCOPE,
  ROLE_PATHWAY_SCOPE,
  type AdminRole,
} from "@/lib/permissions-data";

/**
 * Row-level visibility for the Join Us intake queues.
 *
 * Hiding a navigation link is not access control — an admin endpoint can be
 * called directly by anyone who holds the read permission. So every intake query
 * narrows by the caller's scope here, in the query, rather than relying on the
 * nav to keep people out.
 *
 * The scope tables live in `lib/permissions-data.ts`. This module only enforces
 * them.
 */

/**
 * Pathways a role may see. `null` = every pathway, `[]` = none.
 *
 * Note the explicit `=== undefined` test. `ROLE_PATHWAY_SCOPE[role] ?? []` looks
 * equivalent but is not: `??` also fires on `null`, which is the sentinel for
 * "unrestricted", so it would rewrite every unrestricted role into an empty
 * scope and 403 them out of the queues entirely.
 */
export function pathwayScopeFor(role: AdminRole): readonly string[] | null {
  const scope = ROLE_PATHWAY_SCOPE[role];
  return scope === undefined ? [] : scope;
}

/** Public listing types whose applications a role may see. */
export function listingTypeScopeFor(role: AdminRole): readonly string[] | null {
  const scope = ROLE_LISTING_TYPE_SCOPE[role];
  return scope === undefined ? [] : scope;
}

/** False when the role's scope is empty, i.e. it may see no intake at all. */
export function canSeeAnyPathway(role: AdminRole): boolean {
  const scope = pathwayScopeFor(role);
  return scope === null || scope.length > 0;
}

export function canSeeAnyListingType(role: AdminRole): boolean {
  const scope = listingTypeScopeFor(role);
  return scope === null || scope.length > 0;
}

/** Whether a specific pathway is inside the role's scope. */
export function canSeePathway(role: AdminRole, pathway: string): boolean {
  const scope = pathwayScopeFor(role);
  return scope === null || scope.includes(pathway);
}

/** Whether a specific listing type is inside the role's scope. */
export function canSeeListingType(role: AdminRole, type: string): boolean {
  const scope = listingTypeScopeFor(role);
  return scope === null || scope.includes(type);
}

/**
 * Prisma `where` fragment restricting `PathwayInquiry` rows to the caller's
 * scope. Returns `{}` for an unrestricted role so it composes safely with other
 * filters.
 */
export function pathwayWhereFor(
  role: AdminRole,
  extra: Record<string, unknown> = {}
): Record<string, unknown> {
  const scope = pathwayScopeFor(role);
  const base =
    scope === null ? {} : scope.length === 0 ? { id: "__none__" } : { pathway: { in: [...scope] } };

  return { AND: [base, extra] };
}

/**
 * Prisma `where` fragment restricting `OpportunityApplication` rows to the
 * caller’s scope. Scoping rides on the parent listing's `type`.
 */
export function applicationWhereFor(
  role: AdminRole,
  extra: Record<string, unknown> = {}
): Record<string, unknown> {
  const scope = listingTypeScopeFor(role);
  const base =
    scope === null
      ? {}
      : scope.length === 0
        ? { id: "__none__" }
        : { opportunity: { type: { in: [...scope] } } };

  return { AND: [base, extra] };
}