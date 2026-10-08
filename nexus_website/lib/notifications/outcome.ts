/**
 * Delivery outcome reporting for admin "respond" actions.
 *
 * The notification helpers return a discriminated result rather than throwing,
 * so a channel can be skipped (no credentials) or fail without the caller
 * noticing. Reporting intent ("we had a phone number, so assume WhatsApp went
 * out") would be wrong — these helpers report what actually happened.
 */

export type NotificationResult =
  | { success?: boolean; skipped?: boolean; reason?: string }
  | Record<string, unknown>
  | null
  | undefined;

function delivered(result: NotificationResult): boolean {
  if (!result) return false;
  return result.success === true;
}

function skipped(result: NotificationResult): boolean {
  return Boolean(result && result.skipped === true);
}

export function describeDelivery(
  emailResult: NotificationResult,
  whatsappResult: NotificationResult,
  whatsappAttempted: boolean
): string {
  const parts: string[] = [];

  if (delivered(emailResult)) {
    parts.push("email sent");
  } else if (skipped(emailResult)) {
    parts.push("email skipped (not configured)");
  } else {
    parts.push("email failed");
  }

  if (!whatsappAttempted) {
    parts.push("no phone number, email only");
  } else if (delivered(whatsappResult)) {
    parts.push("WhatsApp sent");
  } else if (skipped(whatsappResult)) {
    parts.push("WhatsApp skipped (not configured)");
  } else {
    parts.push("WhatsApp failed");
  }

  return `Response recorded (${parts.join(", ")}).`;
}