import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/permissions-server";

export async function GET() {
  const { user, authorized } = await requirePermission("*");
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!authorized) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const resendConfigured = !!process.env.RESEND_API_KEY;
  const twilioCredentialsConfigured = !!(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN);
  const smsConfigured = twilioCredentialsConfigured && !!process.env.TWILIO_PHONE_NUMBER;
  const whatsappConfigured = twilioCredentialsConfigured && !!process.env.TWILIO_WHATSAPP_FROM;

  return NextResponse.json({
    providers: {
      resend: {
        configured: resendConfigured,
        from: process.env.EMAIL_FROM_ADDRESS || "onboarding@resend.dev",
      },
      twilio: {
        configured: twilioCredentialsConfigured,
        smsConfigured,
        whatsappConfigured,
        phone: process.env.TWILIO_PHONE_NUMBER || "",
        whatsapp: process.env.TWILIO_WHATSAPP_FROM || "",
      },
    },
  });
}
