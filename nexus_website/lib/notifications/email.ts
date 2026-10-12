import { Resend } from "resend";

let resendClient: Resend | null = null;
let cachedGmailToken: { value: string; expiresAt: number } | null = null;

const GMAIL_ENV_KEYS = [
  "GMAIL_CLIENT_ID",
  "GMAIL_CLIENT_SECRET",
  "GMAIL_REFRESH_TOKEN",
  "GMAIL_USER",
] as const;

function gmailIsConfigured() {
  return GMAIL_ENV_KEYS.every((key) => Boolean(process.env[key]?.trim()));
}

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

export interface EmailDeliveryResult {
  [key: string]: unknown;
  success?: boolean;
  skipped?: boolean;
  reason?: string;
  error?: unknown;
  id?: string;
  provider?: "gmail" | "resend";
}

export function getEmailProviderStatus() {
  const gmailConfigured = gmailIsConfigured();
  const resendConfigured = Boolean(process.env.RESEND_API_KEY);
  const provider = gmailConfigured ? "gmail" : resendConfigured ? "resend" : null;

  return {
    configured: provider !== null,
    provider,
    gmailConfigured,
    resendConfigured,
    from: provider === "gmail"
      ? process.env.GMAIL_USER || ""
      : process.env.EMAIL_FROM_ADDRESS || process.env.RESEND_FROM || "onboarding@resend.dev",
  } as const;
}

export function isEmailConfigured() {
  return getEmailProviderStatus().configured;
}

function safeHeader(value: string) {
  return value.replace(/[\r\n]+/g, " ").trim();
}

async function getGmailAccessToken() {
  if (cachedGmailToken && cachedGmailToken.expiresAt > Date.now() + 60_000) {
    return cachedGmailToken.value;
  }

  const form = new URLSearchParams({
    client_id: process.env.GMAIL_CLIENT_ID!,
    client_secret: process.env.GMAIL_CLIENT_SECRET!,
    refresh_token: process.env.GMAIL_REFRESH_TOKEN!,
    grant_type: "refresh_token",
  });
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: form,
    cache: "no-store",
    signal: AbortSignal.timeout(15_000),
  });
  const payload = await response.json().catch(() => null) as {
    access_token?: unknown;
    expires_in?: unknown;
    error_description?: unknown;
  } | null;

  if (!response.ok || typeof payload?.access_token !== "string") {
    const reason = typeof payload?.error_description === "string"
      ? payload.error_description
      : `Google OAuth token request failed (${response.status})`;
    throw new Error(reason);
  }

  const expiresIn = typeof payload.expires_in === "number" ? payload.expires_in : 3600;
  cachedGmailToken = { value: payload.access_token, expiresAt: Date.now() + expiresIn * 1000 };
  return payload.access_token;
}

function encodeGmailMessage(options: EmailOptions) {
  const gmailUser = safeHeader(process.env.GMAIL_USER || "");
  if (!gmailUser || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(gmailUser)) {
    throw new Error("GMAIL_USER must be a valid Gmail address");
  }
  const to = safeHeader(options.to);
  if (!to || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
    throw new Error("A valid email recipient is required");
  }

  const fromName = safeHeader(process.env.GMAIL_FROM_NAME || "NEXUS").replace(/[\\\"]+/g, "");
  const subject = `=?UTF-8?B?${Buffer.from(safeHeader(options.subject), "utf8").toString("base64")}?=`;
  const replyTo = options.replyTo ? `Reply-To: ${safeHeader(options.replyTo)}` : "";
  const htmlBody = Buffer.from(options.html, "utf8").toString("base64").replace(/.{1,76}/g, "$&\r\n");
  const mime = [
    `From: "${fromName}" <${gmailUser}>`,
    `To: ${to}`,
    `Subject: ${subject}`,
    ...(replyTo ? [replyTo] : []),
    "MIME-Version: 1.0",
    "Content-Type: text/html; charset=UTF-8",
    "Content-Transfer-Encoding: base64",
  ].join("\r\n") + `\r\n\r\n${htmlBody}`;

  return Buffer.from(mime, "utf8").toString("base64url");
}

async function sendGmail(options: EmailOptions): Promise<EmailDeliveryResult> {
  const accessToken = await getGmailAccessToken();
  const raw = encodeGmailMessage(options);
  const response = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages/send", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ raw }),
    cache: "no-store",
    signal: AbortSignal.timeout(20_000),
  });
  const payload = await response.json().catch(() => null) as {
    id?: unknown;
    error?: { message?: unknown };
  } | null;

  if (!response.ok) {
    const reason = typeof payload?.error?.message === "string"
      ? payload.error.message
      : `Gmail send failed (${response.status})`;
    throw new Error(reason);
  }

  return { success: true as const, id: typeof payload?.id === "string" ? payload.id : undefined, provider: "gmail" as const };
}

export async function sendEmail(options: EmailOptions): Promise<EmailDeliveryResult> {
  const status = getEmailProviderStatus();
  if (!status.configured) {
    console.warn("[notifications] No email provider configured; skipping email:", options.subject);
    return { skipped: true as const, reason: "Configure Gmail OAuth or RESEND_API_KEY to send email" };
  }

  try {
    if (status.provider === "gmail") return await sendGmail(options);

    const client = getResendClient();
    if (!client) return { skipped: true as const, reason: "RESEND_API_KEY not configured" };
    const result = await client.emails.send({
      from: options.from || process.env.EMAIL_FROM_ADDRESS || process.env.RESEND_FROM || "onboarding@resend.dev",
      to: options.to,
      subject: options.subject,
      html: options.html,
      replyTo: options.replyTo,
    });

    if (result.error) {
      console.error("[notifications] Resend API error:", result.error);
      return { success: false as const, error: result.error, provider: "resend" as const };
    }

    return { success: true as const, id: result.data?.id, provider: "resend" as const };
  } catch (error) {
    console.error(`[notifications] ${status.provider} email failed:`, error);
    return { success: false as const, error, provider: status.provider ?? undefined };
  }
}
