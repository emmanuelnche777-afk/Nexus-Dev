"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, RefreshCw, ExternalLink, User, Mail, Phone, CalendarDays, GraduationCap } from "lucide-react";

type PrivateRequest = {
  id: string;
  programSlug: string;
  fullName: string;
  email: string;
  phone: string;
  preferredFormat: string;
  preferredSchedule: string;
  message: string | null;
  status: string;
  adminNotes: string | null;
  reviewedAt: string | null;
  createdAt: string;
  program: { title: string; slug: string };
};

const statuses = ["new", "reviewing", "approved", "declined"] as const;

export default function AcademyPrivateRequestsPage() {
  const [requests, setRequests] = useState<PrivateRequest[]>([]);
  const [drafts, setDrafts] = useState<Record<string, { status: string; adminNotes: string }>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [savingId, setSavingId] = useState("");
  const [savedId, setSavedId] = useState("");

  const loadRequests = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/admin/academy/private-requests", { cache: "no-store" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Failed to load requests.");
      setRequests(result.requests || []);
      setDrafts(Object.fromEntries((result.requests || []).map((item: PrivateRequest) => [item.id, { status: item.status, adminNotes: item.adminNotes || "" }])));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Failed to load requests.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/admin/academy/private-requests", { cache: "no-store" })
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "Failed to load requests.");
        return result.requests || [];
      })
      .then((items: PrivateRequest[]) => {
        if (cancelled) return;
        setRequests(items);
        setDrafts(Object.fromEntries(items.map((item) => [item.id, { status: item.status, adminNotes: item.adminNotes || "" }])));
      })
      .catch((cause: unknown) => {
        if (!cancelled) setError(cause instanceof Error ? cause.message : "Failed to load requests.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  async function saveRequest(id: string) {
    const draft = drafts[id];
    if (!draft) return;
    setSavingId(id);
    setSavedId("");
    setError("");
    try {
      const response = await fetch(`/api/admin/academy/private-requests/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Failed to save request.");
      setRequests((current) => current.map((item) => item.id === id ? { ...item, ...result.request } : item));
      setSavedId(id);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Failed to save request.");
    } finally {
      setSavingId("");
    }
  }

  return (
    <div className="mx-auto max-w-6xl p-4 sm:p-6 lg:p-8">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-nexus-cyan">Academy</p>
          <h1 className="mt-1 text-2xl font-bold text-nexus-dark">Private Enrollment Requests</h1>
          <p className="mt-2 max-w-2xl text-sm text-nexus-navy/65">Review requests for one-to-one or private group training when a program has no available cohort. Approving a request does not enroll the learner or create a payment.</p>
        </div>
        <button type="button" onClick={() => void loadRequests()} disabled={loading} className="inline-flex items-center gap-2 rounded-lg border border-nexus-cyan/20 px-4 py-2 text-sm font-semibold text-nexus-dark hover:bg-nexus-cyan/5 disabled:opacity-50"><RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />Refresh</button>
      </div>

      {error && <div role="alert" className="mb-5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
      {loading ? <div className="flex items-center justify-center gap-2 py-16 text-sm text-nexus-navy/60"><Loader2 className="h-5 w-5 animate-spin" />Loading requests…</div> : requests.length === 0 ? (
        <div className="rounded-xl border border-dashed border-nexus-cyan/25 bg-white p-10 text-center"><GraduationCap className="mx-auto h-8 w-8 text-nexus-cyan" /><h2 className="mt-3 font-semibold text-nexus-dark">No private training requests yet</h2><p className="mt-1 text-sm text-nexus-navy/60">New requests will appear here when a program has no open cohort.</p></div>
      ) : <div className="space-y-5">
        {requests.map((item) => {
          const draft = drafts[item.id] || { status: item.status, adminNotes: item.adminNotes || "" };
          return <article key={item.id} className="rounded-xl border border-nexus-cyan/15 bg-white shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-nexus-cyan/10 p-5">
              <div>
                <div className="flex flex-wrap items-center gap-2"><h2 className="text-lg font-bold text-nexus-dark">{item.fullName}</h2><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${item.status === "new" ? "bg-amber-100 text-amber-800" : item.status === "approved" ? "bg-green-100 text-green-800" : item.status === "declined" ? "bg-red-100 text-red-800" : "bg-blue-100 text-blue-800"}`}>{item.status}</span></div>
                <p className="mt-1 text-sm text-nexus-navy/60">Received {new Date(item.createdAt).toLocaleString()}</p>
              </div>
              <Link href={`/academy/programs/${item.program.slug}`} target="_blank" className="inline-flex items-center gap-1 text-sm font-medium text-nexus-cyan hover:underline">{item.program.title}<ExternalLink className="h-3.5 w-3.5" /></Link>
            </div>
            <div className="grid gap-5 p-5 lg:grid-cols-2">
              <div className="space-y-3 text-sm text-nexus-navy/75">
                <p className="flex items-center gap-2"><User className="h-4 w-4 text-nexus-cyan" />{item.preferredFormat === "private_group" ? "Private small group" : "One-to-one"}</p>
                <p className="flex items-center gap-2"><Mail className="h-4 w-4 text-nexus-cyan" /><a className="hover:underline" href={`mailto:${item.email}`}>{item.email}</a></p>
                <p className="flex items-center gap-2"><Phone className="h-4 w-4 text-nexus-cyan" /><a className="hover:underline" href={`tel:${item.phone}`}>{item.phone}</a></p>
                <p className="flex items-start gap-2"><CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-nexus-cyan" /><span><strong>Preferred schedule:</strong> {item.preferredSchedule}</span></p>
                {item.message && <div className="rounded-lg bg-nexus-gray/60 p-3"><p className="mb-1 text-xs font-semibold uppercase tracking-wide text-nexus-navy/50">Applicant message</p><p className="whitespace-pre-wrap">{item.message}</p></div>}
              </div>
              <div className="space-y-3">
                <label className="block text-sm font-medium text-nexus-dark">Review status<select value={draft.status} onChange={(event) => setDrafts({ ...drafts, [item.id]: { ...draft, status: event.target.value } })} className="mt-1.5 w-full rounded-lg border border-nexus-cyan/20 bg-white px-3 py-2.5 text-sm">{statuses.map((status) => <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>)}</select></label>
                <label className="block text-sm font-medium text-nexus-dark">Internal notes<textarea rows={4} maxLength={4000} value={draft.adminNotes} onChange={(event) => setDrafts({ ...drafts, [item.id]: { ...draft, adminNotes: event.target.value } })} placeholder="Record follow-up, availability, or next steps…" className="mt-1.5 w-full rounded-lg border border-nexus-cyan/20 bg-white px-3 py-2.5 text-sm" /></label>
                <div className="flex items-center justify-between gap-3"><p className="text-xs text-nexus-navy/55">{item.reviewedAt ? `Last reviewed ${new Date(item.reviewedAt).toLocaleString()}` : "Not reviewed yet"}</p><button type="button" onClick={() => void saveRequest(item.id)} disabled={savingId === item.id} className="rounded-lg bg-nexus-cyan px-4 py-2 text-sm font-semibold text-nexus-dark hover:bg-nexus-cyan-bright disabled:opacity-50">{savingId === item.id ? "Saving…" : savedId === item.id ? "Saved" : "Save review"}</button></div>
              </div>
            </div>
          </article>;
        })}
      </div>}
    </div>
  );
}
