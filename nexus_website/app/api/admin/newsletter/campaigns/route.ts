import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { requirePermission } from "@/lib/permissions-server";
import { enforceActorRateLimit } from "@/lib/rate-limit";
import { safeEmailSubject } from "@/lib/email-html";

const MAX_SUBJECT_LENGTH = 150;
const MAX_BODY_LENGTH = 20_000;

export async function POST(request: Request) {
  const { user, authorized } = await requirePermission("newsletter:manage");
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!authorized) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const limited = await enforceActorRateLimit(user.id, "newsletter-drafts", 20, 60 * 60 * 1000);
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

    const campaign = await prisma.newsletterCampaign.create({
      data: { subject, body: message, createdById: user.id },
      select: { id: true, subject: true, status: true, createdAt: true },
    });
    return NextResponse.json({ campaign }, { status: 201 });
  } catch (error) {
    console.error("[newsletter] Failed to create campaign:", error);
    return NextResponse.json({ error: "Failed to save newsletter campaign." }, { status: 500 });
  }
}
