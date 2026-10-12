import { randomUUID } from "node:crypto";
import prisma from "@/lib/db";
import { sendSms } from "@/lib/notifications";
import { enforceActorRateLimit } from "@/lib/rate-limit";

/** Sends and records an SMS only when the staff member explicitly requests it. */
export async function sendOptionalSms(args: {
  to: string;
  body: string;
  sentById: string;
  subject?: string;
  logBody?: string;
}) {
  const limit = await enforceActorRateLimit(args.sentById, "optional-sms", 20, 60 * 60 * 1000);
  const result = limit
    ? { success: false, error: "SMS limit reached for this staff account. Try again later." }
    : await sendSms({ to: args.to, body: args.body });
  const status = "skipped" in result && result.skipped
    ? "skipped"
    : "success" in result && result.success
      ? "queued" in result && result.queued ? "queued" : "sent"
      : "failed";

  await prisma.notificationLog.create({
    data: {
      id: randomUUID(),
      type: "sms",
      to: args.to,
      subject: args.subject ?? null,
      body: args.logBody ?? args.body,
      status,
      result: JSON.parse(JSON.stringify(result)),
      error: "error" in result ? String(result.error ?? "") : null,
      sentById: args.sentById,
    },
  }).catch((error) => console.error("Failed to log SMS delivery:", error));

  return { result, status };
}
