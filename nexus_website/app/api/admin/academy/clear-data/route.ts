import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/permissions-server";

import { prisma } from "@/lib/db";
import { logAdminAction } from "@/lib/audit";


export async function POST(request: Request) {
  try {
    const { entity, confirm } = await request.json();

    const permissionByEntity: Record<string, string> = {
      payments: "academy:payments:delete",
      registrations: "academy:registrations:*",
      students: "academy:students:*",
    };
    const permission = permissionByEntity[entity];
    if (!permission) return NextResponse.json({ error: "Invalid entity" }, { status: 400 });
    const { user, authorized } = await requirePermission(permission);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!authorized) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    if (confirm !== "DELETE ALL") {
      return NextResponse.json({ error: "Invalid confirmation" }, { status: 400 });
    }

    let deletedCount = 0;

    switch (entity) {
      case "payments":
        const pResult = await prisma.payment.deleteMany({});
        deletedCount = pResult.count;
        break;
      case "registrations":
        const rResult = await prisma.registration.deleteMany({});
        deletedCount = rResult.count;
        break;
      case "students":
        const sResult = await prisma.student.deleteMany({});
        deletedCount = sResult.count;
        break;
      default:
        return NextResponse.json({ error: "Invalid entity" }, { status: 400 });
    }

    await logAdminAction({
      adminEmail: user.email,
      action: "delete_all",
      resourceType: entity,
      newValue: { deletedCount },
    });

    return NextResponse.json({ success: true, deletedCount });
  } catch (error) {
    console.error("Clear data failed:", error);
    return NextResponse.json({ error: "Failed to clear data" }, { status: 500 });
  }
}
