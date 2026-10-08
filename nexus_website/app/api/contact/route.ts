import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { sendEmail } from "@/lib/notifications";
import { getAdminUrl } from "@/lib/urls";
import { enforceOutboundRateLimit } from "@/lib/rate-limit";
import { escapeHtml, escapeHtmlWithBreaks, safeEmailSubject } from "@/lib/email-html";
import {
  CONTACT_DEPARTMENT_LABELS,
  getContactDepartmentRoles,
  isContactDepartment,
} from "@/lib/contact-routing";

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();

    if (!data.name || typeof data.name !== "string" || data.name.trim().length < 2) {
      return NextResponse.json({ error: "Name must be at least 2 characters" }, { status: 400 });
    }
    if (data.name.length > 100) {
      return NextResponse.json({ error: "Name must be less than 100 characters" }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!data.email || !emailRegex.test(data.email)) {
      return NextResponse.json({ error: "Valid email is required" }, { status: 400 });
    }

    if (!data.message || typeof data.message !== "string" || data.message.trim().length < 10) {
      return NextResponse.json({ error: "Message must be at least 10 characters" }, { status: 400 });
    }
    if (data.message.length > 2000) {
      return NextResponse.json({ error: "Message must be less than 2000 characters" }, { status: 400 });
    }

    const department = data.department === undefined ? "general" : data.department;
    if (!isContactDepartment(department)) {
      return NextResponse.json({ error: "Choose a valid team." }, { status: 400 });
    }

    const limited = await enforceOutboundRateLimit(req, String(data.email).trim().toLowerCase());
    if (limited) return limited;

    const message = await prisma.contactMessage.create({
      data: {
        id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        name: data.name.trim(),
        email: data.email.trim().toLowerCase(),
        phone: data.phone?.trim() || "",
        department,
        subject: data.subject?.trim() || "General Inquiry",
        message: data.message.trim(),
        status: "new",
        source: "contact-form",
      },
    });

    const recipients = await prisma.adminUser.findMany({
      where: {
        role: { in: [...getContactDepartmentRoles(department)] },
        status: "ACTIVE",
        deletedAt: null,
      },
      select: { email: true },
    });

    if (recipients.length === 0) {
      console.error(`[contact] No active admin recipient for department ${department}; message ${message.id} remains in the inbox`);
    }

    for (const recipient of recipients) {
      await sendEmail({
        to: recipient.email,
        subject: safeEmailSubject(`NEXUS ${CONTACT_DEPARTMENT_LABELS[department]} inquiry: ${message.subject}`, 180),
        html: `
          <h2>New ${escapeHtml(CONTACT_DEPARTMENT_LABELS[department])} Contact Inquiry</h2>
          <p><strong>Name:</strong> ${escapeHtml(message.name)}</p>
          <p><strong>Email:</strong> ${escapeHtml(message.email)}</p>
          ${message.phone ? `<p><strong>Phone:</strong> ${escapeHtml(message.phone)}</p>` : ""}
          <p><strong>Subject:</strong> ${escapeHtml(message.subject)}</p>
          <p><strong>Message:</strong></p>
          <p>${escapeHtmlWithBreaks(message.message)}</p>
          <hr>
          <p><a href="${getAdminUrl()}/admin/contact-inquiries">Open the Contact Inbox</a></p>
        `,
      });
    }

    return NextResponse.json({ ok: true, id: message.id });
  } catch (err) {
    console.error("Contact form submission error:", err);
    return NextResponse.json({ error: "Failed to submit message" }, { status: 500 });
  }
}
