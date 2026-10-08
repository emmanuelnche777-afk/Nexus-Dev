"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Search,
  ClipboardList,
  Inbox,
  Timer,
  TrendingUp,
  BadgeCheck,
  CircleDollarSign,
  Trash2,
  X,
  UserCheck,
  Mail,
  Phone,
  Building2,
  MessageCircle,
  Clock,
  DollarSign,
  Send,
  Plus,
  Check,
  FileText,
} from "lucide-react";
import LoadingState from "@/components/admin/LoadingState";
import EmptyState from "@/components/admin/EmptyState";


interface Milestone {
  id: string;
  title: string;
  description?: string;
  status: string;
  dueDate?: string | null;
  completedAt?: string | null;
}

interface ServiceOrder {
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
  assignedToId?: string | null;
  assignee?: { id: string; name: string; email: string } | null;
  notes?: string;
  milestones: Milestone[];
  createdAt: string;
  updatedAt: string;
}

const STATUS_META: Record<string, { label: string; classes: string }> = {
  new: { label: "New", classes: "bg-blue-100 text-blue-700" },
  quoted: { label: "Quoted", classes: "bg-amber-100 text-amber-700" },
  in_progress: { label: "In Progress", classes: "bg-cyan-100 text-cyan-700" },
  completed: { label: "Completed", classes: "bg-emerald-100 text-emerald-700" },
  cancelled: { label: "Cancelled", classes: "bg-gray-100 text-gray-500" },
};

const PRIORITY_META: Record<string, { label: string; classes: string }> = {
  high: { label: "High", classes: "bg-red-100 text-red-700" },
  medium: { label: "Medium", classes: "bg-amber-100 text-amber-700" },
  low: { label: "Low", classes: "bg-gray-100 text-gray-500" },
};

const CURRENCIES = ["XAF", "USD", "EUR", "GBP"];

