import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { hashPassword, comparePassword } from "@/lib/admin-auth";
import { requirePermission } from "@/lib/permissions-server";

const PASSWORD_MIN_LENGTH = 10;

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
    const { currentPassword, newPassword } = body as {
      currentPassword: string;
      newPassword: string;
    };

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: "Current password and new password are required" },
        { status: 400 }
      );
    }

    if (newPassword.length < PASSWORD_MIN_LENGTH) {
      return NextResponse.json(
        { error: `New password must be at least ${PASSWORD_MIN_LENGTH} characters` },
        { status: 400 }
      );
    }

    const adminUser = await prisma.adminUser.findUnique({
      where: { id: user.id, deletedAt: null },
    });

    if (!adminUser || !adminUser.passwordHash) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const valid = await comparePassword(currentPassword, adminUser.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: "Current password is incorrect" }, { status: 401 });
    }

    const passwordHash = await hashPassword(newPassword);

    await prisma.$transaction(async (tx) => {
      await tx.adminUser.update({
        where: { id: adminUser.id },
        data: { passwordHash },
      });
      await tx.adminSession.deleteMany({ where: { userId: adminUser.id } });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[user/change-password] Error:", error);
    return NextResponse.json({ error: "Failed to change password" }, { status: 500 });
  }
}
