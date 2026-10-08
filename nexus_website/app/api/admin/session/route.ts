import { NextResponse } from "next/server";
import { clearSession, getSession } from "@/lib/admin-auth";

export async function POST() {
  await clearSession();
  return NextResponse.json({ success: true });
}

export async function GET() {
  const user = await getSession();
  if (!user) return NextResponse.json({ authenticated: false, user: null });

  return NextResponse.json({ authenticated: true, user });
}