export default function AdminServiceOrdersPage() {
  const [orders, setOrders] = useState<ServiceOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [selected, setSelected] = useState<ServiceOrder | null>(null);
  const [notes, setNotes] = useState("");
  const [newMilestone, setNewMilestone] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedMessage, setSavedMessage] = useState("");
  const [assignedToDraft, setAssignedToDraft] = useState("");
  const [staffOptions, setStaffOptions] = useState<Array<{ id: string; name: string; email: string }>>([]);
  const router = useRouter();

  // Quote form state
  const [quoteOpen, setQuoteOpen] = useState(false);
  const [quoteAmount, setQuoteAmount] = useState("");
  const [quoteCurrency, setQuoteCurrency] = useState("XAF");
  const [quoteDuration, setQuoteDuration] = useState("");

  useEffect(() => {
    load();
    fetch("/api/admin/tech-hub/assignees", { cache: "no-store" }).then((res) => res.json()).then((data) => setStaffOptions(Array.isArray(data.staff) ? data.staff : [])).catch(() => {});
  }, []);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/service-orders", { cache: "no-store" });
      const data = await res.json();
      setOrders(Array.isArray(data.orders) ? data.orders : []);
    } catch {
      setError("Failed to load orders");
    } finally {
      setLoading(false);
    }
  }

  const stats = useMemo(() => {
    const revenue = orders.reduce((sum, o) => {
      const amt = Number(o.quoteAmount || 0);
      return o.status === "completed" || o.status === "in_progress" ? sum + amt : sum;
    }, 0);
    return {
      total: orders.length,
      newCount: orders.filter((o) => o.status === "new").length,
      quoted: orders.filter((o) => o.status === "quoted").length,
      inProgress: orders.filter((o) => o.status === "in_progress").length,
      completed: orders.filter((o) => o.status === "completed").length,
      revenue,
    };
  }, [orders]);

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return orders.filter((o) => {
      if (statusFilter !== "all" && o.status !== statusFilter) return false;
      if (priorityFilter !== "all" && o.priority !== priorityFilter) return false;
      if (!q) return true;
      return (
        o.clientName.toLowerCase().includes(q) ||
        o.clientEmail.toLowerCase().includes(q) ||
        (o.serviceType || "").toLowerCase().includes(q) ||
        (o.company || "").toLowerCase().includes(q) ||
        o.id.toLowerCase().includes(q)
      );
    });
  }, [orders, searchQuery, statusFilter, priorityFilter]);

  async function updateOrder(id: string, patch: Partial<ServiceOrder>) {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/service-orders/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Update failed");
        return false;
      }
      setOrders((prev) => prev.map((o) => (o.id === id ? data : o)));
      setSelected((prev) => (prev?.id === id ? data : prev));
      return true;
    } catch {
      setError("Update failed");
      return false;
    } finally {
      setSaving(false);
    }
  }

  function openDetail(order: ServiceOrder) {
    setSelected(order);
    setNotes(order.notes || "");
    setAssignedToDraft(order.assignedToId || "");
    setQuoteOpen(false);
    setError(null);
    setSavedMessage("");
  }

  async function saveNotes() {
    if (!selected) return;
    if (await updateOrder(selected.id, { notes })) setSavedMessage("Internal note saved on this order.");
  }

  async function saveAssignee() {
    if (!selected) return;
    if (await updateOrder(selected.id, { assignedToId: assignedToDraft || null })) setSavedMessage("Assignment saved on this order.");
  }

  async function startConversation() {
    if (!selected) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/tech-hub/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: selected.id }),
      });
      const data = await res.json();
      if (!res.ok || !data.conversation?.id) throw new Error(data.error || "Could not start conversation");
      router.push(`/admin/tech-hub/messaging/${data.conversation.id}`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not start conversation");
    } finally {
      setSaving(false);
    }
  }

  async function saveQuote() {
    if (!selected) return;
    const amount = Number(quoteAmount);
    if (!quoteAmount || !Number.isFinite(amount) || amount <= 0) {
      setError("Enter a valid quote amount");
      return;
    }
    await updateOrder(selected.id, {
      quoteAmount: amount,
      quoteCurrency,
      quoteDurationWeeks: quoteDuration ? Number(quoteDuration) : null,
      status: "quoted",
    });
    setQuoteOpen(false);
  }

  async function addMilestone() {
    if (!selected || !newMilestone.trim()) return;
    const res = await fetch(`/api/admin/service-orders/${selected.id}/milestones`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newMilestone.trim(), status: "pending" }),
    });
    if (res.ok) {
      const data = await res.json();
      setSelected({ ...selected, milestones: [...(selected.milestones || []), data] });
      setNewMilestone("");
      setSavedMessage("Milestone added to this order.");
      await load();
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Failed to add milestone");
    }
  }

  async function toggleMilestone(milestone: Milestone) {
    if (!selected) return;
    const nextStatus = milestone.status === "completed" ? "pending" : "completed";
    await fetch(`/api/admin/service-orders/${selected.id}/milestones/${milestone.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: nextStatus }),
    });
    const updated = await fetch(`/api/admin/service-orders/${selected.id}`).then((r) => r.json());
    setSelected(updated);
    await load();
  }

  async function deleteMilestone(milestone: Milestone) {
    if (!selected) return;
    await fetch(`/api/admin/service-orders/${selected.id}/milestones/${milestone.id}`, {
      method: "DELETE",
    });
    const updated = await fetch(`/api/admin/service-orders/${selected.id}`).then((r) => r.json());
    setSelected(updated);
    await load();
  }

  async function deleteOrder(id: string) {
    if (!confirm("Delete this order? This cannot be undone.")) return;
    const res = await fetch(`/api/admin/service-orders/${id}`, { method: "DELETE" });
    if (res.ok) {
      setOrders((prev) => prev.filter((o) => o.id !== id));
      setSelected(null);
    }
  }

  const whatsapp = (order: ServiceOrder) =>
    order.clientPhone
      ? `https://wa.me/${order.clientPhone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
          `Hi ${order.clientName}, thank you for contacting NEXUS about "${order.serviceType}".`
        )}`
      : `https://wa.me/?text=${encodeURIComponent(`NEXUS: reply to ${order.clientName} (${order.clientEmail})`)}`;

  const mailto = (order: ServiceOrder) =>
    `mailto:${order.clientEmail}?subject=${encodeURIComponent(
      `Re: Your NEXUS request — ${order.serviceType}`
    )}&body=${encodeURIComponent(
      `Hi ${order.clientName},\n\nThank you for contacting NEXUS. We're on it and will get back to you shortly.\n\nBest regards,\nNEXUS Tech Hub`
    )}`;

  const statCards = [
    { label: "Total Orders", value: stats.total, icon: ClipboardList, color: "text-nexus-cyan" },
    { label: "New", value: stats.newCount, icon: Inbox, color: "text-blue-500" },
    { label: "Awaiting Quote", value: stats.quoted, icon: Timer, color: "text-amber-500" },
    { label: "In Progress", value: stats.inProgress, icon: TrendingUp, color: "text-cyan-500" },
    { label: "Completed", value: stats.completed, icon: BadgeCheck, color: "text-emerald-500" },
    { label: "Revenue", value: stats.revenue.toLocaleString(), icon: CircleDollarSign, color: "text-emerald-600" },
  ];

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Link
            href="/admin/tech-hub"
            className="mb-2 inline-flex items-center gap-1 text-sm text-nexus-navy/60 hover:text-nexus-cyan"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
          <h1 className="text-2xl font-bold text-nexus-navy">Service Orders</h1>
          <p className="mt-1 text-sm text-nexus-navy/60">
            Review client requests, send quotes, and track delivery.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
        {statCards.map((card) => (
          <div key={card.label} className="rounded-xl border border-nexus-navy/10 bg-white p-4">
            <card.icon className={`h-5 w-5 ${card.color}`} />
            <div className="mt-2 text-2xl font-bold text-nexus-navy">{card.value}</div>
            <div className="text-xs text-nexus-navy/60">{card.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col gap-3 rounded-xl border border-nexus-navy/10 bg-white p-4 lg:flex-row lg:items-center">
        <div className="flex flex-1 items-center gap-2 rounded-lg border border-nexus-navy/10 px-3 py-2">
          <Search className="h-4 w-4 text-nexus-navy/40" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by client, email, service..."
            className="w-full bg-transparent text-sm focus:outline-none"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-nexus-navy/10 px-3 py-2 text-sm focus:border-nexus-cyan focus:outline-none"
        >
          <option value="all">All statuses</option>
          {Object.entries(STATUS_META).map(([value, meta]) => (
            <option key={value} value={value}>{meta.label}</option>
          ))}
        </select>
        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="rounded-lg border border-nexus-navy/10 px-3 py-2 text-sm focus:border-nexus-cyan focus:outline-none"
        >
          <option value="all">All priorities</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>

      {error && (
        <p className="mb-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600">{error}</p>
      )}

      {loading ? (
        <LoadingState />
      ) : orders.length === 0 ? (
        <EmptyState
          title="No service orders yet"
          description="New client requests will appear here."
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-nexus-navy/10 bg-white">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-nexus-navy/10 text-xs uppercase tracking-wide text-nexus-navy/50">
                <th className="px-4 py-3">Client</th>
                <th className="px-4 py-3">Service</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Priority</th>
                <th className="px-4 py-3">Quote</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((order) => (
                <tr
                  key={order.id}
                  className="border-b border-nexus-navy/5 last:border-0 hover:bg-nexus-white"
                >
                  <td className="px-4 py-3">
                    <div className="font-medium text-nexus-navy">{order.clientName}</div>
                    <div className="text-xs text-nexus-navy/50">{order.clientEmail}</div>
                  </td>
                  <td className="px-4 py-3 text-nexus-navy/80">{order.serviceType}</td>
                  <td className="px-4 py-3 text-xs text-nexus-navy/60">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                        PRIORITY_META[order.priority]?.classes || PRIORITY_META.medium.classes
                      }`}
                    >
                      {PRIORITY_META[order.priority]?.label || "Medium"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-nexus-navy/70">
                    {order.quoteAmount
                      ? `${Number(order.quoteAmount).toLocaleString()} ${order.quoteCurrency}`
                      : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                        STATUS_META[order.status]?.classes || STATUS_META.new.classes
                      }`}
                    >
                      {STATUS_META[order.status]?.label || order.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => openDetail(order)}
                        className="rounded-md bg-nexus-cyan/10 px-3 py-1.5 text-xs font-semibold text-nexus-cyan hover:bg-nexus-cyan hover:text-white"
                      >
                        View
                      </button>
                      <button
                        onClick={() => deleteOrder(order.id)}
                        className="rounded-md p-1.5 text-nexus-navy/50 hover:bg-red-50 hover:text-red-500"
                        aria-label="Delete order"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Detail drawer */}
      {selected && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40" onClick={() => setSelected(null)}>
          <div
            className="h-full w-full max-w-2xl overflow-y-auto bg-nexus-gray-50 p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-6 flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold text-nexus-navy">{selected.serviceType}</h2>
                <p className="text-xs text-nexus-navy/50">Order {selected.id}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setSelected(null)}
                  className="rounded-lg p-2 text-nexus-navy/60 hover:bg-nexus-navy/5"
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Status workflow */}
            <div className="mb-6 flex items-center gap-2">
              <select
                value={selected.status}
                onChange={(e) => updateOrder(selected.id, { status: e.target.value })}
                disabled={saving}
                className="rounded-lg border border-nexus-navy/10 bg-white px-3 py-2 text-sm font-medium"
              >
                {Object.entries(STATUS_META).map(([value, meta]) => (
                  <option key={value} value={value}>{meta.label}</option>
                ))}
              </select>
              <span
                className={`rounded-full px-2 py-1 text-xs font-semibold ${
                  STATUS_META[selected.status]?.classes || ""
                }`}
              >
                {STATUS_META[selected.status]?.label || selected.status}
              </span>
              <div className="ml-auto flex items-center gap-2">
                <select
                  value={selected.priority}
                  onChange={(e) => updateOrder(selected.id, { priority: e.target.value })}
                  className="rounded-lg border border-nexus-navy/10 bg-white px-3 py-2 text-sm"
                >
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
                <select
                  value={assignedToDraft}
                  onChange={(e) => setAssignedToDraft(e.target.value)}
                  className="rounded-lg border border-nexus-navy/10 bg-white px-3 py-2 text-sm"
                >
                  <option value="">Unassigned</option>
                  {staffOptions.map((staff) => <option key={staff.id} value={staff.id}>{staff.name} · {staff.email}</option>)}
                </select>
                <button onClick={saveAssignee} disabled={saving} className="rounded-lg border border-nexus-navy/10 bg-white px-3 py-2 text-sm font-medium disabled:opacity-50">Save assignment</button>
              </div>
            </div>
            {selected.assignedTo && !selected.assignedToId && <p className="-mt-4 mb-5 text-xs text-amber-700">Existing text assignment: “{selected.assignedTo}”. Choose an active staff member to replace it, or leave Unassigned and save to clear it.</p>}

            {/* Client card */}
            <div className="mb-6 rounded-xl border border-nexus-navy/10 bg-white p-5">
              <h3 className="text-sm font-semibold text-nexus-navy">Client</h3>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                <div className="flex items-center gap-2 text-sm text-nexus-navy/70">
                  <UserCheck className="h-4 w-4 text-nexus-cyan" />
                  {selected.clientName}
                </div>
                <div className="flex items-center gap-2 text-sm text-nexus-navy/70">
                  <Mail className="h-4 w-4 text-nexus-cyan" />
                  {selected.clientEmail}
                </div>
                {selected.clientPhone && (
                  <div className="flex items-center gap-2 text-sm text-nexus-navy/70">
                    <Phone className="h-4 w-4 text-nexus-cyan" />
                    {selected.clientPhone}
                  </div>
                )}
                {selected.company && (
                  <div className="flex items-center gap-2 text-sm text-nexus-navy/70">
                    <Building2 className="h-4 w-4 text-nexus-cyan" />
                    {selected.company}
                  </div>
                )}
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <button onClick={startConversation} disabled={saving} className="inline-flex items-center gap-2 rounded-lg bg-nexus-cyan px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
                  <MessageCircle className="h-4 w-4" /> Start / open conversation
                </button>
                <a
                  href={whatsapp(selected)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-600"
                >
                  <MessageCircle className="h-4 w-4" /> WhatsApp client
                </a>
                <a
                  href={mailto(selected)}
                  className="inline-flex items-center gap-2 rounded-lg border border-nexus-navy/10 bg-white px-4 py-2 text-sm font-semibold text-nexus-navy/70 hover:bg-nexus-navy/5"
                >
                  <Mail className="h-4 w-4" /> Email client
                </a>
              </div>
            </div>

            {/* Project brief */}
            <div className="mb-6 rounded-xl border border-nexus-navy/10 bg-white p-5">
              <h3 className="text-sm font-semibold text-nexus-navy">Project brief</h3>
              {selected.desiredTimeline && (
                <p className="mt-3 flex items-center gap-2 text-sm text-nexus-navy/70">
                  <Clock className="h-4 w-4 text-nexus-cyan" />
                  Desired timeline: {selected.desiredTimeline}
                </p>
              )}
              <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-nexus-navy/75">
                {selected.description}
              </p>
            </div>

            {/* Quote */}
            <div className="mb-6 rounded-xl border border-nexus-navy/10 bg-white p-5">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-nexus-navy">Quote</h3>
                {!quoteOpen && !selected.quoteAmount && (
                  <button
                    onClick={() => setQuoteOpen(true)}
                    className="inline-flex items-center gap-1 rounded-lg bg-nexus-cyan px-3 py-1.5 text-xs font-semibold text-white hover:bg-nexus-cyan-dark"
                  >
                    <DollarSign className="h-3.5 w-3.5" /> Send quote
                  </button>
                )}
              </div>
              {selected.quoteAmount ? (
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <span className="text-2xl font-bold text-nexus-navy">
                    {Number(selected.quoteAmount).toLocaleString()} {selected.quoteCurrency}
                  </span>
                  {selected.quoteDurationWeeks && (
                    <span className="text-sm text-nexus-navy/60">
                      ~{selected.quoteDurationWeeks} week{selected.quoteDurationWeeks > 1 ? "s" : ""}
                    </span>
                  )}
                  <button
                    onClick={() => {
                      setQuoteAmount(String(selected.quoteAmount));
                      setQuoteCurrency(selected.quoteCurrency || "XAF");
                      setQuoteDuration(String(selected.quoteDurationWeeks || ""));
                      setQuoteOpen(true);
                    }}
                    className="ml-auto text-xs font-semibold text-nexus-cyan hover:underline"
                  >
                    Edit
                  </button>
                  <p className="w-full text-xs text-nexus-navy/50">
                    The client was emailed this quote automatically.
                  </p>
                </div>
              ) : (
                <p className="mt-3 text-sm text-nexus-navy/50">
                  {quoteOpen
                    ? "Set the estimated cost and duration. The client will be emailed automatically."
                    : "No quote sent yet."}
                </p>
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
            <div className="mb-6 rounded-xl border border-nexus-navy/10 bg-white p-5">
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
                  className="rounded-lg bg-nexus-cyan/10 px-3 py-2 text-nexus-cyan hover:bg-nexus-cyan hover:text-white"
                  aria-label="Add milestone"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <ul className="mt-4 space-y-2">
                {(selected.milestones || []).map((ms) => (
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
                      className="text-nexus-navy/40 hover:text-red-500"
                      aria-label="Delete milestone"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </li>
                ))}
                {(selected.milestones || []).length === 0 && (
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
              {savedMessage && <p role="status" className="mt-3 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800">{savedMessage}</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
