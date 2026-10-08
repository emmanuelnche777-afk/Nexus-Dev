"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { CalendarDays, Clock, ArrowRight } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { translateDate } from "@/lib/i18n/translations";
import { translateReadingTime } from "@/lib/blog";
import type { BlogPost } from "@/lib/blog";
import TranslatedText from "@/components/TranslatedText";

export default function BlogCard({ post }: { post: BlogPost }) {
  const { language } = useLanguage();
  const hasFrenchTitle = language === "fr" && post.titleFr !== post.title;
  const hasFrenchExcerpt = language === "fr" && post.excerptFr !== post.excerpt;
  const hasFrenchCategory = language === "fr" && post.categoryFr !== post.category;
  const title = hasFrenchTitle ? post.titleFr : post.title;
  const excerpt = hasFrenchExcerpt ? post.excerptFr : post.excerpt;
  const category = hasFrenchCategory ? post.categoryFr : post.category;

  return (
    <Link href={`/blog/${post.slug}`} className="group block">
      <motion.article 
        whileHover={{ y: -5 }}                
        transition={{ duration: 0.2 }}
        className="flex h-full flex-col overflow-hidden rounded-lg border border-nexus-cyan/20 bg-nexus-white transition hover:border-nexus-cyan hover:shadow-lg"
      >
        <div className="relative aspect-[16/10] overflow-hidden">
          {post.coverImage.trim() ? (
            <Image
              src={post.coverImage}
              alt={title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              unoptimized
            />
          ) : (
            <div
              aria-hidden="true"
              className="h-full w-full bg-gradient-to-br from-nexus-navy via-nexus-dark to-nexus-cyan/40"
            />
          )}
          <span className="absolute left-3 top-3 rounded-full bg-nexus-navy/90 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-nexus-cyan-bright backdrop-blur">
            {hasFrenchCategory ? category : <TranslatedText>{category}</TranslatedText>}
          </span>
        </div>
        <div className="flex flex-1 flex-col p-5">
          <div className="flex items-center gap-3 text-xs text-nexus-navy">
            <span className="flex items-center gap-1">
              <CalendarDays className="h-3.5 w-3.5" />
                {translateDate(post.date, language)}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {translateReadingTime(post.readingTime, language)}
            </span>
          </div>
          <h3 className="mt-3 text-lg font-bold leading-snug text-nexus-dark transition group-hover:text-nexus-cyan">
            {hasFrenchTitle ? title : <TranslatedText>{title}</TranslatedText>}
          </h3>
          <p className="mt-2 flex-1 text-sm leading-relaxed text-nexus-navy line-clamp-3">
            {hasFrenchExcerpt ? excerpt : <TranslatedText as="span">{excerpt}</TranslatedText>}
          </p>
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {post.author.avatar && (
                <Image
                  src={post.author.avatar}
                  alt={post.author.name}
                  width={24}
                  height={24}
                  className="rounded-full object-cover"
                  unoptimized
                />
              )}
              <span className="text-xs font-medium text-nexus-navy">
                {post.author.name}
              </span>
            </div>
            <span className="inline-flex items-center gap-1 text-sm font-semibold text-nexus-cyan transition group-hover:gap-2">
              <ArrowRight className="h-4 w-4" />
            </span>
          </div>
        </div>
      </motion.article>
    </Link>
  );
}
