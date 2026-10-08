"use client";

import { Fragment, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp, MapPin, Share2 } from "lucide-react";
import Reveal from "@/components/divisions/tech-hub/Reveal";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import TranslatedText from "@/components/TranslatedText";
import VideoPlayer from "@/components/video/VideoPlayer";
import {
  CATEGORY_LABELS,
  CATEGORY_COLORS,
  STATUS_LABELS,
  STATUS_COLORS,
  SHARE_PLATFORMS,
  type JourneyStatus,
  type JourneyCategory,
} from "@/lib/journey";

interface JourneyEntry {
  id: string;
  date: string;
  title: string;
  description: string;
  fullContent?: string;
  status: JourneyStatus;
  category: JourneyCategory;
  media?: Array<{
    type: "video" | "image";
    url: string;
    thumbnail?: string;
    caption?: string;
  }>;
  tags?: string[];
  socialShare?: {
    platforms: string[];
    sharedAt?: string;
    shareUrl?: string;
  };
  priority?: number;
  author?: string;
  projectName?: string | null;
  phaseOrder?: number | null;
  progress?: number | null;
  outcome?: string | null;
}

function StatusBadge({ status }: { status: JourneyStatus }) {
  return (
    <span
      className={`journey-badge inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${STATUS_COLORS[status]} journey-badge-pulse`}
      data-status={status}
    >
      <span className="relative flex h-2 w-2">
        {status === "live" && <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />}
        <span className="relative inline-flex h-2 w-2 rounded-full bg-current" />
      </span>
      <TranslatedText>{STATUS_LABELS[status]}</TranslatedText>
    </span>
  );
}

