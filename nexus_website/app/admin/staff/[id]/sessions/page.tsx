"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

interface Session {
  id: string;
  createdAt: string;
  lastActiveAt: string;
  userAgent: string | null;
  ipAddress: string | null;
  expiresAt: string;
}

export default function StaffSessionsPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [staffId, setStaffId] = useState<string | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [revoking, setRevoking] = useState<string | null>(null);
  const [revokingAll, setRevokingAll] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    void params.then(({ id }) => setStaffId(id));
  }, [params]);

  useEffect(() => {
    if (!staffId) return;
    let cancelled = false;
    fetch(`/api/admin/staff/${staffId}/sessions`, { cache: "no-store" })
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to load sessions");
        const data = await res.json();
        if (cancelled) return;
        setSessions(data.sessions || []);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Failed to load sessions");
      })
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
      });
    return () => { cancelled = true };
  }, [staffId]);

  const revokeSession = async (id: string) => {
    if (!staffId) return;
    if (!confirm("Revoke this session? The user will be logged out immediately.")) return;

    setRevoking(id);
    try {
      const res = await fetch(`/api/admin/staff/${staffId}/sessions`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: id }),
      });
      if (!res.ok) throw new Error("Failed to revoke session");
      setSessions((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to revoke session");
    } finally {
      setRevoking(null);
    }
  }

  async function revokeAllSessions() {
    if (!staffId) return;
    if (!confirm("Revoke ALL sessions for this staff member? They will be logged out everywhere.")) return;

    setRevokingAll(true);
    try {
      const res = await fetch(`/api/admin/staff/${staffId}/sessions`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      if (!res.ok) throw new Error("Failed to revoke sessions");
      setSessions([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to revoke sessions");
    } finally {
      setRevokingAll(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 animate-pulse rounded bg-nexus-navy/10"></div>
        <div className="h-64 animate-pulse rounded-lg border border-nexus-navy/10 bg-nexus-navy/5"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="rounded-md p-2 text-nexus-navy hover:bg-nexus-navy/5"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-2xl font-bold text-nexus-navy">Active Sessions</h1>
        </div>
        <button
          onClick={() => router.push("/admin/staff")}
          className="text-sm text-nexus-cyan hover:underline"
        >
          Back to Staff
        </button>
      </div>

      {error && (
        <p className="rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600">
          {error}
        </p>
      )}

      {sessions.length === 0 ? (
        <div className="rounded-lg border border-nexus-navy/10 bg-white p-8 text-center">
          <p className="text-sm text-nexus-navy/50">No active sessions found.</p>
        </div>
      ) : (
        <>
          <div className="flex justify-end">
            <button
              onClick={revokeAllSessions}
              disabled={revokingAll}
              className="rounded-md border border-red-200 px-4 py-2 text-sm text-red-600 transition hover:bg-red-50 disabled:opacity-60"
            >
              {revokingAll ? "Revoking..." : "Revoke All Sessions"}
            </button>
          </div>

          <div className="overflow-x-auto rounded-lg border border-nexus-navy/10 bg-white">
            <table className="w-full">
              <thead>
                <tr className="border-b border-nexus-navy/10">
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-nexus-navy/60">
                    Device/Browser
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-nexus-navy/60">
                    IP Address
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-nexus-navy/60">
                    Last Active
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium uppercase text-nexus-navy/60">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((session) => (
                  <tr key={session.id} className="border-b border-nexus-navy/5 last:border-0">
                    <td className="px-6 py-4">
                      <p className="max-w-xs truncate text-sm text-nexus-navy">
                        {session.userAgent || "Unknown device"}
                      </p>
                      <p className="text-xs text-nexus-navy/50">
                        Session started {new Date(session.createdAt).toLocaleString()}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-sm text-nexus-navy/60">
                      {session.ipAddress || "Unknown"}
                    </td>
                    <td className="px-6 py-4 text-sm text-nexus-navy/60">
                      {new Date(session.lastActiveAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => revokeSession(session.id)}
                        disabled={revoking === session.id}
                        className="text-sm text-red-600 hover:underline disabled:opacity-50"
                      >
                        {revoking === session.id ? "Revoking..." : "Revoke"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
