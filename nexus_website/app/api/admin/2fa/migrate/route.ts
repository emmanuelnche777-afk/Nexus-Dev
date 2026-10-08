import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { encrypt } from "@/lib/encryption";
import { requirePermission } from "@/lib/permissions-server";

export async function POST(request: NextRequest) {
  const { user, authorized } = await requirePermission("staff:*");
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!authorized) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const body = await request.json();
    const { secret, backupCodes } = body as {
      secret: string;
      backupCodes?: string[];
    };

    if (!secret) {
      return NextResponse.json({ error: "TOTP secret is required" }, { status: 400 });
    }

    await prisma.adminUser.update({
      where: { id: user.id },
      data: {
        twoFactorSecret: encrypt(secret),
        backupCodes: backupCodes ? JSON.stringify(backupCodes) : undefined,
        twoFactorEnabled: true,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[2fa/migrate] Error:", error);
    return NextResponse.json({ error: "Failed to migrate 2FA" }, { status: 500 });
  }
}
