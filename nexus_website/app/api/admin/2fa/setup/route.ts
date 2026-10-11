import { NextResponse } from "next/server";
import { TOTP, NobleCryptoPlugin, ScureBase32Plugin } from "otplib";
import QRCode from "qrcode";
import crypto from "node:crypto";
import { prisma } from "@/lib/db";
import { encrypt } from "@/lib/encryption";
import { requirePermission } from "@/lib/permissions-server";
import { enforceActorRateLimit } from "@/lib/rate-limit";

const totp = new TOTP({
  issuer: "NEXUS",
  crypto: new NobleCryptoPlugin(),
  base32: new ScureBase32Plugin(),
});

export async function POST() {
  // 2FA setup belongs to the authenticated account itself, not a staff role.
  const { user, authorized } = await requirePermission("account:security");
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!authorized) return NextResponse.json({ error: "Session locked" }, { status: 423 });
  const limited = await enforceActorRateLimit(user.id, "2fa-enrollment-start", 5, 60 * 60 * 1000);
  if (limited) return limited;
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
        pendingTwoFactorSecret: encrypt(secret),
        pendingBackupCodes: JSON.stringify(backupCodeHashes),
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
