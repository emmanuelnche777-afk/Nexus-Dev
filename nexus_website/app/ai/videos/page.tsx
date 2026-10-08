"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Play } from "lucide-react";
import VideoPlayer from "@/components/video/VideoPlayer";
import { resolveVideoUrl } from "@/lib/video-url";

type PublicVideo = {
  id: string;
  title: string;
  description: string | null;
  videoUrl: string;
  thumbnailUrl: string | null;
  category: string;
  duration: string | null;
  tags: string[];
  createdAt: string;
};

export default function AIVideosLibraryPage() {
  const [videos, setVideos] = useState<PublicVideo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/ai-videos", { cache: "no-store" })
      .then((response) => response.json())
      .then((data) => setVideos(Array.isArray(data.videos) ? data.videos : []))
      .catch(() => setVideos([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="min-h-screen bg-nexus-gray py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Link href="/academy" className="inline-flex items-center gap-2 text-sm font-medium text-nexus-cyan hover:underline">
          <ArrowLeft className="h-4 w-4" /> Academy
        </Link>
        <header className="mx-auto mb-12 mt-8 max-w-3xl text-center">
          <p className="font-semibold uppercase tracking-[0.25em] text-nexus-cyan">NEXUS Learning</p>
          <h1 className="mt-3 text-4xl font-bold text-nexus-dark sm:text-5xl">AI Video Library</h1>
          <p className="mt-4 text-lg text-nexus-navy/70">Tutorials, demonstrations, webinars, and conversations published by NEXUS.</p>
        </header>

        {loading ? (
          <p className="py-16 text-center text-nexus-navy/60">Loading videos…</p>
        ) : videos.length === 0 ? (
          <div className="rounded-2xl border border-nexus-cyan/15 bg-white p-10 text-center">
            <Play className="mx-auto h-8 w-8 text-nexus-cyan" />
            <h2 className="mt-4 text-xl font-semibold text-nexus-dark">No videos published yet</h2>
            <p className="mt-2 text-sm text-nexus-navy/60">New videos will appear here when they are published.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {videos.map((video) => {
              const isSupported = Boolean(resolveVideoUrl(video.videoUrl));
              return (
                <article key={video.id} className="overflow-hidden rounded-2xl border border-nexus-cyan/15 bg-white shadow-sm">
                  <div className="aspect-video bg-nexus-dark">
                    {isSupported ? (
                      <VideoPlayer src={video.videoUrl} title={video.title} poster={video.thumbnailUrl || undefined} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center px-6 text-center text-sm text-white/70">This video link is currently unavailable.</div>
                    )}
                  </div>
                  <div className="p-5">
                    <p className="text-xs font-semibold uppercase tracking-wider text-nexus-cyan">{video.category}{video.duration ? ` · ${video.duration}` : ""}</p>
                    <h2 className="mt-2 text-xl font-bold text-nexus-dark">{video.title}</h2>
                    {video.description && <p className="mt-2 line-clamp-4 text-sm leading-relaxed text-nexus-navy/70">{video.description}</p>}
                    {video.tags.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {video.tags.map((tag) => <span key={tag} className="rounded-full bg-nexus-cyan/10 px-2.5 py-1 text-xs text-nexus-cyan">{tag}</span>)}
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
