"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Pencil, Trash2, Search, ArrowLeft, BookOpen, Save, X as XIcon, Plus as PlusIcon, Sparkles, Award, Wrench, ListChecks, Upload, FileVideo } from "lucide-react";
import LoadingState from "@/components/admin/LoadingState";
import EmptyState from "@/components/admin/EmptyState";
import AdminModal from "@/components/admin/AdminModal";
import { resolveVideoUrl } from "@/lib/video-url";
import { removeCloudinaryVideo, uploadCloudinaryVideo, type CloudinaryVideoUpload } from "@/lib/cloudinary-video-upload";

interface Program {
  id?: string;
  slug: string;
  title: string;
  durationWeeks: number;
  price: number;
  currency: string;
  thumbnailUrl?: string;
  overviewVideoUrl?: string;
  overviewVideoPublicId?: string | null;
  status?: string;
  shortDescription?: string;
  fullDescription?: string;
  targetAudience?: string;
  certification?: string;
  curriculumModules?: Array<{
    title: string;
    weeks: number;
    topics: string[];
    project?: string;
  }>;
  requirements?: string[];
  tools?: string[];
  highlights?: string[];
  awards?: string[];
}

const emptyForm = {
  slug: "",
  title: "",
  durationWeeks: 12,
  price: 20600,
  currency: "XAF",
  thumbnailUrl: "",
  overviewVideoUrl: "",
  overviewVideoPublicId: "",
  shortDescription: "",
  fullDescription: "",
  targetAudience: "",
  certification: "",
  status: "active",
  curriculumModules: [] as Array<{ title: string; weeks: number; topics: string[]; project?: string }>,
  requirements: [] as string[],
  tools: [] as string[],
  highlights: [] as string[],
  awards: [] as string[],
};

