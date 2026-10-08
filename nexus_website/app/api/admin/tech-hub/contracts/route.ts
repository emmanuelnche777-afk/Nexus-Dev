import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/permissions-server";
import prisma from "@/lib/db";
import type { Prisma } from "@prisma/client";

export async function GET(request: Request) {
  const { user, authorized } = await requirePermission("techhub:contracts:*");
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!authorized) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const url = new URL(request.url);
    const includeArchived = url.searchParams.get("archived") === "true";
    const where: Prisma.ContractWhereInput = {
      archivedAt: includeArchived ? { not: null } : null,
      ...(url.searchParams.has("status") && { status: { in: url.searchParams.get("status")!.split(",") } }),
      ...(url.searchParams.has("type") && { contractType: url.searchParams.get("type")! }),
      ...(url.searchParams.has("orderId") && { orderId: url.searchParams.get("orderId")! }),
    };

    const contracts = await prisma.contract.findMany({
      where,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        orderId: true,
        contractType: true,
        templateKey: true,
        bodyTemplate: true,
        status: true,
        clientName: true,
        clientEmail: true,
        clientPhone: true,
        company: true,
        serviceType: true,
        serviceTypeKey: true,
        totalAmount: true,
        currency: true,
        depositPercent: true,
        depositAmount: true,
        milestones: true,
        bodyText: true,
        pdfUrl: true,
        signedPdfUrl: true,
        signatureClientAt: true,
        signatureTechHubAt: true,
        archivedAt: true,
        signedAt: true,
        sentAt: true,
        createdAt: true,
        updatedAt: true,
        order: {
          select: {
            status: true,
            priority: true,
            budget: true,
            description: true,
            serviceType: true,
            serviceTypeKey: true,
          },
        },
      },
    });

    const enriched = contracts.map((c) => {
      const order = (c as { order?: { status?: string; priority?: string; budget?: string | null; description?: string; serviceType?: string; serviceTypeKey?: string } | undefined }).order;
      return {
        ...c,
        client: c.orderId && order ? {
          serviceType: order.serviceType || "",
          serviceTypeKey: order.serviceTypeKey || "",
          budget: order.budget,
          description: order.description,
          status: order.status || "",
          milestoneCount: 0,
        } : null,
      };
    });

    return NextResponse.json({ contracts: enriched });
  } catch (error) {
    console.error("Failed to load contracts:", error);
    return NextResponse.json({ error: "Failed to load contracts" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const { user, authorized } = await requirePermission("techhub:contracts:*");
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!authorized) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const body = await request.json();

    const orderId = body.orderId || undefined;
    let clientName = body.clientName;
    let clientEmail = body.clientEmail;
    let clientPhone = body.clientPhone;
    let company = body.company;
    let serviceType = body.serviceType;
    let serviceTypeKey = body.serviceTypeKey;
    let description = body.description;
    let contractBody = typeof body.bodyText === "string" ? body.bodyText.trim() : "";

    // If anchored to an order, pull fields from the order
    if (orderId) {
      const order = await prisma.serviceOrder.findUnique({
        where: { id: orderId },
        include: { milestones: true },
      });
      if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
      clientName ||= order.clientName;
      clientEmail ||= order.clientEmail;
      clientPhone ||= order.clientPhone;
      company ||= order.company;
      serviceType ||= order.serviceType;
      serviceTypeKey ||= order.serviceTypeKey;
      description ||= order.description;
      contractBody ||= [
        "NEXUS TECH HUB — PROJECT SERVICE AGREEMENT",
        `Client: ${order.clientName}${order.company ? ` (${order.company})` : ""}`,
        `Service: ${order.serviceType}`,
        "\nSCOPE OF WORK",
        order.description,
        "\nFEES",
        order.quoteAmount ? `${order.quoteAmount.toLocaleString()} ${order.quoteCurrency}` : "To be agreed in writing before work begins.",
        "\nTIMELINE",
        order.desiredTimeline || order.timeline || "To be agreed by both parties.",
        "\nMILESTONES",
        ...order.milestones.map((milestone) => `• ${milestone.title}`),
        "\nPAYMENT AND APPROVAL",
        "NEXUS will begin work after the parties approve the final scope, schedule, and payment terms in writing. Changes to scope or timing must be agreed by both parties.",
        "\nSIGNATURES",
        "The client and an authorized NEXUS representative will sign this agreement electronically.",
        "\nDraft: review and complete all terms with the client before sending for signature.",
      ].join("\n");
      body.milestones ??= order.milestones.map((m) => ({ title: m.title, due: m.dueDate?.toISOString(), amount: null }));
      body.totalAmount ??= order.quoteAmount;
      body.currency ??= order.quoteCurrency;
      body.status ??= "draft";
    } else {
      body.status ??= "draft";
    }

    if (!clientName || !clientEmail || !serviceType || !serviceTypeKey || !body.contractType || !contractBody) {
      return NextResponse.json({ error: "Client name, email, service, contract type, and contract body are required" }, { status: 400 });
    }

    const contract = await prisma.contract.create({
      data: {
        orderId,
        clientName,
        clientEmail,
        clientPhone,
        company,
        serviceType,
        serviceTypeKey,
        contractType: body.contractType,
        templateKey: body.templateKey || "standard-project-agreement",
        bodyTemplate: body.bodyTemplate || "",
        status: "draft",
        totalAmount: body.totalAmount ?? null,
        currency: body.currency ?? "XAF",
        depositPercent: body.depositPercent ?? null,
        depositAmount: body.depositAmount ?? null,
        milestones:
          body.milestones
            ? JSON.stringify(body.milestones)
            : "[]",
        scopeText: body.scopeText,
        bodyText: contractBody,
      },
      select: {
        id: true,
        orderId: true,
        contractType: true,
        templateKey: true,
        bodyTemplate: true,
        status: true,
        clientName: true,
        clientEmail: true,
        clientPhone: true,
        company: true,
        serviceType: true,
        serviceTypeKey: true,
        totalAmount: true,
        currency: true,
        depositPercent: true,
        depositAmount: true,
        milestones: true,
        scopeText: true,
        bodyText: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    await prisma.activityLog.create({
      data: {
        action: "contract.created",
        entity: "Contract",
        entityId: contract.id,
        userId: user.id,
        metadata: { contractType: contract.contractType, clientEmail: contract.clientEmail },
      },
    });

    return NextResponse.json({ contract }, { status: 201 });
  } catch (error) {
    console.error("Failed to create contract:", error);
    return NextResponse.json({ error: "Failed to create contract" }, { status: 500 });
  }
}
