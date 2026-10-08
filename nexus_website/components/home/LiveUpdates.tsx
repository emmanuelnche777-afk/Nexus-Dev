"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, CalendarDays, Newspaper } from "lucide-react";
import SectionHeading from "@/components/SectionHeading";
import Reveal from "@/components/divisions/tech-hub/Reveal";
import TiltCard from "@/components/divisions/tech-hub/TiltCard";
import TranslatedText from "@/components/TranslatedText";
import { usePublicSettings } from "@/components/PublicSettingsProvider";
import { useLanguage } from "@/lib/i18n/LanguageContext";

interface LiveUpdate {
  id: string;
  kind: "journey" | "blog";
  title: string;
  titleFr?: string | null;
  description: string;
  descriptionFr?: string | null;
  date: string;
  href: string;
}

export default function LiveUpdates() {
  const { settings, loading: settingsLoading } = usePublicSettings();
  const { language, t } = useLanguage();
  const [updates, setUpdates] = useState<LiveUpdate[]>([]);
  const [loadedBlogSetting, setLoadedBlogSetting] = useState<boolean | null>(null);
  const loading = loadedBlogSetting !== settings.blog;

  useEffect(() => {
    if (settingsLoading) return;

    let cancelled = false;
    fetch(`/api/live-updates?includeBlog=${settings.blog}`, { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) throw new Error("Failed to load homepage updates");
        return response.json();
      })
      .then((data) => {
        if (!cancelled) setUpdates(Array.isArray(data.updates) ? data.updates : []);
      })
      .catch(() => {
        if (!cancelled) setUpdates([]);
      })
      .finally(() => {
        if (!cancelled) setLoadedBlogSetting(settings.blog);
      });

    return () => {
      cancelled = true;
    };
  }, [settings.blog, settingsLoading]);

  if (settingsLoading || loading || updates.length === 0) return null;

  return (
    <section className="relative overflow-hidden border-t border-nexus-navy/10 bg-nexus-gray py-16 lg:py-20">
      <div className="pointer-events-none absolute -left-24 top-0 h-72 w-72 rounded-full bg-nexus-cyan/10 blur-3xl" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow={t.home.liveEyebrow}
          title={t.home.liveTitle}
          description={t.home.liveDesc}
        />
        <div className="mt-12 grid gap-6 sm:grid-cols-2">
          {updates.map((update, index) => {
            const isBlog = update.kind === "blog";
            const title = language === "fr" && update.titleFr ? update.titleFr : update.title;
            const description = language === "fr" && update.descriptionFr ? update.descriptionFr : update.description;
            const date = isBlog ? formatDate(update.date, language) : update.date;
            const Icon = isBlog ? Newspaper : CalendarDays;

            return (
              <Reveal key={update.id} delay={index * 100}>
                <TiltCard className="h-full">
                  <Link
                    href={update.href}
                    className="group flex h-full flex-col rounded-lg border border-nexus-cyan/20 bg-nexus-white p-6 transition hover:border-nexus-cyan"
                  >
                    <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-nexus-cyan">
                      <Icon className="h-4 w-4" /> {isBlog ? t.home.fromBlog : t.home.journeyUpdate}
                    </p>
                    <h3 className="mt-3 text-xl font-bold text-nexus-dark">
                      {isBlog ? title : <TranslatedText>{title}</TranslatedText>}
                    </h3>
                    {description && (
                      <p className="mt-2 text-sm leading-relaxed text-nexus-navy/70">
                        {isBlog ? description : <TranslatedText>{description}</TranslatedText>}
                      </p>
                    )}
                    <span className="mt-3 text-xs text-nexus-navy/50">{date}</span>
                    <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-nexus-cyan transition group-hover:gap-2">
                      {isBlog ? t.home.readPost : t.home.openTimeline} <ArrowRight className="h-4 w-4" />
                    </span>
                  </Link>
                </TiltCard>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function formatDate(value: string, language: "en" | "fr"): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(language === "fr" ? "fr-FR" : "en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}
