"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Play } from "lucide-react";
import Reveal from "@/components/divisions/tech-hub/Reveal";
import TiltCard from "@/components/divisions/tech-hub/TiltCard";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { CATEGORY_COLORS, CATEGORY_LABELS } from "@/lib/journey";
import TranslatedText from "@/components/TranslatedText";
import VideoPlayer from "@/components/video/VideoPlayer";
import { resolveVideoUrl } from "@/lib/video-url";

interface MediaItem {
  url: string;
  caption?: string;
  type: "image" | "video";
  entryTitle: string;
  category: string;
}

interface JourneyEntry {
  id: string;
  title: string;
  category: string;
  media?: Array<{
    type: "video" | "image";
    url: string;
    thumbnail?: string;
    caption?: string;
  }>;
}

export default function JourneyMediaGallery() {
  const { t } = useLanguage();
  const jp = t.journeyPage;
  const [lightbox, setLightbox] = useState<MediaItem | null>(null);
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

  const allMedia: MediaItem[] = entries.flatMap((entry) =>
    (entry.media ?? []).map((m) => ({
      url: m.url,
      caption: m.caption,
      type: m.type,
      entryTitle: entry.title,
      category: entry.category,
    }))
  );

  if (allMedia.length === 0 && !loading) return null;

  return (
    <>
      <section className="relative overflow-hidden bg-nexus-navy-deep py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal variant="up">
            <p className="text-center font-mono text-xs uppercase tracking-[0.3em] text-nexus-cyan">
              {jp.eyebrow}
            </p>
            <h2 className="mx-auto mt-4 max-w-3xl text-center text-3xl font-extrabold leading-tight text-white sm:text-4xl lg:text-5xl">
              {jp.galleryTitle}
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-center text-nexus-gray/70">
              {jp.galleryDesc}
            </p>
          </Reveal>

          <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {allMedia.map((item, i) => (
              <Reveal key={i} variant="up" delay={i * 80}>
                <TiltCard className="rounded-xl overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setLightbox(item)}
                    className="group relative block w-full aspect-[4/3] overflow-hidden rounded-xl border border-nexus-cyan/20 bg-nexus-dark"
                  >
                    {item.type === "video" ? (
                      <VideoPlayer src={item.url} title={item.caption || item.entryTitle} className="h-full w-full object-cover" controls={false} muted />
                    ) : (
                      <img src={item.url} alt={item.caption || item.entryTitle} className="h-full w-full object-cover" />
                    )}
                    {item.type === "video" && <Play className="absolute left-1/2 top-1/2 h-10 w-10 -translate-x-1/2 -translate-y-1/2 text-white drop-shadow" />}

                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-nexus-dark/60 opacity-0 transition-opacity group-hover:opacity-100" />

                    {/* Category badge */}
                    <span
                      className={`absolute left-3 top-3 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${CATEGORY_COLORS[item.category as keyof typeof CATEGORY_COLORS]}`}
                    >
                      <TranslatedText>{CATEGORY_LABELS[item.category as keyof typeof CATEGORY_LABELS]}</TranslatedText>
                    </span>
                  </button>

                  {/* Caption */}
                  {item.caption && (
                    <p className="mt-3 text-xs text-nexus-gray/60">
                      <TranslatedText as="span">{item.caption}</TranslatedText>
                    </p>
                  )}
                </TiltCard>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-nexus-dark/90 p-4 backdrop-blur-md"
            onClick={() => setLightbox(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="relative max-w-3xl overflow-hidden rounded-2xl border border-nexus-cyan/30 bg-nexus-navy-deep shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setLightbox(null)}
                className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-nexus-dark/80 text-white transition hover:bg-nexus-cyan hover:text-nexus-dark"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="flex aspect-video w-full items-center justify-center bg-nexus-dark">
                {lightbox.type === "video" ? (
                  resolveVideoUrl(lightbox.url) ? (
                    <VideoPlayer src={lightbox.url} title={lightbox.caption || lightbox.entryTitle} className="h-full w-full object-contain" controls autoPlay />
                  ) : (
                    <p className="p-6 text-sm text-white">This video link is invalid or uses an unsupported format.</p>
                  )
                ) : (
                  <img src={lightbox.url} alt={lightbox.caption || lightbox.entryTitle} className="h-full w-full object-contain" />
                )}
              </div>

              <div className="p-6">
                <p className="text-sm font-semibold text-white">
                  <TranslatedText>{lightbox.entryTitle}</TranslatedText>
                </p>
                {lightbox.caption && (
                  <p className="mt-1 text-xs text-nexus-gray/60">
                    <TranslatedText as="span">{lightbox.caption}</TranslatedText>
                  </p>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
