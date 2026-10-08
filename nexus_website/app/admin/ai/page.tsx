"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, BookOpen, MessageSquare, Play, Sparkles, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import LoadingState from "@/components/admin/LoadingState";

type AiKey = "chats" | "escalations" | "liveChats" | "knowledge" | "videos";
type Tile = { key: AiKey; title: string; href: string; icon: LucideIcon; description: string };
const TILES: Tile[] = [
  { key: "chats", title: "AI chat logs", href: "/admin/ai-chat", icon: MessageSquare, description: "Visitor chat records" },
  { key: "escalations", title: "Escalations", href: "/admin/ai/escalations", icon: Sparkles, description: "Waiting for staff attention" },
  { key: "liveChats", title: "Live support", href: "/admin/ai/live-support", icon: Users, description: "Active support conversations" },
  { key: "knowledge", title: "Knowledge to review", href: "/admin/ai/knowledge", icon: BookOpen, description: "Unapproved knowledge entries" },
  { key: "videos", title: "Published AI videos", href: "/admin/ai/videos", icon: Play, description: "Videos currently available" },
];

export default function AIDashboard() {
  const [counts, setCounts] = useState<Partial<Record<AiKey, number>>>({});
  const [permissions, setPermissions] = useState<Partial<Record<AiKey, boolean>>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch("/api/admin/ai/summary", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) throw new Error("Unable to load AI overview");
        return response.json();
      })
      .then((data) => {
        setCounts(data.counts ?? {});
        setPermissions(data.permissions ?? {});
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingState />;
  const visibleTiles = TILES.filter((tile) => permissions[tile.key]);
  const pending = (counts.escalations ?? 0) + (counts.knowledge ?? 0);

  return (
    <main className="space-y-6 p-6">
      <header>
        <h1 className="text-2xl font-bold text-nexus-navy">AI Management overview</h1>
        <p className="mt-1 text-sm text-nexus-navy/70">Monitor visitor conversations, staff escalations, and AI content.</p>
      </header>
      {error ? (
        <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">AI overview counts could not be loaded. Refresh the page or open a section directly.</div>
      ) : (
        <>
          <section className="rounded-xl border border-nexus-navy/10 bg-white p-5">
            <p className="text-sm text-nexus-navy/60">Items needing review</p>
            <p className="mt-1 text-3xl font-bold text-nexus-navy">{pending}</p>
            <p className="mt-1 text-xs text-nexus-navy/50">Open escalations and unapproved knowledge entries</p>
          </section>
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3" aria-label="AI management sections">
            {visibleTiles.map((tile) => (
              <Link key={tile.key} href={tile.href} className="group rounded-xl border border-nexus-navy/10 bg-white p-5 transition hover:border-nexus-cyan/40 hover:shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3"><span className="rounded-lg bg-nexus-cyan/10 p-2"><tile.icon className="h-5 w-5 text-nexus-cyan" /></span><h2 className="font-semibold text-nexus-navy">{tile.title}</h2></div>
                  <ArrowRight className="h-4 w-4 text-nexus-cyan transition group-hover:translate-x-1" />
                </div>
                <p className="mt-4 text-sm text-nexus-navy/60">{tile.description}</p>
                <p className="mt-3 text-2xl font-bold text-nexus-navy">{counts[tile.key] ?? 0}</p>
                <p className="text-xs text-nexus-navy/50">{tile.key === "escalations" || tile.key === "knowledge" || tile.key === "liveChats" ? "open" : "records"}</p>
              </Link>
            ))}
          </section>
        </>
      )}
    </main>
  );
}
