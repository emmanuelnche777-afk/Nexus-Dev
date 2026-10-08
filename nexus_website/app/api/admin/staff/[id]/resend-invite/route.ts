import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import crypto from "node:crypto";
import { prisma } from "@/lib/db";
import { sendEmail } from "@/lib/notifications";
import { requirePermission } from "@/lib/permissions-server";
import { getAdminUrl } from "@/lib/urls";
import { escapeHtml } from "@/lib/email-html";
import { enforceActorRateLimit } from "@/lib/rate-limit";

const INVITE_TTL = 48 * 60 * 60 * 1000; // 48 hours

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { user, authorized } = await requirePermission("staff:*");
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!authorized) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const rateLimit = await enforceActorRateLimit(user.id, "staff-invite-resends", 10, 24 * 60 * 60 * 1000);
  if (rateLimit) return rateLimit;

  const { id } = await params;

  try {
    const staff = await prisma.adminUser.findUnique({
      where: { id, deletedAt: null },
    });

    if (!staff) {
      return NextResponse.json({ error: "Staff member not found" }, { status: 404 });
    }

    const inviteToken = crypto.randomBytes(32).toString("hex");
    const invitedTokenHash = crypto.createHash("sha256").update(inviteToken).digest("hex");
    const expiresAt = new Date(Date.now() + INVITE_TTL);

    await prisma.adminUser.update({
      where: { id },
      data: {
        invitedAt: new Date(),
        invitedTokenHash,
        invitedTokenExpiresAt: expiresAt,
        createdBy: user.id,
      },
    });

    const baseUrl = getAdminUrl();
    const inviteLink = `${baseUrl}/admin/accept-invite?token=${inviteToken}`;

    const emailResult = await sendEmail({
      to: staff.email,
      subject: "NEXUS Admin — You've been invited to join",
      html: `
        <p>Hello ${escapeHtml(staff.name)},</p>
        <p>You have been invited to join the NEXUS Admin Platform as a ${escapeHtml(staff.role)}.</p>
        <p><a href="${inviteLink}">Click here to set up your password</a></p>
        <p>This invitation link expires in 48 hours.</p>
        <p>If you did not expect this invitation, you can safely ignore this email.</p>
        <p>— NEXUS Admin Team</p>
      `,
    });

    if (emailResult?.skipped && process.env.NODE_ENV !== "production") {
      console.info("[dev] Staff invite link (email skipped):", inviteLink);
    }

    if (!emailResult?.success && process.env.NODE_ENV !== "production") {
      console.warn("[dev] Staff invite email failed — use this link manually:", inviteLink);
    }

    return NextResponse.json({
      success: true,
      email: staff.email,
      invited: true,
    });
  } catch (error) {
    console.error("[staff/resend-invite] Error:", error);
    return NextResponse.json({ error: "Failed to resend invitation" }, { status: 500 });
  }
}
