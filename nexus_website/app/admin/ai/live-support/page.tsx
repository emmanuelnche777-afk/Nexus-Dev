"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { RefreshCw, Users } from "lucide-react";


interface LiveSupportSession {
  id: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  startedAt: string;
  adminId?: string;
  adminName?: string;
  reason: string;
  endTime?: string;
}

export default function LiveSupportPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [endingId, setEndingId] = useState<string | null>(null);
  const [sessions, setSessions] = useState<LiveSupportSession[]>([]);

  const loadSessions = useCallback(async (refresh = false) => {
    if (refresh) { setLoading(true); setError(""); }
    try {
      const response = await fetch("/api/admin/live-support", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not load live support sessions.");
      setSessions(Array.isArray(data.sessions) ? data.sessions : []);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not load live support sessions.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial loading is already true; the loader only sets state after its network request.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { void loadSessions(); }, [loadSessions]);

  const handleEndSession = async (id: string) => {
    setEndingId(id);
    setError("");
    try {
      const response = await fetch("/api/admin/live-support", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: id, endSession: true }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not end this support session.");
      setSessions((current) => current.filter((session) => session.id !== id));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not end this support session.");
    } finally {
      setEndingId(null);
    }
  };

  return (
    <div className="bg-nexus-white p-6 rounded-lg border border-nexus-cyan/20">
      <header className="flex items-center justify-between mb-6">
        <div>
          <Users className="h-5 w-5 text-nexus-cyan" />
          <h2 className="text-xl font-bold text-nexus-dark">Live Support Sessions</h2>
        </div>
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => void loadSessions(true)} disabled={loading} className="inline-flex items-center gap-2 rounded-md border border-nexus-navy/15 px-3 py-2 text-sm disabled:opacity-60"><RefreshCw className="h-4 w-4" />Refresh</button>
          <Link href="/admin/ai" className="text-sm text-nexus-navy hover:text-nexus-cyan">← Back to AI Management</Link>
        </div>
      </header>

      {error && <div role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</div>}

      <div className="mt-6">
        <h3 className="font-semibold text-nexus-dark mb-3">
          Active Sessions: {sessions.length}
        </h3>
        {loading ? (
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-nexus-cyan border-t-transparent" />
        ) : sessions.length === 0 ? (
          <p className="text-nexus-navy mt-4">No active sessions</p>
        ) : (
          <div className="space-y-3">
            {sessions.map((session) => (
              <div
                key={session.id}
                className="p-4 rounded-lg border border-nexus-cyan/10 bg-white mb-2"
              >
                <div className="flex items-start gap-3">
                  <div>
                    <p className="font-medium text-nexus-dark">
                      {session.clientName}
                    </p>
                    <p className="text-xs text-nexus-navy/70">
                      {session.clientEmail}
                    </p>
                  </div>
                  <div className="ml-auto">
                    <p className="text-xs text-nexus-navy">
                      {session.reason}
                    </p>
                    <p className="text-xs text-nexus-navy/70">
                      Started: {new Date(session.startedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <button type="button" onClick={() => void handleEndSession(session.id)} disabled={endingId === session.id} className="text-sm text-red-600 hover:text-red-800 disabled:opacity-60" title="End session">
                    {endingId === session.id ? "Ending…" : "✕ End"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
