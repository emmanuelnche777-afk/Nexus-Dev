import { Resend } from "resend";

let resendClient: Resend | null = null;

function getResendClient() {
  if (!resendClient && process.env.RESEND_API_KEY) {
    resendClient = new Resend(process.env.RESEND_API_KEY);
  }
  return resendClient;
}

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
  replyTo?: string;
}

export async function sendEmail(options: EmailOptions) {
  const client = getResendClient();
  if (!client) {
    console.warn("[notifications] Resend not configured, skipping email:", options.subject);
    return { skipped: true, reason: "RESEND_API_KEY not configured" };
  }

  try {
    const result = await client.emails.send({
      from: options.from || process.env.EMAIL_FROM_ADDRESS || "onboarding@resend.dev",
      to: options.to,
      subject: options.subject,
      html: options.html,
      replyTo: options.replyTo,
    });

    if (result.error) {
      console.error("[notifications] Resend API error:", result.error);
      return { success: false, error: result.error };
    }

    return { success: true, id: result.data?.id };
  } catch (error) {
    console.error("[notifications] Failed to send email:", error);
    return { success: false, error };
  }
}
