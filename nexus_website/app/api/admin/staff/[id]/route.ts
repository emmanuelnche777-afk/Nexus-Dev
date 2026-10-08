import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requirePermission } from "@/lib/permissions-server";
import { invalidateUserSessions } from "@/lib/admin-auth";
import { encrypt, decrypt } from "@/lib/encryption";
import { ROLE_PERMISSIONS } from "@/lib/permissions-data";

function canManageTargetRole(callerRole: string, targetRole: string): boolean {
  const hierarchy: Record<string, number> = {
    SUPER_ADMIN: 7,
    ACADEMY_MANAGER: 6,
    TECH_HUB_MANAGER: 6,
    MENTORSHIP_COORDINATOR: 6,
    CONTENT_EDITOR: 5,
    SUPPORT_STAFF: 4,
    NEWSLETTER_MANAGER: 4,
    FINANCE: 4,
  };
  return (hierarchy[callerRole] || 0) >= (hierarchy[targetRole] || 0);
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { user, authorized } = await requirePermission("staff:*");
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!authorized) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;

  try {
    const staff = await prisma.adminUser.findUnique({
      where: { id, deletedAt: null },
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
        updatedAt: true,
        momoPayoutName: true,
        momoPayoutNumber: true,
        salaryAmount: true,
        salaryCurrency: true,
      },
    });

    if (!staff) {
      return NextResponse.json({ error: "Staff member not found" }, { status: 404 });
    }

    let payroll = null;
    if (user.role === "SUPER_ADMIN") {
      payroll = {
        momoPayoutName: staff.momoPayoutName ? decrypt(staff.momoPayoutName) : null,
        momoPayoutNumber: staff.momoPayoutNumber ? decrypt(staff.momoPayoutNumber) : null,
        salaryAmount: staff.salaryAmount ? decrypt(staff.salaryAmount.toString()) : null,
        salaryCurrency: staff.salaryCurrency,
      };
    }

    return NextResponse.json({ staff, payroll });
  } catch (error) {
    console.error("[staff/[id]] Get error:", error);
    return NextResponse.json({ error: "Failed to load staff member" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { user, authorized } = await requirePermission("staff:*");
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!authorized) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;

  try {
    const target = await prisma.adminUser.findUnique({
      where: { id, deletedAt: null },
    });

    if (!target) {
      return NextResponse.json({ error: "Staff member not found" }, { status: 404 });
    }

    if (!canManageTargetRole(user.role, target.role)) {
      return NextResponse.json({ error: "Insufficient privileges to modify this staff member" }, { status: 403 });
    }

    const body = await request.json();
    const { name, email, phone, role, status, momoPayoutName, momoPayoutNumber, salaryAmount, salaryCurrency } = body;

    // Super Admin accounts can never be modified through staff routes.
    // Role changes must be done through user/profile endpoints or recovery scripts.
    if (target.role === "SUPER_ADMIN") {
      if (
        role !== undefined ||
        status !== undefined ||
        name !== undefined ||
        email !== undefined ||
        phone !== undefined ||
        momoPayoutName !== undefined ||
        momoPayoutNumber !== undefined ||
        salaryAmount !== undefined ||
        salaryCurrency !== undefined
      ) {
        return NextResponse.json(
          { error: "Super Admin accounts cannot be modified through staff routes. Use the profile or recovery tools." },
          { status: 403 }
        );
      }
      // Allow no-op calls (return early)
      return NextResponse.json({ success: true });
    }

    // Reject any attempt to set a role to SUPER_ADMIN
    if (role !== undefined && role === "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Cannot assign the Super Admin role through staff routes" },
        { status: 400 }
      );
    }

    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;
    if (status !== undefined) updateData.status = status;
    if (role !== undefined) {
      if (typeof role !== "string" || !Object.hasOwn(ROLE_PERMISSIONS, role)) {
        return NextResponse.json({ error: "Select a valid staff role" }, { status: 400 });
      }
      if (!canManageTargetRole(user.role, role)) {
        return NextResponse.json({ error: "Cannot assign this role" }, { status: 403 });
      }
      updateData.role = role;
    }

    if (user.role === "SUPER_ADMIN") {
      if (momoPayoutName !== undefined) updateData.momoPayoutName = momoPayoutName ? encrypt(momoPayoutName) : null;
      if (momoPayoutNumber !== undefined) updateData.momoPayoutNumber = momoPayoutNumber ? encrypt(momoPayoutNumber) : null;
      if (salaryAmount !== undefined) updateData.salaryAmount = salaryAmount !== null ? encrypt(String(salaryAmount)) : null;
      if (salaryCurrency !== undefined) updateData.salaryCurrency = salaryCurrency;

      if (status === "DELETED") {
        updateData.deletedAt = new Date();
        updateData.status = "DELETED";
        await invalidateUserSessions(target.id);
      }
      if (status === "SUSPENDED") {
        await invalidateUserSessions(target.id);
      }
    }

    await prisma.adminUser.update({
      where: { id },
      data: updateData,
    });

    if (status === "DELETED") {
      await invalidateUserSessions(target.id);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[staff/[id]] Update error:", error);
    return NextResponse.json({ error: "Failed to update staff member" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { user, authorized } = await requirePermission("staff:*");
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!authorized) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;

  try {
    const target = await prisma.adminUser.findUnique({
      where: { id, deletedAt: null },
    });

    if (!target) {
      return NextResponse.json({ error: "Staff member not found" }, { status: 404 });
    }

    if (!canManageTargetRole(user.role, target.role)) {
      return NextResponse.json({ error: "Insufficient privileges" }, { status: 403 });
    }

    // Super Admin accounts can never be deleted through staff routes.
    // Only the recovery script or My Profile can change a Super Admin's own data.
    if (target.role === "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Super Admin accounts cannot be deleted through staff routes" },
        { status: 403 }
      );
    }

    await prisma.$transaction(async (tx) => {
      await tx.adminUser.update({
        where: { id },
        data: { status: "DELETED", deletedAt: new Date() },
      });
      await tx.adminSession.deleteMany({ where: { userId: id } });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[staff/[id]] Delete error:", error);
    return NextResponse.json({ error: "Failed to delete staff member" }, { status: 500 });
  }
}
