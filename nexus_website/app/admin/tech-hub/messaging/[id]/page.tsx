"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Send, Phone, Mail, X, Archive, RotateCcw } from "lucide-react";
import LoadingState from "@/components/admin/LoadingState";
import EmptyState from "@/components/admin/EmptyState";

interface Message {
  id: string;
  content: string;
  sender: string;
  senderName: string;
  isInternal: boolean;
  channel: string | null;
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
}

export default function ConversationDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [isInternalNote, setIsInternalNote] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  async function sendMessage() {
    if (!newMessage.trim() || conversation?.archivedAt) return;
    setSending(true);
    try {
      const res = await fetch(`/api/admin/tech-hub/conversations/${conversation?.id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: newMessage,
          sender: isInternalNote ? "admin" : "admin",
          isInternal: isInternalNote,
          channel: "chat-session",
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessages((prev) => [...prev, data.message]);
        setNewMessage("");
        setIsInternalNote(false);
        setError(null);
      } else {
        setError(data.error || "Failed to send message");
      }
    } catch (err) {
      console.error("Failed to send message:", err);
      setError("Failed to send message");
    } finally {
      setSending(false);
    }
  }

  async function updateArchiveState() {
    if (!conversation) return;
    const action = conversation.archivedAt ? "restore" : "archive";
    try {
      const res = await fetch(`/api/admin/tech-hub/conversations/${conversation.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `Failed to ${action} conversation`);
      setConversation({ ...conversation, archivedAt: data.archivedAt });
      setError(null);
      if (action === "archive") router.push("/admin/tech-hub/messaging");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : `Failed to ${action} conversation`);
    }
  }

  function handleWhatsApp() {
    const phone = conversation?.clientPhone?.replace(/[^0-9+]/g, "") || "";
    const text = encodeURIComponent(`Hi ${conversation?.clientName}, this is Nexus Tech Hub.`);
    window.open(`https://wa.me/${phone}?text=${text}`, "_blank");
  }

  function handleEmail() {
    window.location.href = `mailto:${conversation?.clientEmail}?subject=Nexus Tech Hub - ${conversation?.serviceType}`;
  }

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/admin/tech-hub/conversations/${id}/messages`);
        const data = await res.json();
        if (data.conversation) {
          setConversation(data.conversation);
          setMessages(data.conversation.messages || []);
        } else {
          setError("Conversation not found");
        }
      } catch (err) {
        console.error("Failed to load conversation:", err);
        setError("Failed to load conversation");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const clientName = conversation?.clientName || "Client";
  const serviceType = conversation?.serviceType || "Inquiry";

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="mb-4">
          <Link
            href="/admin/tech-hub/messaging"
            className="inline-flex items-center gap-1 text-sm text-nexus-navy/60 hover:text-nexus-cyan"
          >
            <ArrowLeft className="h-4 w-4" /> Back to conversations
          </Link>
        </div>
        <EmptyState icon={X} title={error} description="The conversation could not be loaded." />
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-2rem)] flex-col">
      <div className="border-b border-nexus-navy/10 bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <Link
              href="/admin/tech-hub/messaging"
              className="mb-2 inline-flex items-center gap-1 text-sm text-nexus-navy/60 hover:text-nexus-cyan"
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </Link>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-nexus-navy">
                {clientName}
              </h1>
            </div>
            <p className="text-sm text-nexus-navy/60">{serviceType}</p>
          </div>
          <div className="flex gap-2">
            <button onClick={updateArchiveState} className="inline-flex items-center gap-2 rounded-md border border-nexus-navy/10 px-3 py-2 text-sm font-medium text-nexus-navy hover:bg-nexus-navy/5">
              {conversation?.archivedAt ? <RotateCcw className="h-4 w-4" /> : <Archive className="h-4 w-4" />}
              {conversation?.archivedAt ? "Restore" : "Archive"}
            </button>
            <button
              onClick={handleWhatsApp}
              className="rounded-md p-2 text-green-600 hover:bg-green-50"
              aria-label="WhatsApp"
              title="WhatsApp"
            >
              <Phone className="h-5 w-5" />
            </button>
            <button
              onClick={handleEmail}
              className="rounded-md p-2 text-nexus-navy/60 hover:bg-nexus-navy/5"
              aria-label="Email"
              title="Email"
            >
              <Mail className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-gray-50 p-6">
        {conversation?.archivedAt && <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">This conversation is archived and read-only. Restore it to continue the conversation.</div>}
        {messages.length === 0 ? (
          <EmptyState
            icon={X}
            title="No messages yet"
            description="Start the conversation by sending a message below."
          />
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === "admin" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[70%] rounded-lg px-4 py-3 text-sm ${
                    message.isInternal
                      ? "bg-yellow-50 text-yellow-900 border border-yellow-200"
                      : message.sender === "admin"
                      ? "bg-nexus-cyan text-white"
                      : "bg-white border border-nexus-navy/10"
                  }`}
                >
                  {message.isInternal && (
                    <span className="mb-1 block text-xs text-yellow-600">Internal note</span>
                  )}
                  <p>{message.content}</p>
                  <span className={`mt-1 block text-[10px] ${
                    message.sender === "admin" ? "text-cyan-100" : "text-nexus-navy/50"
                  }`}>
                    {new Date(message.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <div className="border-t border-nexus-navy/10 bg-white px-6 py-4">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={newMessage}
            disabled={!!conversation?.archivedAt}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            placeholder="Type a message..."
            className="flex-1 rounded-lg border border-nexus-navy/10 px-4 py-2 text-sm focus:border-nexus-cyan focus:outline-none"
          />
          <button
            onClick={sendMessage}
            disabled={sending || !newMessage.trim() || !!conversation?.archivedAt}
            className="inline-flex items-center gap-2 rounded-lg bg-nexus-cyan px-4 py-2 text-sm font-semibold text-white hover:bg-nexus-cyan-dark disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
            {sending ? "Sending..." : "Send"}
          </button>
        </div>
        <div className="mt-2 flex items-center gap-2">
          <label className="flex items-center gap-2 text-xs text-nexus-navy/60">
            <input
              type="checkbox"
              checked={isInternalNote}
              onChange={(e) => setIsInternalNote(e.target.checked)}
              className="rounded border-nexus-navy/20"
            />
            Internal note (private)
          </label>
          <a
            href={`mailto:${conversation?.clientEmail}`}
            className="text-xs text-nexus-navy/60 underline hover:text-nexus-cyan"
          >
            Email client: {conversation?.clientEmail || "unknown"}
          </a>
        </div>
      </div>
    </div>
  );
}