export default function ProgramsPage() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingProgram, setEditingProgram] = useState<Program | null>(null);
  const [formData, setFormData] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [pendingVideoUpload, setPendingVideoUpload] = useState<CloudinaryVideoUpload | null>(null);
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);

  useEffect(() => {
    loadPrograms();
  }, []);

  async function loadPrograms() {
    try {
      const res = await fetch("/api/admin/programs");
      if (!res.ok) throw new Error("Failed to load");
      const data = await res.json();
      setPrograms(Array.isArray(data) ? data : data.programs || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load programs");
    } finally {
      setLoading(false);
    }
  }

  function openCreate() {
    if (pendingVideoUpload) void removeCloudinaryVideo(pendingVideoUpload, "academy-program");
    setEditingProgram(null);
    setFormData(emptyForm);
    setVideoPreview(null);
    setPendingVideoUpload(null);
    setThumbnailPreview(null);
    setShowModal(true);
  }

  function openEdit(program: Program) {
    setEditingProgram(program);
    setFormData({
      slug: program.slug,
      title: program.title,
      durationWeeks: program.durationWeeks,
      price: program.price,
      currency: program.currency,
      thumbnailUrl: program.thumbnailUrl || "",
      overviewVideoUrl: program.overviewVideoUrl || "",
      overviewVideoPublicId: program.overviewVideoPublicId || "",
      shortDescription: program.shortDescription || "",
      fullDescription: program.fullDescription || "",
      targetAudience: program.targetAudience || "",
      certification: program.certification || "",
      status: program.status || "active",
      curriculumModules: program.curriculumModules || [],
      requirements: program.requirements || [],
      tools: program.tools || [],
      highlights: program.highlights || [],
      awards: program.awards || [],
    });
    setVideoPreview(program.overviewVideoPublicId || program.overviewVideoUrl?.startsWith("/videos/") ? program.overviewVideoUrl || null : null);
    setPendingVideoUpload(null);
    setThumbnailPreview(program.thumbnailUrl?.startsWith("/uploads/") ? program.thumbnailUrl : null);
    setShowModal(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const slugOrId = editingProgram?.slug || formData.slug;
      const url = editingProgram
        ? `/api/admin/programs/${slugOrId}`
        : "/api/admin/programs";
      const method = editingProgram ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, id: formData.slug }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Save failed");
      }
      setShowModal(false);
      setEditingProgram(null);
      setFormData(emptyForm);
      setPendingVideoUpload(null);
      await loadPrograms();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to save program");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(program: Program) {
    if (!confirm(`Delete program "${program.title}"? This cannot be undone.`)) return;
    try {
      const slugOrId = program.slug || program.id;
      const res = await fetch(`/api/admin/programs/${slugOrId}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Delete failed");
      }
      setPrograms((prev) => prev.filter((p) => p.slug !== program.slug));
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to delete program");
    }
  }

  async function handleVideoUpload(file: File) {
    if (formData.overviewVideoUrl.trim()) {
      alert("This program already has a video source. Remove the current URL or uploaded video before adding another.");
      return;
    }
    setUploadingVideo(true);
    try {
      const uploaded = await uploadCloudinaryVideo(file, "academy-program");
      setFormData((current) => ({ ...current, overviewVideoUrl: uploaded.url, overviewVideoPublicId: uploaded.publicId }));
      setPendingVideoUpload(uploaded);
      setVideoPreview(uploaded.url);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to upload video");
    } finally {
      setUploadingVideo(false);
    }
  }

  async function handleThumbnailUpload(file: File) {
    setUploadingThumbnail(true);
    try {
      const formDataUpload = new FormData();
      formDataUpload.append("file", file);
      formDataUpload.append("type", "image");
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formDataUpload,
      });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      setFormData({ ...formData, thumbnailUrl: data.url });
      setThumbnailPreview(data.url);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to upload thumbnail");
    } finally {
      setUploadingThumbnail(false);
    }
  }

  const filteredPrograms = programs.filter((p) =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/academy"
            className="rounded-md p-2 text-nexus-navy/60 hover:bg-nexus-navy/5"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-nexus-navy">Programs</h1>
            <p className="mt-1 text-sm text-nexus-navy/70">
              Manage academy programs and curriculum
            </p>
          </div>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 rounded-lg bg-nexus-cyan px-4 py-2.5 text-sm font-medium text-white transition hover:bg-nexus-cyan-bright"
        >
          <Plus className="h-4 w-4" />
          Add Program
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-nexus-navy/40" />
        <input
          type="text"
          placeholder="Search programs..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-lg border border-nexus-navy/10 bg-white py-2.5 pl-10 pr-4 text-sm text-nexus-navy placeholder:text-nexus-navy/40 focus:border-nexus-cyan focus:outline-none"
        />
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="rounded-xl border border-nexus-navy/10 bg-white">
        {loading ? (
          <LoadingState label="Loading programs..." />
        ) : filteredPrograms.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title={programs.length === 0 ? "No programs yet" : "No programs match your search"}
            description={
              programs.length === 0
                ? "Click 'Add Program' to create your first one."
                : "Try a different search term."
            }
          />
        ) : (
          <div className="divide-y divide-nexus-navy/10">
            {filteredPrograms.map((program, idx) => (
              <div
                key={program.id || program.slug || `program-${idx}`}
                className="flex items-center justify-between gap-4 px-6 py-4"
              >
                <div className="flex items-center gap-4 min-w-0 flex-1">
                  {program.thumbnailUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={program.thumbnailUrl}
                      alt={program.title}
                      className="h-12 w-12 shrink-0 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-nexus-cyan/10">
                      <BookOpen className="h-5 w-5 text-nexus-cyan" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="truncate font-medium text-nexus-navy">{program.title}</p>
                    <p className="text-sm text-nexus-navy/60">
                      {program.durationWeeks} weeks • {program.currency} {program.price.toLocaleString()}
                    </p>
                    <p className="text-xs text-nexus-navy/50">/{program.slug}</p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <button
                    onClick={() => openEdit(program)}
                    className="rounded-md p-2 text-nexus-navy/60 hover:bg-nexus-navy/5 hover:text-nexus-navy"
                    title="Edit"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(program)}
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
          if (pendingVideoUpload) void removeCloudinaryVideo(pendingVideoUpload, "academy-program");
          setPendingVideoUpload(null);
          setShowModal(false);
          setVideoPreview(null);
          setThumbnailPreview(null);
        }}
        title={editingProgram ? "Edit Program" : "Add Program"}
        description={
          editingProgram
            ? "Update program details. Changes appear on the public site immediately."
            : "Create a new program. Slug must be unique (e.g. 'software-development')."
        }
        maxWidth="2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-nexus-navy">Slug</label>
              <input
                type="text"
                required
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                className="mt-1 w-full rounded-lg border border-nexus-navy/10 px-3 py-2 text-sm focus:border-nexus-cyan focus:outline-none"
                placeholder="e.g. software-development"
              />
            </div>
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
              <label className="block text-sm font-medium text-nexus-navy">Duration (weeks)</label>
              <input
                type="number"
                min={1}
                required
                value={formData.durationWeeks}
                onChange={(e) => setFormData({ ...formData, durationWeeks: parseInt(e.target.value) || 1 })}
                className="mt-1 w-full rounded-lg border border-nexus-navy/10 px-3 py-2 text-sm focus:border-nexus-cyan focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-nexus-navy">Price</label>
              <input
                type="number"
                min={0}
                required
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) || 0 })}
                className="mt-1 w-full rounded-lg border border-nexus-navy/10 px-3 py-2 text-sm focus:border-nexus-cyan focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-nexus-navy">Currency</label>
              <select
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                className="mt-1 w-full rounded-lg border border-nexus-navy/10 px-3 py-2 text-sm focus:border-nexus-cyan focus:outline-none"
              >
                <option value="XAF">XAF</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-nexus-navy">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="mt-1 w-full rounded-lg border border-nexus-navy/10 px-3 py-2 text-sm focus:border-nexus-cyan focus:outline-none"
              >
                <option value="active">Active</option>
                <option value="draft">Draft</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-nexus-navy">Thumbnail URL</label>
            <input
              type="text"
              value={formData.thumbnailUrl}
              onChange={(e) => {
                setFormData({ ...formData, thumbnailUrl: e.target.value });
                setThumbnailPreview(null);
              }}
              placeholder="/images/programs/my-program.jpg or /uploads/your-image.jpg"
              className="mt-1 w-full rounded-lg border border-nexus-navy/10 px-3 py-2 text-sm focus:border-nexus-cyan focus:outline-none"
            />
            <p className="mt-1 text-xs text-nexus-navy/50">Or upload an image (JPG, PNG, WebP):</p>
            <div className="mt-2 flex items-center gap-3">
              <label className="flex items-center gap-2 rounded-lg border border-nexus-navy/10 px-4 py-2 text-sm text-nexus-cyan hover:bg-nexus-cyan/5 cursor-pointer transition">
                <Upload className="h-4 w-4" />
                <span>Choose Image</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(e) => e.target.files?.[0] && handleThumbnailUpload(e.target.files[0])}
                  className="hidden"
                  disabled={uploadingThumbnail}
                />
              </label>
              {uploadingThumbnail && (
                <div className="flex items-center gap-2 text-xs text-nexus-navy/60">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-nexus-cyan border-t-transparent" />
                  Uploading...
                </div>
              )}
            </div>
            {thumbnailPreview && (
              <div className="mt-2 flex items-center justify-between rounded-lg border border-nexus-cyan/30 bg-nexus-cyan/5 p-2">
                <span className="text-xs text-nexus-cyan">Image uploaded: {thumbnailPreview}</span>
                <button
                  type="button"
                  onClick={() => {
                    setFormData({ ...formData, thumbnailUrl: "" });
                    setThumbnailPreview(null);
                  }}
                  className="text-xs text-red-500 hover:text-red-700"
                >
                  Remove
                </button>
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-nexus-navy">Short Description</label>
            <textarea
              rows={2}
              value={formData.shortDescription}
              onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
              className="mt-1 w-full rounded-lg border border-nexus-navy/10 px-3 py-2 text-sm focus:border-nexus-cyan focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-nexus-navy">Full Description</label>
            <textarea
              rows={4}
              value={formData.fullDescription}
              onChange={(e) => setFormData({ ...formData, fullDescription: e.target.value })}
              className="mt-1 w-full rounded-lg border border-nexus-navy/10 px-3 py-2 text-sm focus:border-nexus-cyan focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-nexus-navy">Overview Video URL</label>
            <input
              type="text"
              value={formData.overviewVideoUrl}
              onChange={(e) => {
                const nextUrl = e.target.value;
                const isUploadedVideo = Boolean(formData.overviewVideoPublicId) || formData.overviewVideoUrl.startsWith("/videos/");
                if (isUploadedVideo && nextUrl.trim()) {
                  alert("Remove the uploaded video before entering a URL.");
                  return;
                }
                if (!nextUrl.trim() && formData.overviewVideoUrl) {
                  if (pendingVideoUpload) void removeCloudinaryVideo(pendingVideoUpload, "academy-program");
                  setPendingVideoUpload(null);
                  setFormData((current) => ({ ...current, overviewVideoUrl: "", overviewVideoPublicId: "" }));
                  setVideoPreview(null);
                  return;
                }
                setFormData((current) => ({ ...current, overviewVideoUrl: nextUrl }));
                setVideoPreview(null);
              }}
              placeholder="https://youtube.com/... or https://vimeo.com/... or /videos/your-video.mp4"
              className="mt-1 w-full rounded-lg border border-nexus-navy/10 px-3 py-2 text-sm focus:border-nexus-cyan focus:outline-none"
            />
            <p className="mt-1 text-xs text-nexus-navy/50">Or upload one MP4 video up to 40 MB. YouTube and Vimeo links are supported.</p>
            {formData.overviewVideoUrl && !resolveVideoUrl(formData.overviewVideoUrl) && (
              <p className="mt-1 text-xs text-red-600">Enter a supported YouTube/Vimeo link or a video file URL.</p>
            )}
            <div className="mt-2 flex items-center gap-3">
              <label className="flex items-center gap-2 rounded-lg border border-nexus-navy/10 px-4 py-2 text-sm text-nexus-cyan hover:bg-nexus-cyan/5 cursor-pointer transition">
                <FileVideo className="h-4 w-4" />
                <span>Choose Video</span>
                <input
                  type="file"
                  accept="video/mp4"
                  onChange={(e) => e.target.files?.[0] && handleVideoUpload(e.target.files[0])}
                  className="hidden"
                  disabled={uploadingVideo}
                />
              </label>
              {uploadingVideo && (
                <div className="flex items-center gap-2 text-xs text-nexus-navy/60">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-nexus-cyan border-t-transparent" />
                  Uploading...
                </div>
              )}
            </div>
            {videoPreview && (
              <div className="mt-2 flex items-center justify-between rounded-lg border border-nexus-cyan/30 bg-nexus-cyan/5 p-2">
                <span className="text-xs text-nexus-cyan">Video uploaded: {videoPreview}</span>
                <button
                  type="button"
                  onClick={() => {
                    if (pendingVideoUpload) void removeCloudinaryVideo(pendingVideoUpload, "academy-program");
                    setPendingVideoUpload(null);
                    setFormData((current) => ({ ...current, overviewVideoUrl: "", overviewVideoPublicId: "" }));
                    setVideoPreview(null);
                  }}
                  className="text-xs text-red-500 hover:text-red-700"
                >
                  Remove
                </button>
              </div>
            )}
          </div>
          <div className="rounded-lg border border-nexus-navy/10 p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-nexus-navy">
                <ListChecks className="h-4 w-4 text-nexus-cyan" />
                Curriculum Modules
              </h3>
              <button
                type="button"
                onClick={() =>
                  setFormData({
                    ...formData,
                    curriculumModules: [
                      ...formData.curriculumModules,
                      { title: "", weeks: 1, topics: [], project: "" },
                    ],
                  })
                }
                className="flex items-center gap-1.5 rounded-lg border border-nexus-cyan/30 px-3 py-1.5 text-xs font-medium text-nexus-cyan transition hover:bg-nexus-cyan/5"
              >
                <PlusIcon className="h-3.5 w-3.5" />
                Add Module
              </button>
            </div>
            {formData.curriculumModules.length === 0 ? (
              <p className="text-xs text-nexus-navy/40">No modules yet. Click &quot;Add Module&quot; to get started.</p>
            ) : (
              <div className="space-y-3">
                {formData.curriculumModules.map((module, mi) => (
                  <div key={mi} className="rounded-lg border border-nexus-navy/10 p-3">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-xs font-medium text-nexus-navy/60">Module {mi + 1}</span>
                      <button
                        type="button"
                        onClick={() =>
                          setFormData({
                            ...formData,
                            curriculumModules: formData.curriculumModules.filter((_, i) => i !== mi),
                          })
                        }
                        className="text-xs text-red-500 hover:text-red-700"
                      >
                        Remove
                      </button>
                    </div>
                    <div className="grid gap-2 sm:grid-cols-3">
                      <div className="sm:col-span-2">
                        <input
                          type="text"
                          value={module.title}
                          onChange={(e) => {
                            const updated = [...formData.curriculumModules];
                            updated[mi].title = e.target.value;
                            setFormData({ ...formData, curriculumModules: updated });
                          }}
                          placeholder="Module title"
                          className="w-full rounded-lg border border-nexus-navy/10 px-2 py-1.5 text-sm focus:border-nexus-cyan focus:outline-none"
                        />
                      </div>
                      <div>
                        <input
                          type="number"
                          min={1}
                          value={module.weeks}
                          onChange={(e) => {
                            const updated = [...formData.curriculumModules];
                            updated[mi].weeks = parseInt(e.target.value) || 1;
                            setFormData({ ...formData, curriculumModules: updated });
                          }}
                          placeholder="Weeks"
                          className="w-full rounded-lg border border-nexus-navy/10 px-2 py-1.5 text-sm focus:border-nexus-cyan focus:outline-none"
                        />
                      </div>
                    </div>
                    <div className="mt-2">
                      <input
                        type="text"
                        value={module.topics.join(", ")}
                        onChange={(e) => {
                          const updated = [...formData.curriculumModules];
                          updated[mi].topics = e.target.value
                            .split(",")
                            .map((t) => t.trim())
                            .filter(Boolean);
                          setFormData({ ...formData, curriculumModules: updated });
                        }}
                        placeholder="Topics (comma-separated)"
                        className="w-full rounded-lg border border-nexus-navy/10 px-2 py-1.5 text-sm focus:border-nexus-cyan focus:outline-none"
                      />
                    </div>
                    <div className="mt-2">
                      <input
                        type="text"
                        value={module.project || ""}
                        onChange={(e) => {
                          const updated = [...formData.curriculumModules];
                          updated[mi].project = e.target.value;
                          setFormData({ ...formData, curriculumModules: updated });
                        }}
                        placeholder="Capstone project (optional)"
                        className="w-full rounded-lg border border-nexus-navy/10 px-2 py-1.5 text-sm focus:border-nexus-cyan focus:outline-none"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-nexus-navy">Target Audience</label>
              <input
                type="text"
                value={formData.targetAudience}
                onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                className="mt-1 w-full rounded-lg border border-nexus-navy/10 px-3 py-2 text-sm focus:border-nexus-cyan focus:outline-none"
              />
            </div>
            <div className="rounded-lg border border-nexus-navy/10 p-4">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-nexus-navy">
                  <Wrench className="h-4 w-4 text-nexus-cyan" />
                  Requirements
                </h3>
                <button
                  type="button"
                  onClick={() =>
                    setFormData({ ...formData, requirements: [...formData.requirements, ""] })
                  }
                  className="flex items-center gap-1.5 rounded-lg border border-nexus-cyan/30 px-3 py-1.5 text-xs font-medium text-nexus-cyan transition hover:bg-nexus-cyan/5"
                >
                  <PlusIcon className="h-3.5 w-3.5" />
                  Add
                </button>
              </div>
              <div className="space-y-2">
                {formData.requirements.map((req, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={req}
                      onChange={(e) => {
                        const updated = [...formData.requirements];
                        updated[i] = e.target.value;
                        setFormData({ ...formData, requirements: updated });
                      }}
                      placeholder="e.g. Baccalaureate or equivalent"
                      className="flex-1 rounded-lg border border-nexus-navy/10 px-2 py-1.5 text-sm focus:border-nexus-cyan focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          requirements: formData.requirements.filter((_, idx) => idx !== i),
                        })
                      }
                      className="text-xs text-red-500 hover:text-red-700"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-lg border border-nexus-navy/10 p-4">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-nexus-navy">
                  <Wrench className="h-4 w-4 text-nexus-cyan" />
                  Tools
                </h3>
                <button
                  type="button"
                  onClick={() =>
                    setFormData({ ...formData, tools: [...formData.tools, ""] })
                  }
                  className="flex items-center gap-1.5 rounded-lg border border-nexus-cyan/30 px-3 py-1.5 text-xs font-medium text-nexus-cyan transition hover:bg-nexus-cyan/5"
                >
                  <PlusIcon className="h-3.5 w-3.5" />
                  Add
                </button>
              </div>
              <div className="space-y-2">
                {formData.tools.map((tool, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={tool}
                      onChange={(e) => {
                        const updated = [...formData.tools];
                        updated[i] = e.target.value;
                        setFormData({ ...formData, tools: updated });
                      }}
                      placeholder="e.g. VS Code"
                      className="flex-1 rounded-lg border border-nexus-navy/10 px-2 py-1.5 text-sm focus:border-nexus-cyan focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          tools: formData.tools.filter((_, idx) => idx !== i),
                        })
                      }
                      className="text-xs text-red-500 hover:text-red-700"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-lg border border-nexus-navy/10 p-4">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-nexus-navy">
                  <Sparkles className="h-4 w-4 text-nexus-cyan" />
                  Highlights
                </h3>
                <button
                  type="button"
                  onClick={() =>
                    setFormData({ ...formData, highlights: [...formData.highlights, ""] })
                  }
                  className="flex items-center gap-1.5 rounded-lg border border-nexus-cyan/30 px-3 py-1.5 text-xs font-medium text-nexus-cyan transition hover:bg-nexus-cyan/5"
                >
                  <PlusIcon className="h-3.5 w-3.5" />
                  Add
                </button>
              </div>
              <div className="space-y-2">
                {formData.highlights.map((hl, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={hl}
                      onChange={(e) => {
                        const updated = [...formData.highlights];
                        updated[i] = e.target.value;
                        setFormData({ ...formData, highlights: updated });
                      }}
                      placeholder="e.g. 100% hands-on projects"
                      className="flex-1 rounded-lg border border-nexus-navy/10 px-2 py-1.5 text-sm focus:border-nexus-cyan focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          highlights: formData.highlights.filter((_, idx) => idx !== i),
                        })
                      }
                      className="text-xs text-red-500 hover:text-red-700"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-lg border border-nexus-navy/10 p-4">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-nexus-navy">
                  <Award className="h-4 w-4 text-nexus-cyan" />
                  Awards
                </h3>
                <button
                  type="button"
                  onClick={() =>
                    setFormData({ ...formData, awards: [...formData.awards, ""] })
                  }
                  className="flex items-center gap-1.5 rounded-lg border border-nexus-cyan/30 px-3 py-1.5 text-xs font-medium text-nexus-cyan transition hover:bg-nexus-cyan/5"
                >
                  <PlusIcon className="h-3.5 w-3.5" />
                  Add
                </button>
              </div>
              <div className="space-y-2">
                {formData.awards.map((award, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={award}
                      onChange={(e) => {
                        const updated = [...formData.awards];
                        updated[i] = e.target.value;
                        setFormData({ ...formData, awards: updated });
                      }}
                      placeholder="e.g. NEXUS Certification"
                      className="flex-1 rounded-lg border border-nexus-navy/10 px-2 py-1.5 text-sm focus:border-nexus-cyan focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          awards: formData.awards.filter((_, idx) => idx !== i),
                        })
                      }
                      className="text-xs text-red-500 hover:text-red-700"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
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
              {saving ? "Saving..." : editingProgram ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </AdminModal>
    </div>
  );
}
