"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, BriefcaseBusiness, ImagePlus, LoaderCircle, Plus, Save, X } from "lucide-react";

interface FeaturedProject {
  id: string;
  title: string;
  titleFr: string | null;
  category: string;
  categoryFr: string | null;
  description: string;
  descriptionFr: string | null;
  features: string[];
  featuresFr: string[];
  imageUrl: string;
  linkUrl: string;
  linkType: string;
  linkLabel: string | null;
  linkLabelFr: string | null;
  status: "draft" | "published" | "archived";
  sortOrder: number;
}

type ProjectForm = {
  id?: string; title: string; titleFr: string; category: string; categoryFr: string;
  description: string; descriptionFr: string; features: string[]; featuresFr: string[];
  imageUrl: string; linkUrl: string; linkType: string; linkLabel: string; linkLabelFr: string;
  status: "draft" | "published" | "archived"; sortOrder: number;
};

const emptyForm: ProjectForm = {
  title: "", titleFr: "", category: "", categoryFr: "", description: "", descriptionFr: "",
  features: [], featuresFr: [], imageUrl: "", linkUrl: "", linkType: "website",
  linkLabel: "Visit website", linkLabelFr: "Visiter le site", status: "draft", sortOrder: 0,
};

const linkLabels: Record<string, string> = {
  website: "Visit website", app_store: "Download on App Store", google_play: "Get it on Google Play", custom: "View project",
};

