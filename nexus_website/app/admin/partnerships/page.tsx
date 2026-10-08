"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { ArrowLeft, ExternalLink, Handshake, Mail, Search, Send, X } from "lucide-react";
import LoadingState from "@/components/admin/LoadingState";
import EmptyState from "@/components/admin/EmptyState";

type PartnershipStatus = "new" | "under-review" | "contacted" | "approved" | "rejected";
type Filter = "active" | "approved" | "rejected" | "all";

interface Partnership {
  id: string;
  organizationName: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string | null;
  partnershipType: string;
  interest: string | null;
  website: string | null;
  status: PartnershipStatus;
  proposedValue: number | null;
  description: string;
  createdAt: string;
  reviewedAt: string | null;
  adminNotes: string | null;
}

interface PartnershipEmail {
  id: string;
  direction: string;
  subject: string;
  body: string;
  deliveryStatus: string;
  createdAt: string;
}

const STATUS_LABELS: Record<PartnershipStatus, string> = {
  new: "New",
  "under-review": "Under review",
  contacted: "Contacted",
  approved: "Approved",
  rejected: "Rejected",
};

const STATUS_STYLES: Record<PartnershipStatus, string> = {
  new: "bg-amber-100 text-amber-800",
  "under-review": "bg-blue-100 text-blue-800",
  contacted: "bg-cyan-100 text-cyan-800",
  approved: "bg-emerald-100 text-emerald-800",
  rejected: "bg-red-100 text-red-800",
};

const FILTERS: Array<{ value: Filter; label: string }> = [
  { value: "active", label: "In progress" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "all", label: "All requests" },
];

function safeWebsiteUrl(value: string | null): string | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : null;
  } catch {
    return null;
  }
}

