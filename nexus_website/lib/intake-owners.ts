import prisma from "@/lib/db";

/**
 * Owner resolution for the intake queues.
 *
 * `ownerId` on `PathwayInquiry` / `OpportunityApplication` is a plain column, not
 * a foreign key. That was a deliberate call when the columns were added: adding
 * an FK to `AdminUser` would couple applicant records to the staff table, and a
 * staff row being deleted or hard-reset must never be able to cascade into an
 * applicant's record. The cost is that owner names have to be looked up, which
 * this does in one query instead of N+1.
 */

export interface OwnerSummary {
  id: string;
  name: string;
  role: string;
}

export async function resolveOwners(
  ids: Array<string | null | undefined>
): Promise<Map<string, OwnerSummary>> {
  const unique = Array.from(
    new Set(ids.filter((id): id is string => Boolean(id)))
  );

  if (unique.length === 0) return new Map();

  const users = await prisma.adminUser.findMany({
    where: { id: { in: unique } },
    select: { id: true, name: true, role: true },
  });

  return new Map(users.map((u) => [u.id, u]));
}

/**
 * Active staff who can be given a record. Suspended, deleted or not-yet-accepted
 * accounts are excluded: assigning work to someone who cannot log in is how
 * queues silently go stale.
 */
export async function listAssignableAdmins(): Promise<OwnerSummary[]> {
  return prisma.adminUser.findMany({
    where: {
      deletedAt: null,
      active: true,
      status: "ACTIVE",
      passwordHash: { not: null },
    },
    select: { id: true, name: true, role: true },
    orderBy: { name: "asc" },
  });
}
