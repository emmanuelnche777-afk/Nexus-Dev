"use client";

import SectionHeading from "@/components/SectionHeading";
import BlogCard from "./BlogCard";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import type { BlogPost } from "@/lib/blog";

export default function RelatedPosts({ posts }: { posts: BlogPost[] }) {
  const { t } = useLanguage();

  if (posts.length === 0) return null;

  return (
    <section className="border-t border-nexus-navy/10 bg-nexus-gray py-12 lg:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow={t.blogPage.relatedPosts}
          title={t.blogPage.relatedPosts}
        />
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <BlogCard key={post.slug} post={post} />
          ))}
        </div>
      </div>
    </section>
  );
}
