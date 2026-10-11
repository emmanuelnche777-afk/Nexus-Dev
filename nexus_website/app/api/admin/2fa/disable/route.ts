import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/permissions-server";

export async function POST() {
  const { user, authorized } = await requirePermission("account:security");
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!authorized) return NextResponse.json({ error: "Session locked" }, { status: 423 });
  // Two-factor protection is mandatory for every staff account. Do not permit
  // a signed-in user (or a direct API caller) to turn it off.
  return NextResponse.json({ error: "Two-factor authentication is required for staff accounts" }, { status: 409 });
}
