import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const { email, studentCode } = await request.json();

    if (!email || !studentCode) {
      return NextResponse.json({ error: "Email and student code are required" }, { status: 400 });
    }

    if (typeof email !== "string" || typeof studentCode !== "string") {
      return NextResponse.json({ error: "Email and student code are required" }, { status: 400 });
    }

    const student = await prisma.student.findFirst({
      where: {
        status: "Active",
        paymentStatus: "Paid",
        studentCode: { equals: studentCode.toUpperCase() },
        OR: [
          { email: { equals: email.toLowerCase(), mode: "insensitive" } },
          { phone: email },
        ],
      },
      select: {
        studentCode: true,
        fullName: true,
        programSlug: true,
        program: { select: { title: true } },
      },
    });

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    return NextResponse.json({
      student: {
        studentCode: student.studentCode,
        fullName: student.fullName,
        programTitle: student.program?.title || student.programSlug,
        enrollmentValid: true,
      },
    });
  } catch (error) {
    console.error("Verification failed:", error);
    return NextResponse.json({ error: "Failed to verify" }, { status: 500 });
  }
}
