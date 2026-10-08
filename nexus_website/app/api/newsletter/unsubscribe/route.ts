import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { hashUnsubscribeToken } from "@/lib/newsletter";
import { enforceOutboundRateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const limited = await enforceOutboundRateLimit(request, null, {
    scope: "newsletter-unsubscribe",
    ipLimit: 30,
    ipWindowMs: 60 * 60 * 1000,
  });
  if (limited) return limited;

  try {
    const body = await request.json();
    const token = typeof body?.token === "string" ? body.token : "";
    if (!/^[a-f0-9]{64}$/i.test(token)) {
      return NextResponse.json({ success: true });
    }

    const delivery = await prisma.newsletterDelivery.findUnique({
      where: { unsubscribeTokenHash: hashUnsubscribeToken(token) },
      select: { email: true },
    });
    if (delivery) {
      await prisma.newsletterSubscriber.updateMany({
        where: { email: delivery.email, status: "active" },
        data: { status: "unsubscribed" },
      });
    }

    // Return the same response for unknown tokens to prevent address discovery.
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[newsletter] Unsubscribe failed:", error);
    return NextResponse.json({ error: "Unable to process unsubscribe request." }, { status: 500 });
  }
}
