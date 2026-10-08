import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const token = new URL(request.url).searchParams.get("token");
  if (!token) return NextResponse.json({ error: "Signature link is invalid" }, { status: 403 });

  const contract = await prisma.contract.findUnique({ where: { id } });
  if (!contract || contract.signatureToken !== token) {
    return NextResponse.json({ error: "Signature link is invalid" }, { status: 403 });
  }
  if (!contract.signatureTokenExpiresAt || contract.signatureTokenExpiresAt < new Date()) {
    return NextResponse.json({ error: "Signature link has expired" }, { status: 403 });
  }
  if (contract.status === "signed" || contract.signatureClientAt) {
    return NextResponse.json({ error: "This contract has already been signed" }, { status: 409 });
  }

  if (contract.status === "sent") {
    await prisma.contract.update({ where: { id }, data: { status: "viewed", viewedAt: new Date() } });
  }

  return NextResponse.json({
    contract: {
      id: contract.id,
      contractType: contract.contractType,
      clientName: contract.clientName,
      serviceType: contract.serviceType,
      totalAmount: contract.totalAmount,
      currency: contract.currency,
      bodyText: contract.bodyText,
    },
  });
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { token, clientSignature } = await request.json();
    if (typeof token !== "string" || typeof clientSignature !== "string" || clientSignature.length > 2_000_000 || !clientSignature.startsWith("data:image/png;base64,")) {
      return NextResponse.json({ error: "A valid signature and token are required" }, { status: 400 });
    }
    const contract = await prisma.contract.findUnique({ where: { id } });
    if (!contract || contract.signatureToken !== token) return NextResponse.json({ error: "Signature link is invalid" }, { status: 403 });
    if (!contract.signatureTokenExpiresAt || contract.signatureTokenExpiresAt < new Date()) {
      return NextResponse.json({ error: "Signature link has expired" }, { status: 403 });
    }
    if (contract.status === "signed" || contract.signatureClientAt) {
      return NextResponse.json({ error: "This contract has already been signed" }, { status: 409 });
    }
    const signed = await prisma.contract.update({
      where: { id },
      data: { signatureClientAt: new Date(), signatureClientUrl: clientSignature, status: "viewed" },
      select: { id: true, status: true, signatureClientAt: true },
    });
    return NextResponse.json({ contract: signed });
  } catch (error) {
    console.error("Failed to save client contract signature:", error);
    return NextResponse.json({ error: "Failed to save signature" }, { status: 500 });
  }
}
