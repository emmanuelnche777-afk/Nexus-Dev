import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const program = await prisma.program.findUnique({
    where: { slug },
  });

  if (!program || program.status !== "active") {
    return NextResponse.json({ error: "Program not found" }, { status: 404 });
  }

  return NextResponse.json({ program });
}