export default function PartnershipsPage() {
  const [partnerships, setPartnerships] = useState<Partnership[]>([]);
  const [loadedFilter, setLoadedFilter] = useState<Filter | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("active");
  const [selected, setSelected] = useState<Partnership | null>(null);
  const [messages, setMessages] = useState<PartnershipEmail[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [reply, setReply] = useState("");
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const loading = loadedFilter !== filter;
  const loadPartnerships = useCallback(async () => {
    const response = await fetch(`/api/admin/partnerships?status=${filter}`, { cache: "no-store" });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || "Could not load partnership requests.");
    return Array.isArray(data.requests) ? data.requests as Partnership[] : [];
  }, [filter]);

  useEffect(() => {
    let cancelled = false;
    loadPartnerships()
      .then((items) => {
        if (cancelled) return;
        setPartnerships(items);
        setError(null);
        setLoadedFilter(filter);
      })
      .catch((loadError: unknown) => {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : "Could not load partnership requests.");
          setLoadedFilter(filter);
        }
      });
    return () => { cancelled = true; };
  }, [filter, loadPartnerships]);

  async function refreshPartnerships() {
    try {
      setPartnerships(await loadPartnerships());
      setError(null);
      setLoadedFilter(filter);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Could not load partnership requests.");
    }
  }

  async function openRequest(item: Partnership) {
    setSelected(item);
    setMessages([]);
    setReply("");
    setError(null);
    setNotice(null);
    setMessagesLoading(true);
    try {
      const response = await fetch(`/api/admin/partnerships/${item.id}/messages`, { cache: "no-store" });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Could not load the email history.");
      setMessages(Array.isArray(data.messages) ? data.messages : []);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Could not load the email history.");
    } finally {
      setMessagesLoading(false);
    }
  }

  async function saveReview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selected) return;
    setSaving(true);
    setError(null);
    setNotice(null);
    const form = new FormData(event.currentTarget);
    const payload = {
      status: String(form.get("status") || "new"),
      proposedValue: form.get("proposedValue") ? Number(form.get("proposedValue")) : null,
      adminNotes: String(form.get("adminNotes") || ""),
    };
    try {
      const response = await fetch(`/api/admin/partnerships/${selected.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Could not save this review.");
      const updated = { ...selected, ...data, status: data.status as PartnershipStatus };
      setSelected(updated);
      setNotice("Review saved.");
      await refreshPartnerships();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Could not save this review.");
    } finally {
      setSaving(false);
    }
  }

  async function sendReply(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selected || !reply.trim()) return;
    setSending(true);
    setError(null);
    setNotice(null);
    try {
      const response = await fetch(`/api/admin/partnerships/${selected.id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: reply }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Could not send this reply.");
      setMessages((current) => [...current, data.message]);
      setReply("");
      if (selected.status !== "approved" && selected.status !== "rejected") {
        setSelected({ ...selected, status: "contacted" });
      }
      setNotice("Email sent and saved to this request.");
      await refreshPartnerships();
    } catch (sendError) {
      setError(sendError instanceof Error ? sendError.message : "Could not send this reply.");
    } finally {
      setSending(false);
    }
  }

  const filtered = partnerships.filter((item) => {
    const query = searchQuery.trim().toLowerCase();
    return !query || [item.organizationName, item.contactName, item.contactEmail, item.partnershipType]
      .some((value) => value.toLowerCase().includes(query));
  });
  const websiteUrl = selected ? safeWebsiteUrl(selected.website) : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/dashboard" className="rounded-md p-2 text-nexus-navy/60 hover:bg-nexus-navy/5">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-nexus-navy">Partnerships</h1>
          <p className="mt-1 text-sm text-nexus-navy/70">
            Review proposals submitted through the public Partner form, then respond by email.
          </p>
        </div>
      </div>

      {error && !selected && <p role="alert" className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-nexus-navy/40" />
        <input
          type="search"
          placeholder="Search organization, contact, or email..."
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          className="w-full rounded-lg border border-nexus-navy/10 bg-white py-2.5 pl-10 pr-4 text-sm text-nexus-navy placeholder:text-nexus-navy/40 focus:border-nexus-cyan focus:outline-none"
        />
      </div>

      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Partnership request status">
        {FILTERS.map((item) => (
          <button
            key={item.value}
            type="button"
            role="tab"
            aria-selected={filter === item.value}
            onClick={() => setFilter(item.value)}
            className={`rounded-lg px-4 py-2 text-sm font-medium ${filter === item.value ? "bg-nexus-cyan text-white" : "border border-nexus-navy/10 bg-white text-nexus-navy"}`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="rounded-xl border border-nexus-navy/10 bg-white">
        {loading ? <LoadingState label="Loading partnership requests..." /> : filtered.length === 0 ? (
          <EmptyState
            icon={Handshake}
            title={partnerships.length === 0 ? "No partnership requests here" : "No matches"}
            description={partnerships.length === 0 ? "New proposals submitted through the public Partner form will appear here." : "Try a different search."}
          />
        ) : (
          <div className="divide-y divide-nexus-navy/10">
            {filtered.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => void openRequest(item)}
                className="flex w-full flex-wrap items-center justify-between gap-3 px-5 py-4 text-left hover:bg-nexus-gray/40"
              >
                <span className="flex min-w-0 items-center gap-3">
                  <span className="rounded-lg bg-purple-50 p-2 text-purple-700"><Handshake className="h-5 w-5" /></span>
                  <span className="min-w-0">
                    <span className="block truncate font-medium text-nexus-navy">{item.organizationName}</span>
                    <span className="block text-sm text-nexus-navy/70">{item.contactName} · {item.contactEmail}</span>
                    <span className="block text-xs text-nexus-navy/50">
                      {item.partnershipType}{item.interest ? ` · ${item.interest}` : ""} · {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                  </span>
                </span>
                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_STYLES[item.status]}`}>
                  {STATUS_LABELS[item.status]}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-nexus-dark/60 p-3 sm:p-6" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelected(null); }}>
          <section role="dialog" aria-modal="true" aria-labelledby="partnership-dialog-title" className="max-h-[94vh] w-full max-w-5xl overflow-y-auto rounded-xl bg-white shadow-xl">
            <header className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-nexus-navy/10 bg-white px-5 py-4 sm:px-7">
              <div>
                <h2 id="partnership-dialog-title" className="text-xl font-bold text-nexus-navy">{selected.organizationName}</h2>
                <p className="mt-1 text-sm text-nexus-navy/60">Proposal received {new Date(selected.createdAt).toLocaleString()}</p>
              </div>
              <button type="button" onClick={() => setSelected(null)} aria-label="Close request" className="rounded-md p-2 text-nexus-navy/60 hover:bg-nexus-navy/5"><X className="h-5 w-5" /></button>
            </header>

            <div className="grid gap-6 p-5 sm:p-7 lg:grid-cols-2">
              <div className="space-y-5">
                <div className="rounded-lg border border-nexus-navy/10 p-4">
                  <h3 className="font-semibold text-nexus-navy">Submitted proposal</h3>
                  <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
                    <div><dt className="text-nexus-navy/50">Contact</dt><dd className="font-medium text-nexus-navy">{selected.contactName}</dd></div>
                    <div><dt className="text-nexus-navy/50">Email</dt><dd><a className="font-medium text-nexus-cyan hover:underline" href={`mailto:${selected.contactEmail}`}>{selected.contactEmail}</a></dd></div>
                    <div><dt className="text-nexus-navy/50">Organization type</dt><dd className="font-medium text-nexus-navy">{selected.partnershipType || "—"}</dd></div>
                    <div><dt className="text-nexus-navy/50">Interest</dt><dd className="font-medium text-nexus-navy">{selected.interest || "—"}</dd></div>
                    {selected.contactPhone && <div><dt className="text-nexus-navy/50">Phone</dt><dd className="font-medium text-nexus-navy">{selected.contactPhone}</dd></div>}
                    {selected.website && <div><dt className="text-nexus-navy/50">Website</dt><dd>{websiteUrl ? <a className="inline-flex items-center gap-1 font-medium text-nexus-cyan hover:underline" href={websiteUrl} target="_blank" rel="noreferrer">Open site <ExternalLink className="h-3 w-3" /></a> : <span className="text-nexus-navy/60">{selected.website}</span>}</dd></div>}
                  </dl>
                  <div className="mt-4 border-t border-nexus-navy/10 pt-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-nexus-navy/50">Message from submitter</p>
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-nexus-navy">{selected.description}</p>
                  </div>
                </div>

                <form onSubmit={saveReview} className="space-y-3 rounded-lg border border-nexus-navy/10 p-4">
                  <h3 className="font-semibold text-nexus-navy">Review details</h3>
                  <label className="block text-sm font-medium text-nexus-navy">
                    Status
                    <select name="status" defaultValue={selected.status} key={`${selected.id}-${selected.status}`} className="mt-1 w-full rounded-md border border-nexus-navy/15 px-3 py-2">
                      {Object.entries(STATUS_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                    </select>
                  </label>
                  <p className="-mt-2 text-xs text-nexus-navy/55">Saving a status does not email the submitter. Use the reply box to send your decision or ask for more information.</p>
                  <label className="block text-sm font-medium text-nexus-navy">
                    Internal estimate (XAF, optional)
                    <input name="proposedValue" type="number" min="0" step="1" defaultValue={selected.proposedValue ?? ""} className="mt-1 w-full rounded-md border border-nexus-navy/15 px-3 py-2" />
                  </label>
                  <label className="block text-sm font-medium text-nexus-navy">
                    Internal notes
                    <textarea name="adminNotes" rows={3} defaultValue={selected.adminNotes || ""} className="mt-1 w-full rounded-md border border-nexus-navy/15 px-3 py-2" />
                  </label>
                  <button type="submit" disabled={saving} className="rounded-md bg-nexus-navy px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">{saving ? "Saving…" : "Save review"}</button>
                </form>
              </div>

              <div className="flex min-h-[28rem] flex-col rounded-lg border border-nexus-navy/10">
                <div className="border-b border-nexus-navy/10 p-4">
                  <h3 className="flex items-center gap-2 font-semibold text-nexus-navy"><Mail className="h-4 w-4" /> Email conversation</h3>
                  <p className="mt-1 text-xs text-nexus-navy/55">Replies you send are saved here. The client’s replies go to the NEXUS reply-to mailbox.</p>
                </div>
                <div className="flex-1 space-y-3 overflow-y-auto p-4">
                  {messagesLoading ? <p className="text-sm text-nexus-navy/50">Loading email history…</p> : messages.length === 0 ? (
                    <p className="rounded-md bg-nexus-gray/60 p-3 text-sm text-nexus-navy/60">No replies have been sent yet. Start the conversation below.</p>
                  ) : messages.map((message) => (
                    <article key={message.id} className="rounded-lg bg-nexus-gray/60 p-3">
                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-nexus-navy/55">
                        <span>{message.direction === "inbound" ? "Client reply" : "Sent by NEXUS"}</span>
                        <span>{new Date(message.createdAt).toLocaleString()}</span>
                      </div>
                      <p className="mt-2 text-sm font-medium text-nexus-navy">{message.subject}</p>
                      <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-nexus-navy">{message.body}</p>
                      {message.deliveryStatus !== "sent" && <p className="mt-2 text-xs font-medium text-red-700">Email status: {message.deliveryStatus}</p>}
                    </article>
                  ))}
                </div>
                <form onSubmit={sendReply} className="space-y-3 border-t border-nexus-navy/10 p-4">
                  <label htmlFor="partnership-reply" className="block text-sm font-medium text-nexus-navy">Reply to {selected.contactName}</label>
                  <textarea id="partnership-reply" value={reply} onChange={(event) => setReply(event.target.value)} rows={5} maxLength={12000} required placeholder="Write your response…" className="w-full rounded-md border border-nexus-navy/15 px-3 py-2 text-sm" />
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs text-nexus-navy/50">The reply will be emailed to {selected.contactEmail}.</span>
                    <button type="submit" disabled={sending || !reply.trim()} className="inline-flex shrink-0 items-center gap-2 rounded-md bg-nexus-cyan px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"><Send className="h-4 w-4" />{sending ? "Sending…" : "Send email"}</button>
                  </div>
                </form>
              </div>
            </div>
            {(error || notice) && <div className="px-5 pb-5 sm:px-7">{error ? <p role="alert" className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : <p role="status" className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">{notice}</p>}</div>}
          </section>
        </div>
      )}
    </div>
  );
}
