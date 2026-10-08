import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET() {
  try {
    const programs = await prisma.program.findMany({
      where: { status: "active" },
      orderBy: { title: "asc" },
    });
    return NextResponse.json({ programs });
  } catch {
    return NextResponse.json({ programs: [] });
  }
}