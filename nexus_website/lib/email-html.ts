export function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function escapeHtmlWithBreaks(value: unknown): string {
  return escapeHtml(value).replace(/\r?\n/g, "<br />");
}

export function safeEmailSubject(value: unknown, maxLength = 180): string {
  return String(value ?? "").replace(/[\r\n\t\u0000-\u001f\u007f]+/g, " ").trim().slice(0, maxLength);
}
