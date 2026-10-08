"use client";

import { useCallback, useEffect, useState, use } from "react";

import Link from "next/link";
import { ArrowLeft, Save, User, Mail } from "lucide-react";

interface Escalation {
  id: string;
  conversationId: string;
  clientName: string;
  clientEmail: string;
  reason: string;
  aiMessages: string[];
  createdAt: string;
  status: string;
  assignedTo?: string;
  adminResponse?: string;
  respondedAt?: string;
}

export default function EscalationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [escalation, setEscalation] = useState<Escalation | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [adminResponse, setAdminResponse] = useState("");
  const [status, setStatus] = useState("");

  const loadEscalation = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/ai/escalations/${id}`);
      if (res.ok) {
        const data = await res.json();
        setEscalation(data);
        setStatus(data.status);
        setAdminResponse(data.adminResponse || "");
      }
    } catch (error) {
      console.error("Failed to load escalation:", error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    queueMicrotask(() => void loadEscalation());
  }, [loadEscalation]);

  async function handleSave() {
    if (!escalation) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/ai/escalations/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, adminResponse, assignedTo: "admin" }),
      });
      if (res.ok) {
        const updated = await res.json();
        setEscalation(updated);
      }
    } catch (error) {
      console.error("Failed to save:", error);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="py-12 text-center">Loading escalation...</div>;
  }

  if (!escalation) {
    return (
      <div className="py-12 text-center">
        <p className="text-nexus-navy">Escalation not found</p>
        <Link href="/admin/ai/escalations" className="mt-4 inline-block text-nexus-cyan hover:underline">
          Back to escalations
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/ai/escalations"
          className="rounded-md p-2 text-nexus-navy hover:bg-nexus-navy/5"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-nexus-navy">Escalation {escalation.id}</h1>
          <p className="mt-1 text-sm text-nexus-navy/70">
            Created {new Date(escalation.createdAt).toLocaleString()}
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-nexus-navy/10 bg-white p-6">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-nexus-navy/60">
            Client Information
          </h3>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-nexus-navy/50" />
              <span className="text-sm font-medium text-nexus-navy">{escalation.clientName}</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-nexus-navy/50" />
              <a href={`mailto:${escalation.clientEmail}`} className="text-sm text-nexus-cyan hover:underline">
                {escalation.clientEmail}
              </a>
            </div>
            <div>
              <p className="text-xs text-nexus-navy/50">Reason</p>
              <p className="text-sm text-nexus-navy">{escalation.reason}</p>
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-nexus-navy/10 bg-white p-6">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-nexus-navy/60">
            AI Messages
          </h3>
          <div className="space-y-2">
            {(escalation.aiMessages || []).length === 0 ? (
              <p className="text-sm text-nexus-navy/60">No AI messages recorded.</p>
            ) : (
              escalation.aiMessages.map((msg, i) => (
                <div key={i} className="rounded-lg bg-nexus-gray/30 p-3">
                  <p className="text-xs text-nexus-navy/60">Message {i + 1}</p>
                  <p className="text-sm text-nexus-navy">{msg}</p>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      <section className="rounded-xl border border-nexus-navy/10 bg-white p-6">
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-nexus-navy/60">
          Respond to Escalation
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-nexus-navy">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="mt-1 w-full rounded-lg border border-nexus-navy/10 px-3 py-2 text-sm focus:border-nexus-cyan focus:outline-none"
            >
              <option value="new">New</option>
              <option value="pending">Pending</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-nexus-navy">Admin Response</label>
            <textarea
              rows={6}
              value={adminResponse}
              onChange={(e) => setAdminResponse(e.target.value)}
              placeholder="Write your response to the client..."
              className="mt-1 w-full rounded-lg border border-nexus-navy/10 px-3 py-2 text-sm focus:border-nexus-cyan focus:outline-none"
            />
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-1.5 rounded-lg bg-nexus-cyan px-4 py-2 text-sm font-medium text-white transition hover:bg-nexus-cyan-bright disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {saving ? "Saving..." : "Save Response"}
          </button>
        </div>
      </section>
    </div>
  );
}
