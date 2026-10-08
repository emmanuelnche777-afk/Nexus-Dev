"use client";

import { useCallback, useEffect, useState } from "react";
import { Mail, RefreshCw } from "lucide-react";
import LoadingState from "@/components/admin/LoadingState";
import EmptyState from "@/components/admin/EmptyState";

type MenteeApplication = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: string | null;
  message: string | null;
  status: string;
  adminNotes: string | null;
  createdAt: string;
};

const STATUSES = ["new", "reviewing", "approved", "rejected"] as const;

export default function MentorshipApplicationsPage() {
  const [applications, setApplications] = useState<MenteeApplication[]>([]);
  const [drafts, setDrafts] = useState<Record<string, { status: string; adminNotes: string }>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [savingId, setSavingId] = useState("");

  const loadApplications = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/admin/mentorship-applications", { cache: "no-store" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not load applications.");
      const rows = (result.applications || []) as MenteeApplication[];
      setApplications(rows);
      setDrafts(Object.fromEntries(rows.map((row) => [row.id, { status: row.status, adminNotes: row.adminNotes || "" }])));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not load applications.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => { void loadApplications(); }, 0);
    return () => window.clearTimeout(timer);
  }, [loadApplications]);

  async function save(id: string) {
    const draft = drafts[id];
    if (!draft) return;
    setSavingId(id);
    setError("");
    try {
      const response = await fetch(`/api/admin/mentorship-applications/${encodeURIComponent(id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not save review.");
      setApplications((current) => current.map((item) => item.id === id ? { ...item, ...result.application } : item));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not save review.");
    } finally {
      setSavingId("");
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4 sm:p-6 lg:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-nexus-cyan">Mentorship</p>
          <h1 className="mt-1 text-2xl font-bold text-nexus-dark">Mentee Applications</h1>
          <p className="mt-2 max-w-2xl text-sm text-nexus-navy/65">Review requests from people looking for a mentor. Mentor and volunteer applications are handled in Mentorship Inquiries.</p>
        </div>
        <button type="button" onClick={() => void loadApplications()} disabled={loading} className="inline-flex items-center gap-2 rounded-lg border border-nexus-cyan/20 px-4 py-2 text-sm font-semibold text-nexus-dark hover:bg-nexus-cyan/5 disabled:opacity-50">
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />Refresh
        </button>
      </div>

      {error && <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
      {loading ? <LoadingState /> : applications.length === 0 ? (
        <EmptyState icon={Mail} title="No mentee applications" description="New applications from the public Mentorship page will appear here." />
      ) : <div className="space-y-4">
        {applications.map((item) => {
          const draft = drafts[item.id] || { status: item.status, adminNotes: item.adminNotes || "" };
          return <article key={item.id} className="rounded-xl border border-nexus-cyan/15 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-nexus-dark">{item.name}</h2>
                <p className="mt-1 text-sm text-nexus-navy/60">Received {new Date(item.createdAt).toLocaleString()}</p>
              </div>
              <a className="text-sm font-medium text-nexus-cyan hover:underline" href={`mailto:${item.email}`}>{item.email}</a>
            </div>
            <div className="mt-4 grid gap-5 lg:grid-cols-2">
              <div>
                {item.phone && <p className="mb-3 text-sm text-nexus-navy/70">Phone: {item.phone}</p>}
                <p className="whitespace-pre-wrap rounded-lg bg-nexus-gray/60 p-4 text-sm text-nexus-navy/80">{item.message || "No additional details provided."}</p>
              </div>
              <div className="space-y-3">
                <label className="block text-sm font-medium text-nexus-dark">Review status
                  <select value={draft.status} onChange={(event) => setDrafts({ ...drafts, [item.id]: { ...draft, status: event.target.value } })} className="mt-1.5 w-full rounded-lg border border-nexus-cyan/20 bg-white px-3 py-2.5 text-sm">
                    {STATUSES.map((status) => <option key={status} value={status}>{status[0].toUpperCase() + status.slice(1)}</option>)}
                  </select>
                </label>
                <label className="block text-sm font-medium text-nexus-dark">Internal notes
                  <textarea rows={4} maxLength={4000} value={draft.adminNotes} onChange={(event) => setDrafts({ ...drafts, [item.id]: { ...draft, adminNotes: event.target.value } })} className="mt-1.5 w-full rounded-lg border border-nexus-cyan/20 bg-white px-3 py-2.5 text-sm" placeholder="Record review and follow-up steps…" />
                </label>
                <div className="flex justify-end"><button type="button" onClick={() => void save(item.id)} disabled={savingId === item.id} className="rounded-lg bg-nexus-cyan px-4 py-2 text-sm font-semibold text-nexus-dark hover:bg-nexus-cyan-bright disabled:opacity-50">{savingId === item.id ? "Saving…" : "Save review"}</button></div>
              </div>
            </div>
          </article>;
        })}
      </div>}
    </div>
  );
}