export default function FeaturedWorkAdminPage() {
  const [projects, setProjects] = useState<FeaturedProject[]>([]);
  const [enabled, setEnabled] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<ProjectForm>(emptyForm);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => { void load(); }, []);

  async function load() {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/tech-hub/featured-work", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not load Featured Work");
      setProjects(Array.isArray(data.projects) ? data.projects : []);
      setEnabled(data.enabled !== false);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load Featured Work");
    } finally { setLoading(false); }
  }

  function startCreate() {
    setForm({ ...emptyForm, sortOrder: projects.length * 10 });
    setEditing(true); setError(""); setNotice("");
  }

  function startEdit(project: FeaturedProject) {
    setForm({ ...project, titleFr: project.titleFr || "", categoryFr: project.categoryFr || "", descriptionFr: project.descriptionFr || "", featuresFr: project.featuresFr || [], linkLabel: project.linkLabel || linkLabels[project.linkType] || "View project", linkLabelFr: project.linkLabelFr || "Visiter le site" });
    setEditing(true); setError(""); setNotice("");
  }

  async function saveProject() {
    setSaving(true); setError(""); setNotice("");
    try {
      const response = await fetch(form.id ? `/api/admin/tech-hub/featured-work/${form.id}` : "/api/admin/tech-hub/featured-work", {
        method: form.id ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, features: form.features.map((value) => value.trim()).filter(Boolean), featuresFr: form.featuresFr.map((value) => value.trim()).filter(Boolean) }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not save project");
      setEditing(false); setNotice("Featured Work item saved."); await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save project");
    } finally { setSaving(false); }
  }

  async function toggleSection() {
    const next = !enabled;
    setError(""); setNotice("");
    try {
      const response = await fetch("/api/admin/tech-hub/featured-work", {
        method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ enabled: next }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not update section visibility");
      setEnabled(data.enabled); setNotice(next ? "Featured Work is visible on the public page." : "Featured Work is hidden from the public page.");
    } catch (err) { setError(err instanceof Error ? err.message : "Could not update section visibility"); }
  }

  async function setProjectStatus(project: FeaturedProject, status: FeaturedProject["status"]) {
    setError(""); setNotice("");
    try {
      const response = await fetch(`/api/admin/tech-hub/featured-work/${project.id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...project, status }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not update project");
      setNotice(status === "archived" ? `${project.title} was taken down from the public page.` : status === "published" ? `${project.title} is now published.` : `${project.title} restored as a draft.`);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update project");
    }
  }

  async function uploadImage(file?: File) {
    if (!file) return;
    setUploading(true); setError("");
    try {
      const body = new FormData(); body.append("file", file); body.append("type", "techhub-image");
      const response = await fetch("/api/admin/upload", { method: "POST", body });
      const data = await response.json();
      if (!response.ok || !data.url) throw new Error(data.error || "Image upload failed");
      setForm((current) => ({ ...current, imageUrl: data.url }));
    } catch (err) { setError(err instanceof Error ? err.message : "Image upload failed"); }
    finally { setUploading(false); }
  }

  function update<K extends keyof ProjectForm>(key: K, value: ProjectForm[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  return (
    <div className="p-6">
      <Link href="/admin/tech-hub" className="mb-3 inline-flex items-center gap-1 text-sm text-nexus-navy/60 hover:text-nexus-cyan">
        <ArrowLeft className="h-4 w-4" /> Back to Tech Hub
      </Link>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-nexus-navy"><BriefcaseBusiness className="h-6 w-6 text-nexus-cyan" /> Featured Work</h1>
          <p className="mt-1 max-w-2xl text-sm text-nexus-navy/60">Manage project showcases and their website or app store links on the public Tech Hub page.</p>
        </div>
        <button onClick={startCreate} className="inline-flex items-center gap-2 rounded-lg bg-nexus-cyan px-4 py-2 text-sm font-semibold text-white hover:bg-nexus-cyan-dark">
          <Plus className="h-4 w-4" /> Add Project
        </button>
      </div>

      {error && <div role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
      {notice && <div role="status" className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{notice}</div>}

      <section className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-nexus-navy/10 bg-white p-5">
        <div>
          <h2 className="font-semibold text-nexus-navy">Public section visibility</h2>
          <p className="mt-1 text-sm text-nexus-navy/60">Turn the full section off, or take down a single published project. Taking down a project hides only that item and keeps its details saved.</p>
        </div>
        <button type="button" role="switch" aria-checked={enabled} onClick={toggleSection}
          className={`rounded-full px-4 py-2 text-sm font-semibold ${enabled ? "bg-emerald-100 text-emerald-800" : "bg-nexus-navy/10 text-nexus-navy/70"}`}>
          {enabled ? "On · visible" : "Off · hidden"}
        </button>
      </section>

      {editing && <section className="mb-6 rounded-xl border border-nexus-cyan/30 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold text-nexus-navy">{form.id ? "Edit project" : "Add project"}</h2>
          <button onClick={() => { setEditing(false); setError(""); }} aria-label="Close editor"><X className="h-5 w-5" /></button>
        </div>
        {error && <div role="alert" className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
        <div className="grid gap-4 md:grid-cols-2">
          <label className="text-sm font-medium text-nexus-navy">Project name<input value={form.title} onChange={(e) => update("title", e.target.value)} className="mt-1 w-full rounded-lg border border-nexus-navy/15 px-3 py-2" /></label>
          <label className="text-sm font-medium text-nexus-navy">Project name (French, optional)<input value={form.titleFr} onChange={(e) => update("titleFr", e.target.value)} className="mt-1 w-full rounded-lg border border-nexus-navy/15 px-3 py-2" /></label>
          <label className="text-sm font-medium text-nexus-navy">Category<input value={form.category} onChange={(e) => update("category", e.target.value)} placeholder="E-Commerce Platform" className="mt-1 w-full rounded-lg border border-nexus-navy/15 px-3 py-2" /></label>
          <label className="text-sm font-medium text-nexus-navy">Category (French, optional)<input value={form.categoryFr} onChange={(e) => update("categoryFr", e.target.value)} className="mt-1 w-full rounded-lg border border-nexus-navy/15 px-3 py-2" /></label>
          <label className="text-sm font-medium text-nexus-navy md:col-span-2">Description<textarea rows={3} value={form.description} onChange={(e) => update("description", e.target.value)} className="mt-1 w-full rounded-lg border border-nexus-navy/15 px-3 py-2" /></label>
          <label className="text-sm font-medium text-nexus-navy md:col-span-2">Description (French, optional)<textarea rows={3} value={form.descriptionFr} onChange={(e) => update("descriptionFr", e.target.value)} className="mt-1 w-full rounded-lg border border-nexus-navy/15 px-3 py-2" /></label>
          <label className="text-sm font-medium text-nexus-navy md:col-span-2">Highlights <span className="font-normal text-nexus-navy/50">(one per line, maximum four)</span><textarea rows={4} value={form.features.join("\n")} onChange={(e) => update("features", e.target.value.split("\n").slice(0, 4))} className="mt-1 w-full rounded-lg border border-nexus-navy/15 px-3 py-2" /></label>
          <label className="text-sm font-medium text-nexus-navy md:col-span-2">Highlights (French, optional)<textarea rows={4} value={form.featuresFr.join("\n")} onChange={(e) => update("featuresFr", e.target.value.split("\n").slice(0, 4))} className="mt-1 w-full rounded-lg border border-nexus-navy/15 px-3 py-2" /></label>
          <div className="md:col-span-2">
            <label className="text-sm font-medium text-nexus-navy">Project image</label>
            <div className="mt-1 flex flex-wrap items-center gap-3">
              {form.imageUrl && <Image src={form.imageUrl} alt="Project preview" width={128} height={80} unoptimized className="h-20 w-32 rounded-lg object-cover" />}
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-nexus-cyan px-3 py-2 text-sm text-nexus-cyan">
                {uploading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}{uploading ? "Uploading" : "Upload image"}
                <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" disabled={uploading} onChange={(e) => { void uploadImage(e.target.files?.[0]); e.target.value = ""; }} />
              </label>
              <input aria-label="Image URL" value={form.imageUrl} onChange={(e) => update("imageUrl", e.target.value)} placeholder="or paste image URL" className="min-w-60 flex-1 rounded-lg border border-nexus-navy/15 px-3 py-2 text-sm" />
            </div>
            <p className="mt-1 text-xs text-nexus-navy/50">A wide image works best in the public project carousel.</p>
          </div>
          <label className="text-sm font-medium text-nexus-navy">Destination type<select value={form.linkType} onChange={(e) => { update("linkType", e.target.value); if (!form.linkLabel || Object.values(linkLabels).includes(form.linkLabel)) update("linkLabel", linkLabels[e.target.value]); }} className="mt-1 w-full rounded-lg border border-nexus-navy/15 px-3 py-2"><option value="website">Project website</option><option value="app_store">Apple App Store</option><option value="google_play">Google Play</option><option value="custom">Other link</option></select></label>
          <label className="text-sm font-medium text-nexus-navy">Button label<input value={form.linkLabel} onChange={(e) => update("linkLabel", e.target.value)} placeholder="Visit website" className="mt-1 w-full rounded-lg border border-nexus-navy/15 px-3 py-2" /></label>
          <label className="text-sm font-medium text-nexus-navy">Button label (French, optional)<input value={form.linkLabelFr} onChange={(e) => update("linkLabelFr", e.target.value)} placeholder="Visiter le site" className="mt-1 w-full rounded-lg border border-nexus-navy/15 px-3 py-2" /></label>
          <label className="text-sm font-medium text-nexus-navy md:col-span-2">Destination URL<input type="url" value={form.linkUrl} onChange={(e) => update("linkUrl", e.target.value)} placeholder="https://..." className="mt-1 w-full rounded-lg border border-nexus-navy/15 px-3 py-2" /><span className="mt-1 block text-xs font-normal text-nexus-navy/50">Use the project site URL or its exact App Store / Google Play listing.</span></label>
          <label className="text-sm font-medium text-nexus-navy">Visibility<select value={form.status} onChange={(e) => update("status", e.target.value as ProjectForm["status"])} className="mt-1 w-full rounded-lg border border-nexus-navy/15 px-3 py-2"><option value="draft">Draft · hidden</option><option value="published">Published · public</option><option value="archived">Archived · hidden</option></select></label>
          <label className="text-sm font-medium text-nexus-navy">Display order<input type="number" value={form.sortOrder} onChange={(e) => update("sortOrder", Number(e.target.value))} className="mt-1 w-full rounded-lg border border-nexus-navy/15 px-3 py-2" /></label>
        </div>
        <div className="mt-5 flex justify-end gap-3"><button onClick={() => setEditing(false)} className="rounded-lg border border-nexus-navy/15 px-4 py-2 text-sm">Cancel</button><button disabled={saving || uploading} onClick={() => void saveProject()} className="inline-flex items-center gap-2 rounded-lg bg-nexus-cyan px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"><Save className="h-4 w-4" />{saving ? "Saving…" : "Save project"}</button></div>
      </section>}

      {loading ? <div className="py-12 text-center text-sm text-nexus-navy/50">Loading Featured Work…</div> : projects.length === 0 ? (
        <div className="rounded-xl border border-dashed border-nexus-navy/20 bg-white p-10 text-center"><BriefcaseBusiness className="mx-auto h-8 w-8 text-nexus-navy/30" /><h2 className="mt-3 font-semibold text-nexus-navy">No projects yet</h2><p className="mt-1 text-sm text-nexus-navy/60">Add a project to start building the public Featured Work showcase.</p></div>
      ) : <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{projects.map((project) => <article key={project.id} className="overflow-hidden rounded-xl border border-nexus-navy/10 bg-white">
        <Image src={project.imageUrl} alt={project.title} width={640} height={352} unoptimized className="h-44 w-full object-cover" />
        <div className="p-4"><div className="flex items-center justify-between gap-2"><span className="text-xs font-semibold uppercase tracking-wide text-nexus-cyan">{project.category}</span><span className={`rounded-full px-2 py-1 text-xs font-semibold ${project.status === "published" ? "bg-emerald-100 text-emerald-800" : project.status === "archived" ? "bg-gray-100 text-gray-600" : "bg-amber-100 text-amber-800"}`}>{project.status}</span></div>
          <h3 className="mt-2 font-bold text-nexus-navy">{project.title}</h3><p className="mt-1 line-clamp-3 text-sm text-nexus-navy/60">{project.description}</p>{project.linkUrl ? <a href={project.linkUrl} target="_blank" rel="noopener noreferrer" className="mt-3 inline-block text-xs font-semibold text-nexus-cyan">{project.linkLabel || linkLabels[project.linkType]} ↗</a> : <p className="mt-3 text-xs text-amber-700">Add the project link before publishing.</p>}
          <div className="mt-4 flex flex-wrap justify-between gap-2 border-t border-nexus-navy/10 pt-3"><span className="self-center text-xs text-nexus-navy/50">Order {project.sortOrder}</span><div className="flex flex-wrap gap-2"><button onClick={() => startEdit(project)} className="rounded border px-3 py-1 text-xs font-semibold">Edit</button>{project.status === "published" ? <button onClick={() => void setProjectStatus(project, "archived")} className="rounded border border-amber-300 px-3 py-1 text-xs font-semibold text-amber-800">Take down</button> : project.status === "archived" ? <button onClick={() => void setProjectStatus(project, "draft")} className="rounded border border-nexus-cyan/40 px-3 py-1 text-xs font-semibold text-nexus-cyan">Restore as draft</button> : <button onClick={() => void setProjectStatus(project, "published")} className="rounded bg-emerald-600 px-3 py-1 text-xs font-semibold text-white">Publish</button>}</div></div>
        </div>
      </article>)}</div>}
    </div>
  );
}
