import { PrismaClient } from "@prisma/client";
import { promises as fs } from "fs";
import path from "path";

const prisma = new PrismaClient();
const DATA_DIR = path.join(process.cwd(), "data");

async function migrate() {
  console.log("🚀 Starting data migration from JSON to Postgres...");

  // Migrating Students
  const students = JSON.parse(await fs.readFile(path.join(DATA_DIR, "academy-students.json"), "utf-8"));
  for (const s of students) {
    await prisma.student.upsert({
      where: { studentCode: s.studentCode },
      update: {
        fullName: s.fullName,
        email: s.email,
        phone: s.phone,
        programSlug: s.programSlug,
        status: s.status,
        paymentStatus: s.paymentStatus,
        createdAt: new Date(s.createdAt),
      },
      create: {
        id: s.id,
        studentCode: s.studentCode,
        fullName: s.fullName,
        email: s.email,
        phone: s.phone,
        programSlug: s.programSlug,
        status: s.status,
        paymentStatus: s.paymentStatus,
        createdAt: new Date(s.createdAt),
      },
    });
  }
  console.log(`✅ Migrated ${students.length} students`);

  // Migrating Registrations
  const regs = JSON.parse(await fs.readFile(path.join(DATA_DIR, "academy-registrations.json"), "utf-8"));
  for (const r of regs) {
    await prisma.registration.upsert({
      where: { id: r.id },
      update: {
        programSlug: r.programSlug,
        fullName: r.submittedData?.fullName || r.fullName || "Unknown",
        email: r.submittedData?.email || r.email || "Unknown",
        phone: r.submittedData?.phone || r.phone || "Unknown",
        status: r.status,
      },
      create: {
        id: r.id,
        programSlug: r.programSlug,
        fullName: r.submittedData?.fullName || r.fullName || "Unknown",
        email: r.submittedData?.email || r.email || "Unknown",
        phone: r.submittedData?.phone || r.phone || "Unknown",
        status: r.status,
      },
    });
  }
  console.log(`✅ Migrated ${regs.length} registrations`);

// Migrating Payments
  const payments = JSON.parse(await fs.readFile(path.join(DATA_DIR, "academy-payments.json"), "utf-8"));
  for (const p of payments) {
    await prisma.payment.upsert({
      where: { id: p.id },
      update: {
        studentId: p.studentId,
        registrationId: p.registrationId,
        studentCode: p.studentCode,
        amount: p.amount,
        currency: p.currency,
        status: p.status,
        method: p.method || "manual",
      },
      create: {
        id: p.id,
        studentId: p.studentId || "unknown", // Should be valid ideally
        registrationId: p.registrationId,
        studentCode: p.studentCode,
        amount: p.amount,
        currency: p.currency,
        status: p.status,
        method: p.method || "manual",
      },
    });
  }
  console.log(`✅ Migrated ${payments.length} payments`);

  await prisma.$disconnect();
  console.log("🏁 Migration complete!");
}

migrate().catch(console.error);
