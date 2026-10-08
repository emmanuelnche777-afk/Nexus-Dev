"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  ArrowLeft,
  Play,
  Eye,
  X as XIcon,
  Save,
  Video as VideoIcon,
  Clock,
  Tag,
  CheckCircle2,
  Circle,
  ExternalLink,
} from "lucide-react";
import LoadingState from "@/components/admin/LoadingState";
import EmptyState from "@/components/admin/EmptyState";
import AdminModal from "@/components/admin/AdminModal";
import VideoPlayer from "@/components/video/VideoPlayer";
import { resolveVideoUrl } from "@/lib/video-url";

interface AIVideo {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl: string;
  category: string;
  duration: string;
  status: string;
  createdAt: string;
  views?: number;
  tags?: string[];
}

const CATEGORY_OPTIONS = [
  { value: "tutorial", label: "Tutorial" },
  { value: "demo", label: "Demo" },
  { value: "webinar", label: "Webinar" },
  { value: "interview", label: "Interview" },
];

const STATUS_OPTIONS = [
  { value: "published", label: "Published" },
  { value: "draft", label: "Draft" },
  { value: "archived", label: "Archived" },
];

const CATEGORY_STYLES: Record<string, string> = {
  tutorial: "bg-blue-100 text-blue-700",
  demo: "bg-emerald-100 text-emerald-700",
  webinar: "bg-purple-100 text-purple-700",
  interview: "bg-amber-100 text-amber-700",
};

const STATUS_STYLES: Record<string, string> = {
  published: "bg-emerald-100 text-emerald-700",
  draft: "bg-amber-100 text-amber-700",
  archived: "bg-gray-100 text-gray-700",
};

const emptyForm = {
  title: "",
  description: "",
  videoUrl: "",
  thumbnailUrl: "",
  category: "tutorial",
  duration: "",
  status: "published",
  tags: "",
};

function parseTags(input: string): string[] {
  return input
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean)
    .slice(0, 12);
}

