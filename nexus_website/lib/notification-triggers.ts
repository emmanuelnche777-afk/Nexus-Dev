import { sendEmail, sendWhatsApp } from "@/lib/notifications";
import { CONTACT } from "@/lib/site";
import { escapeHtml } from "@/lib/email-html";

export type NotificationEvent =
  | "new_registration"
  | "academy_private_request"
  | "payment_verified"
  | "payment_requires_review"
  | "ai_escalation"
  | "partnership_request"
  | "new_service_request"
  | "newsletter_signup"
  | "blog_published"
  | "journey_published"
  // Join Us intake. These were previously fired as `new_registration`, which is
  // labelled "New Academy Registration" — so a volunteer application reached
  // staff as an Academy registration.
  | "new_pathway_inquiry"
  | "mentorship_application"
  | "new_opportunity_application"
  | "listing_published";

const EVENT_LABELS: Record<NotificationEvent, string> = {
  new_registration: "New Academy Registration",
  academy_private_request: "New Academy Private Training Request",
  payment_verified: "Payment Verified",
  payment_requires_review: "Payment Requires Review",
  ai_escalation: "AI Escalation",
  partnership_request: "New Partnership Request",
  new_service_request: "New Service Request",
  newsletter_signup: "Newsletter Signup",
  blog_published: "Blog Published",
  journey_published: "Journey Published",
  new_pathway_inquiry: "New Join Us Pathway Inquiry",
  mentorship_application: "New Mentee Application",
  new_opportunity_application: "New Opportunity Application",
  listing_published: "Opportunity Listing Published",
};

// Admin alert recipients (overridable via env, fall back to site values)
export function getAdminNotifyEmail(): string {
  return process.env.ADMIN_NOTIFY_EMAIL || CONTACT.email;
}

export function getAdminNotifyWhatsApp(): string {
  return process.env.ADMIN_NOTIFY_WHATSAPP || CONTACT.whatsapp;
}

export async function triggerNotification(
  event: NotificationEvent,
  data: {
    summary?: string;
    referenceId?: string;
    link?: string;
  }
) {
  const adminEmail = getAdminNotifyEmail();
  const subject = `NEXUS Alert: ${EVENT_LABELS[event]}`;
  const summary = data.summary || `Event: ${EVENT_LABELS[event]}`;

  const html = `
      <h2>${EVENT_LABELS[event]}</h2>
      <p><strong>Summary:</strong> ${escapeHtml(summary)}</p>
      ${data.referenceId ? `<p><strong>Reference:</strong> ${escapeHtml(data.referenceId)}</p>` : ""}
      ${data.link ? `<p><a href="${escapeHtml(data.link)}">View in admin panel</a></p>` : ""}
      <hr>
      <p><small>Sent automatically by NEXUS Admin System</small></p>
    `;

  try {
    await sendEmail({
      to: adminEmail,
      subject,
      html,
    });
  } catch (error) {
    console.error("Email notification failed:", error);
  }

  // WhatsApp alerts to the admin for operational events
  const whatsappEvents: NotificationEvent[] = [
    "new_registration",
    "academy_private_request",
    "payment_verified",
    "payment_requires_review",
    "ai_escalation",
    "partnership_request",
    "new_service_request",
    "new_pathway_inquiry",
    "mentorship_application",
    "new_opportunity_application",
    "listing_published",
  ];
  if (whatsappEvents.includes(event)) {
    try {
      await sendWhatsApp({
        to: getAdminNotifyWhatsApp(),
        body: `${EVENT_LABELS[event]} | ${summary}${data.referenceId ? ` | Ref: ${data.referenceId}` : ""}`,
      });
    } catch (error) {
      console.error("WhatsApp notification failed:", error);
    }
  }
}
