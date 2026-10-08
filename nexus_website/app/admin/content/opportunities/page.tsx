"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  ArrowLeft,
  BookOpen,
  Eye,
  EyeOff,
  Users,
} from "lucide-react";

type Lifecycle = "DRAFT" | "OPEN" | "CLOSED" | "ARCHIVED";

interface DealFields {
  value: number | null;
  probability: number | null;
  contactName: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  notes: string | null;
}

interface Opportunity {
  id: string;
  title: string;
  description: string;
  type: string;
  category: string;
  location: string | null;
  deadline: string | null;
  lifecycle: Lifecycle;
  publishedAt: string | null;
  closedAt: string | null;
  _count: { applications: number };
  deal: DealFields | null;
}

const LIFECYCLE_OPTIONS: Array<{ value: Lifecycle; label: string }> = [
  { value: "DRAFT", label: "Draft — not visible publicly" },
  { value: "OPEN", label: "Open — live on /join-us" },
  { value: "CLOSED", label: "Closed — no longer accepting" },
  { value: "ARCHIVED", label: "Archived" },
];

const LIFECYCLE_STYLES: Record<Lifecycle, string> = {
  DRAFT: "bg-gray-100 text-gray-700",
  OPEN: "bg-green-100 text-green-700",
  CLOSED: "bg-amber-100 text-amber-700",
  ARCHIVED: "bg-gray-200 text-gray-600",
};

const EMPTY_FORM = {
  title: "",
  description: "",
  type: "job",
  category: "partnership",
  location: "",
  deadline: "",
  lifecycle: "DRAFT" as Lifecycle,
  value: "",
  probability: "",
  contactName: "",
  contactEmail: "",
  contactPhone: "",
  notes: "",
};

