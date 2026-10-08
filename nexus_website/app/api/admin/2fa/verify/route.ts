import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { TOTP, NobleCryptoPlugin, ScureBase32Plugin } from "otplib";
import { prisma } from "@/lib/db";
import { decrypt } from "@/lib/encryption";
import { requirePermission } from "@/lib/permissions-server";

const totp = new TOTP({
  issuer: "NEXUS",
  crypto: new NobleCryptoPlugin(),
  base32: new ScureBase32Plugin(),
});

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
    const { code } = body as { code: string };

    if (!code || typeof code !== "string") {
      return NextResponse.json({ error: "Verification code is required" }, { status: 400 });
    }

    const adminUser = await prisma.adminUser.findUnique({
      where: { id: user.id, deletedAt: null },
    });

    if (!adminUser || !adminUser.twoFactorSecret) {
      return NextResponse.json({ error: "2FA not set up" }, { status: 400 });
    }

    let secret: string;
    try {
      secret = decrypt(adminUser.twoFactorSecret);
    } catch {
      return NextResponse.json({ error: "Failed to decrypt 2FA secret" }, { status: 500 });
    }

    const result = await totp.verify(code, { secret });
    if (!result.valid) {
      return NextResponse.json({ error: "Invalid verification code" }, { status: 401 });
    }

    await prisma.adminUser.update({
      where: { id: adminUser.id },
      data: { twoFactorEnabled: true },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[2fa/verify] Error:", error);
    return NextResponse.json({ error: "Failed to verify 2FA" }, { status: 500 });
  }
}