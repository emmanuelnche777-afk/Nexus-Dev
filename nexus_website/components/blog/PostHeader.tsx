"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { CalendarDays, Clock, ArrowLeft, Share2 } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { translateDate } from "@/lib/i18n/translations";
import { translateReadingTime } from "@/lib/blog";
import type { BlogPost } from "@/lib/blog";
import TranslatedText from "@/components/TranslatedText";

export default function PostHeader({ post }: { post: BlogPost }) {
  const { t, language } = useLanguage();
  const hasFrenchTitle = language === "fr" && post.titleFr !== post.title;
  const hasFrenchCategory = language === "fr" && post.categoryFr !== post.category;
  const title = hasFrenchTitle ? post.titleFr : post.title;
  const category = hasFrenchCategory ? post.categoryFr : post.category;

  const [shared, setShared] = useState(false);
  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title, url: window.location.href });
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(window.location.href);
        setShared(true);
        setTimeout(() => setShared(false), 2000);
      }
    } catch (err) {
      console.error("Error sharing:", err);
    }
  };

  return (
    <section className="relative overflow-hidden border-b border-nexus-cyan/10 bg-nexus-dark">
      <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-nexus-navy/40 blur-3xl" />
      <div className="relative mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-sm font-semibold text-nexus-cyan-bright transition hover:gap-3"
        >
          <ArrowLeft className="h-4 w-4" /> {t.blogPage.backToBlog}
        </Link>

        <div className="mt-8 flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-widest text-nexus-cyan">
          <span className="rounded-full bg-nexus-cyan/20 px-3 py-1 text-nexus-cyan-bright">
            {hasFrenchCategory ? category : <TranslatedText>{category}</TranslatedText>}
          </span>
          <span className="flex items-center gap-1">
            <CalendarDays className="h-3.5 w-3.5" />
            {translateDate(post.date, language)}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {translateReadingTime(post.readingTime, language)}
          </span>
        </div>

        <h1 className="mt-4 max-w-3xl text-3xl font-extrabold leading-tight text-nexus-white sm:text-4xl lg:text-5xl">
          {hasFrenchTitle ? title : <TranslatedText>{title}</TranslatedText>}
        </h1>

        <div className="mt-6 flex items-center gap-4">
          <div className="flex items-center gap-3">
            {post.author.avatar ? (
              <Image
                src={post.author.avatar}
                alt={post.author.name}
                width={40}
                height={40}
                className="rounded-full object-cover"
                unoptimized
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-nexus-cyan/20 text-sm font-bold text-nexus-cyan-bright">
                {post.author.name.charAt(0)}
              </div>
            )}
            <div>
              <p className="text-sm font-semibold text-nexus-white">
                {post.author.name}
              </p>
              {post.author.role && (
                <p className="text-xs text-nexus-gray/60">
                  {language === "fr" && post.author.roleFr && post.author.roleFr !== post.author.role ? post.author.roleFr : <TranslatedText>{post.author.role}</TranslatedText>}
                </p>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={handleShare}
            className="ml-auto inline-flex items-center gap-2 rounded-md border border-nexus-cyan/30 p-2 text-nexus-cyan-bright transition hover:bg-nexus-navy"
            title={language === "fr" ? "Partager" : "Share"}
          >
            {shared ? (
              <span className="text-xs">Copied!</span>
            ) : (
              <Share2 className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>
    </section>
  );
}
