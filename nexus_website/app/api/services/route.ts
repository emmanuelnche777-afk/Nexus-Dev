import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET() {
  try {
    const services = await prisma.service.findMany({
      where: { status: "active" },
      orderBy: { sortOrder: "asc" },
    });
    return NextResponse.json({ services });
  } catch {
    return NextResponse.json({ services: [] });
  }
}