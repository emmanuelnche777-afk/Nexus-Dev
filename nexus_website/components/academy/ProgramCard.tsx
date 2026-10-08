"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import TranslatedText from "@/components/TranslatedText";

type ProgramCardProps = {
  slug: string;
  title: string;
  description: string;
  durationWeeks: number;
  targetAudience: string;
  certification: string;
  tools: string[];
  thumbnailUrl?: string;
};

export default function ProgramCard({
  slug,
  title,
  description,
  durationWeeks,
  targetAudience,
  certification,
  tools,
  thumbnailUrl,
}: ProgramCardProps) {
  return (
    <Link
      href={`/academy/program/${slug}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-nexus-cyan/10 bg-white transition-all duration-300 hover:border-nexus-cyan/30 hover:shadow-xl hover:shadow-nexus-cyan/5"
    >
      {/* Thumbnail */}
      <div className="relative aspect-[16/9] overflow-hidden bg-nexus-dark">
        {thumbnailUrl ? (
          <Image
            src={thumbnailUrl}
            alt={title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-nexus-navy to-nexus-dark">
            <span className="font-mono text-xs text-nexus-cyan/60"><TranslatedText>{title}</TranslatedText></span>
          </div>
        )}
        {/* Duration badge */}
        <span className="absolute right-3 top-3 rounded-full bg-nexus-dark/80 px-3 py-1 font-mono text-xs font-semibold text-nexus-cyan-bright backdrop-blur-sm">
          {durationWeeks} weeks
        </span>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-3 p-5 sm:p-6">
        <div>
          <h3 className="text-lg font-bold text-nexus-dark transition-colors group-hover:text-nexus-cyan">
            <TranslatedText>{title}</TranslatedText>
          </h3>
          <span className="mt-1 inline-block rounded-full bg-nexus-cyan/10 px-2.5 py-0.5 text-[11px] font-semibold text-nexus-cyan">
            <TranslatedText>{targetAudience}</TranslatedText>
          </span>
        </div>

        <p className="line-clamp-3 text-sm leading-relaxed text-nexus-navy/65">
          <TranslatedText as="span">{description}</TranslatedText>
        </p>

        {/* Tools chips */}
        <div className="flex flex-wrap gap-1.5">
          {tools.slice(0, 4).map((tool) => (
            <span
              key={tool}
              className="rounded-full bg-nexus-gray px-2.5 py-1 text-[11px] font-medium text-nexus-navy"
            >
              <TranslatedText>{tool}</TranslatedText>
            </span>
          ))}
          {tools.length > 4 && (
            <span className="rounded-full bg-nexus-gray px-2.5 py-1 text-[11px] font-medium text-nexus-navy/40">
              +{tools.length - 4}
            </span>
          )}
        </div>

        {/* Certification */}
        <p className="mt-auto border-t border-nexus-cyan/10 pt-3 text-[11px] font-medium text-nexus-cyan/80">
          <TranslatedText>{certification}</TranslatedText>
        </p>

        {/* Arrow-swap CTA */}
        <div className="relative mt-1 h-10 overflow-hidden">
          <div className="absolute left-0 top-0 font-mono text-xs font-semibold uppercase tracking-wider text-nexus-cyan transition-all duration-500 ease-in-out md:translate-y-11 md:group-hover:translate-y-0">
            View program
          </div>
          <div className="transition-all duration-500 ease-out md:group-hover:-translate-y-full md:group-hover:delay-0">
            <ArrowRight className="h-10 w-10 text-nexus-cyan" strokeWidth={2} />
          </div>
        </div>
      </div>
    </Link>
  );
}
