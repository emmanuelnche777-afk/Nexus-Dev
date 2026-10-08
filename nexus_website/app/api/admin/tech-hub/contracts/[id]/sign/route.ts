import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { token, clientSignature } = await request.json();
    if (typeof token !== "string" || typeof clientSignature !== "string" || !clientSignature.startsWith("data:image/png;base64,")) {
      return NextResponse.json({ error: "A valid signature and token are required" }, { status: 400 });
    }

    const contract = await prisma.contract.findUnique({ where: { id } });
    if (!contract) return NextResponse.json({ error: "Contract not found" }, { status: 404 });
    if (contract.status === "signed") return NextResponse.json({ error: "Contract already signed" }, { status: 400 });
    if (!contract.signatureTokenExpiresAt || contract.signatureTokenExpiresAt < new Date()) {
      return NextResponse.json({ error: "Signature link has expired" }, { status: 403 });
    }
    if (contract.signatureToken !== token) return NextResponse.json({ error: "Invalid or expired signature token" }, { status: 403 });
    if (contract.signatureClientAt) return NextResponse.json({ error: "Client already signed" }, { status: 400 });

    const now = new Date();
    const signed = await prisma.contract.update({
      where: { id },
      data: {
        signatureClientAt: now,
        signatureClientUrl: clientSignature || null,
        signedAt: contract.signatureTechHubAt ? now : null,
        status: contract.signatureTechHubAt ? "signed" : "viewed",
      },
      select: {
        id: true,
        status: true,
        signedAt: true,
        signatureClientAt: true,
        signatureTechHubAt: true,
      },
    });

    return NextResponse.json({ contract: signed });
  } catch (error) {
    console.error("Failed to process client signature:", error);
    return NextResponse.json({ error: "Failed to process signature" }, { status: 500 });
  }
}
