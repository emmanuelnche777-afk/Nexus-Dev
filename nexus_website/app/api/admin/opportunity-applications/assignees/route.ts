import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/permissions-server";
import { PERMISSIONS } from "@/lib/permissions-data";
import { listAssignableAdmins } from "@/lib/intake-owners";

/**
 * Active staff who can own an opportunity application. Mirrors
 * `/api/admin/joiners/assignees`, gated on the applications triage permission.
 */
export async function GET() {
  const { user, authorized } = await requirePermission(PERMISSIONS.APPLICATIONS_TRIAGE);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!authorized) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    return NextResponse.json({ assignees: await listAssignableAdmins() });
  } catch (error) {
    console.error("Failed to load assignees:", error);
    return NextResponse.json({ assignees: [] });
  }
}
