"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Upload,
  Search,
  Package,
} from "lucide-react";
import LoadingState from "@/components/admin/LoadingState";
import EmptyState from "@/components/admin/EmptyState";
import AdminModal from "@/components/admin/AdminModal";

interface Service {
  id: string;
  slug: string;
  title: string;
  tagline?: string;
  description: string;
  imageUrl?: string;
  iconKey: string;
  features: string[];
  deliverables: string[];
  status: string;
  sortOrder: number;
}

const ICON_OPTIONS = [
  "Code2", "Server", "ShieldCheck", "Brain", "Palette", "Brush",
  "Rocket", "Globe", "Layers", "Cpu", "Smartphone", "Cloud",
];

const emptyForm = {
  slug: "",
  title: "",
  tagline: "",
  description: "",
  imageUrl: "",
  iconKey: "Code2",
  features: [] as string[],
  deliverables: [] as string[],
  status: "active",
  sortOrder: 0,
};

export default function AdminServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [editing, setEditing] = useState<Service | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/services");
      const data = await res.json();
      if (Array.isArray(data.services)) setServices(data.services);
    } catch {
      setError("Failed to load services");
    } finally {
      setLoading(false);
    }
  }

  function openCreate() {
    setForm(emptyForm);
    setEditing(null);
    setCreating(true);
    setError(null);
  }

  function openEdit(service: Service) {
    setEditing(service);
    setForm({
      slug: service.slug,
      title: service.title,
      tagline: service.tagline || "",
      description: service.description,
      imageUrl: service.imageUrl || "",
      iconKey: service.iconKey || "Code2",
      features: service.features || [],
      deliverables: service.deliverables || [],
      status: service.status || "active",
      sortOrder: service.sortOrder || 0,
    });
    setCreating(true);
    setError(null);
  }

  async function handleSave() {
    if (!form.title.trim()) {
      setError("Title is required");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(
        editing ? `/api/admin/services/${editing.id}` : "/api/admin/services",
        {
          method: editing ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        }
      );
      if (res.ok) {
        setCreating(false);
        setEditing(null);
        await load();
      } else {
        const data = await res.json();
        setError(data.error || "Save failed");
      }
    } catch {
      setError("Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this service? This cannot be undone.")) return;
    const res = await fetch(`/api/admin/services/${id}`, { method: "DELETE" });
    if (res.ok) await load();
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append("file", file);
    fd.append("type", "techhub-image");
    const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
    const data = await res.json();
    if (res.ok && data.url) {
      setForm({ ...form, imageUrl: data.url });
    } else {
      setError(data.error || "Upload failed");
    }
    e.target.value = "";
  }

  function addListItem(field: "features" | "deliverables", value: string) {
    if (!value.trim()) return;
    setForm({ ...form, [field]: [...(form[field] || []), value.trim()] });
  }

  function removeListItem(field: "features" | "deliverables", index: number) {
    setForm({
      ...form,
      [field]: (form[field] || []).filter((_, i) => i !== index),
    });
  }

  const filtered = services.filter(
    (s) =>
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.tagline || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Link
            href="/admin/tech-hub"
            className="mb-2 inline-flex items-center gap-1 text-sm text-nexus-navy/60 hover:text-nexus-cyan"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
          <h1 className="text-2xl font-bold text-nexus-navy">Services</h1>
          <p className="mt-1 text-sm text-nexus-navy/60">
            Manage the services shown on the public site and used for ordering.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-lg bg-nexus-cyan px-4 py-2 text-sm font-semibold text-white hover:bg-nexus-cyan-dark"
        >
          <Plus className="h-4 w-4" /> Add Service
        </button>
      </div>

      <div className="mb-6 flex items-center gap-2 rounded-lg border border-nexus-navy/10 bg-white px-3 py-2">
        <Search className="h-4 w-4 text-nexus-navy/40" />
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search services..."
          className="w-full bg-transparent text-sm focus:outline-none"
        />
      </div>

      {loading ? (
        <LoadingState />
      ) : services.length === 0 ? (
        <EmptyState
          title="No services yet"
          description="Add your first service to start accepting orders."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((service) => (
            <div
              key={service.id}
              className="rounded-xl border border-nexus-navy/10 bg-white p-5"
            >
              {service.imageUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={service.imageUrl}
                  alt={service.title}
                  className="mb-4 h-32 w-full rounded-lg object-cover"
                />
              )}
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-nexus-cyan/10 text-nexus-cyan">
                  <Package className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <h3 className="truncate font-semibold text-nexus-navy">
                    {service.title}
                  </h3>
                  <p className="truncate text-xs text-nexus-navy/50">
                    /{service.slug}
                  </p>
                </div>
              </div>
              <p className="mt-3 line-clamp-2 text-sm text-nexus-navy/60">
                {service.tagline || service.description}
              </p>
              <div className="mt-4 flex items-center justify-between">
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                    service.status === "active"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-nexus-navy/10 text-nexus-navy/50"
                  }`}
                >
                  {service.status}
                </span>
                <div className="flex gap-1">
                  <button
                    onClick={() => openEdit(service)}
                    className="rounded-md p-1.5 text-nexus-navy/60 hover:bg-nexus-navy/5 hover:text-nexus-cyan"
                    aria-label="Edit"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(service.id)}
                    className="rounded-md p-1.5 text-nexus-navy/60 hover:bg-red-50 hover:text-red-500"
                    aria-label="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {creating && (
        <AdminModal open={creating} onClose={() => setCreating(false)} title={editing ? "Edit Service" : "Add Service"}>
          <div className="space-y-4">
            {error && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
                {error}
              </p>
            )}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-nexus-navy">Title *</label>
                <input
                  value={form.title}
                  onChange={(e) => {
                    const title = e.target.value;
                    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
                    setForm({ ...form, title, slug });
                  }}
                  className="mt-1 w-full rounded-lg border border-nexus-navy/10 px-3 py-2 text-sm focus:border-nexus-cyan focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-nexus-navy">Slug</label>
                <input
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-nexus-navy/10 px-3 py-2 text-sm focus:border-nexus-cyan focus:outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-nexus-navy">Tagline</label>
              <input
                value={form.tagline}
                onChange={(e) => setForm({ ...form, tagline: e.target.value })}
                placeholder="Short one-liner shown on cards"
                className="mt-1 w-full rounded-lg border border-nexus-navy/10 px-3 py-2 text-sm focus:border-nexus-cyan focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-nexus-navy">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={4}
                className="mt-1 w-full rounded-lg border border-nexus-navy/10 px-3 py-2 text-sm focus:border-nexus-cyan focus:outline-none"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-nexus-navy">Icon</label>
                <select
                  value={form.iconKey}
                  onChange={(e) => setForm({ ...form, iconKey: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-nexus-navy/10 px-3 py-2 text-sm focus:border-nexus-cyan focus:outline-none"
                >
                  {ICON_OPTIONS.map((icon) => (
                    <option key={icon} value={icon}>{icon}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-nexus-navy">Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-nexus-navy/10 px-3 py-2 text-sm focus:border-nexus-cyan focus:outline-none"
                >
                  <option value="active">Active</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-nexus-navy">Image</label>
              <div className="mt-1 flex items-center gap-3">
                {form.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={form.imageUrl}
                    alt="Service preview"
                    className="h-16 w-24 rounded-lg object-cover"
                  />
                ) : null}
                <label className="flex shrink-0 cursor-pointer items-center gap-2 rounded-lg border border-nexus-cyan bg-nexus-cyan/10 px-3 py-2 text-sm text-nexus-cyan hover:bg-nexus-cyan/20">
                  <Upload className="h-4 w-4" /> Upload
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={handleUpload}
                  />
                </label>
                <input
                  value={form.imageUrl}
                  onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                  placeholder="or paste image URL"
                  className="w-full rounded-lg border border-nexus-navy/10 px-3 py-2 text-sm focus:border-nexus-cyan focus:outline-none"
                />
              </div>
            </div>
            {(["features", "deliverables"] as const).map((field) => (
              <div key={field}>
                <label className="block text-sm font-medium text-nexus-navy capitalize">{field}</label>
                <div className="mt-1 flex flex-wrap gap-2">
                  {(form[field] || []).map((item, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 rounded-full bg-nexus-cyan/10 px-3 py-1 text-xs text-nexus-cyan"
                    >
                      {item}
                      <button
                        onClick={() => removeListItem(field, i)}
                        className="text-nexus-navy/50 hover:text-red-500"
                        aria-label={`Remove ${item}`}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                  <input
                    placeholder={field === "features" ? "Add feature (Enter)" : "Add deliverable (Enter)"}
                    className="min-w-40 rounded-lg border border-nexus-navy/10 px-3 py-1 text-xs focus:border-nexus-cyan focus:outline-none"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addListItem(field, (e.target as HTMLInputElement).value);
                        (e.target as HTMLInputElement).value = "";
                      }
                    }}
                  />
                </div>
              </div>
            ))}
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setCreating(false)}
                className="rounded-lg border border-nexus-navy/10 px-4 py-2 text-sm text-nexus-navy/70 hover:bg-nexus-navy/5"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-lg bg-nexus-cyan px-4 py-2 text-sm font-semibold text-white hover:bg-nexus-cyan-dark disabled:opacity-50"
              >
                <Save className="h-4 w-4" /> {saving ? "Saving..." : "Save Service"}
              </button>
            </div>
          </div>
        </AdminModal>
      )}
    </div>
  );
}
