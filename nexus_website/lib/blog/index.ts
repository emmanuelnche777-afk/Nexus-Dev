import type { BlogPost, BlogFilters, BlogAuthor } from "./types";
import type { Language } from "@/lib/i18n/translations";
import type { BlogPost as PrismaPost } from "@prisma/client";
import prisma from "@/lib/db";

export type {
  BlogPost,
  BlogPostSummary,
  BlogAuthor,
  BlogSEO,
  BlogFilters,
} from "./types";

function parseAuthor(raw: string | null): BlogAuthor | undefined {
  if (!raw) return undefined;
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object" && parsed.name) return parsed;
    return undefined;
  } catch {
    return skipAuthor(raw) ? undefined : { name: raw };
  }
}

function skipAuthor(raw: string): boolean {
  return raw.includes("(") || raw.length > 60;
}

function toBlogPost(row: PrismaPost): BlogPost {
  const author = parseAuthor(row.author);
  return {
    slug: row.slug,
    title: row.title,
    titleFr: row.titleFr || row.title,
    excerpt: row.excerpt || "",
    excerptFr: row.excerptFr || row.excerpt || "",
    content: Array.isArray(row.content) ? (row.content as BlogPost["content"]) : [],
    contentFr: Array.isArray(row.contentFr) ? (row.contentFr as BlogPost["contentFr"]) : [],
    coverImage: row.coverImage || "",
    author: author || { name: "NEXUS" },
    date: row.date || new Date(row.publishedAt || row.createdAt).toLocaleDateString("en-CA"),
    category: row.category || "general",
    categoryFr: row.categoryFr || row.category || "general",
    tags: row.tags || [],
    readingTime: row.readingTime || "",
    status: row.published ? "published" : "draft",
    featured: row.featured || false,
    seo: (row.seo as BlogPost["seo"]) || undefined,
  };
}

function matchesSearch(post: BlogPost, search: string): boolean {
  const q = search.toLowerCase();
  return (
    post.title.toLowerCase().includes(q) ||
    post.titleFr.toLowerCase().includes(q) ||
    post.excerpt.toLowerCase().includes(q) ||
    post.excerptFr.toLowerCase().includes(q) ||
    post.tags.some((t) => t.toLowerCase().includes(q))
  );
}

export async function getAllPosts(filters?: BlogFilters): Promise<BlogPost[]> {
  const result = await prisma.blogPost.findMany({
    where: { published: true },
  });

  const newestFirst = result
    .slice()
    .sort(
      (a, b) =>
        (b.publishedAt?.getTime() ?? b.createdAt.getTime()) -
        (a.publishedAt?.getTime() ?? a.createdAt.getTime()),
    );
  let mapped = newestFirst.map(toBlogPost);

  const category = filters?.category;
  if (category && category !== "All") {
    mapped = mapped.filter(
      (p) => p.category === category || p.categoryFr === category
    );
  }

  if (filters?.search) {
    mapped = mapped.filter((p) => matchesSearch(p, filters.search!));
  }

  return mapped;
}

export async function getPostBySlug(
  slug: string
): Promise<BlogPost | undefined> {
  const row = await prisma.blogPost.findFirst({
    where: { slug, published: true },
  });
  return row ? toBlogPost(row) : undefined;
}

export async function getFeaturedPost(): Promise<BlogPost | undefined> {
  const row = await prisma.blogPost.findFirst({
    where: { published: true, featured: true },
  });
  if (row) return toBlogPost(row);

  const fallback = await prisma.blogPost.findFirst({
    where: { published: true },
    orderBy: { publishedAt: "desc" },
  });
  return fallback ? toBlogPost(fallback) : undefined;
}

export async function getCategories(): Promise<string[]> {
  const posts = await getAllPosts();
  const cats = new Set(posts.map((p) => p.category));
  return ["All", ...Array.from(cats)];
}

export async function searchPosts(query: string): Promise<BlogPost[]> {
  return getAllPosts({ search: query });
}

export async function getRelatedPosts(
  slug: string,
  limit = 3
): Promise<BlogPost[]> {
  const current = await getPostBySlug(slug);
  if (!current) return [];

  const cats = new Set<string>([current.category, current.categoryFr]);
  const all = await getAllPosts();
  return all
    .filter(
      (p) =>
        p.slug !== slug &&
        (cats.has(p.category) ||
          cats.has(p.categoryFr) ||
          p.tags.some((t) => current.tags.includes(t)))
    )
    .slice(0, limit);
}

export async function paginatedPosts(
  posts: BlogPost[],
  page: number,
  limit: number
) {
  const start = (page - 1) * limit;
  const end = start + limit;
  return {
    posts: posts.slice(start, end),
    total: posts.length,
    totalPages: Math.ceil(posts.length / limit),
    page,
  };
}

export function translateReadingTime(
  readingTime: string,
  lang: Language
): string {
  if (lang === "en") return readingTime;
  const match = readingTime.match(/(\d+)\s*min/);
  if (!match) return readingTime;
  const num = match[1];
  return `${num} min de lecture`;
}
