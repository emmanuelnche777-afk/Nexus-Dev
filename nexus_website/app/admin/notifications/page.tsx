"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  Send,
  ArrowLeft,
  Mail,
  MessageSquare,
  Phone,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Trash2,
  Search,
  Clock,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import LoadingState from "@/components/admin/LoadingState";
import EmptyState from "@/components/admin/EmptyState";

type NotificationType = "email" | "sms" | "whatsapp";

interface ProviderStatus {
  providers: {
    resend: { configured: boolean; from: string };
    twilio: { configured: boolean; smsConfigured: boolean; whatsappConfigured: boolean; phone: string; whatsapp: string };
  };
}

interface LogEntry {
  id: string;
  type: NotificationType;
  to: string;
  subject?: string;
  body?: string;
  status: "sent" | "skipped" | "failed";
  sentBy?: string;
  sentAt: string;
  result?: unknown;
  error?: string;
}

interface SendResult {
  status?: "sent" | "skipped" | "failed";
  error?: string;
  reason?: string;
  [key: string]: unknown;
}

const TYPE_META: Record<NotificationType, { icon: LucideIcon; label: string; color: string }> = {
  email: { icon: Mail, label: "Email", color: "bg-blue-100 text-blue-700" },
  sms: { icon: MessageSquare, label: "SMS", color: "bg-emerald-100 text-emerald-700" },
  whatsapp: { icon: Phone, label: "WhatsApp", color: "bg-green-100 text-green-700" },
};

const STATUS_META: Record<string, { icon: LucideIcon; color: string; label: string }> = {
  sent: { icon: CheckCircle2, color: "bg-emerald-100 text-emerald-700", label: "Sent" },
  skipped: { icon: AlertCircle, color: "bg-amber-100 text-amber-700", label: "Skipped" },
  failed: { icon: XCircle, color: "bg-red-100 text-red-700", label: "Failed" },
};

