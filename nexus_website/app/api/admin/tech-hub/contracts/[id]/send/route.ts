import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/permissions-server";
import prisma from "@/lib/db";
import type { Prisma } from "@prisma/client";
import { generateToken, getSignedUrl } from "@/lib/contract-signing";
import { sendContractEmail } from "@/lib/contract-email";
import { sendWhatsApp } from "@/lib/notifications";
import { logNotification } from "@/lib/notification-log";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, authorized } = await requirePermission("techhub:contracts:*");
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!authorized) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const { id } = await params;
    const contract = await prisma.contract.findUnique({ where: { id } });
    if (!contract) return NextResponse.json({ error: "Contract not found" }, { status: 404 });
    if (contract.archivedAt) return NextResponse.json({ error: "Restore this contract before sending it" }, { status: 400 });
    if (["signed", "rejected"].includes(contract.status)) {
      return NextResponse.json({ error: "Contract is not in a sendable state" }, { status: 400 });
    }

    if (!contract.bodyText.trim()) {
      return NextResponse.json({ error: "Contract body is empty" }, { status: 400 });
    }

    const token = generateToken();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const signUrl = getSignedUrl(id, token);

    const updated = await prisma.contract.update({
      where: { id },
      data: {
        signatureToken: token,
        signatureTokenExpiresAt: expiresAt,
        sentAt: new Date(),
        expiresAt,
        status: "sent",
      },
      select: {
        id: true,
        orderId: true,
        contractType: true,
        templateKey: true,
        status: true,
        clientName: true,
        clientEmail: true,
        clientPhone: true,
        company: true,
        serviceType: true,
        totalAmount: true,
        currency: true,
        pdfUrl: true,
        sentAt: true,
        expiresAt: true,
      },
    });

    // Send email via Resend
    try {
      const emailSent = await sendContractEmail(updated.clientEmail, updated.clientName, signUrl, updated);
      await logNotification({
        type: "contract-sent",
        to: updated.clientEmail,
        subject: `Nexus Tech Hub: ${updated.contractType} for ${updated.clientName}`,
        body: `Contract ${updated.id} sent to ${updated.clientEmail}`,
        status: emailSent ? "sent" : "failed",
        result: { signUrl },
      });
      if (!emailSent) {
        await prisma.contract.update({
          where: { id },
          data: { status: "draft", signatureToken: null, signatureTokenExpiresAt: null, sentAt: null, expiresAt: null },
        });
        return NextResponse.json({ error: "Email delivery failed. The contract remains a draft." }, { status: 502 });
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "unknown error";
      await logNotification({
        type: "contract-sent",
        to: updated.clientEmail,
        subject: `Nexus Tech Hub: ${updated.contractType} for ${updated.clientName}`,
        body: message,
        status: "failed",
        error: message,
      });
      return NextResponse.json(
        { success: true, contract: updated, emailError: message },
        { status: 200 }
      );
    }

    // WhatsApp fallback when the client supplied a phone number.
    const phone = updated.clientPhone;
    if (phone) {
      try {
        const recipient = normalizeWhatsAppNumber(phone);
        if (!recipient) throw new Error("Client phone number is invalid for WhatsApp");
        const result = await sendWhatsApp({
          to: recipient,
          body: `Hi ${updated.clientName}, your ${updated.contractType.replace(/-/g, " ")} for ${updated.serviceType} is ready for review and signature: ${signUrl}\n\nThis secure link expires in 7 days.`,
        });
        await logNotification({
          type: "whatsapp",
          to: recipient,
          body: `Contract ${updated.id} signature link sent via WhatsApp`,
          status: result.success ? "sent" : result.skipped ? "skipped" : "failed",
          error: result.success ? undefined : result.reason || "WhatsApp delivery failed",
        });
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "unknown error";
        await logNotification({
          type: "whatsapp",
          to: phone,
          body: message,
          status: "failed",
          error: message,
        });
      }
    }

    await prisma.activityLog.create({
      data: {
        action: "contract.sent",
        entity: "Contract",
        entityId: id,
        userId: user.id,
        metadata: { clientEmail: updated.clientEmail, signUrl } satisfies Prisma.InputJsonObject,
      },
    });

    return NextResponse.json({ contract: updated });
  } catch (error) {
    console.error("Failed to send contract:", error);
    return NextResponse.json({ error: "Failed to send contract" }, { status: 500 });
  }
}

function normalizeWhatsAppNumber(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (!digits) return "";
  if (phone.trim().startsWith("+")) return `+${digits}`;
  if (/^6\d{8}$/.test(digits)) return `+237${digits}`;
  return `+${digits}`;
}
