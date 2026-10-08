"use client";

import { useCallback, useEffect, useState, use } from "react";

import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";

interface KnowledgeEntry {
  id: string;
  title: string;
  content: string;
  category: string;
  approved: boolean;
  createdAt: string;
  createdBy?: string;
}

export default function KnowledgeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [entry, setEntry] = useState<KnowledgeEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category: "general",
    approved: false,
  });

  const loadEntry = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/ai/knowledge/${id}`);
      if (res.ok) {
        const data = await res.json();
        setEntry(data);
        setFormData({
          title: data.title || "",
          content: data.content || "",
          category: data.category || "general",
          approved: data.approved || false,
        });
      }
    } catch (error) {
      console.error("Failed to load knowledge entry:", error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    queueMicrotask(() => void loadEntry());
  }, [loadEntry]);

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/ai/knowledge/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setEntry({ ...entry, ...formData } as KnowledgeEntry);
      }
    } catch (error) {
      console.error("Failed to save:", error);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="py-12 text-center">Loading...</div>;
  }

  if (!entry) {
    return (
      <div className="py-12 text-center">
        <p className="text-nexus-navy">Entry not found</p>
        <Link href="/admin/ai/knowledge" className="mt-4 inline-block text-nexus-cyan hover:underline">
          Back to knowledge base
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/ai/knowledge"
          className="rounded-md p-2 text-nexus-navy hover:bg-nexus-navy/5"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-nexus-navy">{entry.title}</h1>
          <p className="mt-1 text-sm text-nexus-navy/70">
            Created {new Date(entry.createdAt).toLocaleDateString()} by {entry.createdBy || "unknown"}
          </p>
        </div>
      </div>

      <div role="note" className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950">
        If approved, this content may be shown to any public visitor through the assistant. Keep client, student, applicant, staff, payment, login, and confidential information out of it.
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <section className="rounded-xl border border-nexus-navy/10 bg-white p-6">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-nexus-navy/60">
              Content
            </h3>
            <textarea
              rows={8}
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="w-full rounded-lg border border-nexus-navy/10 px-3 py-2 text-sm focus:border-nexus-cyan focus:outline-none"
            />
          </section>
        </div>

        <div className="space-y-4">
          <section className="rounded-xl border border-nexus-navy/10 bg-white p-6">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-nexus-navy/60">
              Settings
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-nexus-navy">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-nexus-navy/10 px-3 py-2 text-sm focus:border-nexus-cyan focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-nexus-navy">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-nexus-navy/10 px-3 py-2 text-sm focus:border-nexus-cyan focus:outline-none"
                >
                  <option value="academy">Academy</option>
                  <option value="policy">Policy</option>
                  <option value="service">Service</option>
                  <option value="faq">FAQ</option>
                  <option value="general">General</option>
                </select>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-nexus-navy">Approved for public assistant</span>
                <button
                  onClick={() => setFormData({ ...formData, approved: !formData.approved })}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                    formData.approved
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {formData.approved ? "Yes" : "No"}
                </button>
              </div>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-nexus-cyan px-4 py-2 text-sm font-medium text-white transition hover:bg-nexus-cyan-bright disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
