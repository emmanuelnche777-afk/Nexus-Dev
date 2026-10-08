import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { sendEmail } from "@/lib/notifications";
import {
  triggerNotification,
  getAdminNotifyEmail,
} from "@/lib/notification-triggers";
import { getAdminUrl } from "@/lib/urls";
import { enforceOutboundRateLimit } from "@/lib/rate-limit";
import { escapeHtml, escapeHtmlWithBreaks, safeEmailSubject } from "@/lib/email-html";

export async function POST(req: Request) {
  try {
    const data = await req.json();

    // Basic validation
    const name = String(data.name || data.clientName || "").trim();
    const email = String(data.email || data.clientEmail || "").trim();
    const phone = String(data.phone || data.clientPhone || "").trim();
    const description = String(
      data.description || data.message || data.projectDetails || ""
    ).trim();

    if (!name || name.length < 2) {
      return NextResponse.json({ ok: false, error: "Name is required" }, { status: 400 });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return NextResponse.json({ ok: false, error: "Valid email is required" }, { status: 400 });
    }
    if (!description || description.length < 10) {
      return NextResponse.json(
        { ok: false, error: "Please describe your project (minimum 10 characters)" },
        { status: 400 }
      );
    }
    const limited = await enforceOutboundRateLimit(req, email.toLowerCase());
    if (limited) return limited;

    const order = await prisma.serviceOrder.create({
      data: {
        serviceType: data.serviceType || "General Inquiry",
        serviceTypeKey: data.serviceTypeKey || "general",
        clientName: name,
        clientEmail: email,
        clientPhone: phone,
        company: data.company || "",
        description,
        budget: data.budget || "",
        timeline: data.timeline || "",
        desiredTimeline: data.desiredTimeline || "",
        source: data.source || "web",
        status: "new",
        priority: "medium",
      },
    });

    const detailLines = [
      `Name: ${escapeHtml(order.clientName)}`,
      `Email: ${escapeHtml(order.clientEmail)}`,
      order.clientPhone ? `Phone: ${escapeHtml(order.clientPhone)}` : "",
      order.company ? `Company: ${escapeHtml(order.company)}` : "",
      `Service: ${escapeHtml(order.serviceType)}`,
      order.desiredTimeline
        ? `Desired timeline: ${escapeHtml(order.desiredTimeline)}`
        : "",
      ``,
      `Project details:`,
      escapeHtmlWithBreaks(order.description),
    ].join("<br>");

    await sendEmail({
      to: getAdminNotifyEmail(),
      subject: safeEmailSubject(`New Service Order: ${order.serviceType}`),
      html: `
        <h2>New Service Order Received</h2>
        <p><strong>Order ID:</strong> ${escapeHtml(order.id)}</p>
        <p>${detailLines}</p>
        <hr>
        <p><a href="${getAdminUrl()}/admin/tech-hub/orders">View in admin panel</a></p>
      `,
    });

    await triggerNotification("new_service_request", {
      summary: `${order.clientName} ordered "${order.serviceType}"`,
      referenceId: order.id,
       link: "/admin/tech-hub/orders",
    });

    return NextResponse.json({ ok: true, id: order.id }, { status: 201 });
  } catch (error) {
    console.error("Service order submission error:", error);
    return NextResponse.json({ ok: false, error: "Failed to submit order" }, { status: 500 });
  }
}
