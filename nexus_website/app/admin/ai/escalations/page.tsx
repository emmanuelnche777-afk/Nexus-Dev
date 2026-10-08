"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AlertCircle } from "lucide-react";


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
  const [filterStatus, setFilterStatus] = useState("new");

  useEffect(() => {
    fetch("/api/admin/ai/escalations", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        setEscalations(data.escalations || []);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  const filteredEscalations = escalations.filter((e) => {
    if (filterStatus === "new") return e.status === "new";
    if (filterStatus === "pending") return e.status === "pending";
    if (filterStatus === "resolved") return e.status === "resolved";
    if (filterStatus === "closed") return e.status === "closed";
    return true;
  });

  return (
    <div className="bg-nexus-white p-6 rounded-lg border border-nexus-cyan/20">
      <header className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-nexus-cyan" />
          <h1 className="text-xl font-bold text-nexus-dark">Escalations</h1>
        </div>
        <Link
          href="/admin/ai"
          className="text-sm text-nexus-navy hover:text-nexus-navy"
        >
          ← Back to AI Management
        </Link>
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
        {loading ? (
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-nexus-cyan border-t-transparent" />
        ) : escalations.length === 0 ? (
          <p className="text-nexus-navy mt-4">No escalations found</p>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {filteredEscalations.map((escalation) => (
              <div
                key={escalation.id}
                className="p-4 rounded-lg border border-nexus-cyan/10 bg-white hover:border-nexus-cyan/30 transition"
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
              </div>
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