/** `yyyy-mm-dd` for a `<input type="date">`. */
function toDateInput(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  // Local calendar date, not UTC: the stored deadline is end-of-day in NEXUS
  // time, so slicing the ISO string would shift it by a day.
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export default function OpportunitiesPage() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [sectionEnabled, setSectionEnabled] = useState(true);
  const [loading, setLoading] = useState(true);
  const [sectionSaving, setSectionSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<Opportunity | null>(null);
  const [formData, setFormData] = useState({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [rowError, setRowError] = useState<string | null>(null);

  useEffect(() => {
    loadOpportunities();
  }, []);

  async function loadOpportunities() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/opportunities");
      const data = await res.json();
      setOpportunities(data.opportunities || []);
      setSectionEnabled(data.sectionEnabled !== false);
    } catch (error) {
      console.error("Failed to load opportunities:", error);
    } finally {
      setLoading(false);
    }
  }

  async function toggleSection() {
    setSectionSaving(true);
    setRowError(null);
    try {
      const res = await fetch("/api/admin/opportunities", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sectionEnabled: !sectionEnabled }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setRowError(data.error || "Failed to update public section visibility");
        return;
      }
      setSectionEnabled(data.sectionEnabled);
    } catch (error) {
      console.error("Failed to update Opportunities visibility:", error);
      setRowError("Failed to update public section visibility. Please try again.");
    } finally {
      setSectionSaving(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setFormError(null);

    const url = editingItem
      ? `/api/admin/opportunities/${editingItem.id}`
      : "/api/admin/opportunities";
    const method = editingItem ? "PUT" : "POST";

    const payload: Record<string, unknown> = {
      title: formData.title,
      description: formData.description,
      type: formData.type,
      category: formData.category,
      location: formData.location || null,
      deadline: formData.deadline || null,
      lifecycle: formData.lifecycle,
    };

    // Only send deal fields that were filled in. The API whitelists every field
    // it accepts, so nothing outside this list can reach the database.
    if (formData.value) payload.value = Number(formData.value);
    if (formData.probability) payload.probability = Number(formData.probability);
    if (formData.contactName) payload.contactName = formData.contactName;
    if (formData.contactEmail) payload.contactEmail = formData.contactEmail;
    if (formData.contactPhone) payload.contactPhone = formData.contactPhone;
    if (formData.notes) payload.notes = formData.notes;

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setFormError(data.error || "Failed to save opportunity");
        return;
      }

      setShowModal(false);
      setEditingItem(null);
      setFormData({ ...EMPTY_FORM });
      loadOpportunities();
    } catch (error) {
      console.error("Failed to save opportunity:", error);
      setFormError("Failed to save opportunity. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  /**
   * Archives by default. Applications are protected at the database level, so a
   * hard delete with applicants attached is refused; the admin gets a clear
   * message rather than silent data loss.
   */
  async function handleDelete(item: Opportunity) {
    setRowError(null);
    const hasApplications = item._count.applications > 0;
    const message = hasApplications
      ? `Archive "${item.title}"?\n\nIt has ${item._count.applications} application(s). Archiving hides it from the public page and keeps every applicant record.`
      : `Archive "${item.title}"?\n\nIt has no applications, so it can also be permanently deleted.`;

    if (!confirm(message)) return;

    try {
      const res = await fetch(`/api/admin/opportunities/${item.id}`, {
        method: "DELETE",
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setRowError(data.error || "Failed to archive opportunity");
        return;
      }

      if (
        !hasApplications &&
        confirm(
          "Archived. Permanently delete it instead? Only possible because it has no applicants."
        )
      ) {
        const purgeRes = await fetch(
          `/api/admin/opportunities/${item.id}?purge=true`,
          { method: "DELETE" }
        );
        if (!purgeRes.ok) {
          const purgeData = await purgeRes.json().catch(() => ({}));
          setRowError(purgeData.error || "Could not permanently delete");
        }
      }

      loadOpportunities();
    } catch (error) {
      console.error("Failed to archive opportunity:", error);
      setRowError("Failed to archive opportunity. Please try again.");
    }
  }

  async function togglePublished(item: Opportunity) {
    setRowError(null);
    const next: Lifecycle = item.lifecycle === "OPEN" ? "CLOSED" : "OPEN";
    try {
      const res = await fetch(`/api/admin/opportunities/${item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lifecycle: next }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setRowError(data.error || "Failed to update visibility");
        return;
      }
      loadOpportunities();
    } catch (error) {
      console.error("Failed to update visibility:", error);
      setRowError("Failed to update visibility.");
    }
  }

  function openCreateModal() {
    setEditingItem(null);
    setFormData({ ...EMPTY_FORM });
    setFormError(null);
    setShowModal(true);
  }

  function openEditModal(item: Opportunity) {
    setEditingItem(item);
    setFormError(null);
    setFormData({
      title: item.title,
      description: item.description,
      type: item.type,
      category: item.category || "partnership",
      location: item.location || "",
      deadline: toDateInput(item.deadline),
      lifecycle: item.lifecycle,
      value: item.deal?.value != null ? String(item.deal.value) : "",
      probability:
        item.deal?.probability != null ? String(item.deal.probability) : "",
      contactName: item.deal?.contactName || "",
      contactEmail: item.deal?.contactEmail || "",
      contactPhone: item.deal?.contactPhone || "",
      notes: item.deal?.notes || "",
    });
    setShowModal(true);
  }

  const filteredOpportunities = opportunities.filter((o) =>
    o.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/content"
            className="rounded-md p-2 text-nexus-navy/60 hover:bg-nexus-navy/5"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-nexus-navy">Opportunities</h1>
            <p className="mt-1 text-sm text-nexus-navy/70">
              Public listings shown on the Join Us page. A listing is only visible
              once its status is <strong>Open</strong>.
            </p>
          </div>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 rounded-lg bg-nexus-cyan px-4 py-2.5 text-sm font-medium text-white transition hover:bg-nexus-cyan-bright"
        >
          <Plus className="h-4 w-4" />
          New Opportunity
        </button>
      </div>

      <section className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-nexus-navy/10 bg-white p-5">
        <div>
          <h2 className="font-semibold text-nexus-navy">Public Opportunities section</h2>
          <p className="mt-1 max-w-2xl text-sm text-nexus-navy/60">
            Turn this off to remove the entire Opportunities section from Join Us, including its cards and application form. Existing listings and applications are kept.
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={sectionEnabled}
          disabled={sectionSaving}
          onClick={() => void toggleSection()}
          className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition disabled:opacity-60 ${sectionEnabled ? "bg-emerald-100 text-emerald-800" : "bg-nexus-navy/10 text-nexus-navy/70"}`}
        >
          {sectionEnabled ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
          {sectionSaving ? "Saving…" : sectionEnabled ? "On · visible" : "Off · hidden"}
        </button>
      </section>

      {rowError && (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {rowError}
        </p>
      )}

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-nexus-navy/40" />
        <input
          type="text"
          placeholder="Search opportunities..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-lg border border-nexus-navy/10 bg-white py-2.5 pl-10 pr-4 text-sm text-nexus-navy placeholder:text-nexus-navy/40 focus:border-nexus-cyan focus:outline-none"
        />
      </div>

      <div className="rounded-xl border border-nexus-navy/10 bg-white">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-nexus-cyan border-t-transparent" />
          </div>
        ) : filteredOpportunities.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-nexus-navy/60">No opportunities found</p>
          </div>
        ) : (
          <div className="divide-y divide-nexus-navy/10">
            {filteredOpportunities.map((opp) => (
              <div
                key={opp.id}
                className="flex flex-wrap items-center justify-between gap-3 px-6 py-4"
              >
                <div className="flex items-center gap-4">
                  <div className="rounded-lg bg-orange-50 p-2">
                    <BookOpen className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="font-medium text-nexus-navy">{opp.title}</p>
                    <p className="text-xs text-nexus-navy/50">
                      {opp.type}
                      {opp.location ? ` • ${opp.location}` : ""}
                      {opp.deadline
                        ? ` • closes ${new Date(opp.deadline).toLocaleDateString()}`
                        : " • no deadline"}
                      {opp._count.applications > 0 && (
                        <span className="ml-2 inline-flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {opp._count.applications}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      LIFECYCLE_STYLES[opp.lifecycle] || "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {opp.lifecycle}
                  </span>
                  <button
                    onClick={() => togglePublished(opp)}
                    title={
                      opp.lifecycle === "OPEN"
                        ? "Close — stop accepting applications"
                        : "Publish — show on the Join Us page"
                    }
                    className="rounded-md p-2 text-nexus-navy/60 hover:bg-nexus-navy/5"
                  >
                    {opp.lifecycle === "OPEN" ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                  <button
                    onClick={() => openEditModal(opp)}
                    className="rounded-md p-2 text-nexus-navy/60 hover:bg-nexus-navy/5 hover:text-nexus-navy"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(opp)}
                    title="Archive"
                    className="rounded-md p-2 text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-nexus-dark/50">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl bg-white p-6">
            <h2 className="text-xl font-bold text-nexus-navy">
              {editingItem ? "Edit Opportunity" : "New Opportunity"}
            </h2>
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
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
                  <label className="block text-sm font-medium text-nexus-navy">Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-nexus-navy/10 px-3 py-2 text-sm focus:border-nexus-cyan focus:outline-none"
                  >
                    <option value="job">Job</option>
                    <option value="internship">Internship</option>
                    <option value="volunteer">Volunteer</option>
                    <option value="partnership">Partnership</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-nexus-navy">Status</label>
                  <select
                    value={formData.lifecycle}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        lifecycle: e.target.value as Lifecycle,
                      })
                    }
                    className="mt-1 w-full rounded-lg border border-nexus-navy/10 px-3 py-2 text-sm focus:border-nexus-cyan focus:outline-none"
                  >
                    {LIFECYCLE_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-nexus-navy">Location</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-nexus-navy/10 px-3 py-2 text-sm focus:border-nexus-cyan focus:outline-none"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-nexus-navy">
                    Deadline
                  </label>
                  <input
                    type="date"
                    value={formData.deadline}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-nexus-navy/10 px-3 py-2 text-sm focus:border-nexus-cyan focus:outline-none"
                  />
                  <p className="mt-1 text-xs text-nexus-navy/50">
                    The listing stays open through the end of this day.
                  </p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-nexus-navy">
                  Description
                </label>
                <textarea
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-nexus-navy/10 px-3 py-2 text-sm focus:border-nexus-cyan focus:outline-none"
                />
              </div>

              <div className="border-t border-nexus-navy/10 pt-4">
                <h3 className="mb-1 text-sm font-semibold text-nexus-navy">
                  Internal deal details
                </h3>
                <p className="mb-3 text-xs text-nexus-navy/50">
                  Never shown on the public page. Stored separately from the
                  listing so it cannot leak.
                </p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-nexus-navy">
                      Value
                    </label>
                    <input
                      type="number"
                      value={formData.value}
                      onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-nexus-navy/10 px-3 py-2 text-sm focus:border-nexus-cyan focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-nexus-navy">
                      Probability (%)
                    </label>
                    <input
                      type="number"
                      value={formData.probability}
                      onChange={(e) =>
                        setFormData({ ...formData, probability: e.target.value })
                      }
                      className="mt-1 w-full rounded-lg border border-nexus-navy/10 px-3 py-2 text-sm focus:border-nexus-navy/5 focus:border-nexus-cyan focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-nexus-navy">
                      Contact name
                    </label>
                    <input
                      type="text"
                      value={formData.contactName}
                      onChange={(e) =>
                        setFormData({ ...formData, contactName: e.target.value })
                      }
                      className="mt-1 w-full rounded-lg border border-nexus-navy/10 px-3 py-2 text-sm focus:border-nexus-cyan focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-nexus-navy">
                      Contact email
                    </label>
                    <input
                      type="email"
                      value={formData.contactEmail}
                      onChange={(e) =>
                        setFormData({ ...formData, contactEmail: e.target.value })
                      }
                      className="mt-1 w-full rounded-lg border border-nexus-navy/10 px-3 py-2 text-sm focus:border-nexus-cyan focus:outline-none"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-nexus-navy">
                      Internal notes
                    </label>
                    <textarea
                      rows={3}
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-nexus-navy/10 px-3 py-2 text-sm focus:border-nexus-cyan focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {formError && (
                <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {formError}
                </p>
              )}

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-lg border border-nexus-navy/10 px-4 py-2 text-sm font-medium text-nexus-navy transition hover:bg-nexus-navy/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-nexus-cyan px-4 py-2 text-sm font-medium text-white transition hover:bg-nexus-cyan-bright disabled:opacity-50"
                >
                  {saving ? "Saving..." : editingItem ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
