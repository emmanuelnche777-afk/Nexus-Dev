"use client";

import { useState, useEffect, useMemo } from "react";
import PageHeader from "@/components/PageHeader";
import CTA from "@/components/CTA";
import BlogHero from "@/components/blog/BlogHero";
import BlogCard from "@/components/blog/BlogCard";
import CategoryFilter from "@/components/blog/CategoryFilter";
import BlogSearch from "@/components/blog/BlogSearch";
import BlogPagination from "@/components/blog/BlogPagination";
import Reveal from "@/components/divisions/tech-hub/Reveal";
import { type BlogPost } from "@/lib/blog";
import { useLanguage } from "@/lib/i18n/LanguageContext";

const POSTS_PER_PAGE = 6;

export default function Blog() {
  const { t } = useLanguage();
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [categories, setCategories] = useState<string[]>(["All"]);
  const [allPosts, setAllPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/blog?limit=200`, { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        setCategories(data.categories || ["All"]);
        setAllPosts(data.posts || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filteredPosts = useMemo(() => {
    let result = allPosts;
    if (category && category !== "All") {
      result = result.filter(
        (p) => p.category === category || p.categoryFr === category
      );
    }
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.titleFr.toLowerCase().includes(q) ||
          p.excerpt.toLowerCase().includes(q) ||
          p.excerptFr.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    return result;
  }, [allPosts, category, search]);

  const totalPages = Math.ceil(filteredPosts.length / POSTS_PER_PAGE);
  const paginated = filteredPosts.slice(
    (page - 1) * POSTS_PER_PAGE,
    page * POSTS_PER_PAGE,
  );

  const handleCategoryChange = (cat: string) => {
    setCategory(cat);
    setPage(1);
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  return (
    <div className="bg-nexus-white">
      <PageHeader
        title={t.blogPage.title}
        description={t.blogPage.description}
        breadcrumb={[
          { label: t.nav.home, href: "/" },
          { label: t.blogPage.title, href: "/blog" },
        ]}
      />

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        {allPosts.length > 0 && <BlogHero posts={allPosts} />}

        <div className="mb-8 mt-14 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <CategoryFilter
            categories={categories}
            active={category}
            onChange={handleCategoryChange}
          />
          <BlogSearch value={search} onChange={handleSearchChange} />
        </div>

        {loading ? (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-[420px] animate-pulse rounded-2xl bg-nexus-gray" />
            ))}
          </div>
        ) : (
          <>
            {paginated.length === 0 ? (
              <p className="py-16 text-center text-nexus-navy/50">
                {t.blogPage.noPosts || "No posts found."}
              </p>
            ) : (
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {paginated.map((post, i) => (
                  <Reveal key={post.slug} variant="up" delay={i * 90}>
                    <BlogCard post={post} />
                  </Reveal>
                ))}
              </div>
            )}

            {totalPages > 1 && (
              <div className="mt-12">
                <BlogPagination
                  page={page}
                  totalPages={totalPages}
                  onPageChange={setPage}
                />
              </div>
            )}
          </>
        )}
      </section>

      <CTA
        title={t.home.ctaTitle}
        description={t.home.ctaDesc}
        primaryLabel={t.home.seeJourney}
        primaryHref="/journey"
        secondaryLabel={t.home.joinBtn}
        secondaryHref="/join-us?division=general"
      />
    </div>
  );
}
