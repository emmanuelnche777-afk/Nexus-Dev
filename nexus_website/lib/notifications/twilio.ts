import twilio from "twilio";

let twilioClient: ReturnType<typeof twilio> | null = null;

function getTwilioClient() {
  if (!twilioClient && process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
    twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  }
  return twilioClient;
}

export interface SmsOptions {
  to: string;
  body: string;
}

export interface WhatsAppOptions {
  to: string;
  body: string;
}

async function sendTextBeeSms(options: SmsOptions) {
  const apiKey = process.env.TEXTBEE_API_KEY;
  if (!apiKey) return null;

  const simSubscriptionId = process.env.TEXTBEE_SIM_SUBSCRIPTION_ID
    ? Number(process.env.TEXTBEE_SIM_SUBSCRIPTION_ID)
    : undefined;
  if (simSubscriptionId !== undefined && !Number.isInteger(simSubscriptionId)) {
    return { success: false, error: "TEXTBEE_SIM_SUBSCRIPTION_ID must be a number" };
  }

  try {
    const response = await fetch("https://api.textbee.dev/api/v1/gateway/send-sms", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": apiKey },
      body: JSON.stringify({
        recipients: [options.to],
        message: options.body,
        ...(process.env.TEXTBEE_DEVICE_ID ? { deviceId: process.env.TEXTBEE_DEVICE_ID } : {}),
        ...(simSubscriptionId !== undefined ? { simSubscriptionId } : {}),
      }),
      signal: AbortSignal.timeout(15_000),
      cache: "no-store",
    });
    const payload = await response.json().catch(() => null);
    if (!response.ok || payload?.data?.success !== true) {
      const message = typeof payload?.message === "string" ? payload.message
        : typeof payload?.data?.message === "string" ? payload.data.message
        : `TextBee request failed (${response.status})`;
      return { success: false, error: message };
    }

    return {
      success: true,
      queued: true,
      provider: "textbee",
      status: "queued",
      batchId: payload.data.smsBatchId,
      recipientCount: payload.data.recipientCount,
      message: "TextBee accepted the SMS and queued it for the connected phone.",
    };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Could not reach TextBee" };
  }
}

export async function sendSms(options: SmsOptions) {
  const textBeeResult = await sendTextBeeSms(options);
  if (textBeeResult) return textBeeResult;

  const client = getTwilioClient();
  if (!client) {
    console.warn("[notifications] No SMS provider configured, skipping SMS:", options.to);
    return { skipped: true, reason: "Configure TextBee or Twilio to send SMS" };
  }
  if (!process.env.TWILIO_PHONE_NUMBER) {
    return { skipped: true, reason: "TWILIO_PHONE_NUMBER is not configured" };
  }

  try {
    const result = await client.messages.create({
      body: options.body,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: options.to,
    });
    return { success: true, sid: result.sid };
  } catch (error) {
    console.error("[notifications] Failed to send SMS:", error);
    return { success: false, error };
  }
}

export async function sendWhatsApp(options: WhatsAppOptions) {
  const client = getTwilioClient();
  if (!client) {
    console.warn("[notifications] Twilio not configured, skipping WhatsApp:", options.to);
    return { skipped: true, reason: "Twilio credentials not configured" };
  }
  if (!process.env.TWILIO_WHATSAPP_FROM) {
    return { skipped: true, reason: "TWILIO_WHATSAPP_FROM is not configured" };
  }

  try {
    const result = await client.messages.create({
      body: options.body,
      from: `whatsapp:${process.env.TWILIO_WHATSAPP_FROM}`,
      to: `whatsapp:${options.to}`,
    });
    return { success: true, sid: result.sid };
  } catch (error) {
    console.error("[notifications] Failed to send WhatsApp:", error);
    return { success: false, error };
  }
}
