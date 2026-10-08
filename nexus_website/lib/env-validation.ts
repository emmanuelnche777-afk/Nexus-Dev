export function validateEnv() {
  const missing: string[] = [];

  if (!process.env.RESEND_API_KEY) {
    missing.push("RESEND_API_KEY");
  }
  if (!process.env.TWILIO_ACCOUNT_SID) {
    missing.push("TWILIO_ACCOUNT_SID");
  }
  if (!process.env.TWILIO_AUTH_TOKEN) {
    missing.push("TWILIO_AUTH_TOKEN");
  }
  if (!process.env.TWILIO_WHATSAPP_FROM) {
    missing.push("TWILIO_WHATSAPP_FROM");
  }

  return {
    valid: missing.length === 0,
    missing,
  };
}
