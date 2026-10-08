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

export async function sendSms(options: SmsOptions) {
  const client = getTwilioClient();
  if (!client) {
    console.warn("[notifications] Twilio not configured, skipping SMS:", options.to);
    return { skipped: true, reason: "Twilio credentials not configured" };
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
