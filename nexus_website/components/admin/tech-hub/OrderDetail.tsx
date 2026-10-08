"use client";

import { useEffect, useState } from "react";
import {
  UserCheck,
  Mail,
  Phone,
  Building2,
  Clock,
  DollarSign,
  Send,
  Plus,
  Trash2,
  Check,
  X,
  MessageCircle,
  FileText,
} from "lucide-react";
import LoadingState from "@/components/admin/LoadingState";

export interface TechHubServiceOrder {
  id: string;
  serviceType: string;
  serviceTypeKey: string;
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  company?: string;
  description: string;
  budget?: string;
  timeline?: string;
  desiredTimeline?: string;
  quoteAmount?: number | null;
  quoteCurrency?: string;
  quoteDurationWeeks?: number | null;
  source?: string;
  status: string;
  priority: string;
  assignedTo?: string;
  notes?: string;
  milestones: { id: string; title: string; status: string; dueDate?: string | null }[];
  createdAt: string;
  updatedAt: string;
}

interface OrderDetailProps {
  orderId: string;
  onDraftContract?: (order: TechHubServiceOrder) => void;
  onStartConversation?: (order: TechHubServiceOrder) => void;
  emptyStateTitle?: string;
  emptyStateDescription?: string;
  title?: string;
  subtitle?: string;
}

const CURRENCIES = ["XAF", "USD", "EUR", "GBP"];

const STATUS_META: Record<string, { label: string; classes: string }> = {
  new: { label: "New", classes: "bg-blue-100 text-blue-700" },
  quoted: { label: "Quoted", classes: "bg-amber-100 text-amber-700" },
  in_progress: { label: "In Progress", classes: "bg-cyan-100 text-cyan-700" },
  completed: { label: "Completed", classes: "bg-emerald-100 text-emerald-700" },
  cancelled: { label: "Cancelled", classes: "bg-gray-100 text-gray-500" },
};

