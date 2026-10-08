/**
 * Local/server recovery script only — not imported by any web route, page, or API file.
 * Usage: npx tsx scripts/reset-super-admin.ts
 *
 * Provides emergency recovery for the Super Admin account:
 *   - Reset password (hashed with bcrypt, cost 12, same as the rest of the app)
 *   - Disable 2FA and clear backup codes
 *   - Delete all of the user's sessions
 *
 * The script prompts in the terminal and asks for confirmation before making changes.
 * Nothing sensitive is printed to the terminal.
 */
import * as readline from "node:readline";
import * as process from "node:process";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";

const BCRYPT_COST = 12;

function rlQuestion(query: string): Promise<string> {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => rl.question(query, (ans) => { rl.close(); resolve(ans); }));
}

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_COST);
}

async function main() {
  const email = await rlQuestion("Enter the Super Admin email: ");
  if (!email || !email.includes("@")) {
    console.error("Invalid email. Aborting.");
    process.exit(1);
  }

  const confirm = await rlQuestion(`Proceed with recovery for "${email}"? Type YES to confirm: `);
  if (confirm.trim() !== "YES") {
    console.log("Aborted.");
    process.exit(0);
  }

  const admin = await prisma.adminUser.findUnique({
    where: { email, deletedAt: null },
  });

  if (!admin) {
    console.error("No active Super Admin account found with that email. Done.");
    process.exit(1);
  }

  if (admin.role !== "SUPER_ADMIN") {
    console.error("That account is not a Super Admin. Aborting.");
    process.exit(1);
  }

  console.log(`Found Super Admin: ${admin.name} <${admin.email}>`);

  const wantPassword = await rlQuestion("Reset password? (y/N): ");
  if (wantPassword.trim().toLowerCase() === "y") {
    const password = await rlQuestion("Enter new password (min 10 chars): ");
    if (password.length < 10) {
      console.error("Password too short. Aborting password reset.");
    } else {
      const passwordConfirm = await rlQuestion("Confirm new password: ");
      if (password !== passwordConfirm) {
        console.error("Passwords do not match. Aborting password reset.");
      } else {
        const passwordHash = await hashPassword(password);
        await prisma.adminUser.update({
          where: { id: admin.id },
          data: { passwordHash },
        });
        console.log("Password reset successfully.");
      }
    }
  }

  const want2fa = await rlQuestion("Disable 2FA and clear backup codes? (y/N): ");
  if (want2fa.trim().toLowerCase() === "y") {
    await prisma.adminUser.update({
      where: { id: admin.id },
      data: {
        twoFactorEnabled: false,
        twoFactorSecret: null,
        backupCodes: "[]",
      },
    });
    console.log("2FA disabled and backup codes cleared.");
  }

  await prisma.adminSession.deleteMany({ where: { userId: admin.id } });
  console.log(`Sessions deleted for user ${admin.id}.`);

  console.log("Recovery complete.");
  process.exit(0);
}

main()
  .catch((err) => {
    console.error("An error occurred:", err);
    process.exit(1);
  });
