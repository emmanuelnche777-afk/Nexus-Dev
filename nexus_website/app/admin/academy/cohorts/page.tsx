"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Pencil, Trash2, Search, ArrowLeft, Users, Save, X as XIcon } from "lucide-react";
import LoadingState from "@/components/admin/LoadingState";
import EmptyState from "@/components/admin/EmptyState";
import AdminModal from "@/components/admin/AdminModal";

interface Cohort {
  id: string;
  programSlug: string;
  name: string;
  period: string;
  status: string;
  startDate: string;
  endDate: string;
  applicationDeadline: string;
  maxStudents: number;
  currentStudents: number;
  location: string;
  schedule: string;
  description?: string | null;
  price: number;
  currency: string;
}

interface ProgramOption {
  id?: string;
  slug: string;
  title?: string;
  name?: string;
}

const emptyForm = {
  programSlug: "",
  name: "",
  period: "",
  status: "open",
  startDate: "",
  endDate: "",
  applicationDeadline: "",
  maxStudents: 30,
  location: "",
  schedule: "",
  description: "",
  price: 20600,
  currency: "XAF",
};

const STATUS_STYLES: Record<string, string> = {
  open: "bg-emerald-100 text-emerald-700",
  upcoming: "bg-blue-100 text-blue-700",
  closed: "bg-gray-100 text-gray-700",
};

