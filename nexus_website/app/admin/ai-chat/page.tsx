"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Search, Sparkles, Trash2, User, Bot, Image as ImageIcon, Calendar, MessageSquare } from "lucide-react";
import LoadingState from "@/components/admin/LoadingState";
import EmptyState from "@/components/admin/EmptyState";

interface ChatMsg {
  id: string;
  role: "user" | "assistant";
  text: string;
  timestamp: string;
  hasImage?: boolean;
}

interface Conversation {
  id: string;
  language: string;
  startedAt: string;
  lastMessageAt: string;
  messageCount: number;
  messages: ChatMsg[];
}

export default function AiChatPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [stats, setStats] = useState({ total: 0, totalMessages: 0, withImages: 0 });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selected, setSelected] = useState<Conversation | null>(null);

  async function loadConversations() {
    try {
      const res = await fetch("/api/admin/ai-chat");
      const data = await res.json();
      setConversations(data.conversations || []);
      setStats(
        data.stats || { total: 0, totalMessages: 0, withImages: 0 }
      );
    } catch (error) {
      console.error("Failed to load AI chats:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    queueMicrotask(() => void loadConversations());
  }, []);

  async function handleDelete(id: string) {
    if (!confirm("Delete this AI conversation?")) return;
    try {
      await fetch("/api/admin/ai-chat", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      setConversations((prev) => prev.filter((c) => c.id !== id));
      if (selected?.id === id) setSelected(null);
    } catch (err) {
      console.error("Failed to delete:", err);
    }
  }

  const filtered = conversations.filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return c.messages.some((m) => m.text.toLowerCase().includes(q));
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/dashboard"
          className="rounded-md p-2 text-nexus-navy hover:bg-nexus-navy/5"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-nexus-navy">AI Chat Logs</h1>
          <p className="mt-1 text-sm text-nexus-navy/70">
            Review conversations between visitors and the NEXUS AI assistant
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-nexus-navy/10 bg-white p-4">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-nexus-navy/60">
            <MessageSquare className="h-4 w-4" /> Sessions
          </div>
          <p className="mt-2 text-2xl font-bold text-nexus-navy">{stats.total}</p>
        </div>
        <div className="rounded-xl border border-nexus-navy/10 bg-white p-4">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-nexus-navy/60">
            <Sparkles className="h-4 w-4" /> Messages
          </div>
          <p className="mt-2 text-2xl font-bold text-nexus-navy">{stats.totalMessages}</p>
        </div>
        <div className="rounded-xl border border-nexus-navy/10 bg-white p-4">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-nexus-navy/60">
            <ImageIcon className="h-4 w-4" /> With Images
          </div>
          <p className="mt-2 text-2xl font-bold text-nexus-navy">{stats.withImages}</p>
        </div>
      </div>

      <div className="flex h-[calc(100vh-22rem)] gap-6">
        <div className="w-96 flex-shrink-0 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-nexus-navy/40" />
            <input
              type="text"
              placeholder="Search message text..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-nexus-navy/10 bg-white py-2.5 pl-10 pr-4 text-sm text-nexus-navy placeholder:text-nexus-navy/40 focus:border-nexus-cyan focus:outline-none"
            />
          </div>

          <div className="max-h-full space-y-2 overflow-y-auto pr-1">
            {loading ? (
              <LoadingState label="Loading conversations..." size="sm" />
            ) : filtered.length === 0 ? (
              <EmptyState
                icon={MessageSquare}
                title="No conversations yet"
                description="AI chats from visitors will appear here once they start using the assistant."
              />
            ) : (
              filtered.map((conv) => {
                const lastUser = [...conv.messages]
                  .reverse()
                  .find((m) => m.role === "user");
                const preview = lastUser?.text || conv.messages[0]?.text || "";
                return (
                  <button
                    key={conv.id}
                    onClick={() => setSelected(conv)}
                    className={`w-full rounded-lg border p-3 text-left transition ${
                      selected?.id === conv.id
                        ? "border-nexus-cyan bg-nexus-cyan/5"
                        : "border-nexus-navy/10 bg-white hover:border-nexus-cyan/30"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Bot className="h-3.5 w-3.5 text-nexus-cyan" />
                        <span className="text-xs font-semibold uppercase text-nexus-navy/60">
                          {conv.language}
                        </span>
                      </div>
                      <span className="text-xs text-nexus-navy/50">
                        {conv.messageCount} msg
                      </span>
                    </div>
                    <p className="mt-1.5 line-clamp-2 text-sm text-nexus-navy">
                      {preview}
                    </p>
                    <p className="mt-1 text-xs text-nexus-navy/50">
                      {new Date(conv.lastMessageAt).toLocaleString()}
                    </p>
                  </button>
                );
              })
            )}
          </div>
        </div>

        <div className="flex flex-1 flex-col rounded-xl border border-nexus-navy/10 bg-white">
          {selected ? (
            <>
              <div className="flex items-center justify-between border-b border-nexus-navy/10 p-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Bot className="h-4 w-4 text-nexus-cyan" />
                    <h3 className="font-medium text-nexus-navy">
                      AI Conversation
                    </h3>
                    <span className="rounded-full bg-nexus-cyan/10 px-2 py-0.5 text-xs font-medium text-nexus-cyan">
                      {selected.language}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-nexus-navy/60">
                    <Calendar className="inline h-3 w-3" />{" "}
                    {new Date(selected.startedAt).toLocaleString()} ·{" "}
                    {selected.messageCount} messages
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(selected.id)}
                  className="rounded-md p-2 text-red-600 hover:bg-red-50"
                  title="Delete conversation"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <div className="flex-1 space-y-4 overflow-y-auto p-4">
                {selected.messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${
                      msg.role === "assistant" ? "justify-start" : "justify-end"
                    }`}
                  >
                    <div
                      className={`flex max-w-[80%] gap-2 ${
                        msg.role === "user" ? "flex-row-reverse" : "flex-row"
                      }`}
                    >
                      <div
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                          msg.role === "assistant"
                            ? "bg-nexus-cyan text-white"
                            : "bg-nexus-navy text-white"
                        }`}
                      >
                        {msg.role === "assistant" ? (
                          <Bot className="h-4 w-4" />
                        ) : (
                          <User className="h-4 w-4" />
                        )}
                      </div>
                      <div
                        className={`rounded-lg px-4 py-2 ${
                          msg.role === "assistant"
                            ? "bg-nexus-gray text-nexus-navy"
                            : "bg-nexus-navy text-white"
                        }`}
                      >
                        {msg.hasImage && (
                          <p className="mb-1 flex items-center gap-1 text-xs opacity-70">
                            <ImageIcon className="h-3 w-3" /> Image attached
                          </p>
                        )}
                        <p className="whitespace-pre-wrap text-sm">{msg.text}</p>
                        <p
                          className={`mt-1 text-xs ${
                            msg.role === "assistant"
                              ? "text-nexus-navy/50"
                              : "text-white/60"
                          }`}
                        >
                          {new Date(msg.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <EmptyState
              icon={Sparkles}
              title="Select a conversation to view"
              description="Choose a session on the left to read the full message history."
            />
          )}
        </div>
      </div>
    </div>
  );
}
