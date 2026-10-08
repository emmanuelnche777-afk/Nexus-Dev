"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  MessageSquare,
  ArrowLeft,
  Search,
  Phone,
  Mail,
  Send,
  MoreVertical,
  Plus,
  Users,
  Archive,
  RotateCcw,
} from "lucide-react";
import LoadingState from "@/components/admin/LoadingState";
import EmptyState from "@/components/admin/EmptyState";
import AdminModal from "@/components/admin/AdminModal";

interface Message {
  id: string;
  content: string;
  sender: string;
  isInternal: boolean;
  createdAt: string;
}

interface Conversation {
  id: string;
  orderId: string | null;
  subject: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string | null;
  company: string | null;
  serviceType: string;
  status: string;
  archivedAt?: string | null;
  lastMessageAt: string;
  createdAt: string;
  messages: Message[];
  _count: {
    messages: number;
  };
}

interface ServiceOrderOption {
  id: string;
  clientName: string;
  clientEmail: string;
  serviceType: string;
  createdAt: string;
  status: string;
}

const STATUS_OPTIONS = [
  { value: "all", label: "All" },
  { value: "open", label: "Open" },
  { value: "active", label: "Active" },
  { value: "closed", label: "Closed" },
];

export default function MessagingPage() {
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [archivedView, setArchivedView] = useState(false);
  const [newOrderId, setNewOrderId] = useState("");
  const [serviceOrders, setServiceOrders] = useState<ServiceOrderOption[]>([]);
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadConversations = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/admin/tech-hub/conversations?status=${filterStatus}&archived=${archivedView}`
      );
      const data = await res.json();
      if (data.conversations) setConversations(data.conversations);
    } catch (err) {
      console.error("Failed to load conversations:", err);
    } finally {
      setLoading(false);
    }
  }, [filterStatus, archivedView]);

  useEffect(() => {
    queueMicrotask(() => void loadConversations());
  }, [loadConversations]);

  useEffect(() => {
    void fetch("/api/admin/service-orders", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => setServiceOrders(Array.isArray(data.orders) ? data.orders : []))
      .catch(() => setServiceOrders([]));
  }, []);

  function startNewConversation() {
    setNewOrderId("");
    setCreating(true);
    setError(null);
  }

  async function createConversation() {
    if (!newOrderId.trim()) {
      setError("Enter a valid order ID to start a conversation");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/admin/tech-hub/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: newOrderId.trim() }),
      });
      const data = await res.json();
      if (res.ok && data.conversation?.id) {
        setCreating(false);
        setNewOrderId("");
        setError(null);
        router.push(`/admin/tech-hub/messaging/${data.conversation.id}`);
      } else if (res.ok) {
        setCreating(false);
        setNewOrderId("");
        void loadConversations();
      } else {
        setError(data.error || "Failed to create conversation");
      }
    } catch (err) {
      console.error("Failed to create conversation:", err);
      setError("Failed to create conversation");
    } finally {
      setSaving(false);
    }
  }

  function openConversation(conversation: Conversation) {
    router.push(`/admin/tech-hub/messaging/${conversation.id}`);
  }

  async function handleArchiveRestore(id: string) {
    const action = archivedView ? "restore" : "archive";
    try {
      const res = await fetch(`/api/admin/tech-hub/conversations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `Failed to ${action} conversation`);
      setError(null);
      await loadConversations();
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to ${action} conversation`);
    }
  }

  function handleWhatsApp(conversation: Conversation) {
    const phone = conversation.clientPhone?.replace(/[^0-9+]/g, "") || "";
    const text = encodeURIComponent(
      `Hi ${conversation.clientName}, this is Nexus Tech Hub. We'd like to follow up on your inquiry regarding ${conversation.serviceType}.`
    );
    window.open(`https://wa.me/${phone}?text=${text}`, "_blank");
  }

  function handleEmail(conversation: Conversation) {
    window.location.href = `mailto:${conversation.clientEmail}?subject=Nexus Tech Hub - ${conversation.serviceType}`;
  }

  const filteredConversations = conversations.filter((c) => {
    const matchesSearch =
      c.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.clientEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.serviceType.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === "all" || c.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

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
          <h1 className="text-2xl font-bold text-nexus-navy">Client Messages</h1>
          <p className="mt-1 text-sm text-nexus-navy/60">
            Archive conversations to hide them from the active list while keeping their messages available to restore later.
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => { setArchivedView((value) => !value); setFilterStatus("all"); }} className="inline-flex items-center gap-2 rounded-lg border border-nexus-navy/10 px-4 py-2 text-sm font-semibold text-nexus-navy">
            {archivedView ? <RotateCcw className="h-4 w-4" /> : <Archive className="h-4 w-4" />}
            {archivedView ? "Active conversations" : "Archived conversations"}
          </button>
          <button onClick={startNewConversation} className="inline-flex items-center gap-2 rounded-lg bg-nexus-cyan px-4 py-2 text-sm font-semibold text-white hover:bg-nexus-cyan-dark">
            <Plus className="h-4 w-4" /> Start Conversation
          </button>
        </div>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-4">
        <div className="sm:col-span-2">
          <div className="flex items-center gap-2 rounded-lg border border-nexus-navy/10 bg-white px-3 py-2">
            <Search className="h-4 w-4 text-nexus-navy/40" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by client, email, or service..."
              className="w-full bg-transparent text-sm focus:outline-none"
            />
          </div>
        </div>
        <div>
          <div className="flex items-center gap-2 rounded-lg border border-nexus-navy/10 bg-white px-3 py-2">
            <Users className="h-4 w-4 text-nexus-navy/40" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full bg-transparent text-sm focus:outline-none"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <LoadingState />
      ) : filteredConversations.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          title={archivedView ? "No archived conversations" : "No conversations yet"}
          description={archivedView ? "Conversations you archive will appear here and can be restored." : "Start a new conversation session with a client to get started."}
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filteredConversations.map((conversation) => (
            <div
              key={conversation.id}
              className="rounded-xl border border-nexus-navy/10 bg-white p-5"
            >
              <div className="flex items-start gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-nexus-cyan/10 text-nexus-cyan">
                    <MessageSquare className="h-5 w-5" />
                  </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-semibold text-nexus-navy truncate">
                        {conversation.clientName}
                      </h3>
                      <p className="text-xs text-nexus-navy/50 truncate">
                        {conversation.serviceType}
                      </p>
                    </div>
                    <MoreVertical className="h-4 w-4 text-nexus-navy/40" />
                  </div>
                  <div className="mt-2 space-y-1 text-sm text-nexus-navy/70">
                    <div className="flex items-center gap-1.5 text-xs">
                      <Mail className="h-3 w-3 text-nexus-navy/40" />
                      <span className="truncate">{conversation.clientEmail}</span>
                    </div>
                    {conversation.clientPhone && (
                      <div className="flex items-center gap-1.5 text-xs">
                        <Phone className="h-3 w-3 text-nexus-navy/40" />
                        <span className="truncate">{conversation.clientPhone}</span>
                      </div>
                    )}
                    <div className="mt-2 flex items-center justify-between">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                          conversation.status === "active"
                            ? "bg-emerald-100 text-emerald-800"
                            : conversation.status === "open"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {conversation.status.charAt(0).toUpperCase() +
                          conversation.status.slice(1)}
                      </span>
                      <span className="text-xs text-nexus-navy/50">
                        {conversation._count.messages} messages
                      </span>
                    </div>
                    <div className="mt-2 text-xs text-nexus-navy/50">
                      Last message: {new Date(conversation.lastMessageAt).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-nexus-navy/10 pt-3">
                <div className="flex gap-1">
                  <button
                    onClick={() => handleWhatsApp(conversation)}
                    className="rounded-md p-1.5 text-green-600 hover:bg-green-50"
                    aria-label="WhatsApp"
                    title="WhatsApp"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleEmail(conversation)}
                    className="rounded-md p-1.5 text-nexus-navy/60 hover:bg-nexus-navy/5"
                    aria-label="Email"
                    title="Email"
                  >
                    <Mail className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => openConversation(conversation)}
                    className="rounded-md px-3 py-1.5 text-xs font-semibold text-nexus-cyan bg-nexus-cyan/10 hover:bg-nexus-cyan/20"
                  >
                    Chat
                  </button>
                </div>
                <button
                  onClick={() => handleArchiveRestore(conversation.id)}
                  className="rounded-md p-1.5 text-nexus-navy/60 hover:bg-amber-50 hover:text-amber-700"
                  aria-label={archivedView ? "Restore conversation" : "Archive conversation"}
                  title={archivedView ? "Restore conversation" : "Archive conversation"}
                >
                  {archivedView ? <RotateCcw className="h-4 w-4" /> : <Archive className="h-4 w-4" />}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {creating && (
        <AdminModal
          open={creating}
          onClose={() => {
            setCreating(false);
            setNewOrderId("");
          }}
          title="Start New Conversation"
        >
          <div className="space-y-4">
            {error && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
                {error}
              </p>
            )}
            <div>
              <label className="block text-sm font-medium text-nexus-navy">
                Choose client order *
              </label>
              <select
                value={newOrderId}
                onChange={(e) => setNewOrderId(e.target.value)}
                className="mt-1 w-full rounded-lg border border-nexus-navy/10 px-3 py-2 text-sm focus:border-nexus-cyan focus:outline-none"
              >
                <option value="">Select an order</option>
                {serviceOrders.map((order) => (
                  <option key={order.id} value={order.id}>
                    {order.clientName} · {order.serviceType} · {order.clientEmail} · {new Date(order.createdAt).toLocaleDateString()}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-nexus-navy/50">
                Choose the order you want this conversation attached to. If it already has an open conversation, you will be taken to that conversation.
              </p>
              {serviceOrders.length === 0 && <p className="mt-2 text-xs text-amber-700">There are no service orders available. Create or open an order first.</p>}
            </div>
            <div className="flex gap-3 pt-4">
              <button
                onClick={createConversation}
                disabled={saving}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-nexus-cyan px-4 py-2 text-sm font-semibold text-white hover:bg-nexus-cyan-dark disabled:opacity-50"
              >
                <MessageSquare className="h-4 w-4" />
                {saving ? "Creating..." : "Start Conversation"}
              </button>
              <button
                onClick={() => {
                  setCreating(false);
                  setNewOrderId("");
                }}
                className="inline-flex items-center justify-center rounded-lg border border-nexus-navy/10 px-4 py-2 text-sm font-semibold text-nexus-navy hover:bg-nexus-navy/5"
              >
                Cancel
              </button>
            </div>
          </div>
        </AdminModal>
      )}
    </div>
  );
}
