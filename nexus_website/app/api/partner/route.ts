import { NextResponse } from "next/server";
import prisma from "@/lib/db";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function isBlank(v: unknown): boolean {
  return typeof v !== "string" || v.trim().length === 0;
}

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_body" }, { status: 400 });
  }

  const orgName = String(body.orgName ?? "").trim();
  const contactName = String(body.contactName ?? "").trim();
  const email = String(body.email ?? "").trim().toLowerCase();
  const orgType = String(body.orgType ?? "").trim();
  const website = String(body.website ?? "").trim();
  const interest = String(body.interest ?? "").trim();
  const message = String(body.message ?? "").trim();

  if (
    isBlank(orgName) ||
    isBlank(contactName) ||
    isBlank(email) ||
    isBlank(orgType) ||
    isBlank(interest) ||
    isBlank(message)
  ) {
    return NextResponse.json({ ok: false, error: "missing_fields" }, { status: 400 });
  }

  if (!EMAIL_RE.test(email) || email.length > 254) {
    return NextResponse.json({ ok: false, error: "invalid_email" }, { status: 400 });
  }

  try {
    const existing = await prisma.partnerInquiry.findFirst({
      where: { email },
    });

    if (existing) {
      return NextResponse.json({ ok: true, duplicate: true });
    }

    await prisma.partnerInquiry.create({
      data: {
        id: `pi-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        name: contactName,
        email,
        organization: orgName,
        type: orgType,
        website,
        interest,
        message,
        status: "new",
      },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Partner inquiry failed:", err);
    return NextResponse.json({ ok: false, error: "storage_failed" }, { status: 500 });
  }
}