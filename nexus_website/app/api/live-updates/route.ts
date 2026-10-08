import { NextResponse } from "next/server";
import prisma from "@/lib/db";

const FEED_SIZE = 4;

export async function GET(request: Request) {
  const url = new URL(request.url);
  const includeBlog = url.searchParams.get("includeBlog") !== "false";

  try {
    const [journeyEntries, blogPosts] = await Promise.all([
      prisma.journeyEntry.findMany({
        orderBy: { createdAt: "desc" },
        take: FEED_SIZE,
        select: { id: true, title: true, description: true, date: true, createdAt: true },
      }),
      includeBlog
        ? prisma.blogPost.findMany({
            where: { published: true },
            orderBy: [
              { publishedAt: { sort: "desc", nulls: "last" } },
              { createdAt: "desc" },
            ],
            take: FEED_SIZE,
            select: {
              id: true,
              slug: true,
              title: true,
              titleFr: true,
              excerpt: true,
              excerptFr: true,
              publishedAt: true,
              createdAt: true,
            },
          })
        : Promise.resolve([]),
    ]);

    const updates = [
      ...journeyEntries.map((entry) => ({
        id: `journey-${entry.id}`,
        kind: "journey" as const,
        title: entry.title,
        description: entry.description,
        date: entry.date,
        sortAt: entry.createdAt,
        href: "/journey",
      })),
      ...blogPosts.map((post) => ({
        id: `blog-${post.id}`,
        kind: "blog" as const,
        title: post.title,
        titleFr: post.titleFr,
        description: post.excerpt,
        descriptionFr: post.excerptFr,
        date: (post.publishedAt ?? post.createdAt).toISOString(),
        sortAt: post.publishedAt ?? post.createdAt,
        href: `/blog/${post.slug}`,
      })),
    ]
      .sort((a, b) => b.sortAt.getTime() - a.sortAt.getTime())
      .slice(0, FEED_SIZE)
      .map(({ sortAt: _sortAt, ...update }) => update);

    return NextResponse.json({ updates }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Failed to load homepage updates:", error);
    return NextResponse.json({ updates: [] }, { headers: { "Cache-Control": "no-store" } });
  }
}
