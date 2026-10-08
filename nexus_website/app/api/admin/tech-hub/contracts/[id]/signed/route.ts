import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/permissions-server";
import prisma from "@/lib/db";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, authorized } = await requirePermission("techhub:contracts:*");
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!authorized) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (user.role !== "SUPER_ADMIN") return NextResponse.json({ error: "Only a super admin can add the NEXUS signature" }, { status: 403 });

  try {
    const { id } = await params;
    const contract = await prisma.contract.findUnique({ where: { id } });
    if (!contract) return NextResponse.json({ error: "Contract not found" }, { status: 404 });

    const body = await request.json();
    const { signedPdfUrl, signatureTechHubUrl } = body;

    if (contract.status === "signed") return NextResponse.json({ error: "Contract already locked" }, { status: 400 });
    if (!contract.signatureClientAt) return NextResponse.json({ error: "Client has not signed yet" }, { status: 400 });
    if (typeof signatureTechHubUrl !== "string" || signatureTechHubUrl.length > 2_000_000 || !signatureTechHubUrl.startsWith("data:image/png;base64,")) {
      return NextResponse.json({ error: "A NEXUS signature is required" }, { status: 400 });
    }

    const now = new Date();
    const locked = await prisma.contract.update({
      where: { id },
      data: {
        signatureTechHubAt: now,
        signatureTechHubUrl: signatureTechHubUrl || null,
        signedPdfUrl: signedPdfUrl || contract.signedPdfUrl,
        signedAt: now,
        signatureToken: null,
        signatureTokenExpiresAt: null,
        status: "signed",
      },
      select: {
        id: true,
        status: true,
        signedAt: true,
        signatureClientAt: true,
        signatureTechHubAt: true,
        signedPdfUrl: true,
      },
    });

    await prisma.activityLog.create({
      data: {
        action: "contract.signed",
        entity: "Contract",
        entityId: id,
        userId: user.id,
        metadata: { signedAt: now.toISOString() },
      },
    });

    return NextResponse.json({ contract: locked });
  } catch (error) {
    console.error("Failed to lock signed contract:", error);
    return NextResponse.json({ error: "Failed to lock signed contract" }, { status: 500 });
  }
}
