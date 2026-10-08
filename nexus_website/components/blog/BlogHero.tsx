"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock,
  Pause,
  Play,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { translateDate } from "@/lib/i18n/translations";
import { translateReadingTime } from "@/lib/blog";
import type { BlogPost } from "@/lib/blog";
import TranslatedText from "@/components/TranslatedText";

type SlideChange = {
  targetIndex: number;
  direction: 1 | -1;
};

function BlogHeroSlide({
  post,
  index,
  total,
  width,
}: {
  post: BlogPost;
  index: number;
  total: number;
  width: string;
}) {
  const { language } = useLanguage();
  const hasFrenchTitle = language === "fr" && post.titleFr !== post.title;
  const hasFrenchExcerpt = language === "fr" && post.excerptFr !== post.excerpt;
  const hasFrenchCategory = language === "fr" && post.categoryFr !== post.category;
  const title = hasFrenchTitle ? post.titleFr : post.title;
  const excerpt = hasFrenchExcerpt ? post.excerptFr : post.excerpt;
  const category = hasFrenchCategory ? post.categoryFr : post.category;

  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group block h-full shrink-0"
      style={{ width }}
    >
      <article
        role="group"
        aria-roledescription="slide"
        aria-label={`${index + 1} ${language === "fr" ? "sur" : "of"} ${total}`}
        className="relative h-full overflow-hidden bg-nexus-dark"
      >
        {post.coverImage.trim() ? (
          <Image
            src={post.coverImage}
            alt={title}
            fill
            sizes="(max-width: 1024px) 100vw, 1280px"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            unoptimized
          />
        ) : (
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-br from-nexus-navy via-nexus-dark to-nexus-cyan/40"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-nexus-dark via-nexus-dark/60 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
          <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-widest text-nexus-cyan-bright">
            <span className="rounded-full bg-nexus-cyan/20 px-3 py-1 text-nexus-cyan-bright">
              {hasFrenchCategory ? category : <TranslatedText>{category}</TranslatedText>}
            </span>
            <span className="flex items-center gap-1">
              <CalendarDays className="h-3.5 w-3.5" />
              {translateDate(post.date, language)}
            </span>
            {post.readingTime && (
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {translateReadingTime(post.readingTime, language)}
              </span>
            )}
          </div>
          <h2 className="mt-3 text-2xl font-extrabold leading-tight text-nexus-white sm:text-3xl lg:text-4xl">
            {hasFrenchTitle ? title : <TranslatedText>{title}</TranslatedText>}
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-nexus-gray/75 sm:text-base">
            {hasFrenchExcerpt ? excerpt : <TranslatedText as="span">{excerpt}</TranslatedText>}
          </p>
          <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-nexus-cyan-bright transition group-hover:gap-2">
            {language === "fr" ? "Lire l'article" : "Read the post"}{" "}
            <ArrowRight className="h-4 w-4" />
          </span>
        </div>
      </article>
    </Link>
  );
}

export default function BlogHero({ posts }: { posts: BlogPost[] }) {
  const { language } = useLanguage();
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [slideChange, setSlideChange] = useState<SlideChange | null>(null);
  const post = posts[activeIndex];

  useEffect(() => {
    if (paused || slideChange || posts.length < 2) return;

    const timer = window.setTimeout(() => {
      setSlideChange({
        targetIndex: (activeIndex + 1) % posts.length,
        direction: 1,
      });
    }, 7000);

    return () => window.clearTimeout(timer);
  }, [activeIndex, paused, posts.length, slideChange]);

  if (!post) return null;

  const goToSlide = (targetIndex: number, direction: 1 | -1) => {
    if (slideChange || targetIndex === activeIndex) return;
    setSlideChange({ targetIndex, direction });
  };

  const previous = () =>
    goToSlide((activeIndex - 1 + posts.length) % posts.length, -1);
  const next = () => goToSlide((activeIndex + 1) % posts.length, 1);
  const displayedPosts = slideChange
    ? slideChange.direction === 1
      ? [post, posts[slideChange.targetIndex]]
      : [posts[slideChange.targetIndex], post]
    : [post];
  const initialOffset = slideChange?.direction === -1 ? "-50%" : "0%";
  const destinationOffset = slideChange?.direction === 1 ? "-50%" : "0%";

  return (
    <section
      aria-label={language === "fr" ? "Articles à la une" : "Featured blog posts"}
      aria-roledescription="carousel"
      className="relative"
    >
      <div className="relative h-64 overflow-hidden rounded-xl border border-nexus-cyan/20 bg-nexus-dark sm:h-80 lg:h-96">
        <motion.div
          key={slideChange
            ? `moving-${activeIndex}-${slideChange.targetIndex}-${slideChange.direction}`
            : `active-${activeIndex}`}
          initial={{ x: initialOffset }}
          animate={{ x: destinationOffset }}
          style={{
            width: slideChange ? "200%" : "100%",
          }}
          transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
          onAnimationComplete={() => {
            if (!slideChange) return;
            setActiveIndex(slideChange.targetIndex);
            setSlideChange(null);
          }}
          className="flex h-full"
        >
          {displayedPosts.map((slidePost) => (
            <BlogHeroSlide
              key={`${slideChange?.direction ?? 0}-${slidePost.slug}`}
              post={slidePost}
              index={posts.findIndex((item) => item.slug === slidePost.slug)}
              total={posts.length}
              width={slideChange ? "50%" : "100%"}
            />
          ))}
        </motion.div>
      </div>

      {posts.length > 1 && (
        <div className="mt-4 flex items-center justify-center gap-3" aria-live="off">
          <button
            type="button"
            onClick={previous}
            disabled={!!slideChange}
            aria-label={language === "fr" ? "Article précédent" : "Previous post"}
            className="rounded-full border border-nexus-navy/20 p-2 text-nexus-navy transition hover:border-nexus-cyan hover:text-nexus-cyan disabled:opacity-40"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-2">
            {posts.map((item, index) => (
              <button
                key={item.slug}
                type="button"
                disabled={!!slideChange}
                onClick={() =>
                  goToSlide(index, index > activeIndex ? 1 : -1)
                }
                aria-label={`${language === "fr" ? "Afficher l'article" : "Show post"}: ${item.title}`}
                aria-current={index === activeIndex ? "true" : undefined}
                className={`h-2.5 rounded-full transition-all disabled:opacity-50 ${
                  index === activeIndex
                    ? "w-7 bg-nexus-cyan"
                    : "w-2.5 bg-nexus-navy/25 hover:bg-nexus-cyan/60"
                }`}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={next}
            disabled={!!slideChange}
            aria-label={language === "fr" ? "Article suivant" : "Next post"}
            className="rounded-full border border-nexus-navy/20 p-2 text-nexus-navy transition hover:border-nexus-cyan hover:text-nexus-cyan disabled:opacity-40"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setPaused((value) => !value)}
            aria-label={paused ? (language === "fr" ? "Lire le diaporama" : "Play slides") : (language === "fr" ? "Mettre le diaporama en pause" : "Pause slides")}
            className="rounded-full border border-nexus-navy/20 p-2 text-nexus-navy transition hover:border-nexus-cyan hover:text-nexus-cyan"
          >
            {paused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
          </button>
        </div>
      )}
    </section>
  );
}
