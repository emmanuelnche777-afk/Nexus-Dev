"use client";

import { useEffect, useState } from "react";


import { Search, MessageSquare, Trash2, Send } from "lucide-react";
import LoadingState from "@/components/admin/LoadingState";
import EmptyState from "@/components/admin/EmptyState";

interface ChatMessage {
  id: string;
  sender: "visitor" | "admin";
  text: string;
  timestamp: string;
  adminName?: string;
}

interface LiveChat {
  id: string;
  visitorName: string;
  visitorEmail: string;
  visitorPhone: string;
  messages: ChatMessage[];
  status: string;
  createdAt: string;
  updatedAt: string;
}

export default function LiveChatPage() {
  const [chats, setChats] = useState<LiveChat[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedChat, setSelectedChat] = useState<LiveChat | null>(null);
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    loadChats();
  }, []);

  async function loadChats() {
    try {
      const res = await fetch("/api/admin/live-chat");
      const data = await res.json();
      setChats(data.chats || []);
    } catch (error) {
      console.error("Failed to load chats:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSendReply() {
    if (!replyText.trim() || !selectedChat) return;

    setSending(true);
    try {
      const newMessage: ChatMessage = {
        id: `msg-${Date.now()}`,
        sender: "admin",
        text: replyText.trim(),
        timestamp: new Date().toISOString(),
        adminName: "Admin",
      };

      const updatedChat = {
        ...selectedChat,
        messages: [...selectedChat.messages, newMessage],
        updatedAt: new Date().toISOString(),
      };

      const res = await fetch(`/api/admin/live-chat/${selectedChat.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedChat),
      });

      if (res.ok) {
        setSelectedChat(updatedChat);
        setReplyText("");
        loadChats();
      }
    } catch (error) {
      console.error("Failed to send reply:", error);
    } finally {
      setSending(false);
    }
  }

  async function handleDeleteChat(id: string) {
    if (!confirm("Are you sure you want to delete this chat?")) return;

    try {
      const res = await fetch(`/api/admin/live-chat/${id}`, { method: "DELETE" });
      if (res.ok) {
        setChats(chats.filter((c) => c.id !== id));
        if (selectedChat?.id === id) setSelectedChat(null);
      }
    } catch (error) {
      console.error("Failed to delete chat:", error);
    }
  }

  const filteredChats = chats.filter((c) =>
    c.visitorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.visitorEmail.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeChats = chats.filter((c) => c.status === "active").length;

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-6">
      {/* Chat List */}
      <div className="w-80 flex-shrink-0 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-nexus-navy">Live Chat</h1>
            <p className="mt-1 text-sm text-nexus-navy/70">
              {activeChats} active conversations
            </p>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-nexus-navy/40" />
          <input
            type="text"
            placeholder="Search chats..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-nexus-navy/10 bg-white py-2.5 pl-10 pr-4 text-sm text-nexus-navy placeholder:text-nexus-navy/40 focus:border-nexus-cyan focus:outline-none"
          />
        </div>

        <div className="max-h-[60vh] space-y-2 overflow-y-auto">
          {loading ? (
            <LoadingState label="Loading chats..." size="sm" />
          ) : filteredChats.length === 0 ? (
            <EmptyState
              icon={MessageSquare}
              title="No chats found"
              description="Visitor support requests from the public site will appear here."
            />
          ) : (
            filteredChats.map((chat) => (
              <button
                key={chat.id}
                onClick={() => setSelectedChat(chat)}
                className={`w-full rounded-lg border p-3 text-left transition ${
                  selectedChat?.id === chat.id
                    ? "border-nexus-cyan bg-nexus-cyan/5"
                    : "border-nexus-navy/10 bg-white hover:border-nexus-cyan/30"
                }`}
              >
                <div className="flex items-center justify-between">
                  <p className="font-medium text-nexus-navy">{chat.visitorName}</p>
                  <span
                    className={`inline-flex h-2 w-2 rounded-full ${
                      chat.status === "active" ? "bg-green-500" : "bg-gray-400"
                    }`}
                  />
                </div>
                <p className="text-xs text-nexus-navy/60">{chat.visitorEmail}</p>
                <p className="mt-1 truncate text-xs text-nexus-navy/50">
                  {chat.messages[chat.messages.length - 1]?.text}
                </p>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Chat Detail */}
      <div className="flex flex-1 flex-col rounded-xl border border-nexus-navy/10 bg-white">
        {selectedChat ? (
          <>
            <div className="border-b border-nexus-navy/10 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-nexus-navy">{selectedChat.visitorName}</h3>
                  <p className="text-sm text-nexus-navy/60">{selectedChat.visitorEmail}</p>
                  {selectedChat.visitorPhone && (
                    <p className="text-xs text-nexus-navy/50">{selectedChat.visitorPhone}</p>
                  )}
                </div>
                <button
                  onClick={() => handleDeleteChat(selectedChat.id)}
                  className="rounded-md p-2 text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto p-4">
              {selectedChat.messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === "admin" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg px-4 py-2 ${
                      msg.sender === "admin"
                        ? "bg-nexus-cyan text-white"
                        : "bg-nexus-gray text-nexus-navy"
                    }`}
                  >
                    <p className="text-sm">{msg.text}</p>
                    <p
                      className={`mt-1 text-xs ${
                        msg.sender === "admin" ? "text-white/70" : "text-nexus-navy/50"
                      }`}
                    >
                      {new Date(msg.timestamp).toLocaleTimeString()}
                      {msg.adminName && ` • ${msg.adminName}`}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-nexus-navy/10 p-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendReply()}
                  placeholder="Type a reply..."
                  className="flex-1 rounded-lg border border-nexus-navy/10 px-4 py-2 text-sm focus:border-nexus-cyan focus:outline-none"
                />
                <button
                  onClick={handleSendReply}
                  disabled={sending || !replyText.trim()}
                  className="rounded-lg bg-nexus-cyan px-4 py-2 text-sm font-medium text-white transition hover:bg-nexus-cyan-bright disabled:opacity-50"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <EmptyState
            icon={MessageSquare}
            title="Select a conversation to view"
            description="Choose a chat on the left to read the message history and reply."
          />
        )}
      </div>
    </div>
  );
}
