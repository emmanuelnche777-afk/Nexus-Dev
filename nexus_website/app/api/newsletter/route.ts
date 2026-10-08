import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { triggerNotification } from "@/lib/notification-triggers";
import { enforceOutboundRateLimit } from "@/lib/rate-limit";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function POST(req: Request) {
  let email: string;
  try {
    const body = await req.json();
    email = String(body?.email ?? "").trim().toLowerCase();
  } catch {
    return NextResponse.json(
      { ok: false, error: "invalid_body" },
      { status: 400 }
    );
  }

  if (!EMAIL_RE.test(email) || email.length > 254) {
    return NextResponse.json(
      { ok: false, error: "invalid_email" },
      { status: 400 }
    );
  }

  const limited = await enforceOutboundRateLimit(req, email, {
    ipLimit: 15,
    recipientLimit: 2,
  });
  if (limited) return limited;

  try {
    const existing = await prisma.newsletterSubscriber.findUnique({
      where: { email },
    });

    if (existing) {
      return NextResponse.json({ ok: true, duplicate: true });
    }

    await prisma.newsletterSubscriber.create({
      data: {
        id: `nl-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        email,
        status: "active",
        source: "footer",
      },
    });

    await triggerNotification("newsletter_signup", {
      summary: `New newsletter subscriber: ${email}`,
      referenceId: email,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Newsletter subscribe failed:", err);
    return NextResponse.json(
      { ok: false, error: "storage_failed" },
      { status: 500 }
    );
  }
}
