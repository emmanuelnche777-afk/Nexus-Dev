"use client";

import { useLanguage } from "@/lib/i18n/LanguageContext";
import type { BlogPost } from "@/lib/blog";
import SocialSection from "./SocialSection";
import TranslatedText from "@/components/TranslatedText";

export default function PostContent({ post }: { post: BlogPost }) {
  const { language } = useLanguage();
  const hasFrenchContent = language === "fr" && post.contentFr.length > 0;
  const content = hasFrenchContent ? post.contentFr : post.content;

  return (
    <article className="py-12 lg:py-16">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="space-y-6">
          {content.map((block, i) => {
            if (block.type === "h2") {
              const headingIndex = content.slice(0, i).filter(b => b.type === "h2").length;
              return (
                <h2 key={i} id={`section-${headingIndex}`} className="text-2xl font-bold text-nexus-dark mt-8 mb-4">
                  {hasFrenchContent ? block.content : <TranslatedText>{block.content}</TranslatedText>}
                </h2>
              );
            }
            if (block.type === "h3") {
              return (
                <h3 key={i} className="mt-6 text-xl font-semibold text-nexus-dark">
                  {hasFrenchContent ? block.content : <TranslatedText>{block.content}</TranslatedText>}
                </h3>
              );
            }
            if (block.type === "quote") {
              return (
                <blockquote key={i} className="border-l-4 border-nexus-cyan pl-4 italic text-nexus-navy/80">
                  {hasFrenchContent ? block.content : <TranslatedText as="span">{block.content}</TranslatedText>}
                </blockquote>
              );
            }
            if (block.type === "list") {
              return (
                <ul key={i} className="ml-6 list-disc space-y-2 text-base leading-relaxed text-nexus-navy/80 sm:text-lg">
                  {block.items.map((item, itemIndex) => (
                    <li key={itemIndex}>
                      {hasFrenchContent ? item : <TranslatedText as="span">{item}</TranslatedText>}
                    </li>
                  ))}
                </ul>
              );
            }

            return (
              <div key={i}>
                <p className="text-base leading-relaxed text-nexus-navy/80 sm:text-lg">
                  {hasFrenchContent ? block.content : <TranslatedText as="span">{block.content}</TranslatedText>}
                </p>
              </div>
            );
          })}
        </div>

          {post.tags.length > 0 && (
            <div className="mt-10 flex flex-wrap gap-2 border-t border-nexus-navy/10 pt-6">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-nexus-navy/15 bg-nexus-gray px-3 py-1 text-xs font-medium text-nexus-navy/60"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
          <SocialSection />
        </div>
      </article>
  );
}
