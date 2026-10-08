import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/permissions-server";

import prisma from "@/lib/db";

export async function GET(request: Request) {
  const { user, authorized } = await requirePermission("ai-chat:*");
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!authorized) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get("limit") || "100", 10);
  const search = searchParams.get("search")?.toLowerCase() || "";

  const messages = await prisma.adminChatMessage.findMany({
    where: search
      ? {
          OR: [
            { userMessage: { contains: search, mode: "insensitive" } },
            { aiReply: { contains: search, mode: "insensitive" } },
            { sessionId: { contains: search, mode: "insensitive" } },
          ],
        }
      : undefined,
    orderBy: { timestamp: "desc" },
    take: limit,
  });

  return NextResponse.json({ conversations: messages });
}
