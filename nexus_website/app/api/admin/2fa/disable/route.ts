import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { requirePermission } from "@/lib/permissions-server";

export async function POST(request: NextRequest) {
  const { user, authorized } = await requirePermission("foundation:*");
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!authorized) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { password } = body as { password: string };

    if (!password || typeof password !== "string" || password.length < 1) {
      return NextResponse.json({ error: "Current password is required" }, { status: 400 });
    }

    const adminUser = await prisma.adminUser.findUnique({
      where: { id: user.id, deletedAt: null },
    });

    if (!adminUser || !adminUser.passwordHash) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const valid = await bcrypt.compare(password, adminUser.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }

    await prisma.adminUser.update({
      where: { id: user.id },
      data: {
        twoFactorEnabled: false,
        twoFactorSecret: null,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[2fa/disable] Error:", error);
    return NextResponse.json({ error: "Failed to disable 2FA" }, { status: 500 });
  }
}
