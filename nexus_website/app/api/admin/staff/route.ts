import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import crypto from "node:crypto";
import { prisma } from "@/lib/db";
import { sendEmail } from "@/lib/notifications";
import { requirePermission } from "@/lib/permissions-server";
import type { AdminRole } from "@/lib/permissions-server";
import { getAdminUrl } from "@/lib/urls";
import { escapeHtml } from "@/lib/email-html";
import { enforceActorRateLimit } from "@/lib/rate-limit";
import { ROLE_PERMISSIONS } from "@/lib/permissions-data";

const INVITE_TTL = 48 * 60 * 60 * 1000; // 48 hours

export async function GET() {
  const { user, authorized } = await requirePermission("staff:*");
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!authorized) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const staff = await prisma.adminUser.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        status: true,
        twoFactorEnabled: true,
        invitedAt: true,
        createdAt: true,
        updatedAt: true,
        passwordHash: true,
      },
    });

    const enriched = staff.map((s) => ({
      id: s.id,
      email: s.email,
      name: s.name,
      role: s.role,
      phone: s.phone,
      status: s.status,
      twoFactorEnabled: s.twoFactorEnabled,
      invitedAt: s.invitedAt,
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
      hasAcceptedInvite: s.passwordHash !== null,
    }));

    return NextResponse.json({ staff: enriched });
  } catch (error) {
    console.error("[staff] List error:", error);
    return NextResponse.json({ error: "Failed to list staff" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const { user, authorized } = await requirePermission("staff:*");
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!authorized) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const rateLimit = await enforceActorRateLimit(user.id, "staff-invitations", 10, 24 * 60 * 60 * 1000);
  if (rateLimit) return rateLimit;

  try {
    const body = await request.json();
    const { name, email, phone, role } = body as {
      name: string;
      email: string;
      phone: string;
      role: string;
    };

    if (!name || !email || !phone || !role) {
      return NextResponse.json({ error: "Name, email, phone, and role are required" }, { status: 400 });
    }

    if (role === "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Cannot create a Super Admin account through this endpoint" },
        { status: 400 }
      );
    }

    if (!Object.hasOwn(ROLE_PERMISSIONS, role)) {
      return NextResponse.json({ error: "Select a valid staff role" }, { status: 400 });
    }

    const existing = await prisma.adminUser.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 });
    }

    const inviteToken = crypto.randomBytes(32).toString("hex");
     const invitedTokenHash = crypto.createHash("sha256").update(inviteToken).digest("hex");
    const expiresAt = new Date(Date.now() + INVITE_TTL);

    const newStaff = await prisma.adminUser.create({
      data: {
        email,
        name,
        role: role as AdminRole,
        phone,
        status: "ACTIVE",
        active: true,
        invitedAt: new Date(),
        invitedTokenHash,
        invitedTokenExpiresAt: expiresAt,
        createdBy: user.id,
        passwordHash: null,
      },
    });

    const baseUrl = getAdminUrl();
    const inviteLink = `${baseUrl}/admin/accept-invite?token=${inviteToken}`;

    const emailResult = await sendEmail({
      to: email,
      subject: "NEXUS Admin — You've been invited to join",
      html: `
        <p>Hello ${escapeHtml(name)},</p>
        <p>You have been invited to join the NEXUS Admin Platform as a ${escapeHtml(role)}.</p>
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
      id: newStaff.id,
      email: newStaff.email,
      invited: true,
    }, { status: 201 });
  } catch (error) {
    console.error("[staff] Create error:", error);
    return NextResponse.json({ error: "Failed to create staff account" }, { status: 500 });
  }
}
