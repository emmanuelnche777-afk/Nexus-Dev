import { notFound } from "next/navigation";
import BlogPostClient from "./BlogPostClient";
import { getPostBySlug, getRelatedPosts, getAllPosts } from "@/lib/blog";

export function generateStaticParams() {
  return getAllPosts().then((posts) => posts.map((p) => ({ slug: p.slug })));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return { title: "Post not found" };
  return {
    title: post.seo?.metaTitle || post.title,
    description: post.seo?.metaDescription || post.excerpt,
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const related = await getRelatedPosts(slug, 3);

  return <BlogPostClient post={post} relatedPosts={related} />;
}