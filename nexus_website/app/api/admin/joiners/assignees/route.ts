import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/permissions-server";
import { PERMISSIONS } from "@/lib/permissions-data";
import { listAssignableAdmins } from "@/lib/intake-owners";

/**
 * Active staff who can own a pathway inquiry.
 *
 * Gated on the triage permission, matching what assignment actually is: shared
 * queue management. A read-only role can see the owner of a record but cannot
 * change it.
 *
 * This deliberately does not reuse `/api/admin/staff`, which requires
 * `staff:*` — a permission intake roles do not hold, so reusing it would leave
 * the assignee picker empty for exactly the people who need it.
 */
export async function GET() {
  const { user, authorized } = await requirePermission(PERMISSIONS.PATHWAY_INQUIRIES_TRIAGE);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!authorized) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    return NextResponse.json({ assignees: await listAssignableAdmins() });
  } catch (error) {
    console.error("Failed to load assignees:", error);
    return NextResponse.json({ assignees: [] });
  }
}
