"use client";

import { useEffect, useState } from "react";

import Link from "next/link";
import { Search, ArrowLeft, ScrollText, Trash2 } from "lucide-react";

interface ActivityLog {
  id: string;
  action: string;
  item: string;
  details?: string;
  user?: string;
  timestamp: string;
}

export default function LogsPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  async function loadLogs() {
    try {
      const res = await fetch("/api/admin/logs");
      const data = await res.json();
      setLogs(data.logs || []);
    } catch (error) {
      console.error("Failed to load logs:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    queueMicrotask(() => void loadLogs());
  }, []);

  async function handleClearLogs() {
    if (!confirm("Are you sure you want to clear all logs? This cannot be undone.")) return;

    try {
      const res = await fetch("/api/admin/logs", { method: "DELETE" });
      if (res.ok) loadLogs();
    } catch (error) {
      console.error("Failed to clear logs:", error);
    }
  }

  const filteredLogs = logs.filter((log) =>
    log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.item.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (log.user && log.user.toLowerCase().includes(searchQuery.toLowerCase()))
  );

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
            <h1 className="text-2xl font-bold text-nexus-navy">Activity Log</h1>
            <p className="mt-1 text-sm text-nexus-navy">
              Track admin actions and system events
            </p>
          </div>
        </div>
        {logs.length > 0 && (
          <button
            onClick={handleClearLogs}
            className="flex items-center gap-2 rounded-lg border border-red-200 px-4 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
            Clear Logs
          </button>
        )}
      </div>

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

      <div className="rounded-xl border border-nexus-navy/10 bg-white">
        {loading ? (
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
              <div key={log.id} className="px-6 py-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="rounded-lg bg-nexus-cyan/10 p-2">
                      <ScrollText className="h-4 w-4 text-nexus-cyan" />
                    </div>
                    <div>
                      <p className="font-medium text-nexus-navy">{log.action}</p>
                      <p className="text-sm text-nexus-navy">{log.item}</p>
                      {log.details && (
                        <p className="text-xs text-nexus-navy/50">{log.details}</p>
                      )}
                      {log.user && (
                        <p className="text-xs text-nexus-navy/50">By: {log.user}</p>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-nexus-navy/50">
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