export default function NotificationsPage() {
  const [type, setType] = useState<NotificationType>("email");
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<SendResult | null>(null);

  const [providerStatus, setProviderStatus] = useState<ProviderStatus | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    sent: 0,
    skipped: 0,
    failed: 0,
    email: 0,
    sms: 0,
    whatsapp: 0,
  });
  const [loadingLogs, setLoadingLogs] = useState(true);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<"all" | NotificationType>("all");

  async function loadProviderStatus() {
    try {
      const res = await fetch("/api/admin/settings/notifications");
      if (res.ok) setProviderStatus(await res.json());
    } catch (err) {
      console.error(err);
    }
  }

  const loadLogs = useCallback(async () => {
    setLoadingLogs(true);
    try {
      const res = await fetch("/api/admin/notifications?limit=100");
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs || []);
        if (data.stats) setStats(data.stats);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingLogs(false);
    }
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      loadProviderStatus();
      void loadLogs();
    });
  }, [loadLogs]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    setResult(null);

    try {
      const res = await fetch("/api/admin/notifications/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          to,
          subject,
          body,
        }),
      });
      const data = await res.json();
      setResult({ ...data, httpStatus: res.status });
      if (res.ok) {
        setTo("");
        setSubject("");
        setBody("");
        await loadLogs();
      }
    } catch {
      setResult({ error: "Failed to send" });
    } finally {
      setSending(false);
    }
  }

  async function deleteLog(id: string) {
    if (!confirm("Delete this log entry?")) return;
    try {
      await fetch("/api/admin/notifications", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      setLogs((prev) => prev.filter((l) => l.id !== id));
    } catch (err) {
      console.error(err);
    }
  }

  const filteredLogs = logs.filter((l) => {
    if (filterType !== "all" && l.type !== filterType) return false;
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      l.to.toLowerCase().includes(q) ||
      (l.subject || "").toLowerCase().includes(q) ||
      (l.sentBy || "").toLowerCase().includes(q)
    );
  });

  const resendReady = providerStatus?.providers.resend.configured === true;
  const smsReady = providerStatus?.providers.twilio.smsConfigured === true;
  const whatsappReady = providerStatus?.providers.twilio.whatsappConfigured === true;
  const isProviderReady = type === "email" ? resendReady : type === "sms" ? smsReady : whatsappReady;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/dashboard"
            className="rounded-md p-2 text-nexus-navy/60 hover:bg-nexus-navy/5"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-nexus-navy">Notifications</h1>
            <p className="mt-1 text-sm text-nexus-navy/70">
              Send emails, SMS, and WhatsApp messages via Resend and Twilio
            </p>
          </div>
        </div>
        <button
          onClick={() => {
            loadProviderStatus();
            loadLogs();
          }}
          className="flex items-center gap-1.5 rounded-lg border border-nexus-navy/10 bg-white px-3 py-2 text-sm font-medium text-nexus-navy hover:bg-nexus-navy/5"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-4">
        <StatCard
          label="Total"
          value={stats.total}
          icon={Send}
          color="text-nexus-navy"
        />
        <StatCard
          label="Sent"
          value={stats.sent}
          icon={CheckCircle2}
          color="text-emerald-600"
        />
        <StatCard
          label="Skipped"
          value={stats.skipped}
          icon={AlertCircle}
          color="text-amber-600"
        />
        <StatCard
          label="Failed"
          value={stats.failed}
          icon={XCircle}
          color="text-red-600"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-nexus-navy/10 bg-white p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-nexus-navy">Send Message</h2>
            {providerStatus && (
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                    resendReady
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {resendReady ? "Resend ✓" : "Resend ✗"}
                </span>
                {type !== "whatsapp" && (
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                      smsReady ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {smsReady ? "Twilio SMS ✓" : "Twilio SMS ✗"}
                  </span>
                )}
                {type === "whatsapp" && (
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                      whatsappReady ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {whatsappReady ? "Twilio WhatsApp ✓" : "Twilio WhatsApp ✗"}
                  </span>
                )}
              </div>
            )}
          </div>

          {!isProviderReady && (
            <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
              <p className="font-semibold">Provider not configured</p>
              <p className="mt-1 text-xs">
                {type === "email"
                  ? "Set RESEND_API_KEY in .env.local to send real emails. Otherwise sends will be skipped and logged."
                  : type === "sms"
                    ? "Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER in .env.local. Otherwise sends will be skipped and logged."
                    : "Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_WHATSAPP_FROM in .env.local. Otherwise sends will be skipped and logged."}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-nexus-navy">Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as NotificationType)}
                className="mt-1 w-full rounded-lg border border-nexus-navy/10 bg-white px-3 py-2 text-sm focus:border-nexus-cyan focus:outline-none"
              >
                <option value="email">Email (Resend)</option>
                <option value="sms">SMS (Twilio)</option>
                <option value="whatsapp">WhatsApp (Twilio)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-nexus-navy">Recipient</label>
              <input
                type="text"
                required
                value={to}
                onChange={(e) => setTo(e.target.value)}
                placeholder={type === "email" ? "email@example.com" : "+2376XXXXXXX"}
                className="mt-1 w-full rounded-lg border border-nexus-navy/10 bg-white px-3 py-2 text-sm focus:border-nexus-cyan focus:outline-none"
              />
            </div>
            {type === "email" && (
              <div>
                <label className="block text-sm font-medium text-nexus-navy">Subject</label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-nexus-navy/10 bg-white px-3 py-2 text-sm focus:border-nexus-cyan focus:outline-none"
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-nexus-navy">
                Message Body
              </label>
              <textarea
                rows={6}
                required
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="mt-1 w-full rounded-lg border border-nexus-navy/10 bg-white px-3 py-2 text-sm focus:border-nexus-cyan focus:outline-none"
                placeholder="Your NEXUS update is ready."
              />
            </div>
            <button
              type="submit"
              disabled={sending}
              className="flex items-center gap-2 rounded-lg bg-nexus-cyan px-4 py-2.5 text-sm font-medium text-white transition hover:bg-nexus-cyan-bright disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
              {sending ? "Sending..." : `Send ${TYPE_META[type].label}`}
            </button>
          </form>

          {result && (
            <div
              className={`mt-4 rounded-lg border p-4 ${
                result.status === "sent"
                  ? "border-emerald-200 bg-emerald-50"
                  : result.status === "skipped"
                    ? "border-amber-200 bg-amber-50"
                    : "border-red-200 bg-red-50"
              }`}
            >
              <p
                className={`text-sm font-semibold ${
                  result.status === "sent"
                    ? "text-emerald-800"
                    : result.status === "skipped"
                      ? "text-amber-800"
                      : "text-red-800"
                }`}
              >
                {result.status === "sent" && "✓ Sent successfully"}
                {result.status === "skipped" && "⚠ Skipped (provider not configured)"}
                {result.status === "failed" && "✗ Send failed"}
                {!result.status && (result.error || "Completed")}
              </p>
              {result.reason && (
                <p className="mt-1 text-xs text-amber-700">{result.reason}</p>
              )}
              <details className="mt-2">
                <summary className="cursor-pointer text-xs font-medium text-nexus-navy/70">
                  Show response
                </summary>
                <pre className="mt-2 overflow-x-auto rounded bg-white/50 p-2 text-[10px] text-nexus-navy/80">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </details>
            </div>
          )}
        </section>

        <section className="rounded-xl border border-nexus-navy/10 bg-white p-5">
          <h2 className="text-lg font-bold text-nexus-navy">Provider Status</h2>
          <p className="mt-1 text-xs text-nexus-navy/55">
            Last checked on page load
          </p>

          {!providerStatus ? (
            <LoadingState label="Checking providers..." size="sm" />
          ) : (
            <div className="mt-4 space-y-3">
              <ProviderCard
                name="Resend (Email)"
                ready={resendReady}
                detail={`From: ${providerStatus.providers.resend.from}`}
                required="RESEND_API_KEY"
              />
              <ProviderCard
                name="Twilio (SMS)"
                ready={smsReady}
                detail={`Phone: ${providerStatus.providers.twilio.phone || "—"}`}
                required="TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER"
              />
              <ProviderCard
                name="Twilio (WhatsApp)"
                ready={whatsappReady}
                detail={`WhatsApp From: ${
                  providerStatus.providers.twilio.whatsapp || "—"
                }`}
                required="TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_WHATSAPP_FROM"
              />
              <div className="mt-4 rounded-md border border-nexus-cyan/20 bg-nexus-cyan/5 p-3 text-xs text-nexus-navy/80">
                <p className="flex items-center gap-1.5 font-semibold">
                  <Sparkles className="h-3.5 w-3.5 text-nexus-cyan" />
                  Setup
                </p>
                <p className="mt-1">
                  Add credentials to <code className="rounded bg-white px-1">.env.local</code> and
                  restart. Get keys at{" "}
                  <a
                    href="https://resend.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-nexus-cyan hover:underline"
                  >
                    resend.com
                  </a>{" "}
                  and{" "}
                  <a
                    href="https://twilio.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-nexus-cyan hover:underline"
                  >
                    twilio.com
                  </a>
                  .
                </p>
              </div>
            </div>
          )}
        </section>
      </div>

      <section>
        <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-bold text-nexus-navy">Recent Activity</h2>
          <div className="flex flex-1 items-center gap-2 sm:max-w-md">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-nexus-navy/40" />
              <input
                type="text"
                placeholder="Search by recipient, subject, or sender..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-lg border border-nexus-navy/10 bg-white py-2 pl-9 pr-3 text-sm focus:border-nexus-cyan focus:outline-none"
              />
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as NotificationType | "all")}
              className="rounded-lg border border-nexus-navy/10 bg-white px-3 py-2 text-sm focus:border-nexus-cyan focus:outline-none"
            >
              <option value="all">All types</option>
              <option value="email">Email</option>
              <option value="sms">SMS</option>
              <option value="whatsapp">WhatsApp</option>
            </select>
          </div>
        </div>

        <div className="rounded-xl border border-nexus-navy/10 bg-white">
          {loadingLogs ? (
            <LoadingState label="Loading history..." size="sm" />
          ) : filteredLogs.length === 0 ? (
            <EmptyState
              icon={Clock}
              title={logs.length === 0 ? "No notifications sent yet" : "No logs match your filters"}
              description={
                logs.length === 0
                  ? "Send your first message above — it will appear here in the history."
                  : "Try a different search or filter."
              }
            />
          ) : (
            <div className="divide-y divide-nexus-navy/10">
              {filteredLogs.map((log) => {
                const tMeta = TYPE_META[log.type];
                const sMeta = STATUS_META[log.status] || STATUS_META.sent;
                const TypeIcon = tMeta.icon;
                const StatusIcon = sMeta.icon;
                return (
                  <div
                    key={log.id}
                    className="flex items-start gap-3 px-5 py-3"
                  >
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${tMeta.color}`}
                    >
                      <TypeIcon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium text-nexus-navy">
                          {log.to}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${sMeta.color}`}
                        >
                          <StatusIcon className="h-3 w-3" />
                          {sMeta.label}
                        </span>
                        {log.subject && (
                          <span className="truncate text-xs text-nexus-navy/60">
                            • {log.subject}
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 text-xs text-nexus-navy/50">
                        {new Date(log.sentAt).toLocaleString()}
                        {log.sentBy && ` • by ${log.sentBy}`}
                      </p>
                    </div>
                    <button
                      onClick={() => deleteLog(log.id)}
                      className="rounded-md p-1.5 text-red-600 hover:bg-red-50"
                      title="Delete log"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: number;
  icon: LucideIcon;
  color: string;
}) {
  return (
    <div className="rounded-xl border border-nexus-navy/10 bg-white p-4">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-nexus-navy/60">
        <Icon className={`h-4 w-4 ${color}`} />
        {label}
      </div>
      <p className={`mt-2 text-2xl font-bold ${color}`}>{value}</p>
    </div>
  );
}

function ProviderCard({
  name,
  ready,
  detail,
  required,
}: {
  name: string;
  ready: boolean;
  detail: string;
  required: string;
}) {
  return (
    <div
      className={`rounded-lg border p-3 ${
        ready
          ? "border-emerald-200 bg-emerald-50/50"
          : "border-amber-200 bg-amber-50/50"
      }`}
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-nexus-navy">{name}</p>
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
            ready
              ? "bg-emerald-100 text-emerald-700"
              : "bg-amber-100 text-amber-700"
          }`}
        >
          {ready ? (
            <>
              <CheckCircle2 className="h-3 w-3" /> Ready
            </>
          ) : (
            <>
              <AlertCircle className="h-3 w-3" /> Not configured
            </>
          )}
        </span>
      </div>
      <p className="mt-1 text-xs text-nexus-navy/70">{detail}</p>
      {!ready && (
        <p className="mt-1 text-[10px] text-nexus-navy/55">
          Required: <code className="rounded bg-white px-1">{required}</code>
        </p>
      )}
    </div>
  );
}
