"use client";

import { useEffect, useState } from "react";

import Link from "next/link";
import { Search, ArrowLeft, RefreshCw, ScrollText } from "lucide-react";

interface ActivityLog {
  id: string;
  action: string;
  item: string;
  resourceId?: string;
  details?: string;
  user?: string;
  ip?: string;
  timestamp: string;
}

export default function LogsPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [staffFilter, setStaffFilter] = useState("");
  const [eventFilter, setEventFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  async function loadLogs() {
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/logs", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load audit logs.");
      setLogs(data.logs || []);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Failed to load audit logs.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    queueMicrotask(() => void loadLogs());
  }, []);

  const staffOptions = [...new Set(logs.map((log) => log.user).filter((user): user is string => !!user))].sort();
  const eventOptions = [...new Set(logs.map((log) => log.action))].sort();
  const fromTime = dateFrom ? new Date(`${dateFrom}T00:00:00`).getTime() : null;
  const toTime = dateTo ? new Date(`${dateTo}T23:59:59.999`).getTime() : null;
  const filteredLogs = logs.filter((log) => {
    const query = searchQuery.toLowerCase();
    const timestamp = new Date(log.timestamp).getTime();
    return (
      (!query || log.action.toLowerCase().includes(query) || log.item.toLowerCase().includes(query) || (log.user || "").toLowerCase().includes(query)) &&
      (!staffFilter || log.user === staffFilter) &&
      (!eventFilter || log.action === eventFilter) &&
      (fromTime === null || timestamp >= fromTime) &&
      (toTime === null || timestamp <= toTime)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/dashboard"
            className="rounded-md p-2 text-nexus-navy hover:bg-nexus-navy/5"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-nexus-navy">Audit Log</h1>
            <p className="mt-1 text-sm text-nexus-navy">
              Review staff actions recorded by the system. Page views and every record read are not all logged.
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-end"><button type="button" onClick={() => void loadLogs()} disabled={loading} className="inline-flex items-center gap-2 rounded-md border border-nexus-navy/15 bg-white px-3 py-2 text-sm disabled:opacity-60"><RefreshCw className="h-4 w-4" />Refresh logs</button></div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-nexus-navy/40" />
        <input
          type="text"
          placeholder="Search logs..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-lg border border-nexus-navy/10 bg-white py-2.5 pl-10 pr-4 text-sm text-nexus-navy placeholder:text-nexus-navy/40 focus:border-nexus-cyan focus:outline-none"
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <label className="text-xs font-medium text-nexus-navy/70">Staff member
          <select value={staffFilter} onChange={(event) => setStaffFilter(event.target.value)} className="mt-1 w-full rounded-lg border border-nexus-navy/10 bg-white px-3 py-2 text-sm text-nexus-navy">
            <option value="">All staff</option>
            {staffOptions.map((staff) => <option key={staff} value={staff}>{staff}</option>)}
          </select>
        </label>
        <label className="text-xs font-medium text-nexus-navy/70">Event
          <select value={eventFilter} onChange={(event) => setEventFilter(event.target.value)} className="mt-1 w-full rounded-lg border border-nexus-navy/10 bg-white px-3 py-2 text-sm text-nexus-navy">
            <option value="">All events</option>
            {eventOptions.map((eventName) => <option key={eventName} value={eventName}>{eventName}</option>)}
          </select>
        </label>
        <label className="text-xs font-medium text-nexus-navy/70">From
          <input type="date" value={dateFrom} onChange={(event) => setDateFrom(event.target.value)} className="mt-1 w-full rounded-lg border border-nexus-navy/10 bg-white px-3 py-2 text-sm text-nexus-navy" />
        </label>
        <label className="text-xs font-medium text-nexus-navy/70">To
          <input type="date" value={dateTo} onChange={(event) => setDateTo(event.target.value)} className="mt-1 w-full rounded-lg border border-nexus-navy/10 bg-white px-3 py-2 text-sm text-nexus-navy" />
        </label>
      </div>

      <div className="rounded-xl border border-nexus-navy/10 bg-white">
        {error ? (
          <div role="alert" className="p-6 text-sm text-red-800">{error}<button type="button" onClick={() => void loadLogs()} className="ml-2 font-semibold underline">Try again</button></div>
        ) : loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-nexus-cyan border-t-transparent" />
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="py-12 text-center">
            <ScrollText className="mx-auto h-12 w-12 text-nexus-navy/20" />
            <p className="mt-4 text-nexus-navy">No activity logs found</p>
          </div>
        ) : (
          <div className="divide-y divide-nexus-navy/10">
            {filteredLogs.map((log) => (
              <div key={log.id} className="min-w-0 px-4 py-4 sm:px-6">
                <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex min-w-0 items-start gap-3">
                    <div className="rounded-lg bg-nexus-cyan/10 p-2">
                      <ScrollText className="h-4 w-4 text-nexus-cyan" />
                    </div>
                    <div className="min-w-0 flex-1 break-words">
                      <p className="font-medium text-nexus-navy">{log.action.replace(/_/g, " ")}</p>
                      <p className="text-sm text-nexus-navy">{log.item}</p>
                      {log.resourceId && <p className="break-all text-xs text-nexus-navy/50">Record: {log.resourceId}</p>}
                      {log.details && (
                        <p className="text-xs text-nexus-navy/50">{log.details}</p>
                      )}
                      {log.user && (
                        <p className="text-xs text-nexus-navy/50">By: {log.user}</p>
                      )}
                      {!log.user && log.ip && (
                        <p className="text-xs text-nexus-navy/50">Unverified sign-in attempt from: {log.ip}</p>
                      )}
                    </div>
                  </div>
                  <p className="break-words text-xs text-nexus-navy/50 sm:shrink-0 sm:text-right">
                    {new Date(log.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
