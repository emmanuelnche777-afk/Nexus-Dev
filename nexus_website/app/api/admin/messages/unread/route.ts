import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requirePermission } from "@/lib/permissions-server";

export async function GET() {
  const { user, authorized } = await requirePermission("inbox:messages");
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!authorized) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const unreadCount = await prisma.adminMessage.count({
      where: { recipientId: user.id, readAt: null },
    });

    return NextResponse.json({ unreadCount });
  } catch (error) {
    console.error("[messages/unread] Error:", error);
    return NextResponse.json({ error: "Failed to count unread messages" }, { status: 500 });
  }
}
