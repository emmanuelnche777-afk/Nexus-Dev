export function validateEnv() {
  const missing: string[] = [];

  const gmailReady = [
    process.env.GMAIL_CLIENT_ID,
    process.env.GMAIL_CLIENT_SECRET,
    process.env.GMAIL_REFRESH_TOKEN,
    process.env.GMAIL_USER,
  ].every(Boolean);
  if (!gmailReady && !process.env.RESEND_API_KEY) {
    missing.push("Gmail OAuth credentials or RESEND_API_KEY");
  }

  return {
    valid: missing.length === 0,
    missing,
  };
}
