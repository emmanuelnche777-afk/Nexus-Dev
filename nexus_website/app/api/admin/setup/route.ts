import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { hashPassword, createSessionWithExpiry } from "@/lib/admin-auth";
import type { SafeAdminUser } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";
import { escapeHtml } from "@/lib/email-html";
import { AdminRole } from "@prisma/client";
import { sendEmail } from "@/lib/notifications";
import { checkOrigin } from "@/lib/csrf";
import { enforceOutboundRateLimit } from "@/lib/rate-limit";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^\+?[1-9]\d{1,14}$/;
const SETUP_LOCK_KEY = 1337;

const DB_ERROR_CODES = new Set(["P1000", "P1001", "P1002", "P1012"]);

function isDatabaseUnavailable(error: unknown): boolean {
  if (error instanceof Error) {
    if (error.name === "PrismaClientInitializationError") return true;
    if ("code" in error && typeof (error as { code: unknown }).code === "string" && DB_ERROR_CODES.has((error as { code: string }).code)) {
      return true;
    }
  }
  return false;
}

export async function GET() {
  try {
    const anyAdminExists = await prisma.adminUser.count();
    return NextResponse.json({ setupRequired: anyAdminExists === 0 });
  } catch {
    return NextResponse.json(
      { error: "Database unavailable, check server configuration" },
      { status: 503 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const origin = request.headers.get("origin");
    if (!checkOrigin(origin)) {
      return NextResponse.json(
        { error: "Origin not allowed" },
        { status: 403 }
      );
    }

    const anyAdminExists = await prisma.adminUser.count();

    if (anyAdminExists > 0) {
      return NextResponse.json(
        { error: "Setup has already been completed" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { fullName, email, phone, password, confirmPassword } = body as {
      fullName: string;
      email: string;
      phone: string;
      password: string;
      confirmPassword: string;
    };

    if (!fullName || typeof fullName !== "string" || fullName.trim().length < 2) {
      return NextResponse.json(
        { error: "Full name must be at least 2 characters" },
        { status: 400 }
      );
    }

    if (!email || !EMAIL_REGEX.test(email)) {
      return NextResponse.json(
        { error: "Valid email is required" },
        { status: 400 }
      );
    }
    if (email.length > 254) {
      return NextResponse.json({ error: "Email must be 254 characters or fewer" }, { status: 400 });
    }

    if (!phone || !PHONE_REGEX.test(phone)) {
      return NextResponse.json(
        { error: "Valid phone number is required (E.164 format)" },
        { status: 400 }
      );
    }

    if (!password || typeof password !== "string" || password.length < 10) {
      return NextResponse.json(
        { error: "Password must be at least 10 characters" },
        { status: 400 }
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: "Passwords do not match" },
        { status: 400 }
      );
    }

    const limited = await enforceOutboundRateLimit(request, email, {
      scope: "admin-initial-setup",
      ipLimit: 5,
      ipWindowMs: 24 * 60 * 60 * 1000,
      recipientLimit: 3,
      recipientWindowMs: 24 * 60 * 60 * 1000,
    });
    if (limited) return limited;

    const ip = request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip") ||
      "unknown";

    const passwordHash = await hashPassword(password);

    const result = await prisma.$transaction(async (tx) => {
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(${SETUP_LOCK_KEY}::bigint)`;

      const count = await tx.adminUser.count();

      if (count > 0) {
        return null;
      }

      const newUser = await tx.adminUser.create({
        data: {
          email: email.toLowerCase(),
          name: fullName.trim(),
          role: AdminRole.SUPER_ADMIN,
          phone,
          passwordHash,
          status: "ACTIVE",
          active: true,
          bootstrappedFromIp: ip,
          bootstrappedAt: new Date(),
        },
      });

      return newUser;
    });

    if (!result) {
      return NextResponse.json(
        { error: "An admin account was created simultaneously. Use login instead." },
        { status: 409 }
      );
    }

    void sendEmail({
      to: email.toLowerCase(),
      subject: "NEXUS Admin Access Ready",
      html: `
        <h2>Admin Setup Complete</h2>
        <p>Hello ${escapeHtml(fullName.trim())},</p>
        <p>You have been set up as the Super Admin for the NEXUS admin panel.</p>
        <p>You are now logged in. You can manage your account, 2FA settings, and staff from the admin dashboard.</p>
        <hr>
        <p><small>NEXUS Admin System</small></p>
      `,
    }).catch((err: unknown) => {
      console.error("[setup] Welcome email failed:", err);
    });

    const user: SafeAdminUser = {
      id: result.id,
      email: result.email,
      name: result.name,
      role: result.role as unknown as SafeAdminUser["role"],
      phone: result.phone,
    };

    await createSessionWithExpiry(user, ip, request.headers.get("user-agent") || undefined, false);

    return NextResponse.json({
      success: true,
      redirectTo: "/admin/dashboard",
    });
  } catch (error: unknown) {
    if (isDatabaseUnavailable(error)) {
      console.error("[setup] Database unavailable:", error);
      return NextResponse.json(
        { error: "Database unavailable, check server configuration" },
        { status: 503 }
      );
    }
    if (error instanceof Error && "code" in error && (error as { code: unknown }).code === "P2002") {
      return NextResponse.json(
        { error: "An admin account with this email already exists" },
        { status: 409 }
      );
    }
    console.error("[setup] Error:", error);
    return NextResponse.json(
      { error: "Failed to create admin account" },
      { status: 500 }
    );
  }
}
