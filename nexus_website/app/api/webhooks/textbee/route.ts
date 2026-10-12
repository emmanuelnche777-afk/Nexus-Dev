import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import prisma from "@/lib/db";

export const runtime = "nodejs";

type TextBeeEvent = {
  smsId?: unknown;
  smsBatchId?: unknown;
  message?: unknown;
  deviceId?: unknown;
  webhookEvent?: unknown;
  idempotencyKey?: unknown;
  sender?: unknown;
  recipient?: unknown;
  status?: unknown;
  errorMessage?: unknown;
  receivedAt?: unknown;
  sentAt?: unknown;
  deliveredAt?: unknown;
  failedAt?: unknown;
};

function validSignature(rawBody: string, receivedSignature: string, secret: string) {
  if (!/^[a-f0-9]{64}$/i.test(receivedSignature)) return false;
  const expected = createHmac("sha256", secret).update(rawBody).digest();
  const actual = Buffer.from(receivedSignature, "hex");
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

export async function POST(request: Request) {
  const secret = process.env.TEXTBEE_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "TextBee webhook is not configured" }, { status: 503 });
  }

  const signature = request.headers.get("x-signature") || "";
  const rawBody = await request.text();
  if (rawBody.length > 32_000) {
    return NextResponse.json({ error: "Payload too large" }, { status: 413 });
  }
  if (!signature || !validSignature(rawBody, signature, secret)) {
    return NextResponse.json({ error: "Invalid webhook signature" }, { status: 401 });
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
  }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    return NextResponse.json({ error: "Invalid webhook event" }, { status: 400 });
  }
  const event = parsed as TextBeeEvent;

  if (event.webhookEvent === "MESSAGE_RECEIVED") {
    const smsId = typeof event.smsId === "string" ? event.smsId : "";
    const sender = typeof event.sender === "string" ? event.sender.trim() : "";
    const message = typeof event.message === "string" ? event.message : "";
    if (!smsId || smsId.length > 160 || !sender || sender.length > 80 || !message || message.length > 10_000) {
      return NextResponse.json({ error: "Missing or invalid received SMS fields" }, { status: 400 });
    }

    const receivedAtValue = typeof event.receivedAt === "string" ? new Date(event.receivedAt) : new Date();
    const sentAt = Number.isNaN(receivedAtValue.getTime()) ? new Date() : receivedAtValue;
    try {
      await prisma.notificationLog.create({
        data: {
          id: `textbee-in-${smsId}`,
          type: "sms",
          to: sender,
          body: message,
          status: "received",
          sentAt,
          result: {
            direction: "inbound",
            provider: "textbee",
            smsId,
            deviceId: typeof event.deviceId === "string" ? event.deviceId : null,
            idempotencyKey: typeof event.idempotencyKey === "string" ? event.idempotencyKey : null,
          } as Prisma.InputJsonValue,
        },
      });
    } catch (error) {
      // TextBee retries deliveries. Reuse the provider SMS ID as our idempotency key.
      const existing = await prisma.notificationLog.findUnique({
        where: { id: `textbee-in-${smsId}` },
        select: { id: true },
      }).catch(() => null);
      if (!existing) {
        console.error("[textbee-webhook] Failed to save incoming SMS:", error);
        return NextResponse.json({ error: "Could not save incoming SMS" }, { status: 500 });
      }
    }

    return NextResponse.json({ received: true });
  }

  const statusByEvent: Record<string, string> = {
    MESSAGE_SENT: "sent",
    MESSAGE_DELIVERED: "delivered",
    MESSAGE_FAILED: "failed",
    UNKNOWN_STATE: "unknown",
  };
  const nextStatus = typeof event.webhookEvent === "string" ? statusByEvent[event.webhookEvent] : undefined;
  const smsBatchId = typeof event.smsBatchId === "string" ? event.smsBatchId : "";
  if (!nextStatus || !smsBatchId) return new NextResponse(null, { status: 204 });

  const pendingLogs = await prisma.notificationLog.findMany({
    where: { type: "sms", status: { in: ["queued", "sent", "unknown"] } },
    orderBy: { sentAt: "desc" },
    take: 500,
    select: { id: true, status: true, result: true },
  });
  const log = pendingLogs.find((entry) =>
    entry.result && typeof entry.result === "object" && !Array.isArray(entry.result) &&
    (entry.result as Record<string, unknown>).batchId === smsBatchId
  );
  if (!log) return NextResponse.json({ accepted: true, matched: false });

  const finalStatuses = new Set(["delivered", "failed"]);
  if (!finalStatuses.has(log.status)) {
    const previous = log.result && typeof log.result === "object" && !Array.isArray(log.result)
      ? log.result as Record<string, unknown>
      : {};
    const eventAt = [event.deliveredAt, event.failedAt, event.sentAt].find(
      (value): value is string => typeof value === "string"
    ) || new Date().toISOString();
    await prisma.notificationLog.update({
      where: { id: log.id },
      data: {
        status: nextStatus,
        error: nextStatus === "failed" && typeof event.errorMessage === "string" ? event.errorMessage : null,
        result: {
          ...previous,
          providerStatus: nextStatus,
          providerStatusAt: eventAt,
          providerError: typeof event.errorMessage === "string" ? event.errorMessage : null,
        } as Prisma.InputJsonValue,
      },
    });
  }

  return NextResponse.json({ accepted: true, matched: true });
}
