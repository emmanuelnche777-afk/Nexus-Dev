import { createHash, randomBytes } from "node:crypto";
import { decrypt, encrypt } from "@/lib/encryption";
import { escapeHtml, escapeHtmlWithBreaks } from "@/lib/email-html";
import { getPublicUrl } from "@/lib/urls";

export function createUnsubscribeToken() {
  const token = randomBytes(32).toString("hex");
  const tokenHash = createHash("sha256").update(token).digest("hex");
  return { token, tokenHash };
}

export function hashUnsubscribeToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function protectUnsubscribeToken(token: string): string {
  return encrypt(token);
}

export function revealUnsubscribeToken(encryptedToken: string): string {
  return decrypt(encryptedToken);
}

export function renderNewsletterHtml(subject: string, body: string, unsubscribeToken: string): string {
  const unsubscribeUrl = `${getPublicUrl()}/newsletter/unsubscribe/${encodeURIComponent(unsubscribeToken)}`;
  return `
    <div style="max-width:640px;margin:0 auto;padding:32px 20px;font-family:Arial,sans-serif;color:#14213d;line-height:1.6">
      <div style="border-bottom:3px solid #45afe1;padding-bottom:16px;margin-bottom:24px">
        <strong style="font-size:20px;letter-spacing:3px">NEXUS</strong>
      </div>
      <h1 style="font-size:24px;line-height:1.3">${escapeHtml(subject)}</h1>
      <div style="font-size:16px">${escapeHtmlWithBreaks(body)}</div>
      <hr style="border:0;border-top:1px solid #d9e2ec;margin:32px 0 16px" />
      <p style="font-size:12px;color:#64748b">You are receiving this email because you subscribed to NEXUS updates. <a href="${escapeHtml(unsubscribeUrl)}">Unsubscribe</a>.</p>
    </div>
  `;
}
