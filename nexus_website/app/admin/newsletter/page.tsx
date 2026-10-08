"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Download, Loader2, Mail, RefreshCw, Send, ShieldCheck, UserMinus } from "lucide-react";

type Subscriber = {
  id: string;
  email: string;
  status: string;
  source: string;
  createdAt: string;
};

type Campaign = {
  id: string;
  subject: string;
  status: string;
  recipientCount: number;
  sentCount: number;
  failedCount: number;
  skippedCount: number;
  createdAt: string;
  completedAt: string | null;
  _count: { deliveries: number };
};

type NewsletterData = {
  subscribers: Subscriber[];
  activeCount: number;
  unsubscribedCount: number;
  campaigns: Campaign[];
  emailConfigured: boolean;
};

function displayStatus(status: string) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

export default function NewsletterAdminPage() {
  const [data, setData] = useState<NewsletterData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [reviewing, setReviewing] = useState(false);
  const [sending, setSending] = useState(false);
  const [testing, setTesting] = useState(false);
  const [message, setMessage] = useState("");
  const [busySubscriber, setBusySubscriber] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setError("");
    try {
      const response = await fetch("/api/admin/newsletter", { cache: "no-store" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not load newsletter data.");
      setData(result);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not load newsletter data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    queueMicrotask(() => void loadData());
  }, [loadData]);

  const filteredSubscribers = (data?.subscribers || []).filter((subscriber) =>
    subscriber.email.toLowerCase().includes(query.trim().toLowerCase())
  );

  async function updateSubscriber(subscriber: Subscriber, nextStatus: "active" | "unsubscribed") {
    const action = nextStatus === "active"
      ? `Reactivate ${subscriber.email}? Only do this after the person has asked to receive NEXUS updates again.`
      : `Unsubscribe ${subscriber.email} from future newsletter campaigns?`;
    if (!confirm(action)) return;
    setBusySubscriber(subscriber.id);
    setMessage("");
    try {
      const response = await fetch(`/api/admin/newsletter/subscribers/${subscriber.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not update subscriber.");
      setMessage(nextStatus === "active" ? `${subscriber.email} was reactivated.` : `${subscriber.email} was unsubscribed.`);
      await loadData();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not update subscriber.");
    } finally {
      setBusySubscriber(null);
    }
  }

  async function runCampaign(campaignId: string, action: "start" | "continue" | "retry-failed") {
    setSending(true);
    setError("");
    setMessage("Preparing campaign…");
    try {
      let nextAction: "start" | "continue" | "retry-failed" = action;
      let latestCampaign: Campaign | null = null;
      for (let batch = 0; batch < 30; batch += 1) {
        const response = await fetch(`/api/admin/newsletter/campaigns/${campaignId}/send`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: nextAction }),
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "Campaign could not be sent.");
        latestCampaign = result.campaign;
        nextAction = "continue";
        setMessage(`Sending campaign: ${latestCampaign?.sentCount || 0} accepted by email provider of ${latestCampaign?.recipientCount || 0}.`);
        if (latestCampaign?.status !== "sending") break;
      }
      await loadData();
      if (latestCampaign?.status === "sending") {
        setMessage("Batch limit reached. The campaign is saved and can be continued below.");
      } else if (latestCampaign?.status === "sent") {
        setMessage(`Campaign complete: ${latestCampaign.sentCount} accepted by the email provider, ${latestCampaign.skippedCount} skipped.`);
      } else if (latestCampaign) {
        setMessage(`Campaign finished with status “${latestCampaign.status}”: ${latestCampaign.sentCount} accepted, ${latestCampaign.failedCount} failed, ${latestCampaign.skippedCount} skipped.`);
      }
      if (action === "start") {
        setSubject("");
        setBody("");
        setReviewing(false);
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Campaign could not be sent.");
      await loadData();
    } finally {
      setSending(false);
    }
  }

  async function createAndSend() {
    if (!data?.emailConfigured) {
      setError("Email delivery is not configured. Add RESEND_API_KEY before sending campaigns.");
      return;
    }
    if (!data.activeCount) {
      setError("There are no active subscribers to send to.");
      return;
    }
    if (!confirm(`Send “${subject.trim()}” to ${data.activeCount} active subscribers? This will send real email.`)) return;

    setSending(true);
    setError("");
    try {
      const response = await fetch("/api/admin/newsletter/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, body }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not create campaign.");
      await runCampaign(result.campaign.id, "start");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not create campaign.");
      setSending(false);
    }
  }

  async function sendTestEmail() {
    if (!data?.emailConfigured) {
      setError("Email delivery is not configured. Add RESEND_API_KEY before sending a test.");
      return;
    }
    if (!subject.trim() || !body.trim()) {
      setError("Enter a subject and message before sending a test.");
      return;
    }
    if (!confirm("Send a test email only to your signed-in staff email? No newsletter subscribers will receive it.")) return;

    setTesting(true);
    setError("");
    setMessage("");
    try {
      const response = await fetch("/api/admin/newsletter/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, body }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not send test email.");
      setMessage(`The email provider accepted the test for ${result.sentTo}. Check that inbox and spam folder. Subscribers were not emailed.`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not send test email.");
    } finally {
      setTesting(false);
    }
  }

  function exportDisplayedSubscribers() {
    const rows = filteredSubscribers.map((subscriber) => [
      subscriber.email,
      subscriber.status,
      subscriber.source,
      new Date(subscriber.createdAt).toISOString(),
    ]);
    const csv = ["email,status,source,subscribed_at", ...rows.map((row) => row.map((value) => `"${value.replaceAll('"', '""')}"`).join(","))].join("\r\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "nexus-newsletter-subscribers.csv";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="mx-auto max-w-6xl space-y-7">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/admin/dashboard" aria-label="Back to dashboard" className="rounded-md p-2 text-nexus-navy/60 hover:bg-white">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-nexus-navy">Newsletter</h1>
            <p className="mt-1 text-sm text-nexus-navy/60">Manage subscribers and send email updates.</p>
          </div>
        </div>
        <button type="button" onClick={() => void loadData()} className="inline-flex items-center gap-2 rounded-lg border border-nexus-navy/15 bg-white px-4 py-2 text-sm font-semibold text-nexus-navy hover:bg-nexus-gray">
          <RefreshCw className="h-4 w-4" /> Refresh
        </button>
      </div>

      {(error || message) && (
        <div role={error ? "alert" : "status"} className={`rounded-lg border px-4 py-3 text-sm ${error ? "border-red-200 bg-red-50 text-red-800" : "border-emerald-200 bg-emerald-50 text-emerald-800"}`}>
          {error || message}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <SummaryCard label="Active subscribers" value={data?.activeCount ?? "—"} icon={<Mail className="h-5 w-5" />} />
        <SummaryCard label="Unsubscribed" value={data?.unsubscribedCount ?? "—"} icon={<UserMinus className="h-5 w-5" />} />
        <SummaryCard label="Email provider" value={data?.emailConfigured ? "Ready" : "Not configured"} icon={<ShieldCheck className="h-5 w-5" />} />
      </div>

      {!data?.emailConfigured && !loading && (
        <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
          Subscribers can still sign up, but campaigns cannot be delivered until `RESEND_API_KEY` is configured.
        </div>
      )}

      <section className="rounded-xl border border-nexus-navy/10 bg-white p-5 shadow-sm sm:p-7">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-nexus-navy">Subscribers</h2>
            <p className="text-sm text-nexus-navy/60">Unsubscribed addresses are excluded from every campaign.</p>
          </div>
          <button type="button" onClick={exportDisplayedSubscribers} disabled={!filteredSubscribers.length} className="inline-flex items-center gap-2 rounded-lg border border-nexus-navy/15 px-3 py-2 text-sm font-semibold text-nexus-navy disabled:opacity-50">
            <Download className="h-4 w-4" /> Export displayed rows
          </button>
        </div>
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search subscriber email" className="mb-4 w-full rounded-lg border border-nexus-navy/15 px-3 py-2.5 text-sm text-nexus-navy outline-none focus:border-nexus-cyan" />
        {loading ? <div className="flex items-center gap-2 py-8 text-sm text-nexus-navy/60"><Loader2 className="h-4 w-4 animate-spin" /> Loading subscribers…</div> : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[620px] text-left text-sm">
              <thead><tr className="border-b text-xs uppercase tracking-wide text-nexus-navy/50"><th className="py-3 pr-4">Email</th><th className="py-3 pr-4">Status</th><th className="py-3 pr-4">Source</th><th className="py-3 pr-4">Subscribed</th><th className="py-3 text-right">Action</th></tr></thead>
              <tbody>
                {filteredSubscribers.map((subscriber) => (
                  <tr key={subscriber.id} className="border-b border-nexus-navy/5">
                    <td className="py-3 pr-4 font-medium text-nexus-navy">{subscriber.email}</td>
                    <td className="py-3 pr-4"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${subscriber.status === "active" ? "bg-emerald-50 text-emerald-700" : "bg-nexus-gray text-nexus-navy/60"}`}>{displayStatus(subscriber.status)}</span></td>
                    <td className="py-3 pr-4 text-nexus-navy/60">{subscriber.source}</td>
                    <td className="py-3 pr-4 text-nexus-navy/60">{new Date(subscriber.createdAt).toLocaleString()}</td>
                    <td className="py-3 text-right">{subscriber.status === "active" || subscriber.status === "unsubscribed" ? <button type="button" onClick={() => void updateSubscriber(subscriber, subscriber.status === "active" ? "unsubscribed" : "active")} disabled={busySubscriber === subscriber.id} className={`text-xs font-semibold hover:underline disabled:opacity-50 ${subscriber.status === "active" ? "text-red-700" : "text-nexus-cyan"}`}>{busySubscriber === subscriber.id ? "Updating…" : subscriber.status === "active" ? "Unsubscribe" : "Reactivate"}</button> : <span className="text-xs text-nexus-navy/40">—</span>}</td>
                  </tr>
                ))}
                {!filteredSubscribers.length && <tr><td colSpan={5} className="py-10 text-center text-nexus-navy/50">No subscribers match this search.</td></tr>}
              </tbody>
            </table>
            {data && data.activeCount + data.unsubscribedCount > data.subscribers.length && <p className="mt-3 text-xs text-nexus-navy/50">Showing the newest 1,000 subscribers. Campaigns still include all active subscribers.</p>}
          </div>
        )}
      </section>

      <section className="rounded-xl border border-nexus-navy/10 bg-white p-5 shadow-sm sm:p-7">
        <h2 className="text-lg font-bold text-nexus-navy">Write an update</h2>
        <p className="mt-1 text-sm text-nexus-navy/60">Messages are sent as plain text email with an unsubscribe link added automatically.</p>
        <div className="mt-5 space-y-4">
          <label className="block text-sm font-medium text-nexus-navy">Email subject
            <input value={subject} maxLength={150} onChange={(event) => setSubject(event.target.value)} className="mt-1.5 w-full rounded-lg border border-nexus-navy/15 px-3 py-2.5 outline-none focus:border-nexus-cyan" placeholder="What’s new at NEXUS?" />
          </label>
          <label className="block text-sm font-medium text-nexus-navy">Message
            <textarea value={body} maxLength={20000} onChange={(event) => setBody(event.target.value)} rows={8} className="mt-1.5 w-full resize-y rounded-lg border border-nexus-navy/15 px-3 py-2.5 outline-none focus:border-nexus-cyan" placeholder="Write the update for your subscribers…" />
          </label>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs text-nexus-navy/50">{body.length.toLocaleString()} / 20,000 characters</span>
            <div className="flex flex-wrap gap-3">
              <button type="button" onClick={() => void sendTestEmail()} disabled={!subject.trim() || !body.trim() || !data?.emailConfigured || testing || sending} className="inline-flex items-center gap-2 rounded-lg border border-nexus-navy/20 px-4 py-2.5 text-sm font-semibold text-nexus-navy hover:bg-nexus-gray disabled:cursor-not-allowed disabled:opacity-50">
                {testing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
                {testing ? "Sending test…" : "Send test to me"}
              </button>
              <button type="button" onClick={() => setReviewing(true)} disabled={!subject.trim() || !body.trim() || !data?.activeCount || !data?.emailConfigured || sending || testing} className="inline-flex items-center gap-2 rounded-lg bg-nexus-cyan px-4 py-2.5 text-sm font-bold text-nexus-dark hover:bg-nexus-cyan-bright disabled:cursor-not-allowed disabled:opacity-50">
              <Send className="h-4 w-4" /> Review campaign
              </button>
            </div>
          </div>
        </div>
      </section>

      {reviewing && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-nexus-dark/70 p-4">
          <div role="dialog" aria-modal="true" aria-labelledby="newsletter-review-title" className="my-auto w-full max-w-2xl rounded-xl bg-white p-6 shadow-2xl sm:p-8">
            <h2 id="newsletter-review-title" className="text-xl font-bold text-nexus-navy">Review before sending</h2>
            <p className="mt-2 text-sm text-nexus-navy/70">This will send one email to <strong>{data?.activeCount || 0} active subscribers</strong>. Unsubscribed addresses are excluded. This action sends real email.</p>
            <div className="mt-5 rounded-lg border border-nexus-navy/10 bg-nexus-gray/40 p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-nexus-navy/50">Subject</p>
              <p className="mt-1 font-bold text-nexus-navy">{subject}</p>
              <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-nexus-navy">{body}</p>
              <p className="mt-5 border-t border-nexus-navy/10 pt-3 text-xs text-nexus-navy/50">Unsubscribe link will be included in each email.</p>
            </div>
            <div className="mt-6 flex flex-wrap justify-end gap-3">
              <button type="button" onClick={() => setReviewing(false)} className="rounded-lg border border-nexus-navy/20 px-4 py-2.5 text-sm font-semibold text-nexus-navy">Back to edit</button>
              <button type="button" onClick={() => void createAndSend()} disabled={sending} className="inline-flex items-center gap-2 rounded-lg bg-nexus-cyan px-4 py-2.5 text-sm font-bold text-nexus-dark disabled:opacity-60">
                {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                {sending ? "Sending…" : `Send to ${data?.activeCount || 0} subscribers`}
              </button>
            </div>
          </div>
        </div>
      )}

      <section className="rounded-xl border border-nexus-navy/10 bg-white p-5 shadow-sm sm:p-7">
        <h2 className="text-lg font-bold text-nexus-navy">Campaign history</h2>
        <div className="mt-4 divide-y divide-nexus-navy/10">
          {(data?.campaigns || []).map((campaign) => (
            <div key={campaign.id} className="flex flex-wrap items-center justify-between gap-4 py-4">
              <div>
                <p className="font-semibold text-nexus-navy">{campaign.subject}</p>
                <p className="mt-1 text-xs text-nexus-navy/50">{new Date(campaign.createdAt).toLocaleString()} · {campaign.recipientCount} recipients · {campaign.sentCount} accepted · {campaign.failedCount} failed · {campaign.skippedCount} skipped</p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${campaign.status === "sent" ? "bg-emerald-50 text-emerald-700" : campaign.status === "failed" ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-800"}`}>{displayStatus(campaign.status)}</span>
                {campaign.status === "sending" && <button type="button" disabled={sending} onClick={() => void runCampaign(campaign.id, "continue")} className="text-xs font-bold text-nexus-cyan hover:underline">Continue</button>}
                {(campaign.status === "partial" || campaign.status === "failed") && campaign.failedCount > 0 && <button type="button" disabled={sending} onClick={() => void runCampaign(campaign.id, "retry-failed")} className="text-xs font-bold text-nexus-cyan hover:underline">Retry failed</button>}
              </div>
            </div>
          ))}
          {!loading && !data?.campaigns.length && <p className="py-8 text-center text-sm text-nexus-navy/50">No campaigns have been sent yet.</p>}
        </div>
      </section>
    </div>
  );
}

function SummaryCard({ label, value, icon }: { label: string; value: string | number; icon: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-nexus-navy/10 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between text-nexus-navy/50"><span className="text-sm">{label}</span>{icon}</div>
      <p className="mt-2 text-2xl font-bold text-nexus-navy">{value}</p>
    </div>
  );
}
