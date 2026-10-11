import { NextResponse } from "next/server";
import { clearSession, getSession } from "@/lib/admin-auth";
import { logAdminAction } from "@/lib/audit";

export async function POST() {
  const user = await getSession();
  if (user) {
    await logAdminAction({
      actorId: user.id,
      adminEmail: user.email,
      action: "sign_out",
      resourceType: "admin_account",
      resourceId: user.id,
    });
  }
  await clearSession();
  return NextResponse.json({ success: true });
}
