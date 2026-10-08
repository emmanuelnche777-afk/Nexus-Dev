import { NextRequest, NextResponse } from "next/server";
import { getAllPosts, getFeaturedPost, getCategories, paginatedPosts } from "@/lib/blog";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category") || undefined;
  const search = searchParams.get("search") || undefined;
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "10", 10);

  const allPosts = await getAllPosts({ category, search });
  const result = await paginatedPosts(allPosts, page, limit);
  const categories = await getCategories();
  const featured = await getFeaturedPost();

  return NextResponse.json({ ...result, categories, featured });
}