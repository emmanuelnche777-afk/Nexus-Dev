"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CalendarClock, Camera, Check, Link2Off, Send, Undo2 } from "lucide-react";

interface SocialPost {
  id: string;
  platform: string;
  title: string;
  content: string;
  mediaUrl?: string | null;
  status: string;
  scheduledAt?: string | null;
  approvedAt?: string | null;
  approvedBy?: string | null;
  createdAt: string;
  journeyEntry?: { title: string; projectName?: string | null; phaseOrder?: number | null } | null;
}

const STATUS_STYLE: Record<string, string> = {
  draft: "bg-gray-100 text-gray-700",
  pending_approval: "bg-amber-100 text-amber-800",
  approved: "bg-emerald-100 text-emerald-800",
  publishing: "bg-indigo-100 text-indigo-800",
  scheduled: "bg-blue-100 text-blue-800",
  published: "bg-green-100 text-green-800",
  failed: "bg-red-100 text-red-800",
};

export default function SocialQueuePage() {
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [scheduleTimes, setScheduleTimes] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [instagram, setInstagram] = useState<{ configured: boolean; connected: boolean; redirectUri?: string; account: { username: string; expiresAt: string } | null }>({ configured: false, connected: false, account: null });
  const [instagramBusy, setInstagramBusy] = useState(false);

  async function loadInstagram() {
    try {
      const response = await fetch("/api/admin/social/instagram", { cache: "no-store" });
      const data = await response.json();
      if (response.ok) setInstagram(data);
    } catch {
      // Keep the connection panel in its safe disconnected state.
    }
  }

  async function loadPosts() {
    try {
      const response = await fetch("/api/admin/social-media", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not load social drafts");
      setPosts(data.posts || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load social drafts");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadPosts();
      void loadInstagram();
      const params = new URLSearchParams(window.location.search);
      const instagramResult = params.get("instagram");
      if (instagramResult === "connected") setNotice("Instagram is connected. The account authorization is stored securely.");
      if (instagramResult === "error") setError(params.get("message") || "Instagram could not be connected.");
      if (instagramResult) window.history.replaceState({}, "", window.location.pathname);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  async function disconnectInstagram() {
    if (!window.confirm("Disconnect the Instagram account from NEXUS?")) return;
    setInstagramBusy(true);
    try {
      const response = await fetch("/api/admin/social/instagram", { method: "DELETE" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not disconnect Instagram.");
      setInstagram({ ...instagram, connected: false, account: null });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not disconnect Instagram.");
    } finally {
      setInstagramBusy(false);
    }
  }

  async function updatePost(post: SocialPost, status: string) {
    setBusyId(post.id);
    setError("");
    try {
      const scheduledAt = scheduleTimes[post.id];
      const response = await fetch("/api/admin/social-media", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postId: post.id,
          status,
          ...(status === "scheduled" && scheduledAt ? { scheduledAt: new Date(scheduledAt).toISOString() } : {}),
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not update post");
      await loadPosts();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update post");
    } finally {
      setBusyId(null);
    }
  }

  async function publishPost(post: SocialPost) {
    setBusyId(post.id);
    setError("");
    setNotice("");
    try {
      const response = await fetch("/api/admin/social/instagram/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId: post.id }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Instagram publishing failed.");
      setNotice(`Published “${post.title}” to Instagram.`);
      await loadPosts();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Instagram publishing failed.");
      await loadPosts();
    } finally {
      setBusyId(null);
    }
  }

  const sortedPosts = [...posts].sort((a, b) => {
    const aTime = a.scheduledAt ? new Date(a.scheduledAt).getTime() : new Date(a.createdAt).getTime();
    const bTime = b.scheduledAt ? new Date(b.scheduledAt).getTime() : new Date(b.createdAt).getTime();
    return aTime - bTime;
  });

  return (
    <div className="space-y-6">
      <header className="flex items-center gap-4">
        <Link href="/admin/content" className="rounded-md p-2 text-nexus-navy/60 hover:bg-nexus-navy/5"><ArrowLeft className="h-5 w-5" /></Link>
        <div>
          <h1 className="text-2xl font-bold text-nexus-navy">Social post review</h1>
          <p className="mt-1 text-sm text-nexus-navy/70">Review captions, approve them, and plan a release time.</p>
        </div>
      </header>

      <section className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-nexus-navy/10 bg-white p-4">
        <div className="flex items-start gap-3">
          <Camera className="mt-0.5 h-5 w-5 text-nexus-cyan" />
          <div>
            <h2 className="font-semibold text-nexus-navy">Instagram</h2>
            {instagram.connected && instagram.account ? (
              <p className="mt-1 text-sm text-emerald-700">Connected as @{instagram.account.username}</p>
              ) : instagram.configured ? (
                <p className="mt-1 text-sm text-nexus-navy/65">Not connected yet. Authorize the NEXUS Instagram professional account.</p>
              ) : (
                <p className="mt-1 text-sm text-amber-800">Add the Instagram app credentials and encryption key to the server environment first.</p>
              )}
            {instagram.redirectUri && <p className="mt-2 text-xs text-nexus-navy/70">Meta callback URL: <code className="select-all rounded bg-gray-100 px-1 py-0.5">{instagram.redirectUri}</code></p>}
          </div>
        </div>
        {instagram.connected ? (
          <button disabled={instagramBusy} onClick={() => void disconnectInstagram()} className="inline-flex items-center gap-2 rounded-md border border-nexus-navy/15 px-3 py-2 text-sm text-nexus-navy disabled:opacity-50"><Link2Off className="h-4 w-4" /> Disconnect</button>
        ) : (
          <a href="/api/admin/social/instagram/connect" aria-disabled={!instagram.configured} onClick={(event) => { if (!instagram.configured) event.preventDefault(); }} className={`inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-white ${instagram.configured ? "bg-nexus-cyan hover:opacity-90" : "cursor-not-allowed bg-gray-400"}`}><Camera className="h-4 w-4" /> Connect Instagram</a>
        )}
      </section>

      <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        Approved Instagram JPG/JPEG posts can publish now. On your Vercel Hobby plan, scheduled posts will stay queued until we connect an external scheduler. Other platforms still need their own account connections and publishing integrations.
      </div>

      {notice && <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{notice}</div>}
      {error && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
      {loading ? <p className="text-sm text-nexus-navy/60">Loading posts…</p> : sortedPosts.length === 0 ? (
        <div className="rounded-xl border border-nexus-navy/10 bg-white p-8 text-center text-sm text-nexus-navy/60">No social drafts yet. Add platform captions while creating or editing a Journey phase.</div>
      ) : (
        <div className="space-y-4">
          {sortedPosts.map((post) => (
            <article key={post.id} className="rounded-xl border border-nexus-navy/10 bg-white p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-nexus-cyan">{post.platform}</p>
                  <h2 className="mt-1 font-semibold text-nexus-navy">{post.title}</h2>
                  {post.journeyEntry && <p className="mt-1 text-xs text-nexus-navy/55">From Journey: {post.journeyEntry.projectName ? `${post.journeyEntry.projectName} · ` : ""}{post.journeyEntry.title}{post.journeyEntry.phaseOrder ? ` · Phase ${post.journeyEntry.phaseOrder}` : ""}</p>}
                </div>
                <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLE[post.status] || STATUS_STYLE.draft}`}>{post.status.replaceAll("_", " ")}</span>
              </div>
              <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-nexus-navy/80">{post.content}</p>
              {post.mediaUrl && <a href={post.mediaUrl} target="_blank" rel="noreferrer" className="mt-3 inline-block text-xs text-nexus-cyan underline">View attached media</a>}
              {post.scheduledAt && <p className="mt-3 text-xs text-nexus-navy/60">Planned for {new Date(post.scheduledAt).toLocaleString()}</p>}

              <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-nexus-navy/10 pt-4">
                {post.status === "draft" && <button disabled={busyId === post.id} onClick={() => void updatePost(post, "pending_approval")} className="inline-flex items-center gap-1.5 rounded-md bg-amber-100 px-3 py-2 text-xs font-medium text-amber-900 disabled:opacity-50"><Send className="h-3.5 w-3.5" /> Request approval</button>}
                {post.status === "pending_approval" && <>
                  <button disabled={busyId === post.id} onClick={() => void updatePost(post, "approved")} className="inline-flex items-center gap-1.5 rounded-md bg-emerald-600 px-3 py-2 text-xs font-medium text-white disabled:opacity-50"><Check className="h-3.5 w-3.5" /> Approve</button>
                  <button disabled={busyId === post.id} onClick={() => void updatePost(post, "draft")} className="inline-flex items-center gap-1.5 rounded-md border border-nexus-navy/15 px-3 py-2 text-xs font-medium text-nexus-navy disabled:opacity-50"><Undo2 className="h-3.5 w-3.5" /> Return to draft</button>
                </>}
                {post.status === "approved" && <>
                  {post.platform === "instagram" && <button disabled={busyId === post.id || !instagram.connected} onClick={() => void publishPost(post)} className="inline-flex items-center gap-1.5 rounded-md bg-pink-600 px-3 py-2 text-xs font-medium text-white disabled:opacity-50"><Camera className="h-3.5 w-3.5" /> Publish now</button>}
                  <input type="datetime-local" value={scheduleTimes[post.id] || ""} onChange={(e) => setScheduleTimes((current) => ({ ...current, [post.id]: e.target.value }))} className="rounded-md border border-nexus-navy/15 px-3 py-2 text-xs text-nexus-navy" aria-label={`Schedule ${post.title}`} />
                  <button disabled={busyId === post.id || !scheduleTimes[post.id]} onClick={() => void updatePost(post, "scheduled")} className="inline-flex items-center gap-1.5 rounded-md bg-nexus-cyan px-3 py-2 text-xs font-medium text-white disabled:opacity-50"><CalendarClock className="h-3.5 w-3.5" /> Schedule</button>
                  <button disabled={busyId === post.id} onClick={() => void updatePost(post, "draft")} className="inline-flex items-center gap-1.5 rounded-md border border-nexus-navy/15 px-3 py-2 text-xs font-medium text-nexus-navy disabled:opacity-50"><Undo2 className="h-3.5 w-3.5" /> Return to draft</button>
                </>}
                {post.status === "scheduled" && <button disabled={busyId === post.id} onClick={() => void updatePost(post, "approved")} className="inline-flex items-center gap-1.5 rounded-md border border-nexus-navy/15 px-3 py-2 text-xs font-medium text-nexus-navy disabled:opacity-50"><Undo2 className="h-3.5 w-3.5" /> Cancel schedule</button>}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
