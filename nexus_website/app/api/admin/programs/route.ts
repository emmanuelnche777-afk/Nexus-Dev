import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/permissions-server";

import prisma from "@/lib/db";
import { validateVideoUrl } from "@/lib/video-url";
import { managedCloudinaryVideoPublicId } from "@/lib/cloudinary-video";

export async function GET() {
  const { user, authorized } = await requirePermission("academy:programs:*");
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!authorized) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const programs = await prisma.program.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ programs });
}

export async function POST(request: Request) {
  const { user, authorized } = await requirePermission("academy:programs:*");
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!authorized) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const body = await request.json();
    const overviewVideoUrl = validateVideoUrl(body.overviewVideoUrl);
    const newProgram = await prisma.program.create({
      data: {
        slug: body.slug,
        title: body.title,
        durationWeeks: body.durationWeeks,
        price: body.price,
        currency: body.currency,
        thumbnailUrl: body.thumbnailUrl,
        overviewVideoUrl,
        overviewVideoPublicId: managedCloudinaryVideoPublicId(overviewVideoUrl),
        shortDescription: body.shortDescription,
        fullDescription: body.fullDescription,
        targetAudience: body.targetAudience,
        certification: body.certification,
        tools: body.tools,
        highlights: body.highlights,
        requirements: body.requirements,
        awards: body.awards,
        curriculumModules: body.curriculumModules,
        instructors: body.instructors,
        featured: body.featured,
        status: body.status,
      },
    });
    return NextResponse.json(newProgram, { status: 201 });
  } catch (error) {
    if (error instanceof Error && (error.message.startsWith("Enter a YouTube") || error.message.startsWith("Localhost video"))) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create program" }, { status: 500 });
  }
}
