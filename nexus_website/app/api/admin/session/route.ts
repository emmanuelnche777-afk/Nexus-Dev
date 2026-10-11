import { NextResponse } from "next/server";
import { clearSession, getSession, recordSessionActivity } from "@/lib/admin-auth";

export async function POST() {
  await clearSession();
  return NextResponse.json({ success: true });
}

export async function GET() {
  const user = await getSession();
  if (!user) return NextResponse.json({ authenticated: false, user: null });

  return NextResponse.json({ authenticated: true, user });
}

export async function PATCH() {
  const user = await getSession();
  if (!user) return NextResponse.json({ authenticated: false }, { status: 401 });
  if (user.sessionLocked) return NextResponse.json({ error: "Session locked" }, { status: 423 });
  if (!(await recordSessionActivity())) return NextResponse.json({ error: "Session locked" }, { status: 423 });
  return NextResponse.json({ success: true });
}
