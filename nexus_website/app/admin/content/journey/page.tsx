"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  ArrowLeft,
  Map,
  Save,
  X as XIcon,
  CalendarDays,
  Hash,
} from "lucide-react";
import LoadingState from "@/components/admin/LoadingState";
import EmptyState from "@/components/admin/EmptyState";
import AdminModal from "@/components/admin/AdminModal";
import { removeCloudinaryVideo, uploadCloudinaryVideo, type CloudinaryVideoUpload } from "@/lib/cloudinary-video-upload";

interface JourneyEntry {
  id: string;
  date: string;
  title: string;
  description: string;
  fullContent?: string;
  status: string;
  category: string;
  priority: number;
  tags?: string[];
  media?: JourneyMedia[];
  projectName?: string | null;
  phaseOrder?: number | null;
  progress?: number | null;
  outcome?: string | null;
  socialPosts?: Array<{ platform: string; content: string; status: string }>;
  createdAt?: string;
  updatedAt?: string;
}

const SOCIAL_PLATFORMS = [
  { value: "instagram", label: "Instagram" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "youtube", label: "YouTube" },
  { value: "tiktok", label: "TikTok" },
] as const;

interface JourneyMedia {
  type: "image" | "video";
  url: string;
  thumbnail?: string;
  caption?: string;
  publicId?: string | null;
}

const CATEGORY_OPTIONS = [
  { value: "company", label: "Company" },
  { value: "academy", label: "Academy" },
  { value: "tech-hub", label: "Tech Hub" },
  { value: "foundation", label: "Foundation" },
  { value: "mentorship", label: "Mentorship" },
];

const STATUS_OPTIONS = [
  { value: "live", label: "Live" },
  { value: "upcoming", label: "Upcoming" },
  { value: "completed", label: "Completed" },
];

const STATUS_STYLES: Record<string, string> = {
  live: "bg-emerald-100 text-emerald-700",
  upcoming: "bg-blue-100 text-blue-700",
  completed: "bg-gray-100 text-gray-700",
};

const CATEGORY_COLORS: Record<string, string> = {
  company: "bg-nexus-cyan/10 text-nexus-cyan",
  academy: "bg-emerald-50 text-emerald-700",
  "tech-hub": "bg-purple-50 text-purple-700",
  foundation: "bg-amber-50 text-amber-700",
  mentorship: "bg-blue-50 text-blue-700",
};

const emptyForm = {
  date: "",
  title: "",
  description: "",
  fullContent: "",
  status: "live",
  category: "company",
  priority: 5,
  tags: "",
  media: [] as JourneyMedia[],
  projectName: "",
  phaseOrder: "",
  progress: "",
  outcome: "",
  socialCaptions: {} as Record<string, string>,
};

