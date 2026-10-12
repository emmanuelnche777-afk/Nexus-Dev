"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { AlertCircle, RefreshCw } from "lucide-react";


interface Escalation {
  id: string;
  conversationId: string;
  clientName: string;
  clientEmail: string;
  reason: string;
  aiMessages: string[];
  createdAt: string;
  status: "new" | "pending" | "resolved" | "closed";
  assignedTo?: string;
  adminResponse?: string;
  respondedAt?: string;
}

export default function AIEscalationsPage() {
  const [escalations, setEscalations] = useState<Escalation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterStatus, setFilterStatus] = useState("new");

  const loadEscalations = useCallback(async (refresh = false) => {
    if (refresh) { setLoading(true); setError(""); }
    try {
      const response = await fetch("/api/admin/ai/escalations", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not load escalations.");
      setEscalations(Array.isArray(data.escalations) ? data.escalations : []);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not load escalations.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial loading is already true; the loader only sets state after its network request.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { void loadEscalations(); }, [loadEscalations]);

  const filteredEscalations = escalations.filter((e) => {
    if (filterStatus === "new") return e.status === "new";
    if (filterStatus === "pending") return e.status === "pending";
    if (filterStatus === "resolved") return e.status === "resolved";
    if (filterStatus === "closed") return e.status === "closed";
    return true;
  });

  return (
    <div className="bg-nexus-white p-6 rounded-lg border border-nexus-cyan/20">
      <header className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-nexus-cyan" />
          <h1 className="text-xl font-bold text-nexus-dark">Escalations</h1>
        </div>
        <div className="flex items-center gap-3"><button type="button" onClick={() => void loadEscalations(true)} disabled={loading} className="inline-flex items-center gap-2 rounded-md border border-nexus-navy/15 px-3 py-2 text-sm"><RefreshCw className="h-4 w-4" />Refresh</button><Link href="/admin/ai" className="text-sm text-nexus-navy hover:text-nexus-cyan">← Back to AI Management</Link></div>
      </header>

      <div className="mb-4">
        <select
          onChange={(e) => setFilterStatus(e.target.value)}
          className="rounded-md border border-nexus-navy/10 bg-white px-3 py-2 text-sm text-nexus-dark focus:border-nexus-cyan"
        >
          <option value="new">New</option>
          <option value="pending">Pending</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
        </select>
      </div>

      <div className="mt-4">
        {error ? (
          <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error} <button type="button" onClick={() => void loadEscalations(true)} className="ml-2 font-semibold underline">Try again</button></div>
        ) : loading ? (
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-nexus-cyan border-t-transparent" />
        ) : escalations.length === 0 ? (
          <p className="text-nexus-navy mt-4">No escalations found</p>
        ) : filteredEscalations.length === 0 ? (
          <p className="text-nexus-navy mt-4">No {filterStatus} escalations.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {filteredEscalations.map((escalation) => (
              <Link
                href={`/admin/ai/escalations/${escalation.id}`}
                key={escalation.id}
                className="block rounded-lg border border-nexus-cyan/10 bg-white p-4 transition hover:border-nexus-cyan/30"
              >
                <div className="flex items-start gap-3">
                  <div className="flex-1">
                    <p className="font-medium text-nexus-dark">{escalation.clientName}</p>
                    <p className="mt-1 text-xs text-nexus-navy/70">
                      {escalation.clientEmail}
                    </p>
                    <p className="mt-1 text-xs text-nexus-navy">
                      {escalation.reason}
                    </p>
                  </div>
                  <div className="text-xs text-nexus-navy/70">
                    {escalation.status}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="mt-6">
        <Link
          href="/admin/ai/escalations/new"
          className="flex items-center gap-2 rounded-md bg-nexus-cyan px-4 py-2 text-sm font-medium text-white transition hover:bg-nexus-cyan-bright"
        >
          <AlertCircle className="h-4 w-4" /> Create Escalation
        </Link>
      </div>
    </div>
  );
}
