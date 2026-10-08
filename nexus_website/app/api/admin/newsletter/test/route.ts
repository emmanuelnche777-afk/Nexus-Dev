import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/permissions-server";
import { enforceActorRateLimit } from "@/lib/rate-limit";
import { sendEmail } from "@/lib/notifications";
import { escapeHtml, escapeHtmlWithBreaks, safeEmailSubject } from "@/lib/email-html";

const MAX_SUBJECT_LENGTH = 150;
const MAX_BODY_LENGTH = 20_000;

export async function POST(request: Request) {
  const { user, authorized } = await requirePermission("newsletter:send");
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!authorized) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json({ error: "Email delivery is not configured." }, { status: 503 });
  }

  const limited = await enforceActorRateLimit(user.id, "newsletter-test-sends", 5, 60 * 60 * 1000);
  if (limited) return limited;

  try {
    const body = await request.json();
    const subject = safeEmailSubject(body?.subject, MAX_SUBJECT_LENGTH);
    const message = typeof body?.body === "string" ? body.body.trim() : "";
    if (!subject || !message) {
      return NextResponse.json({ error: "A subject and message are required." }, { status: 400 });
    }
    if (message.length > MAX_BODY_LENGTH) {
      return NextResponse.json({ error: `Message must be ${MAX_BODY_LENGTH.toLocaleString()} characters or fewer.` }, { status: 400 });
    }

    // The only recipient is the authenticated staff member. This endpoint never
    // reads the subscriber list or creates campaign delivery records.
    const result = await sendEmail({
      to: user.email,
      subject: `[TEST] ${subject}`,
      html: `
        <div style="max-width:640px;margin:0 auto;padding:32px 20px;font-family:Arial,sans-serif;color:#14213d;line-height:1.6">
          <p style="padding:12px;background:#fff7ed;color:#9a3412;font-weight:bold">TEST EMAIL — sent only to your signed-in staff address. No subscribers were emailed.</p>
          <h1 style="font-size:24px;line-height:1.3">${escapeHtml(subject)}</h1>
          <div style="font-size:16px">${escapeHtmlWithBreaks(message)}</div>
        </div>
      `,
    });

    if (!("success" in result) || !result.success) {
      return NextResponse.json({ error: "The email provider did not accept the test message." }, { status: 502 });
    }

    return NextResponse.json({ success: true, sentTo: user.email, providerMessageId: result.id ?? null });
  } catch (error) {
    console.error("[newsletter] Test email failed:", error);
    return NextResponse.json({ error: "Failed to send test email." }, { status: 500 });
  }
}