function CategoryBadge({ category }: { category: JourneyEntry["category"] }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider ${CATEGORY_COLORS[category]}`}
    >
      <TranslatedText>{CATEGORY_LABELS[category]}</TranslatedText>
    </span>
  );
}

function ShareIndicators({ platforms }: { platforms: string[] }) {
  return (
    <div className="flex items-center gap-1.5">
      <Share2 className="h-3 w-3 text-nexus-gray/40" />
      <div className="flex -space-x-1">
        {platforms.map((p) => {
          const platform = SHARE_PLATFORMS[p as keyof typeof SHARE_PLATFORMS];
          if (!platform) return null;
          return (
            <span
              key={p}
              className="inline-flex h-5 w-5 items-center justify-center rounded-full text-[8px] font-bold text-white ring-1 ring-nexus-dark"
              style={{ backgroundColor: platform.color }}
              title={platform.name}
            >
              {platform.name[0]}
            </span>
          );
        })}
      </div>
    </div>
  );
}

function TimelineCard({
  entry,
  index,
}: {
  entry: JourneyEntry;
  index: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const { t } = useLanguage();
  const jp = t.journeyPage;
  const isEven = index % 2 === 0;

  return (
    <li className="relative">
      {/* Timeline dot */}
      <span className="absolute -left-[41px] flex h-6 w-6 items-center justify-center rounded-full border-2 border-nexus-cyan bg-nexus-dark lg:-left-[45px]">
        <span
          className={`h-2.5 w-2.5 rounded-full ${
            entry.status === "live"
              ? "bg-green-500 journey-dot-pulse"
              : entry.status === "upcoming"
              ? "bg-amber-500"
              : "bg-nexus-cyan"
          }`}
        />
      </span>

      <Reveal variant={isEven ? "left" : "right"} delay={index * 80}>
        <div
          className={`rounded-xl border-l-4 bg-nexus-navy-deep/60 p-6 backdrop-blur-sm transition-all duration-300 hover:bg-nexus-navy-deep/80 hover:shadow-xl hover:shadow-nexus-cyan/5 lg:p-8 ${
            entry.status === "live"
              ? "border-l-green-500"
              : entry.status === "upcoming"
              ? "border-l-amber-500"
              : "border-l-nexus-cyan"
          }`}
        >
          {/* Top row: badges + date */}
          <div className="flex flex-wrap items-center gap-3">
            <StatusBadge status={entry.status} />
            <CategoryBadge category={entry.category} />
            <span className="flex items-center gap-1 font-mono text-xs text-nexus-gray/50">
              <MapPin className="h-3 w-3" />
              {entry.date}
            </span>
          </div>

          {/* Title */}
          <h3 className="mt-4 text-xl font-bold text-white lg:text-2xl">
            <TranslatedText>{entry.title}</TranslatedText>
          </h3>

          {/* Description */}
          <p className="mt-3 text-sm leading-relaxed text-nexus-gray/70">
            <TranslatedText as="span">{entry.description}</TranslatedText>
          </p>

          {entry.progress !== null && entry.progress !== undefined && (
            <div className="mt-4 max-w-md">
              <div className="mb-1 flex justify-between text-[11px] text-nexus-gray/50">
                <span>Project progress</span><span>{entry.progress}%</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                <div className="h-full rounded-full bg-nexus-cyan" style={{ width: `${entry.progress}%` }} />
              </div>
            </div>
          )}

          {entry.outcome && (
            <div className="mt-4 rounded-lg border border-nexus-cyan/15 bg-nexus-cyan/5 px-4 py-3">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-nexus-cyan">Outcome</p>
              <p className="mt-1 text-sm text-nexus-gray/80"><TranslatedText as="span">{entry.outcome}</TranslatedText></p>
            </div>
          )}

          {/* Tags */}
          {entry.tags && entry.tags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {entry.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-md border border-nexus-cyan/15 bg-nexus-dark/50 px-2.5 py-1 text-[11px] font-medium text-nexus-cyan/80"
                >
                  <TranslatedText>{tag}</TranslatedText>
                </span>
              ))}
            </div>
          )}

          {/* Full content expand */}
          {entry.fullContent && (
            <div className="mt-4">
              <button
                type="button"
                onClick={() => setExpanded(!expanded)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-nexus-cyan-bright transition hover:text-white"
              >
                {expanded ? jp.readLess : jp.readMore}
                {expanded ? (
                  <ChevronUp className="h-3.5 w-3.5" />
                ) : (
                  <ChevronDown className="h-3.5 w-3.5" />
                )}
              </button>
              <AnimatePresence>
                {expanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    className="overflow-hidden"
                  >
                    <p className="mt-3 text-sm leading-relaxed text-nexus-gray/60">
                      <TranslatedText as="span">{entry.fullContent}</TranslatedText>
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Media thumbnails */}
          {entry.media && entry.media.length > 0 && (
            <div className="mt-5 flex gap-3">
              {entry.media.map((m, i) => (
                <div
                  key={i}
                  className="relative h-20 w-20 overflow-hidden rounded-lg border border-nexus-cyan/20 bg-nexus-dark"
                >
                  {m.type === "image" ? (
                    <img src={m.url} alt={m.caption || entry.title} className="h-full w-full object-cover" />
                  ) : (
                    <VideoPlayer src={m.url} title={m.caption || entry.title} poster={m.thumbnail} className="h-full w-full object-cover" controls={false} muted />
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Bottom row: social share + author */}
          <div className="mt-5 flex items-center justify-between border-t border-nexus-cyan/10 pt-4">
            {entry.socialShare && entry.socialShare.platforms.length > 0 && (
              <ShareIndicators platforms={entry.socialShare.platforms} />
            )}
            {entry.author && (
              <span className="text-[11px] text-nexus-gray/40">
                {entry.author}
              </span>
            )}
          </div>
        </div>
      </Reveal>
    </li>
  );
}

export default function JourneyTimeline({
  activeFilter,
}: {
  activeFilter: JourneyCategory | "all";
}) {
  const { t } = useLanguage();
  const jp = t.journeyPage;
  const [entries, setEntries] = useState<JourneyEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/journey")
      .then((res) => res.json())
      .then((data) => {
        setEntries(data.entries || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filteredEntries =
    activeFilter === "all"
      ? entries
      : entries.filter((e) => e.category === activeFilter);

  const groups = new Map<string, { name: string | null; entries: JourneyEntry[] }>();
  filteredEntries.forEach((entry) => {
    const name = entry.projectName?.trim() || null;
    const key = name ? `project:${name.toLowerCase()}` : `entry:${entry.id}`;
    const group = groups.get(key) || { name, entries: [] };
    group.entries.push(entry);
    groups.set(key, group);
  });
  const groupedEntries = Array.from(groups.values()).map((group) => ({
    ...group,
    entries: group.entries.sort((a, b) => {
      if (a.phaseOrder != null && b.phaseOrder != null) return a.phaseOrder - b.phaseOrder;
      if (a.phaseOrder != null) return -1;
      if (b.phaseOrder != null) return 1;
      return 0;
    }),
  }));

  return (
    <div className="relative">
      {/* Section heading */}
      <div className="mb-12 text-center">
        <Reveal variant="up">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-nexus-cyan">
            Public Roadmap
          </p>
          <h2 className="mt-4 text-3xl font-extrabold leading-tight text-white sm:text-4xl lg:text-5xl">
            Where we&apos;ve been &amp; where we&apos;re going
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-nexus-gray/70">
            Key milestones in the founding and development of NEXUS.
          </p>
        </Reveal>
      </div>

      {/* Timeline line + entries */}
      <ol className="relative space-y-12 border-l-2 border-nexus-cyan/20 pl-8 lg:pl-10">
        <AnimatePresence mode="popLayout">
          {groupedEntries.map((group, groupIndex) => (
            <Fragment key={group.name || group.entries[0].id}>
              {group.name && (
                <li className="relative rounded-lg border border-nexus-cyan/15 bg-nexus-cyan/5 px-4 py-3">
                  <h3 className="font-semibold text-nexus-cyan">{group.name}</h3>
                  <p className="mt-1 text-xs text-nexus-gray/50">{group.entries.length} project phase{group.entries.length === 1 ? "" : "s"}</p>
                </li>
              )}
              {group.entries.map((entry, phaseIndex) => (
                <TimelineCard key={entry.id} entry={entry} index={groupIndex + phaseIndex} />
              ))}
            </Fragment>
          ))}
        </AnimatePresence>

        {filteredEntries.length === 0 && !loading && (
          <li className="py-12 text-center text-sm text-nexus-gray/50">
            {jp.noMedia}
          </li>
        )}
        {loading && (
          <li className="py-12 text-center text-sm text-nexus-gray/50">
            Loading...
          </li>
        )}
      </ol>
    </div>
  );
}
