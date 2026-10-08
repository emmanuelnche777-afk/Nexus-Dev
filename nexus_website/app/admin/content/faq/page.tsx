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
  MessageSquare,
  Search,
} from "lucide-react";
import LoadingState from "@/components/admin/LoadingState";
import EmptyState from "@/components/admin/EmptyState";

interface Faq {
  id: string;
  question: string;
  answer: string;
  category: string;
  order?: number;
  published: boolean;
  createdAt?: string;
  updatedAt?: string;
}

const CATEGORY_OPTIONS = [
  { value: "general", label: "General" },
  { value: "academy", label: "Academy" },
  { value: "tech-hub", label: "Tech Hub" },
  { value: "foundation", label: "Foundation" },
  { value: "mentorship", label: "Mentorship" },
];

const emptyDraft = {
  question: "",
  answer: "",
  category: "general",
  order: 1,
  published: false,
};

export default function AdminFaqPage() {
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "published" | "draft">("all");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<Faq | null>(null);
  const [creating, setCreating] = useState(false);
  const [newFaq, setNewFaq] = useState(emptyDraft);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const nextOrder = () => Math.max(0, ...faqs.map((faq) => faq.order ?? 0)) + 1;

  useEffect(() => {
    void load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/faq", { cache: "no-store" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to load FAQs.");
      }
      const data = await res.json();
      if (!Array.isArray(data.faqs)) throw new Error("The FAQ response was invalid.");
      setFaqs(data.faqs);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load FAQs.");
    } finally {
      setLoading(false);
    }
  }

  function startEdit(faq: Faq) {
    setEditingId(faq.id);
    setEditDraft({ ...faq });
    setError(null);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditDraft(null);
    setError(null);
  }

  async function saveEdit() {
    if (!editDraft) return;
    if (!editDraft.question.trim() || editDraft.question.trim().length < 3) {
      setError("Question is required (min 3 chars).");
      return;
    }
    if (!editDraft.answer.trim() || editDraft.answer.trim().length < 3) {
      setError("Answer is required (min 3 chars).");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/faq/${editDraft.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: editDraft.question.trim(),
          answer: editDraft.answer.trim(),
          category: editDraft.category,
          order: editDraft.order ?? 1,
          published: editDraft.published,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to update FAQ");
      }
      await load();
      cancelEdit();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to update FAQ");
    } finally {
      setSaving(false);
    }
  }

  async function deleteFaq(id: string) {
    if (!confirm("Delete this FAQ? It will be removed from the public FAQ and AI answers.")) return;
    try {
      const res = await fetch(`/api/admin/faq/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to delete FAQ");
      }
      setFaqs((prev) => prev.filter((f) => f.id !== id));
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to delete FAQ");
    }
  }

  async function createFaq() {
    if (!newFaq.question.trim() || newFaq.question.trim().length < 3) {
      setError("Question is required (min 3 chars).");
      return;
    }
    if (!newFaq.answer.trim() || newFaq.answer.trim().length < 3) {
      setError("Answer is required (min 3 chars).");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/faq", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: newFaq.question.trim(),
          answer: newFaq.answer.trim(),
          category: newFaq.category,
          order: newFaq.order || faqs.length + 1,
          published: newFaq.published,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to create FAQ");
      }
      setNewFaq(emptyDraft);
      setCreating(false);
      await load();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create FAQ");
    } finally {
      setSaving(false);
    }
  }

  const filtered = faqs.filter((f) => {
    if (statusFilter === "published" && !f.published) return false;
    if (statusFilter === "draft" && f.published) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      f.question.toLowerCase().includes(q) ||
      f.answer.toLowerCase().includes(q) ||
      f.category.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/content"
          className="rounded-md p-2 text-nexus-navy hover:bg-nexus-navy/5"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-nexus-navy">FAQ</h1>
          <p className="mt-1 text-sm text-nexus-navy/70">
            Write FAQs in English. Visitors can translate live FAQ content with the French button in Chrome desktop.
          </p>
        </div>
        <button
            onClick={() => {
              setCreating(true);
              setNewFaq({ ...emptyDraft, order: nextOrder() });
              setError(null);
            }}
            className="flex items-center gap-2 rounded-lg bg-nexus-cyan px-4 py-2.5 text-sm font-medium text-white transition hover:bg-nexus-cyan-bright"
          >
            <Plus className="h-4 w-4" />
            New FAQ
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-nexus-navy/40" />
        <input
          type="text"
          placeholder="Search FAQ by question, answer, or category..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-lg border border-nexus-navy/10 bg-white py-2.5 pl-10 pr-4 text-sm text-nexus-navy placeholder:text-nexus-navy/40 focus:border-nexus-cyan focus:outline-none"
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-nexus-navy/60">New FAQs start as drafts. Chrome desktop can translate published FAQ content when a visitor selects French.</p>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)} className="rounded-lg border border-nexus-navy/10 bg-white px-3 py-2 text-sm text-nexus-navy">
          <option value="all">All FAQs</option>
          <option value="published">Published</option>
          <option value="draft">Drafts</option>
        </select>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {creating && (
        <div className="rounded-xl border border-nexus-cyan/30 bg-nexus-cyan/5 p-5">
          <h3 className="text-sm font-semibold text-nexus-navy">New FAQ</h3>
          <div className="mt-3 space-y-3">
            <input
              type="text"
              maxLength={200}
              placeholder="Question"
              value={newFaq.question}
              onChange={(e) =>
                setNewFaq((p) => ({ ...p, question: e.target.value }))
              }
              className="w-full rounded-lg border border-nexus-navy/10 bg-white px-3 py-2 text-sm text-nexus-navy focus:border-nexus-cyan focus:outline-none"
            />
            <textarea
              maxLength={5000}
              placeholder="Answer"
              value={newFaq.answer}
              onChange={(e) =>
                setNewFaq((p) => ({ ...p, answer: e.target.value }))
              }
              rows={3}
              className="w-full rounded-lg border border-nexus-navy/10 bg-white px-3 py-2 text-sm text-nexus-navy focus:border-nexus-cyan focus:outline-none"
            />
            <div className="grid grid-cols-2 gap-3">
              <select
                value={newFaq.category}
                onChange={(e) =>
                  setNewFaq((p) => ({ ...p, category: e.target.value }))
                }
                className="rounded-lg border border-nexus-navy/10 bg-white px-3 py-2 text-sm text-nexus-navy focus:border-nexus-cyan focus:outline-none"
              >
                {CATEGORY_OPTIONS.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
              <input
                type="number"
                min={1}
                max={10000}
                placeholder="Order"
                value={newFaq.order}
                onChange={(e) =>
                  setNewFaq((p) => ({
                    ...p,
                    order: parseInt(e.target.value, 10) || 1,
                  }))
                }
                className="rounded-lg border border-nexus-navy/10 bg-white px-3 py-2 text-sm text-nexus-navy focus:border-nexus-cyan focus:outline-none"
              />
            </div>
            <label className="flex items-center gap-2 text-sm text-nexus-navy">
              <input type="checkbox" checked={newFaq.published} onChange={(e) => setNewFaq((p) => ({ ...p, published: e.target.checked }))} />
              Publish on the public FAQ page and include in AI answers
            </label>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setCreating(false);
                  setNewFaq(emptyDraft);
                  setError(null);
                }}
                className="flex items-center gap-1.5 rounded-lg border border-nexus-navy/10 bg-white px-3 py-2 text-sm font-medium text-nexus-navy hover:bg-nexus-navy/5"
              >
                <X className="h-4 w-4" />
                Cancel
              </button>
              <button
                type="button"
                onClick={createFaq}
                disabled={saving}
                className="flex items-center gap-1.5 rounded-lg bg-nexus-cyan px-3 py-2 text-sm font-medium text-white hover:bg-nexus-cyan-bright disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                {saving ? "Saving..." : "Create FAQ"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="rounded-xl border border-nexus-navy/10 bg-white">
        {loading ? (
          <LoadingState label="Loading FAQs..." />
        ) : error && faqs.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-sm text-red-700">{error}</p>
            <button type="button" onClick={() => void load()} className="mt-3 rounded-lg border border-nexus-navy/15 px-4 py-2 text-sm font-medium text-nexus-navy hover:bg-nexus-navy/5">Retry</button>
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={MessageSquare}
            title={faqs.length === 0 ? "No FAQs yet" : "No FAQs match your search"}
            description={
              faqs.length === 0
                ? "Click 'New FAQ' to create your first one. FAQs appear on the public FAQ page."
                : "Try adjusting your search keywords."
            }
          />
        ) : (
          <div className="divide-y divide-nexus-navy/10">
            {filtered.map((faq) =>
              editingId === faq.id && editDraft ? (
                <div key={faq.id} className="px-6 py-4">
                  <div className="space-y-3">
                    <input
                      type="text"
                      maxLength={200}
                      value={editDraft.question}
                      onChange={(e) =>
                        setEditDraft({ ...editDraft, question: e.target.value })
                      }
                      className="w-full rounded-lg border border-nexus-navy/10 bg-white px-3 py-2 text-sm font-medium text-nexus-navy focus:border-nexus-cyan focus:outline-none"
                    />
                    <textarea
                      maxLength={5000}
                      value={editDraft.answer}
                      onChange={(e) =>
                        setEditDraft({ ...editDraft, answer: e.target.value })
                      }
                      rows={3}
                      className="w-full rounded-lg border border-nexus-navy/10 bg-white px-3 py-2 text-sm text-nexus-navy focus:border-nexus-cyan focus:outline-none"
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <select
                        value={editDraft.category}
                        onChange={(e) =>
                          setEditDraft({ ...editDraft, category: e.target.value })
                        }
                        className="rounded-lg border border-nexus-navy/10 bg-white px-3 py-2 text-sm text-nexus-navy focus:border-nexus-cyan focus:outline-none"
                      >
                        {CATEGORY_OPTIONS.map((c) => (
                          <option key={c.value} value={c.value}>
                            {c.label}
                          </option>
                        ))}
                      </select>
                      <input
                        type="number"
                        min={1}
                        max={10000}
                        value={editDraft.order ?? 1}
                        onChange={(e) =>
                          setEditDraft({
                            ...editDraft,
                            order: parseInt(e.target.value, 10) || 1,
                          })
                        }
                        className="rounded-lg border border-nexus-navy/10 bg-white px-3 py-2 text-sm text-nexus-navy focus:border-nexus-cyan focus:outline-none"
                      />
                    </div>
                    <label className="flex items-center gap-2 text-sm text-nexus-navy">
                      <input type="checkbox" checked={editDraft.published} onChange={(e) => setEditDraft({ ...editDraft, published: e.target.checked })} />
                      Publish on the public FAQ page and include in AI answers
                    </label>
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={cancelEdit}
                        className="flex items-center gap-1.5 rounded-lg border border-nexus-navy/10 bg-white px-3 py-2 text-sm font-medium text-nexus-navy hover:bg-nexus-navy/5"
                      >
                        <X className="h-4 w-4" />
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={saveEdit}
                        disabled={saving}
                        className="flex items-center gap-1.5 rounded-lg bg-nexus-cyan px-3 py-2 text-sm font-medium text-white hover:bg-nexus-cyan-bright disabled:opacity-50"
                      >
                        <Save className="h-4 w-4" />
                        {saving ? "Saving..." : "Save"}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  key={faq.id}
                  className="flex items-start gap-3 px-6 py-4 hover:bg-nexus-gray/20"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex shrink-0 items-center rounded-full bg-nexus-cyan/10 px-2 py-0.5 text-xs font-medium text-nexus-cyan">
                        {faq.category}
                      </span>
                      <span className="text-xs text-nexus-navy/50">
                        Order #{faq.order ?? "—"}
                      </span>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${faq.published ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-800"}`}>
                        {faq.published ? "Published" : "Draft"}
                      </span>
                    </div>
                    <p className="mt-1 font-medium text-nexus-navy">
                      {faq.question}
                    </p>
                    <p className="mt-1 text-sm text-nexus-navy/70">
                      {faq.answer}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <button
                      onClick={() => startEdit(faq)}
                      className="rounded-md p-2 text-nexus-navy/60 hover:bg-nexus-navy/5 hover:text-nexus-navy"
                      title="Edit"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => deleteFaq(faq.id)}
                      className="rounded-md p-2 text-red-600 hover:bg-red-50"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}