export default function OrderDetail({
  orderId,
  onDraftContract,
  onStartConversation,
  emptyStateTitle = "Order not found",
  emptyStateDescription = "The requested order could not be loaded.",
  title = "Order details",
  subtitle = "",
}: OrderDetailProps) {
  const [order, setOrder] = useState<TechHubServiceOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Quote form state
  const [quoteOpen, setQuoteOpen] = useState(false);
  const [quoteAmount, setQuoteAmount] = useState("");
  const [quoteCurrency, setQuoteCurrency] = useState("XAF");
  const [quoteDuration, setQuoteDuration] = useState("");

  // Milestone state
  const [newMilestone, setNewMilestone] = useState("");
  // Notes state
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (!orderId) return;
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/admin/service-orders/${orderId}`, { cache: "no-store" });
        const data = await res.json();
        if (!res.ok || data.error) {
          setError(data.error || "Failed to load order");
          setOrder(null);
          return;
        }
        setOrder(data);
        setQuoteAmount(String(data.quoteAmount || ""));
        setQuoteCurrency(data.quoteCurrency || "XAF");
        setQuoteDuration(String(data.quoteDurationWeeks || ""));
        setNotes(data.notes || "");
      } catch {
        setError("Failed to load order");
      } finally {
        setLoading(false);
      }
    })();
  }, [orderId]);

  async function updateOrder(patch: Partial<TechHubServiceOrder>) {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/service-orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      const updated = await res.json();
      if (res.ok) {
        setOrder(updated);
      } else {
        setError(updated.error || "Update failed");
      }
    } catch {
      setError("Update failed");
    } finally {
      setSaving(false);
    }
    return null;
  }

  async function saveQuote() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/service-orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quoteAmount: Number(quoteAmount),
          quoteCurrency,
          quoteDurationWeeks: quoteDuration ? Number(quoteDuration) : null,
        }),
      });
      const updated = await res.json();
      if (res.ok) {
        setOrder(updated);
        setQuoteOpen(false);
      } else {
        setError(updated.error || "Save failed");
      }
    } catch {
      setError("Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function addMilestone() {
    if (!newMilestone.trim()) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/service-orders/${orderId}/milestones`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newMilestone.trim() }),
      });
      const updated = await res.json();
      if (res.ok) {
        setOrder(updated);
        setNewMilestone("");
      } else {
        setError(updated.error || "Failed to add milestone");
      }
    } catch {
      setError("Failed to add milestone");
    } finally {
      setSaving(false);
    }
  }

  async function toggleMilestone(milestone: { id: string; status: string }) {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/service-orders/${orderId}/milestones/${milestone.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: milestone.status === "completed" ? "pending" : "completed" }),
      });
      const updated = await res.json();
      if (res.ok) setOrder(updated);
    } catch {
      // silent
    } finally {
      setSaving(false);
    }
  }

  async function deleteMilestone(milestone: { id: string }) {
    try {
      const res = await fetch(`/api/admin/service-orders/${orderId}/milestones/${milestone.id}`, {
        method: "DELETE",
      });
      const updated = await res.json();
      if (res.ok) setOrder(updated);
    } catch {
      // silent
    }
  }

  async function saveNotes() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/service-orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes }),
      });
      const updated = await res.json();
      if (res.ok) setOrder(updated);
      else setError(updated.error || "Save failed");
    } catch {
      setError("Save failed");
    } finally {
      setSaving(false);
    }
  }

  const whatsapp = (o: TechHubServiceOrder) =>
    o.clientPhone
      ? `https://wa.me/${o.clientPhone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
          `Hi ${o.clientName}, thank you for contacting NEXUS about "${o.serviceType}".`
        )}`
      : `https://wa.me/?text=${encodeURIComponent(`NEXUS: reply to ${o.clientName} (${o.clientEmail})`)}`;

  const mailto = (o: TechHubServiceOrder) =>
    `mailto:${o.clientEmail}?subject=${encodeURIComponent(`Re: Your NEXUS request — ${o.serviceType}`)}&body=${encodeURIComponent(
      `Hi ${o.clientName},\n\nThank you for contacting NEXUS. We're on it and will get back to you shortly.\n\nBest regards,\nNEXUS Tech Hub`
    )}`;

  if (loading) {
    return <div className="flex items-center justify-center py-12"><LoadingState /></div>;
  }

  if (!order || error) {
    return (
      <EmptyStateWrapper title={emptyStateTitle} description={emptyStateDescription} icon={FileText} />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-bold text-nexus-navy">{title}</h2>
          <p className="text-xs text-nexus-navy/50">Order {order.id}</p>
          {subtitle && <p className="text-xs text-nexus-navy/50 mt-1">{subtitle}</p>}
        </div>
        <button
          onClick={() => window.history.back()}
          className="rounded-lg p-2 text-nexus-navy/60 hover:bg-nexus-navy/5"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Status workflow */}
      <div className="flex flex-wrap items-center gap-2">
        <select
          value={order.status}
          onChange={(e) => updateOrder({ status: e.target.value })}
          disabled={saving}
          className="rounded-lg border border-nexus-navy/10 bg-white px-3 py-2 text-sm font-medium focus:border-nexus-cyan focus:outline-none"
        >
          {Object.entries(STATUS_META).map(([value, meta]) => (
            <option key={value} value={value}>{meta.label}</option>
          ))}
        </select>
        <span className={`rounded-full px-2 py-1 text-xs font-semibold ${STATUS_META[order.status]?.classes || ""}`}>
          {STATUS_META[order.status]?.label || order.status}
        </span>
        <div className="ml-auto flex items-center gap-2">
          <select
            value={order.priority}
            onChange={(e) => updateOrder({ priority: e.target.value })}
            className="rounded-lg border border-nexus-navy/10 bg-white px-3 py-2 text-sm focus:border-nexus-cyan focus:outline-none"
          >
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <input
            value={order.assignedTo || ""}
            onChange={(e) => updateOrder({ assignedTo: e.target.value })}
            placeholder="Assigned to"
            className="rounded-lg border border-nexus-navy/10 bg-white px-3 py-2 text-sm focus:border-nexus-cyan focus:outline-none"
          />
        </div>
      </div>

      {/* Action buttons: Draft Contract + Start Conversation */}
      {(onDraftContract || onStartConversation) && (
        <div className="flex flex-wrap gap-2">
          {onStartConversation && (
            <button
              onClick={() => onStartConversation(order)}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-lg bg-nexus-cyan px-4 py-2 text-sm font-semibold text-white hover:bg-nexus-cyan-dark disabled:opacity-50"
            >
              <MessageCircle className="h-4 w-4" />
              Start conversation
            </button>
          )}
          {onDraftContract && (
            <button
              onClick={() => onDraftContract(order)}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-lg bg-nexus-navy px-4 py-2 text-sm font-semibold text-white hover:bg-nexus-navy/80 disabled:opacity-50"
            >
              <FileText className="h-4 w-4" />
              Draft contract
            </button>
          )}
        </div>
      )}

      {/* Client card */}
      <div className="rounded-xl border border-nexus-navy/10 bg-white p-5">
        <h3 className="text-sm font-semibold text-nexus-navy">Client</h3>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <div className="flex items-center gap-2 text-sm text-nexus-navy/70">
            <UserCheck className="h-4 w-4 text-nexus-cyan" />
            {order.clientName}
          </div>
          <div className="flex items-center gap-2 text-sm text-nexus-navy/70">
            <Mail className="h-4 w-4 text-nexus-cyan" />
            {order.clientEmail}
          </div>
          {order.clientPhone && (
            <div className="flex items-center gap-2 text-sm text-nexus-navy/70">
              <Phone className="h-4 w-4 text-nexus-cyan" />
              {order.clientPhone}
            </div>
          )}
          {order.company && (
            <div className="flex items-center gap-2 text-sm text-nexus-navy/70">
              <Building2 className="h-4 w-4 text-nexus-cyan" />
              {order.company}
            </div>
          )}
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <a
            href={whatsapp(order)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-600"
          >
            <MessageCircle className="h-4 w-4" /> WhatsApp client
          </a>
          <a
            href={mailto(order)}
            className="inline-flex items-center gap-2 rounded-lg border border-nexus-navy/10 bg-white px-4 py-2 text-sm font-semibold text-nexus-navy/70 hover:bg-nexus-navy/5"
          >
            <Mail className="h-4 w-4" /> Email client
          </a>
        </div>
      </div>

      {/* Project brief */}
      <div className="rounded-xl border border-nexus-navy/10 bg-white p-5">
        <h3 className="text-sm font-semibold text-nexus-navy">Project brief</h3>
        {order.desiredTimeline && (
          <p className="mt-3 flex items-center gap-2 text-sm text-nexus-navy/70">
            <Clock className="h-4 w-4 text-nexus-cyan" />
            Desired timeline: {order.desiredTimeline}
          </p>
        )}
        <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-nexus-navy/75">
          {order.description}
        </p>
      </div>

      {/* Quote */}
      <div className="rounded-xl border border-nexus-navy/10 bg-white p-5">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-nexus-navy">Quote</h3>
          {!quoteOpen && !order.quoteAmount && (
            <button
              onClick={() => setQuoteOpen(true)}
              className="inline-flex items-center gap-1 rounded-lg bg-nexus-cyan px-3 py-1.5 text-xs font-semibold text-white hover:bg-nexus-cyan-dark"
            >
              <DollarSign className="h-3.5 w-3.5" /> Send quote
            </button>
          )}
        </div>
        {order.quoteAmount ? (
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <span className="text-2xl font-bold text-nexus-navy">
              {Number(order.quoteAmount).toLocaleString()} {order.quoteCurrency}
            </span>
            {order.quoteDurationWeeks && (
              <span className="text-sm text-nexus-navy/60">
                ~{order.quoteDurationWeeks} week{order.quoteDurationWeeks > 1 ? "s" : ""}
              </span>
            )}
            <button
              onClick={() => {
                setQuoteAmount(String(order.quoteAmount));
                setQuoteCurrency(order.quoteCurrency || "XAF");
                setQuoteDuration(String(order.quoteDurationWeeks || ""));
                setQuoteOpen(true);
              }}
              className="ml-auto text-xs font-semibold text-nexus-cyan hover:underline"
            >
              Edit
            </button>
          </div>
        ) : (
          <p className="mt-3 text-sm text-nexus-navy/50">No quote sent yet.</p>
        )}
        {quoteOpen && (
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div>
              <label className="block text-xs font-medium text-nexus-navy">Amount *</label>
              <input
                type="number"
                min={0}
                value={quoteAmount}
                onChange={(e) => setQuoteAmount(e.target.value)}
                className="mt-1 w-full rounded-lg border border-nexus-navy/10 px-3 py-2 text-sm focus:border-nexus-cyan focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-nexus-navy">Currency</label>
              <select
                value={quoteCurrency}
                onChange={(e) => setQuoteCurrency(e.target.value)}
                className="mt-1 w-full rounded-lg border border-nexus-navy/10 px-3 py-2 text-sm focus:border-nexus-cyan focus:outline-none"
              >
                {CURRENCIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-nexus-navy">Duration (weeks)</label>
              <input
                type="number"
                min={1}
                value={quoteDuration}
                onChange={(e) => setQuoteDuration(e.target.value)}
                className="mt-1 w-full rounded-lg border border-nexus-navy/10 px-3 py-2 text-sm focus:border-nexus-cyan focus:outline-none"
              />
            </div>
            <div className="flex gap-2 sm:col-span-3">
              <button
                onClick={saveQuote}
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-lg bg-nexus-cyan px-4 py-2 text-sm font-semibold text-white hover:bg-nexus-cyan-dark disabled:opacity-50"
              >
                <Send className="h-4 w-4" /> {saving ? "Saving..." : "Send quote"}
              </button>
              <button
                onClick={() => setQuoteOpen(false)}
                className="rounded-lg border border-nexus-navy/10 px-4 py-2 text-sm text-nexus-navy/70 hover:bg-nexus-navy/5"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Milestones */}
      <div className="rounded-xl border border-nexus-navy/10 bg-white p-5">
        <h3 className="text-sm font-semibold text-nexus-navy">Milestones</h3>
        <div className="mt-3 flex gap-2">
          <input
            value={newMilestone}
            onChange={(e) => setNewMilestone(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addMilestone()}
            placeholder="Add a milestone..."
            className="flex-1 rounded-lg border border-nexus-navy/10 px-3 py-2 text-sm focus:border-nexus-cyan focus:outline-none"
          />
          <button
            onClick={addMilestone}
            disabled={saving}
            className="rounded-lg bg-nexus-cyan/10 px-3 py-2 text-nexus-cyan hover:bg-nexus-cyan hover:text-white disabled:opacity-50"
            aria-label="Add milestone"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
        <ul className="mt-4 space-y-2">
          {(order.milestones || []).map((ms) => (
            <li
              key={ms.id}
              className="flex items-center gap-3 rounded-lg border border-nexus-navy/5 bg-nexus-gray-50 px-3 py-2"
            >
              <button
                onClick={() => toggleMilestone(ms)}
                className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                  ms.status === "completed"
                    ? "border-emerald-500 bg-emerald-500 text-white"
                    : "border-nexus-navy/30"
                }`}
                aria-label="Toggle milestone"
              >
                {ms.status === "completed" && <Check className="h-3 w-3" />}
              </button>
              <span
                className={`flex-1 text-sm ${
                  ms.status === "completed"
                    ? "line-through text-nexus-navy/40"
                    : "text-nexus-navy/80"
                }`}
              >
                {ms.title}
              </span>
              <button
                onClick={() => deleteMilestone(ms)}
                disabled={saving}
                className="text-nexus-navy/40 hover:text-red-500 disabled:opacity-50"
                aria-label="Delete milestone"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
          {(order.milestones || []).length === 0 && (
            <li className="text-sm text-nexus-navy/50">No milestones yet.</li>
          )}
        </ul>
      </div>

      {/* Notes */}
      <div className="rounded-xl border border-nexus-navy/10 bg-white p-5">
        <h3 className="text-sm font-semibold text-nexus-navy">Internal notes</h3>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={4}
          placeholder="Private notes for your team..."
          className="mt-3 w-full rounded-lg border border-nexus-navy/10 px-3 py-2 text-sm focus:border-nexus-cyan focus:outline-none"
        />
        <div className="mt-3 flex justify-end">
          <button
            onClick={saveNotes}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-lg bg-nexus-navy px-4 py-2 text-sm font-semibold text-white hover:bg-nexus-navy/80 disabled:opacity-50"
          >
            <FileText className="h-4 w-4" /> {saving ? "Saving..." : "Save notes"}
          </button>
        </div>
      </div>
    </div>
  );
}

function EmptyStateWrapper({ title, description, icon: Icon }: { title: string; description: string; icon: React.ElementType }) {
  return (
    <div className="flex min-h-[300px] flex-col items-center justify-center gap-4 rounded-xl border border-nexus-navy/10 bg-white p-10">
      <div className="rounded-full bg-nexus-navy/5 p-4">
        <Icon className="h-8 w-8 text-nexus-navy/60" />
      </div>
      <div>
        <h3 className="text-lg font-semibold text-nexus-navy">{title}</h3>
        <p className="text-sm text-nexus-navy/60">{description}</p>
      </div>
    </div>
  );
}
