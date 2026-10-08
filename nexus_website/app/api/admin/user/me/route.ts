import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { decrypt } from "@/lib/encryption";
import { getSession } from "@/lib/admin-auth";

export async function GET() {
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const adminUser = await prisma.adminUser.findUnique({
      where: { id: user.id, deletedAt: null },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        status: true,
        twoFactorEnabled: true,
        invitedAt: true,
        createdAt: true,
        momoPayoutName: true,
        momoPayoutNumber: true,
        salaryAmount: true,
        salaryCurrency: true,
      },
    });

    if (!adminUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    let payroll = null;
    if (adminUser.role === "SUPER_ADMIN") {
      payroll = {
        momoPayoutName: adminUser.momoPayoutName ? decrypt(adminUser.momoPayoutName) : null,
        momoPayoutNumber: adminUser.momoPayoutNumber ? decrypt(adminUser.momoPayoutNumber) : null,
        salaryAmount: adminUser.salaryAmount ? decrypt(adminUser.salaryAmount.toString()) : null,
        salaryCurrency: adminUser.salaryCurrency,
      };
    }

    return NextResponse.json({
      user: {
        id: adminUser.id,
        email: adminUser.email,
        name: adminUser.name,
        role: adminUser.role,
        phone: adminUser.phone,
        status: adminUser.status,
        twoFactorEnabled: adminUser.twoFactorEnabled,
        invitedAt: adminUser.invitedAt,
        createdAt: adminUser.createdAt,
      },
      payroll,
    });
  } catch (error) {
    console.error("[user/me] Error:", error);
    return NextResponse.json({ error: "Failed to load user data" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, phone } = body as { name?: string; phone?: string };

    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone;

    await prisma.adminUser.update({
      where: { id: user.id, deletedAt: null },
      data: updateData,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[user/me] Update error:", error);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