export default function AIVideosPage() {
  const [videos, setVideos] = useState<AIVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [editingVideo, setEditingVideo] = useState<AIVideo | null>(null);
  const [viewingVideo, setViewingVideo] = useState<AIVideo | null>(null);
  const [formData, setFormData] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadVideos();
  }, []);

  async function loadVideos() {
    try {
      const res = await fetch("/api/admin/ai-videos");
      if (!res.ok) throw new Error("Failed to load");
      const data = await res.json();
      setVideos(data.videos || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load videos");
    } finally {
      setLoading(false);
    }
  }

  function openCreate() {
    setEditingVideo(null);
    setFormData(emptyForm);
    setShowModal(true);
  }

  function openEdit(video: AIVideo) {
    setEditingVideo(video);
    setFormData({
      title: video.title,
      description: video.description,
      videoUrl: video.videoUrl,
      thumbnailUrl: video.thumbnailUrl,
      category: video.category,
      duration: video.duration,
      status: video.status,
      tags: (video.tags || []).join(", "),
    });
    setShowModal(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...formData,
        tags: parseTags(formData.tags),
      };
      const url = editingVideo
        ? `/api/admin/ai-videos/${editingVideo.id}`
        : "/api/admin/ai-videos";
      const method = editingVideo ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Save failed");
      }
      setShowModal(false);
      setEditingVideo(null);
      setFormData(emptyForm);
      await loadVideos();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to save video");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this video?")) return;
    try {
      const res = await fetch(`/api/admin/ai-videos/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Delete failed");
      }
      setVideos((prev) => prev.filter((v) => v.id !== id));
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to delete video");
    }
  }

  const filteredVideos = videos.filter((v) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      v.title.toLowerCase().includes(q) ||
      v.description.toLowerCase().includes(q) ||
      (v.tags || []).some((t) => t.toLowerCase().includes(q));
    const matchesCategory = categoryFilter === "all" || v.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/dashboard"
            className="rounded-md p-2 text-nexus-navy/60 hover:bg-nexus-navy/5"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-nexus-navy">AI Videos</h1>
            <p className="mt-1 text-sm text-nexus-navy/70">
              Manage AI tutorial and demo videos shown on the public site
            </p>
          </div>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 rounded-lg bg-nexus-cyan px-4 py-2.5 text-sm font-medium text-white transition hover:bg-nexus-cyan-bright"
        >
          <Plus className="h-4 w-4" />
          Add Video
        </button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-nexus-navy/40" />
          <input
            type="text"
            placeholder="Search videos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-nexus-navy/10 bg-white py-2.5 pl-10 pr-4 text-sm text-nexus-navy placeholder:text-nexus-navy/40 focus:border-nexus-cyan focus:outline-none"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="rounded-lg border border-nexus-navy/10 bg-white px-3 py-2.5 text-sm text-nexus-navy focus:border-nexus-cyan focus:outline-none"
        >
          <option value="all">All categories</option>
          {CATEGORY_OPTIONS.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="rounded-xl border border-nexus-navy/10 bg-white p-4">
        {loading ? (
          <LoadingState label="Loading videos..." />
        ) : filteredVideos.length === 0 ? (
          <EmptyState
            icon={VideoIcon}
            title={videos.length === 0 ? "No videos yet" : "No videos match your filters"}
            description={
              videos.length === 0
                ? "Click 'Add Video' to publish your first one. Supports YouTube, Vimeo, or direct file URLs."
                : "Try a different search or category."
            }
          />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredVideos.map((video) => (
              <div
                key={video.id}
                className="overflow-hidden rounded-xl border border-nexus-navy/10 bg-white transition hover:border-nexus-cyan/30 hover:shadow-md"
              >
                <button
                  onClick={() => setViewingVideo(video)}
                  className="relative block aspect-video w-full bg-nexus-gray/20"
                >
                  {video.thumbnailUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={video.thumbnailUrl}
                      alt={video.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-nexus-navy to-nexus-dark">
                      <Play className="h-12 w-12 text-nexus-cyan/50" />
                    </div>
                  )}
                  <div className="absolute inset-0 flex items-center justify-center bg-nexus-dark/40 opacity-0 transition-opacity group-hover:opacity-100 hover:opacity-100">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-nexus-cyan text-white shadow-2xl">
                      <Play className="h-7 w-7 fill-white" />
                    </div>
                  </div>
                  {video.duration && (
                    <span className="absolute bottom-2 right-2 rounded-md bg-nexus-dark/80 px-1.5 py-0.5 text-xs font-semibold text-white">
                      {video.duration}
                    </span>
                  )}
                </button>
                <div className="p-4">
                  <h3 className="line-clamp-2 font-medium text-nexus-navy">
                    {video.title}
                  </h3>
                  <p className="mt-1 line-clamp-2 text-sm text-nexus-navy/70">
                    {video.description}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                        CATEGORY_STYLES[video.category] || CATEGORY_STYLES.tutorial
                      }`}
                    >
                      {video.category}
                    </span>
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                        STATUS_STYLES[video.status] || STATUS_STYLES.draft
                      }`}
                    >
                      {video.status}
                    </span>
                  </div>
                  <div className="mt-4 flex items-center gap-2">
                    <button
                      onClick={() => setViewingVideo(video)}
                      className="flex flex-1 items-center justify-center gap-1 rounded-md border border-nexus-navy/10 px-3 py-1.5 text-xs font-medium text-nexus-navy transition hover:bg-nexus-navy/5"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      View
                    </button>
                    <button
                      onClick={() => openEdit(video)}
                      className="rounded-md p-1.5 text-nexus-navy/60 hover:bg-nexus-navy/5 hover:text-nexus-navy"
                      title="Edit"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(video.id)}
                      className="rounded-md p-1.5 text-red-600 hover:bg-red-50"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <AdminModal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={editingVideo ? "Edit Video" : "Add Video"}
        description="Use a YouTube/Vimeo URL or a direct .mp4 file. Tags help visitors find related content."
        maxWidth="2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-nexus-navy">Title</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="mt-1 w-full rounded-lg border border-nexus-navy/10 px-3 py-2 text-sm focus:border-nexus-cyan focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-nexus-navy">Description</label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="mt-1 w-full rounded-lg border border-nexus-navy/10 px-3 py-2 text-sm focus:border-nexus-cyan focus:outline-none"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-nexus-navy">Video URL</label>
              <input
                type="text"
                required
                value={formData.videoUrl}
                onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                className="mt-1 w-full rounded-lg border border-nexus-navy/10 px-3 py-2 text-sm focus:border-nexus-cyan focus:outline-none"
                placeholder="https://youtube.com/... or https://vimeo.com/... or /videos/ai.mp4"
              />
              {formData.videoUrl && resolveVideoUrl(formData.videoUrl) && (
                <p className="mt-1 flex items-center gap-1 text-xs text-nexus-cyan">
                  <CheckCircle2 className="h-3 w-3" /> Supported video link
                </p>
              )}
              {formData.videoUrl && !resolveVideoUrl(formData.videoUrl) && (
                <p className="mt-1 text-xs text-red-600">Use a YouTube/Vimeo link or a supported video file URL.</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-nexus-navy">Thumbnail URL</label>
              <input
                type="text"
                value={formData.thumbnailUrl}
                onChange={(e) => setFormData({ ...formData, thumbnailUrl: e.target.value })}
                className="mt-1 w-full rounded-lg border border-nexus-navy/10 px-3 py-2 text-sm focus:border-nexus-cyan focus:outline-none"
                placeholder="/images/videos/thumbnail.jpg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-nexus-navy">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="mt-1 w-full rounded-lg border border-nexus-navy/10 px-3 py-2 text-sm focus:border-nexus-cyan focus:outline-none"
              >
                {CATEGORY_OPTIONS.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-nexus-navy">Duration</label>
              <input
                type="text"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                className="mt-1 w-full rounded-lg border border-nexus-navy/10 px-3 py-2 text-sm focus:border-nexus-cyan focus:outline-none"
                placeholder="10:30"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-nexus-navy">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="mt-1 w-full rounded-lg border border-nexus-navy/10 px-3 py-2 text-sm focus:border-nexus-cyan focus:outline-none"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-nexus-navy">Tags (comma-separated)</label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                className="mt-1 w-full rounded-lg border border-nexus-navy/10 px-3 py-2 text-sm focus:border-nexus-cyan focus:outline-none"
                placeholder="chatgpt, automation, beginner"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="flex items-center gap-1.5 rounded-lg border border-nexus-navy/10 px-4 py-2 text-sm font-medium text-nexus-navy transition hover:bg-nexus-navy/5"
            >
              <XIcon className="h-4 w-4" />
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-1.5 rounded-lg bg-nexus-cyan px-4 py-2 text-sm font-medium text-white transition hover:bg-nexus-cyan-bright disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {saving ? "Saving..." : editingVideo ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </AdminModal>

      {viewingVideo && (
        <VideoViewModal video={viewingVideo} onClose={() => setViewingVideo(null)} />
      )}
    </div>
  );
}

function VideoViewModal({
  video,
  onClose,
}: {
  video: AIVideo;
  onClose: () => void;
}) {
  const supported = resolveVideoUrl(video.videoUrl);
  return (
    <AdminModal
      open
      onClose={onClose}
      title={video.title}
      description={video.description}
      maxWidth="2xl"
    >
      <div className="space-y-4">
        <div className="overflow-hidden rounded-lg border border-nexus-navy/10 bg-nexus-dark">
          {supported ? (
            <div className="aspect-video">
              <VideoPlayer src={video.videoUrl} title={video.title} poster={video.thumbnailUrl} className="h-full w-full" />
            </div>
          ) : <p className="p-6 text-sm text-white">This video link is invalid or unsupported.</p>}
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="flex items-start gap-2">
            <Tag className="mt-0.5 h-4 w-4 shrink-0 text-nexus-navy/50" />
            <div>
              <p className="text-xs text-nexus-navy/50">Category</p>
              <p className="text-sm font-medium text-nexus-navy capitalize">
                {video.category}
              </p>
            </div>
          </div>
          {video.duration && (
            <div className="flex items-start gap-2">
              <Clock className="mt-0.5 h-4 w-4 shrink-0 text-nexus-navy/50" />
              <div>
                <p className="text-xs text-nexus-navy/50">Duration</p>
                <p className="text-sm font-medium text-nexus-navy">{video.duration}</p>
              </div>
            </div>
          )}
          <div className="flex items-start gap-2">
            <Circle
              className={`mt-0.5 h-4 w-4 shrink-0 ${
                video.status === "published" ? "text-emerald-500" : "text-amber-500"
              }`}
            />
            <div>
              <p className="text-xs text-nexus-navy/50">Status</p>
              <p className="text-sm font-medium text-nexus-navy capitalize">
                {video.status}
              </p>
            </div>
          </div>
        </div>

        {(video.tags || []).length > 0 && (
          <div>
            <p className="mb-2 text-xs text-nexus-navy/50">Tags</p>
            <div className="flex flex-wrap gap-1.5">
              {video.tags!.map((t) => (
                <span
                  key={t}
                  className="inline-flex rounded-full bg-nexus-cyan/10 px-2.5 py-0.5 text-xs font-medium text-nexus-cyan"
                >
                  #{t}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="rounded-md border border-nexus-navy/10 bg-nexus-gray/30 p-3">
          <p className="text-xs text-nexus-navy/50">Source URL</p>
          <a
            href={video.videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 inline-flex items-center gap-1 break-all text-sm text-nexus-cyan hover:underline"
          >
            {video.videoUrl}
            <ExternalLink className="h-3 w-3 shrink-0" />
          </a>
        </div>

        <div className="flex justify-end border-t border-nexus-navy/10 pt-4">
          <button
            onClick={onClose}
            className="rounded-lg border border-nexus-navy/10 px-4 py-2 text-sm font-medium text-nexus-navy hover:bg-nexus-navy/5"
          >
            Close
          </button>
        </div>
      </div>
    </AdminModal>
  );
}