export default function CohortsPage() {
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [programs, setPrograms] = useState<ProgramOption[]>([]);
  const [sectionEnabled, setSectionEnabled] = useState(true);
  const [loading, setLoading] = useState(true);
  const [sectionSaving, setSectionSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingCohort, setEditingCohort] = useState<Cohort | null>(null);
  const [formData, setFormData] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [cohortsRes, programsRes] = await Promise.all([
        fetch("/api/admin/cohorts"),
        fetch("/api/admin/programs"),
      ]);
      if (!cohortsRes.ok || !programsRes.ok) {
        throw new Error("Failed to load");
      }
      const cohortsData = await cohortsRes.json();
      const programsData = await programsRes.json();
      setCohorts(Array.isArray(cohortsData) ? cohortsData : cohortsData.cohorts || []);
      setSectionEnabled(cohortsData.sectionEnabled !== false);
      setPrograms(Array.isArray(programsData) ? programsData : programsData.programs || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  }

  async function toggleUpcomingCohorts() {
    setSectionSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/cohorts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sectionEnabled: !sectionEnabled }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Failed to update Upcoming Cohorts visibility");
      setSectionEnabled(data.sectionEnabled);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to update Upcoming Cohorts visibility");
    } finally {
      setSectionSaving(false);
    }
  }

  function openCreate() {
    setEditingCohort(null);
    setFormData(emptyForm);
    setShowModal(true);
  }

  function openEdit(cohort: Cohort) {
    setEditingCohort(cohort);
    setFormData({
      programSlug: cohort.programSlug,
      name: cohort.name,
      period: cohort.period,
      status: cohort.status,
      startDate: cohort.startDate?.slice(0, 10) || "",
      endDate: cohort.endDate?.slice(0, 10) || "",
      applicationDeadline: cohort.applicationDeadline?.slice(0, 10) || "",
      maxStudents: cohort.maxStudents,
      location: cohort.location,
      schedule: cohort.schedule,
      description: cohort.description || "",
      price: cohort.price,
      currency: cohort.currency,
    });
    setShowModal(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const url = editingCohort ? `/api/admin/cohorts/${editingCohort.id}` : "/api/admin/cohorts";
      const method = editingCohort ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Save failed");
      }
      setShowModal(false);
      setEditingCohort(null);
      setFormData(emptyForm);
      await loadData();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to save cohort");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this cohort?")) return;
    try {
      const res = await fetch(`/api/admin/cohorts/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Delete failed");
      }
      setCohorts((prev) => prev.filter((c) => c.id !== id));
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to delete cohort");
    }
  }

  const filteredCohorts = cohorts.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.period.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.programSlug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getProgramTitle = (slug: string) => {
    const program = programs.find((p) => p.slug === slug);
    return program?.title || slug;
  };

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
            <h1 className="text-2xl font-bold text-nexus-navy">Cohorts</h1>
            <p className="mt-1 text-sm text-nexus-navy/70">
              Manage cohort schedules and enrollment
            </p>
          </div>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 rounded-lg bg-nexus-cyan px-4 py-2.5 text-sm font-medium text-white transition hover:bg-nexus-cyan-bright"
        >
          <Plus className="h-4 w-4" />
          Add Cohort
        </button>
      </div>

      <section className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-nexus-navy/10 bg-white p-5">
        <div>
          <h2 className="font-semibold text-nexus-navy">Public Upcoming Cohorts section</h2>
          <p className="mt-1 max-w-2xl text-sm text-nexus-navy/60">
            Turn this off to hide the Upcoming Cohorts blocks on the Academy and Programs pages. Cohort records and registration pages remain available.
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={sectionEnabled}
          disabled={sectionSaving}
          onClick={() => void toggleUpcomingCohorts()}
          className={`rounded-full px-4 py-2 text-sm font-semibold transition disabled:opacity-60 ${sectionEnabled ? "bg-emerald-100 text-emerald-800" : "bg-nexus-navy/10 text-nexus-navy/70"}`}
        >
          {sectionSaving ? "Saving…" : sectionEnabled ? "On · visible" : "Off · hidden"}
        </button>
      </section>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-nexus-navy/40" />
        <input
          type="text"
          placeholder="Search cohorts..."
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
          <LoadingState label="Loading cohorts..." />
        ) : filteredCohorts.length === 0 ? (
          <EmptyState
            icon={Users}
            title={cohorts.length === 0 ? "No cohorts yet" : "No cohorts match your search"}
            description={
              cohorts.length === 0
                ? "Click 'Add Cohort' to schedule the first one."
                : "Try a different search term."
            }
          />
        ) : (
          <div className="divide-y divide-nexus-navy/10">
            {filteredCohorts.map((cohort) => (
              <div
                key={cohort.id}
                className="flex items-center justify-between gap-4 px-6 py-4"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-nexus-navy">{cohort.name}</p>
                  <p className="text-sm text-nexus-navy/60">
                    {getProgramTitle(cohort.programSlug)} • {cohort.period}
                  </p>
                  <p className="text-xs text-nexus-navy/50">
                    {cohort.currentStudents}/{cohort.maxStudents} students • {cohort.location} • {cohort.schedule}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      STATUS_STYLES[cohort.status] || STATUS_STYLES.closed
                    }`}
                  >
                    {cohort.status}
                  </span>
                  <button
                    onClick={() => openEdit(cohort)}
                    className="rounded-md p-2 text-nexus-navy/60 hover:bg-nexus-navy/5 hover:text-nexus-navy"
                    title="Edit"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(cohort.id)}
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
        onClose={() => setShowModal(false)}
        title={editingCohort ? "Edit Cohort" : "Add Cohort"}
        description={
          editingCohort
            ? "Update cohort details. Public site reflects changes immediately."
            : "Schedule a new cohort for an existing program."
        }
        maxWidth="2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-nexus-navy">Program</label>
              <select
                required
                value={formData.programSlug}
                onChange={(e) => setFormData({ ...formData, programSlug: e.target.value })}
                className="mt-1 w-full rounded-lg border border-nexus-navy/10 px-3 py-2 text-sm focus:border-nexus-cyan focus:outline-none"
              >
                <option value="">Select program</option>
                {programs.map((program, idx) => (
                  <option key={program.id || program.slug || `program-${idx}`} value={program.slug}>
                    {program.title}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-nexus-navy">Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Fall 2026 Cohort"
                className="mt-1 w-full rounded-lg border border-nexus-navy/10 px-3 py-2 text-sm focus:border-nexus-cyan focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-nexus-navy">Period</label>
              <input
                type="text"
                required
                value={formData.period}
                onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                placeholder="e.g. Oct 2026 - Jan 2027"
                className="mt-1 w-full rounded-lg border border-nexus-navy/10 px-3 py-2 text-sm focus:border-nexus-cyan focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-nexus-navy">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="mt-1 w-full rounded-lg border border-nexus-navy/10 px-3 py-2 text-sm focus:border-nexus-cyan focus:outline-none"
              >
                <option value="open">Open</option>
                <option value="upcoming">Upcoming</option>
                <option value="closed">Closed</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-nexus-navy">Start Date</label>
              <input
                type="date"
                required
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="mt-1 w-full rounded-lg border border-nexus-navy/10 px-3 py-2 text-sm focus:border-nexus-cyan focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-nexus-navy">End Date</label>
              <input
                type="date"
                required
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="mt-1 w-full rounded-lg border border-nexus-navy/10 px-3 py-2 text-sm focus:border-nexus-cyan focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-nexus-navy">Application Deadline</label>
              <input
                type="date"
                required
                value={formData.applicationDeadline}
                onChange={(e) => setFormData({ ...formData, applicationDeadline: e.target.value })}
                className="mt-1 w-full rounded-lg border border-nexus-navy/10 px-3 py-2 text-sm focus:border-nexus-cyan focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-nexus-navy">Max Students</label>
              <input
                type="number"
                min={1}
                required
                value={formData.maxStudents}
                onChange={(e) => setFormData({ ...formData, maxStudents: parseInt(e.target.value) || 1 })}
                className="mt-1 w-full rounded-lg border border-nexus-navy/10 px-3 py-2 text-sm focus:border-nexus-cyan focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-nexus-navy">Location</label>
              <input
                type="text"
                required
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g. Yaoundé, Online"
                className="mt-1 w-full rounded-lg border border-nexus-navy/10 px-3 py-2 text-sm focus:border-nexus-cyan focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-nexus-navy">Schedule</label>
              <input
                type="text"
                required
                value={formData.schedule}
                onChange={(e) => setFormData({ ...formData, schedule: e.target.value })}
                placeholder="e.g. Mon/Wed/Fri 6-8 PM"
                className="mt-1 w-full rounded-lg border border-nexus-navy/10 px-3 py-2 text-sm focus:border-nexus-cyan focus:outline-none"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-nexus-navy">Public description</label>
              <textarea
                required
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe what students will learn or do in this cohort. Visitors will see this on the Academy pages."
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
              {saving ? "Saving..." : editingCohort ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </AdminModal>
    </div>
  );
}
