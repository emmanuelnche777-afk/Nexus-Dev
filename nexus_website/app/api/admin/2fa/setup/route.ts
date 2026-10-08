import { NextResponse } from "next/server";
import { TOTP, NobleCryptoPlugin, ScureBase32Plugin } from "otplib";
import QRCode from "qrcode";
import crypto from "node:crypto";
import { prisma } from "@/lib/db";
import { encrypt } from "@/lib/encryption";
import { requirePermission } from "@/lib/permissions-server";

const totp = new TOTP({
  issuer: "NEXUS",
  crypto: new NobleCryptoPlugin(),
  base32: new ScureBase32Plugin(),
});

export async function POST() {
  const { user, authorized } = await requirePermission("foundation:*");
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!authorized) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const adminUser = await prisma.adminUser.findUnique({
      where: { id: user.id, deletedAt: null },
    });

    if (!adminUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const secret = totp.generateSecret();
    const otpauth = totp.toURI({ secret, label: adminUser.email });
    const qrDataUrl = await QRCode.toDataURL(otpauth);

    const backupCodes: string[] = Array.from({ length: 8 }, () =>
      crypto.randomBytes(8).toString("hex")
    );

    const backupCodeHashes = backupCodes.map((c) =>
      crypto.createHash("sha256").update(c).digest("hex")
    );

    await prisma.adminUser.update({
      where: { id: user.id },
      data: {
        twoFactorSecret: encrypt(secret),
        backupCodes: JSON.stringify(backupCodeHashes),
      },
    });

    return NextResponse.json({
      secret,
      qrDataUrl,
      backupCodes,
    });
  } catch (error) {
    console.error("[2fa/setup] Error:", error);
    return NextResponse.json({ error: "Failed to set up 2FA" }, { status: 500 });
  }
}
