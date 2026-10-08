"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Users } from "lucide-react";


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
  const [sessions, setSessions] = useState<LiveSupportSession[]>([]);

  useEffect(() => {
    fetch("/api/admin/live-support", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        setSessions(data.sessions || []);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  const handleEndSession = (id: string) => {
    setSessions(
      sessions.map((s) =>
        s.id === id ? { ...s, endTime: new Date().toISOString() } : s)
    );
    fetch(`/api/admin/live-support`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId: id, adminId: "admin-1", endSession: true }),
    });
  };

  return (
    <div className="bg-nexus-white p-6 rounded-lg border border-nexus-cyan/20">
      <header className="flex items-center justify-between mb-6">
        <div>
          <Users className="h-5 w-5 text-nexus-cyan" />
          <h2 className="text-xl font-bold text-nexus-dark">Live Support Sessions</h2>
        </div>
        <Link
          href="/admin/ai"
          className="text-sm text-nexus-navy hover:text-nexus-navy"
        >
          ← Back to AI Management
        </Link>
      </header>

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
                  {session.endTime ? (
                    <span className="text-green-600 text-sm">
                      ended {new Date(session.endTime).toLocaleDateString()}
                    </span>
                  ) : (
                    <button
                      onClick={() => handleEndSession(session.id)}
                      className="text-red-500 hover:text-red-700 text-sm"
                      title="End Session"
                    >
                      ✕ End
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}