import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const status = url.searchParams.get("status") || "active";

    const services = await prisma.service.findMany({
      where: { status },
      orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
      select: {
        id: true,
        slug: true,
        title: true,
        tagline: true,
        description: true,
        imageUrl: true,
        iconKey: true,
        features: true,
        deliverables: true,
        status: true,
        sortOrder: true,
      },
    });

    return NextResponse.json({ services });
  } catch (error) {
    console.error("Failed to load tech hub services:", error);
    return NextResponse.json({ error: "Failed to load services" }, { status: 500 });
  }
}
