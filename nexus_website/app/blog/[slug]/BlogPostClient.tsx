"use client";

import PostContent from "@/components/blog/PostContent";
import RelatedPosts from "@/components/blog/RelatedPosts";
import ProgressBar from "@/components/blog/ProgressBar";
import TableOfContents from "@/components/blog/TableOfContents";
import NewsletterCard from "@/components/blog/NewsletterCard";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import type { BlogPost } from "@/lib/blog";
import PostHeader from "@/components/blog/PostHeader";
import CTA from "@/components/CTA";

export default function BlogPostClient({
  post,
  relatedPosts,
}: {
  post: BlogPost;
  relatedPosts: BlogPost[];
}) {
  const { t, language } = useLanguage();
  const hasFrenchContent = language === "fr" && post.contentFr.length > 0;
  const content = hasFrenchContent ? post.contentFr : post.content;

  return (
    <div className="bg-nexus-white">
      <ProgressBar />
      <PostHeader post={post} />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 flex flex-col lg:flex-row gap-12">
        <TableOfContents blocks={content} translateHeadings={!hasFrenchContent} />
        <div className="flex-1">
          <PostContent post={post} />
          <NewsletterCard />
          <RelatedPosts posts={relatedPosts} />
        </div>
      </div>
      <CTA
        title={t.blogPage.eyebrow}
        description={t.blogPage.description}
        primaryLabel={t.blogPage.backToBlog}
        primaryHref="/blog"
        secondaryLabel={t.nav.journey}
        secondaryHref="/journey"
      />
    </div>
  );
}
