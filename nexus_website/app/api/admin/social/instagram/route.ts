import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/permissions-server";
import { getInstagramConnection, instagramRedirectUri, removeInstagramConnection } from "@/lib/instagram-login";

export async function GET() {
  const { user, authorized } = await requirePermission("content:social-media:*");
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!authorized) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  try {
    const connection = await getInstagramConnection();
    return NextResponse.json({
      configured: Boolean(process.env.INSTAGRAM_APP_ID && process.env.INSTAGRAM_APP_SECRET && process.env.ENCRYPTION_KEY),
      redirectUri: instagramRedirectUri(),
      connected: Boolean(connection),
      account: connection ? { username: connection.username, expiresAt: connection.expiresAt, connectedAt: connection.connectedAt } : null,
    });
  } catch (error) {
    console.error("Could not read Instagram connection status:", error);
    return NextResponse.json({ error: "Could not read Instagram connection status." }, { status: 500 });
  }
}

export async function DELETE() {
  const { user, authorized } = await requirePermission("content:social-media:*");
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!authorized) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  try {
    await removeInstagramConnection();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Could not disconnect Instagram:", error);
    return NextResponse.json({ error: "Could not disconnect Instagram." }, { status: 500 });
  }
}
