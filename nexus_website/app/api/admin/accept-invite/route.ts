import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import crypto from "node:crypto";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/admin-auth";

const PASSWORD_MIN_LENGTH = 10;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, password } = body as { token: string; password: string };

    if (!token || !password) {
      return NextResponse.json({ error: "Token and password are required" }, { status: 400 });
    }

    if (password.length < PASSWORD_MIN_LENGTH) {
      return NextResponse.json(
        { error: `Password must be at least ${PASSWORD_MIN_LENGTH} characters` },
        { status: 400 }
      );
    }

    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    const user = await prisma.adminUser.findFirst({
      where: {
        invitedTokenHash: tokenHash,
        deletedAt: null,
      },
    });

    if (!user || !user.invitedTokenExpiresAt || user.invitedTokenExpiresAt < new Date()) {
      return NextResponse.json(
        { error: "Invalid or expired invitation link" },
        { status: 401 }
      );
    }

    const passwordHash = await hashPassword(password);

    await prisma.adminUser.update({
      where: { id: user.id },
      data: {
        passwordHash,
        status: "ACTIVE",
        invitedTokenHash: null,
        invitedTokenExpiresAt: null,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[accept-invite] Error:", error);
    return NextResponse.json({ error: "Failed to accept invitation" }, { status: 500 });
  }
}
