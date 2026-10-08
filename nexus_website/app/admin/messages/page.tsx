"use client";

import { Suspense, useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { MessageCircle, Send, Search, AlertCircle, RefreshCw, ArrowLeft } from "lucide-react";
import Card from "@/components/admin/ui/card";
import Badge from "@/components/admin/ui/badge";
import Avatar from "@/components/admin/ui/avatar";
import Button from "@/components/admin/ui/button";
import { Skeleton } from "@/components/admin/ui/skeleton";
import EmptyState from "@/components/admin/EmptyState";

interface Thread {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  lastMessage: string | null;
  lastMessageAt: string | null;
  unreadCount: number;
}

interface ThreadMessage {
  id: string;
  body: string;
  readAt: string | null;
  createdAt: string;
  isOwn: boolean;
}

interface UserSession {
  id: string;
  email: string;
  name: string;
  role: string;
}

function MessagesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const threadId = searchParams.get("with") || undefined;
  const [session, setSession] = useState<UserSession | null>(null);
  const [threads, setThreads] = useState<Thread[]>([]);
  const [selectedThread, setSelectedThread] = useState<Thread | null>(null);
  const [messages, setMessages] = useState<ThreadMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
   const [error, setError] = useState("");
   const messagesEndRef = useRef<HTMLDivElement>(null);
   const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    void fetch("/api/admin/session", { cache: "no-store" })
      .then((res) => {
        if (!res.ok) throw new Error("Session check failed");
        return res.json();
      })
      .then((data) => {
        if (data.authenticated) {
          setSession(data.user as UserSession);
        } else {
          router.push("/admin/login");
        }
      })
      .catch(() => {
        router.push("/admin/login");
      });
  }, [router]);

  useEffect(() => {
    if (!session) return;
    void fetch("/api/admin/messages", { cache: "no-store" })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load threads");
        return res.json();
      })
      .then((data) => {
        setLoading(false);
        const threadList: Thread[] = data.threads || [];
        setThreads(threadList);
        if (threadId) {
          const selected = threadList.find((t) => t.id === threadId);
          if (selected) setSelectedThread(selected);
        }
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Failed to load threads");
        setLoading(false);
      });
  }, [session, threadId]);

  useEffect(() => {
    if (!session || !threadId) return;
    void fetch(`/api/admin/messages?with=${threadId}`, { cache: "no-store" })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load messages");
        return res.json();
      })
      .then((data) => setMessages(data.messages || []))
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load messages"));
  }, [session, threadId]);

  useEffect(() => {
    messagesEndRef.current?.scrollTo({ top: messagesEndRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  async function fetchThreads() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/messages", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to load threads");
      const data = await res.json();
      const threadList: Thread[] = data.threads || [];
      setThreads(threadList);

      if (threadId) {
        const selected = threadList.find((t) => t.id === threadId);
        if (selected) setSelectedThread(selected);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load conversations");
    } finally {
      setLoading(false);
    }
  }

  async function fetchMessages(id: string) {
    try {
      const res = await fetch(`/api/admin/messages?with=${id}`, { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to load messages");
      const data = await res.json();
      setMessages(data.messages || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load messages");
    }
  }

  async function sendMessage() {
    if (!newMessage.trim() || !session || !selectedThread) return;

    setSending(true);
    setError("");

    try {
      const res = await fetch("/api/admin/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientId: session.role === "SUPER_ADMIN" ? selectedThread.id : undefined,
          body: newMessage,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to send message");
      }

      setNewMessage("");
      void fetchMessages(selectedThread.id);
      void fetchThreads();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send message");
    } finally {
      setSending(false);
    }
  }

  // Auto-resize textarea
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewMessage(e.target.value);
    const ta = e.target;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 120) + "px";
  };

  if (!session) {
    return (
      <div className="flex h-[calc(100vh-8rem)] items-center justify-center">
        <Skeleton className="h-6 w-40" />
      </div>
    );
  }

  if (error && threads.length === 0) {
    return (
      <div className="space-y-4">
        <Card>
          <div className="flex items-center gap-3 text-red-600">
            <AlertCircle className="h-5 w-5" />
            <p className="text-sm">{error}</p>
          </div>
        </Card>
        <div className="flex justify-center">
          <Button variant="secondary" onClick={() => { fetchThreads(); fetchMessages(threadId || ""); }}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-nexus-navy">Messages</h1>
        <Button variant="secondary" size="sm" onClick={() => { void fetchThreads(); void fetchMessages(threadId || ""); }}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="flex-1 overflow-hidden rounded-lg border border-nexus-navy/10 bg-white">
        <div className="flex h-full">
          {/* Thread list — always visible on desktop, hidden on mobile when a thread is selected */}
          <div className={`overflow-y-auto border-r border-nexus-navy/10 transition-all ${threadId && selectedThread ? "hidden sm:block sm:w-64" : "w-full sm:w-64"}`}>
            <div className="border-b border-nexus-navy/10 p-3">
              <div className="relative">
                <Search className="absolute left-2.5 top-2 h-4 w-4 text-nexus-navy/40" />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  className="w-full rounded-md border border-nexus-navy/10 px-3 py-2 pl-9 text-sm text-nexus-navy placeholder:text-nexus-navy/30 focus:border-nexus-cyan focus:outline-none"
                />
              </div>
            </div>

            <div className="overflow-y-auto" style={{ maxHeight: "calc(100% - 56px)" }}>
              {loading ? (
                <div className="space-y-2 p-3">
                  <Skeleton className="h-14 w-full" count={5} />
                </div>
              ) : threads.length === 0 ? (
                <EmptyState
                  icon={MessageCircle}
                  title="No conversations yet"
                  description="When staff send you messages, they'll appear here."
                />
              ) : (
                threads.map((thread) => (
                  <button
                    key={thread.id}
                    onClick={() => router.push(`/admin/messages?with=${thread.id}`)}
                    className={`flex items-center gap-3 p-3 text-left transition hover:bg-nexus-navy/5 ${
                      threadId === thread.id ? "bg-nexus-cyan/5" : ""
                    }`}
                  >
                    <Avatar name={thread.name} size="md" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-nexus-navy">{thread.name}</span>
                        {thread.unreadCount > 0 && (
                          <Badge variant="info" size="sm">
                            {thread.unreadCount}
                          </Badge>
                        )}
                      </div>
                      <p className="truncate text-sm text-nexus-navy/60">
                        {thread.lastMessage || "No messages yet"}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-nexus-navy/50">
                        <Badge variant="neutral" size="sm">
                          {thread.role.replace("_", " ")}
                        </Badge>
                        {thread.lastMessageAt && (
                          <>
                            <span>·</span>
                            <span>
                              {new Date(thread.lastMessageAt).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Message panel — full-width on mobile when thread selected, fixed pane on desktop */}
          <div className={`flex flex-1 flex-col ${!threadId && !selectedThread ? "hidden sm:flex" : ""}`}>
            {threadId && selectedThread ? (
              <>
                <div className="border-b border-nexus-navy/10 px-4 py-3 sm:py-3">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => router.push("/admin/messages")}
                      className="sm:hidden text-nexus-navy/50 hover:text-nexus-navy"
                      aria-label="Back to conversations"
                    >
                      <ArrowLeft className="h-5 w-5" />
                    </button>
                    <Avatar name={selectedThread.name} size="md" />
                    <div>
                      <p className="font-medium text-nexus-navy">{selectedThread.name}</p>
                      <div className="flex items-center gap-2 text-xs text-nexus-navy/60">
                        <Badge variant="neutral" size="sm">
                          {selectedThread.role.replace("_", " ")}
                        </Badge>
                        <span>·</span>
                        <span>{selectedThread.email}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div ref={messagesEndRef} className="flex-1 overflow-y-auto p-4">
                  {messages.length === 0 ? (
                    <EmptyState
                      icon={MessageCircle}
                      title="No messages yet"
                      description="Be the first to say hello!"
                    />
                  ) : (
                    <div className="space-y-4">
                      {messages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`max-w-[75%] rounded-lg px-4 py-2 ${
                            msg.isOwn
                              ? "ml-auto bg-nexus-navy text-nexus-white"
                              : "bg-nexus-navy/5 text-nexus-navy"
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap">{msg.body}</p>
                          <div className="mt-1 flex items-center gap-2 text-xs opacity-70">
                            <span>
                              {new Date(msg.createdAt).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                            {!msg.isOwn && msg.readAt && (
                              <>
                                <span>·</span>
                                <span>Read</span>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="border-t border-nexus-navy/10 p-4">
                  {error && (
                    <p className="mb-2 text-sm text-red-600">{error}</p>
                  )}
                  <div className="flex gap-2">
                    <textarea
                      ref={textareaRef}
                      value={newMessage}
                      onChange={handleTextareaChange}
                      placeholder="Type a message..."
                      disabled={sending}
                      rows={1}
                      maxLength={2000}
                      className="flex-1 resize-none rounded-lg border border-nexus-navy/10 px-3 py-2 text-sm text-nexus-navy placeholder:text-nexus-navy/30 focus:border-nexus-cyan focus:outline-none"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          void sendMessage();
                        }
                      }}
                    />
                    <Button
                      onClick={sendMessage}
                      disabled={sending || !newMessage.trim()}
                      loading={sending}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="mt-1 text-xs text-nexus-navy/40">
                    {newMessage.length}/2000 characters · Enter to send, Shift+Enter for new line
                  </p>
                </div>
              </>
            ) : (
              <div className="flex-1 items-center justify-center p-8">
                <EmptyState
                  icon={MessageCircle}
                  title="Select a conversation"
                  description="Choose a conversation from the list to start messaging."
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MessagesPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-[calc(100vh-8rem)] items-center justify-center">
          <Skeleton className="h-6 w-40" />
        </div>
      }
    >
      <MessagesContent />
    </Suspense>
  );
}
