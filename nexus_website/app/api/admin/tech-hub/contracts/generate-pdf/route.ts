import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/permissions-server";
import prisma from "@/lib/db";
import PDFDocument from "pdfkit";

export async function POST(
  request: Request,
) {
  const { user, authorized } = await requirePermission("techhub:contracts:*");
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!authorized) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  type PdfData = {
    clientName: string;
    clientEmail: string;
    clientPhone?: string;
    company?: string;
    contractType?: string;
    templateKey?: string;
    serviceType: string;
    serviceTypeKey: string;
    totalAmount?: number | null;
    currency?: string;
    depositPercent?: number | null;
    depositAmount?: number | null;
    milestones?: unknown[];
    scopeText?: string;
    bodyText?: string;
    signatureClientUrl?: string | null;
    signatureTechHubUrl?: string | null;
    signatureClientAt?: Date | null;
    signatureTechHubAt?: Date | null;
  };

  try {
    const body = await request.json();
    const { id, orderId, clientName, clientEmail, company, contractType,
      templateKey, serviceType, serviceTypeKey, totalAmount, currency, depositPercent, depositAmount, milestones, scopeText, bodyText } = body;

    // Resolve by id or orderId
    let contract: Awaited<ReturnType<typeof prisma.contract.findUnique>> = null;
    if (id) {
      contract = await prisma.contract.findUnique({ where: { id } });
    } else if (orderId) {
      contract = await prisma.contract.findFirst({ where: { orderId } });
    }
    if (!contract) {
      if (!clientName || !clientEmail || !serviceType || !serviceTypeKey || !contractType) {
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
      }
    }

    const data: PdfData = contract ? {
      clientName: contract.clientName,
      clientEmail: contract.clientEmail,
      clientPhone: contract.clientPhone || undefined,
      company: contract.company || undefined,
      contractType: contract.contractType,
      templateKey: contract.templateKey || undefined,
      serviceType: contract.serviceType,
      serviceTypeKey: contract.serviceTypeKey,
      totalAmount: contract.totalAmount,
      currency: contract.currency,
      depositPercent: contract.depositPercent,
      depositAmount: contract.depositAmount,
      milestones: Array.isArray(contract.milestones) ? contract.milestones : [],
      scopeText: contract.scopeText || undefined,
      bodyText: contract.bodyText || undefined,
      signatureClientUrl: contract.signatureClientUrl,
      signatureTechHubUrl: contract.signatureTechHubUrl,
      signatureClientAt: contract.signatureClientAt,
      signatureTechHubAt: contract.signatureTechHubAt,
    } : {
      clientName,
      clientEmail,
      company,
      contractType,
      templateKey,
      serviceType,
      serviceTypeKey,
      totalAmount,
      currency,
      depositPercent,
      depositAmount,
      milestones: milestones || [],
      scopeText,
      bodyText,
    };

    const doc = new PDFDocument({ margin: 72, size: "A4" });
    const chunks: Buffer[] = [];

    const date = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

    const passThrough = new (await import("stream")).PassThrough();
    passThrough.on("data", (chunk) => chunks.push(chunk));
    doc.pipe(passThrough);

    doc.fontSize(20).text("NEXUS TECH HUB", { align: "center" });
    doc.fontSize(10).text("Business & Technology Services", { align: "center" });
    doc.moveDown(0.5);
    doc.fontSize(14).text(`${data.contractType || "CONTRACT"}`, { align: "center" });
    doc.moveDown(1);

    doc.fontSize(11).text(`Prepared: ${date}`, { align: "right" });
    doc.moveDown(0.3);
    doc.fontSize(11).text(`Contract ID: ${(contract?.id || "DRAFT") as string}`, { align: "left" });

    doc.moveDown(0.8);
    doc.fontSize(12).text("1. PARTIES", { underline: true });
    doc.fontSize(10).text(`Client: ${data.clientName} ${data.company ? `(${data.company})` : ""}`);
    if (data.clientPhone) doc.fontSize(10).text(`Phone: ${data.clientPhone}`);
    if (data.clientEmail) doc.fontSize(10).text(`Email: ${data.clientEmail}`);
    doc.moveDown(0.3);
    doc.fontSize(10).text(`Service: ${data.serviceType} (${data.serviceTypeKey})`);

    doc.moveDown(0.8);
    doc.fontSize(12).text("2. SCOPE OF WORK", { underline: true });
    doc.fontSize(10).text(data.scopeText || data.bodyText || "As defined in the order brief.", { align: "left" });

    doc.moveDown(0.8);
    doc.fontSize(12).text("3. DELIVERABLES & TIMELINE", { underline: true });
    if (Array.isArray(data.milestones) && data.milestones.length > 0) {
      const ms = JSON.parse(typeof data.milestones === "string" ? data.milestones : JSON.stringify(data.milestones));
      for (const m of ms as { title: string; due: string; amount: unknown }[]) {
        doc.fontSize(10).text(`${m.title} - Due: ${m.due ? new Date(m.due).toLocaleDateString() : "TBD"}`);
      }
    } else {
      doc.fontSize(10).text("As defined in the project milestones.");
    }

    doc.moveDown(0.8);
    doc.fontSize(12).text("4. FEES & PAYMENT", { underline: true });
    doc.fontSize(10).text(`Total amount: ${data.totalAmount ? `${data.totalAmount.toLocaleString()} ${data.currency || "XAF"}` : "TBD"}`);
    if (data.depositPercent) {
      doc.fontSize(10).text(`Deposit: ${data.depositPercent}%`);
      doc.fontSize(10).text(`Deposit amount: ${data.depositAmount ? `${data.depositAmount.toLocaleString()} ${data.currency || "XAF"}` : "TBD"}`);
    }

    doc.moveDown(0.8);
    doc.fontSize(12).text("5. SIGNATURES", { underline: true });
    doc.moveDown(0.3);
    doc.fontSize(10).text("Client signature:");
    const signatureBuffer = (value?: string | null) => {
      const encoded = value?.match(/^data:image\/png;base64,(.+)$/)?.[1];
      return encoded ? Buffer.from(encoded, "base64") : null;
    };
    const clientSignatureBuffer = signatureBuffer(data.signatureClientUrl);
    if (clientSignatureBuffer) doc.image(clientSignatureBuffer, doc.x, doc.y, { fit: [190, 55] });
    else doc.text("____________________________________________");
    doc.fontSize(9).text(data.signatureClientAt ? `Signed ${data.signatureClientAt.toLocaleDateString()}` : "Date: ____________");
    doc.moveDown(0.4);
    doc.fontSize(10).text("NEXUS authorized representative:");
    const nexusSignatureBuffer = signatureBuffer(data.signatureTechHubUrl);
    if (nexusSignatureBuffer) doc.image(nexusSignatureBuffer, doc.x, doc.y, { fit: [190, 55] });
    else doc.text("____________________________________________");
    doc.fontSize(9).text(data.signatureTechHubAt ? `Signed ${data.signatureTechHubAt.toLocaleDateString()}` : "Date: ____________");

    if (contract) {
      doc.moveDown(0.5);
      doc.fontSize(10).text(`Status: ${contract.status || "draft"}`, { align: "right" });
    }

    doc.end();
    await new Promise<void>((resolve) => doc.on("end", resolve));

    const buffer = Buffer.concat(chunks);
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${(contract?.id || "contract")}.pdf"`,
      },
    });
  } catch (error) {
    console.error("Failed to generate contract PDF:", error);
    return NextResponse.json({ error: "Failed to generate PDF" }, { status: 500 });
  }
}