export default function JourneyAdminPage() {
  const [entries, setEntries] = useState<JourneyEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [editingEntry, setEditingEntry] = useState<JourneyEntry | null>(null);
  const [formData, setFormData] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const pendingVideoUploads = useRef<CloudinaryVideoUpload[]>([]);

  function discardPendingVideo(publicId: string) {
    const pending = pendingVideoUploads.current.find((item) => item.publicId === publicId);
    if (!pending) return;
    pendingVideoUploads.current = pendingVideoUploads.current.filter((item) => item.publicId !== publicId);
    void removeCloudinaryVideo(pending, "journey");
  }

  function discardAllPendingVideos() {
    const pending = pendingVideoUploads.current;
    pendingVideoUploads.current = [];
    for (const video of pending) void removeCloudinaryVideo(video, "journey");
  }

  useEffect(() => {
    loadEntries();
  }, []);

  async function loadEntries() {
    try {
      const res = await fetch("/api/admin/content/journey");
      if (!res.ok) throw new Error("Failed to load");
      const data = await res.json();
      setEntries(data.entries || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load entries");
    } finally {
      setLoading(false);
    }
  }

  function openCreate() {
    setEditingEntry(null);
    setFormData(emptyForm);
    setShowModal(true);
  }

  function openEdit(entry: JourneyEntry) {
    setEditingEntry(entry);
    setFormData({
      date: entry.date,
      title: entry.title,
      description: entry.description,
      fullContent: entry.fullContent || "",
      status: entry.status,
      category: entry.category,
      priority: entry.priority || 5,
      tags: (entry.tags || []).join(", "),
      media: entry.media || [],
      projectName: entry.projectName || "",
      phaseOrder: entry.phaseOrder?.toString() || "",
      progress: entry.progress?.toString() || "",
      outcome: entry.outcome || "",
      socialCaptions: Object.fromEntries((entry.socialPosts || []).map((post) => [post.platform, post.content])),
    });
    setShowModal(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...(editingEntry ? { id: editingEntry.id } : {}),
        ...formData,
        tags: formData.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        media: formData.media,
        socialCaptions: formData.socialCaptions,
      };
      const url = editingEntry
        ? `/api/admin/content/journey?id=${editingEntry.id}`
        : "/api/admin/content/journey";
      const method = editingEntry ? "PUT" : "POST";
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
      setEditingEntry(null);
      setFormData(emptyForm);
      pendingVideoUploads.current = [];
      await loadEntries();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to save entry");
    } finally {
      setSaving(false);
    }
  }

  async function uploadJourneyMedia(file: File) {
    const type = file.type.startsWith("video/") ? "video" : "image";
    if (type === "video") {
      const uploaded = await uploadCloudinaryVideo(file, "journey");
      pendingVideoUploads.current.push(uploaded);
      setFormData((current) => ({
        ...current,
        media: [...current.media, { type, url: uploaded.url, publicId: uploaded.publicId, caption: "" }],
      }));
      return;
    }
    const body = new FormData();
    body.set("file", file);
    body.set("type", type);
    body.set("context", "journey");
    const response = await fetch("/api/admin/upload", { method: "POST", body });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Media upload failed");
    setFormData((current) => ({
      ...current,
      media: [...current.media, { type, url: result.url, caption: "" }],
    }));
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this entry?")) return;
    try {
      const res = await fetch("/api/admin/content/journey", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Delete failed");
      }
      setEntries((prev) => prev.filter((e) => e.id !== id));
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to delete entry");
    }
  }

  const sortedEntries = [...entries].sort(
    (a, b) => {
      if (a.projectName && a.projectName === b.projectName && a.phaseOrder != null && b.phaseOrder != null) {
        return a.phaseOrder - b.phaseOrder;
      }
      return (b.priority || 0) - (a.priority || 0);
    }
  );

  const filteredEntries = sortedEntries.filter((e) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      e.title.toLowerCase().includes(q) ||
      e.description.toLowerCase().includes(q);
    const matchesStatus = statusFilter === "all" || e.status === statusFilter;
    const matchesCategory = categoryFilter === "all" || e.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/content"
            className="rounded-md p-2 text-nexus-navy/60 hover:bg-nexus-navy/5"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-nexus-navy">Journey</h1>
            <p className="mt-1 text-sm text-nexus-navy/70">
              Manage journey entries and milestones (timeline shown on /journey)
            </p>
          </div>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 rounded-lg bg-nexus-cyan px-4 py-2.5 text-sm font-medium text-white transition hover:bg-nexus-cyan-bright"
        >
          <Plus className="h-4 w-4" />
          New Entry
        </button>
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-nexus-navy/40" />
          <input
            type="text"
            placeholder="Search entries..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-nexus-navy/10 bg-white py-2.5 pl-10 pr-4 text-sm text-nexus-navy placeholder:text-nexus-navy/40 focus:border-nexus-cyan focus:outline-none"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-nexus-navy/10 bg-white px-3 py-2.5 text-sm text-nexus-navy focus:border-nexus-cyan focus:outline-none"
          >
            <option value="all">All statuses</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
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
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="rounded-xl border border-nexus-navy/10 bg-white">
        {loading ? (
          <LoadingState label="Loading entries..." />
        ) : filteredEntries.length === 0 ? (
          <EmptyState
            icon={Map}
            title={entries.length === 0 ? "No journey entries yet" : "No entries match your filters"}
            description={
              entries.length === 0
                ? "Click 'New Entry' to add your first milestone. Higher priority entries show first."
                : "Try a different search or filter combination."
            }
          />
        ) : (
          <div className="divide-y divide-nexus-navy/10">
            {filteredEntries.map((entry) => (
              <div
                key={entry.id}
                className="flex items-start gap-4 px-6 py-4"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                  <Map className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium text-nexus-navy">{entry.title}</p>
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                        STATUS_STYLES[entry.status] || STATUS_STYLES.live
                      }`}
                    >
                      {entry.status}
                    </span>
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                        CATEGORY_COLORS[entry.category] || CATEGORY_COLORS.company
                      }`}
                    >
                      {entry.category}
                    </span>
                  </div>
                  <p className="mt-1 line-clamp-2 text-sm text-nexus-navy/70">
                    {entry.description}
                  </p>
                  <p className="mt-1 flex items-center gap-3 text-xs text-nexus-navy/50">
                    <span className="inline-flex items-center gap-1">
                      <CalendarDays className="h-3 w-3" />
                      {entry.date}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Hash className="h-3 w-3" />
                      Priority {entry.priority}
                    </span>
                    {Array.isArray(entry.tags) && entry.tags.length > 0 && (
                      <span>• {entry.tags.join(", ")}</span>
                    )}
                  </p>
                  {entry.projectName && (
                    <p className="mt-1 text-xs font-medium text-nexus-cyan">
                      {entry.projectName}{entry.phaseOrder ? ` · Phase ${entry.phaseOrder}` : ""}
                      {entry.progress !== null && entry.progress !== undefined ? ` · ${entry.progress}%` : ""}
                    </p>
                  )}
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <button
                    onClick={() => openEdit(entry)}
                    className="rounded-md p-2 text-nexus-navy/60 hover:bg-nexus-navy/5 hover:text-nexus-navy"
                    title="Edit"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(entry.id)}
                    className="rounded-md p-2 text-red-600 hover:bg-red-50"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <AdminModal
        open={showModal}
        onClose={() => {
          discardAllPendingVideos();
          setShowModal(false);
        }}
        title={editingEntry ? "Edit Entry" : "New Journey Entry"}
        description="Higher priority numbers appear first. Use date as a short label (e.g. 'Q1 2026' or '2025-08-15')."
        maxWidth="2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-nexus-navy">Project name (optional)</label>
              <input
                value={formData.projectName}
                onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                className="mt-1 w-full rounded-lg border border-nexus-navy/10 bg-white px-3 py-2 text-sm focus:border-nexus-cyan focus:outline-none"
                placeholder="e.g. Community Learning Hub"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-nexus-navy">Phase number</label>
              <input
                type="number"
                min={1}
                value={formData.phaseOrder}
                onChange={(e) => setFormData({ ...formData, phaseOrder: e.target.value })}
                className="mt-1 w-full rounded-lg border border-nexus-navy/10 bg-white px-3 py-2 text-sm focus:border-nexus-cyan focus:outline-none"
                placeholder="1"
              />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-nexus-navy">Project progress (%)</label>
              <input
                type="number"
                min={0}
                max={100}
                value={formData.progress}
                onChange={(e) => setFormData({ ...formData, progress: e.target.value })}
                className="mt-1 w-full rounded-lg border border-nexus-navy/10 bg-white px-3 py-2 text-sm focus:border-nexus-cyan focus:outline-none"
                placeholder="e.g. 40"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-nexus-navy">Outcome or measurable result</label>
              <input
                value={formData.outcome}
                onChange={(e) => setFormData({ ...formData, outcome: e.target.value })}
                className="mt-1 w-full rounded-lg border border-nexus-navy/10 bg-white px-3 py-2 text-sm focus:border-nexus-cyan focus:outline-none"
                placeholder="e.g. 24 learners completed the first workshop"
              />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-nexus-navy">Date</label>
              <input
                type="text"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="mt-1 w-full rounded-lg border border-nexus-navy/10 bg-white px-3 py-2 text-sm focus:border-nexus-cyan focus:outline-none"
                placeholder="Q1 2026"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-nexus-navy">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="mt-1 w-full rounded-lg border border-nexus-navy/10 bg-white px-3 py-2 text-sm focus:border-nexus-cyan focus:outline-none"
              >
                {CATEGORY_OPTIONS.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-nexus-navy">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="mt-1 w-full rounded-lg border border-nexus-navy/10 bg-white px-3 py-2 text-sm focus:border-nexus-cyan focus:outline-none"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-nexus-navy">
                Priority (higher = shown first)
              </label>
              <input
                type="number"
                min={0}
                max={100}
                value={formData.priority}
                onChange={(e) =>
                  setFormData({ ...formData, priority: parseInt(e.target.value) || 0 })
                }
                className="mt-1 w-full rounded-lg border border-nexus-navy/10 bg-white px-3 py-2 text-sm focus:border-nexus-cyan focus:outline-none"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-nexus-navy">Title</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="mt-1 w-full rounded-lg border border-nexus-navy/10 bg-white px-3 py-2 text-sm focus:border-nexus-cyan focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-nexus-navy">Description</label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="mt-1 w-full rounded-lg border border-nexus-navy/10 bg-white px-3 py-2 text-sm focus:border-nexus-cyan focus:outline-none"
              placeholder="Short summary shown on timeline"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-nexus-navy">Full Content</label>
            <textarea
              rows={5}
              value={formData.fullContent}
              onChange={(e) => setFormData({ ...formData, fullContent: e.target.value })}
              className="mt-1 w-full rounded-lg border border-nexus-navy/10 bg-white px-3 py-2 text-sm focus:border-nexus-cyan focus:outline-none"
              placeholder="Longer description, shown when entry is expanded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-nexus-navy">Project photos and videos</label>
            <p className="mt-1 text-xs text-nexus-navy/60">Add images or MP4 clips from this phase. Images can be up to 10 MB; videos up to 40 MB.</p>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif,video/mp4"
              multiple
              onChange={async (event) => {
                const files = Array.from(event.currentTarget.files || []);
                event.currentTarget.value = "";
                for (const file of files) {
                  try { await uploadJourneyMedia(file); }
                  catch (err) { alert(err instanceof Error ? err.message : "Upload failed"); }
                }
              }}
              className="mt-2 block w-full text-sm text-nexus-navy file:mr-3 file:rounded-md file:border-0 file:bg-nexus-cyan/10 file:px-3 file:py-2 file:text-sm file:font-medium file:text-nexus-cyan"
            />
            {formData.media.length > 0 && (
              <ul className="mt-3 space-y-2">
                {formData.media.map((media, index) => (
                  <li key={`${media.url}-${index}`} className="flex items-center gap-3 rounded-lg border border-nexus-navy/10 p-2">
                    {media.type === "image" ? <img src={media.url} alt="" className="h-14 w-14 rounded object-cover" /> : <video src={media.url} className="h-14 w-14 rounded object-cover" muted />}
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium capitalize text-nexus-navy">{media.type}</p>
                      <input
                        value={media.caption || ""}
                        onChange={(event) => setFormData((current) => ({
                          ...current,
                          media: current.media.map((item, itemIndex) => itemIndex === index ? { ...item, caption: event.target.value } : item),
                        }))}
                        placeholder="Caption (optional)"
                        className="mt-1 w-full rounded border border-nexus-navy/10 px-2 py-1 text-sm"
                      />
                    </div>
                    <button type="button" onClick={() => {
                      if (media.publicId) discardPendingVideo(media.publicId);
                      setFormData((current) => ({ ...current, media: current.media.filter((_, itemIndex) => itemIndex !== index) }));
                    }} className="px-2 text-sm text-red-600">Remove</button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-nexus-navy">Tags (comma-separated)</label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              className="mt-1 w-full rounded-lg border border-nexus-navy/10 bg-white px-3 py-2 text-sm focus:border-nexus-cyan focus:outline-none"
              placeholder="launch, milestone, partnership"
            />
          </div>
          <section className="space-y-3 rounded-xl border border-nexus-cyan/20 bg-nexus-cyan/5 p-4">
            <div>
              <h3 className="text-sm font-semibold text-nexus-navy">Social captions</h3>
              <p className="mt-1 text-xs text-nexus-navy/60">Choose channels and write a caption for each. Saving creates draft posts for review; it does not publish them.</p>
            </div>
            {SOCIAL_PLATFORMS.map((platform) => {
              const selected = Object.hasOwn(formData.socialCaptions, platform.value);
              return (
                <div key={platform.value} className="rounded-lg border border-nexus-navy/10 bg-white p-3">
                  <label className="flex items-center gap-2 text-sm font-medium text-nexus-navy">
                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={(e) => {
                        const captions = { ...formData.socialCaptions };
                        if (e.target.checked) captions[platform.value] = `${formData.title}\n\n${formData.description}`.trim();
                        else delete captions[platform.value];
                        setFormData({ ...formData, socialCaptions: captions });
                      }}
                    />
                    {platform.label}
                  </label>
                  {selected && (
                    <textarea
                      rows={4}
                      value={formData.socialCaptions[platform.value]}
                      onChange={(e) => setFormData({ ...formData, socialCaptions: { ...formData.socialCaptions, [platform.value]: e.target.value } })}
                      className="mt-2 w-full rounded-lg border border-nexus-navy/10 px-3 py-2 text-sm focus:border-nexus-cyan focus:outline-none"
                      placeholder={`Write the ${platform.label} caption`}
                    />
                  )}
                </div>
              );
            })}
          </section>
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
              {saving ? "Saving..." : editingEntry ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </AdminModal>
    </div>
  );
}
