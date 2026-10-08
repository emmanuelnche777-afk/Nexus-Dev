"use client";

import { useEffect, useState } from "react";

import Link from "next/link";
import { Search, ArrowLeft, UserPlus, Handshake, MessageSquare, Trash2, Check, Mail as MailIcon } from "lucide-react";
import LoadingState from "@/components/admin/LoadingState";
import EmptyState from "@/components/admin/EmptyState";

interface Application {
  id: string;
  name: string;
  email: string;
  phone: string;
  pathway?: string;
  role?: string;
  message?: string;
  date: string;
  status: string;
}

interface Partner {
  id: string;
  name: string;
  email: string;
  organization: string;
  type: string;
  message: string;
  date: string;
  status: string;
}

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  status: string;
  createdAt: string;
}

type TabType = "applications" | "partners" | "messages";

export default function InquiriesPage() {
  const [activeTab, setActiveTab] = useState<TabType>("applications");
  const [applications, setApplications] = useState<Application[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [listRes, contactRes] = await Promise.all([
        fetch("/api/admin/inquiries/list"),
        fetch("/api/admin/inquiries/contact"),
      ]);
      const data = await listRes.json();
      const contactData = await contactRes.json();
      setApplications(data.applications || []);
      setPartners(data.partners || []);
      setMessages(contactData.messages || []);
    } catch (error) {
      console.error("Failed to load inquiries:", error);
    } finally {
      setLoading(false);
    }
  }

  async function markMessageRead(id: string) {
    try {
      await fetch("/api/admin/inquiries/contact", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: "read" }),
      });
      loadData();
    } catch (err) {
      console.error("Failed to mark read:", err);
    }
  }

  async function deleteMessage(id: string) {
    if (!confirm("Delete this message?")) return;
    try {
      await fetch("/api/admin/inquiries/contact", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      loadData();
    } catch (err) {
      console.error("Failed to delete:", err);
    }
  }

  const tabs = [
    { id: "applications" as TabType, label: "Applications", icon: UserPlus, count: applications.length },
    { id: "partners" as TabType, label: "Partners", icon: Handshake, count: partners.length },
    { id: "messages" as TabType, label: "Messages", icon: MessageSquare, count: messages.length },
  ];

  const filteredApplications = applications.filter((a) =>
    a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredPartners = partners.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.organization.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredMessages = messages.filter((m) =>
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.message.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
          <h1 className="text-2xl font-bold text-nexus-navy">Inquiries</h1>
          <p className="mt-1 text-sm text-nexus-navy">
            Manage applications and contact messages. Partnership proposals are reviewed in the Partnerships inbox.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition ${
              activeTab === tab.id
                ? "bg-nexus-cyan text-white"
                : "bg-white text-nexus-navy hover:bg-nexus-navy/5"
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
            <span className="rounded-full bg-black/10 px-2 py-0.5 text-xs">
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-nexus-navy/40" />
        <input
          type="text"
          placeholder={`Search ${activeTab}...`}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-lg border border-nexus-navy/10 bg-white py-2.5 pl-10 pr-4 text-sm text-nexus-navy placeholder:text-nexus-navy/40 focus:border-nexus-cyan focus:outline-none"
        />
      </div>

      <div className="rounded-xl border border-nexus-navy/10 bg-white">
        {loading ? (
          <LoadingState label="Loading inquiries..." />
        ) : (
          <div className="divide-y divide-nexus-navy/10">
            {activeTab === "applications" &&
              (filteredApplications.length === 0 ? (
                <EmptyState
                  icon={UserPlus}
                  title="No applications found"
                  description="When visitors apply to the Academy, their submissions will appear here."
                />
              ) : (
                filteredApplications.map((app) => (
                  <div key={app.id} className="px-6 py-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-nexus-navy">{app.name}</p>
                        <p className="text-sm text-nexus-navy">{app.email}</p>
                        <p className="text-sm text-nexus-navy">{app.phone}</p>
                        {app.pathway && (
                          <p className="text-xs text-nexus-navy/50">Pathway: {app.pathway}</p>
                        )}
                        {app.role && (
                          <p className="text-xs text-nexus-navy/50">Role: {app.role}</p>
                        )}
                        {app.message && (
                          <p className="mt-1 text-sm text-nexus-navy">{app.message}</p>
                        )}
                        <p className="text-xs text-nexus-navy/50">
                          {new Date(app.date).toLocaleString()}
                        </p>
                      </div>
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          app.status === "new"
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {app.status}
                      </span>
                    </div>
                  </div>
                ))
              ))}

            {activeTab === "partners" && (
              <div className="flex flex-col items-start gap-3 p-6">
                <Handshake className="h-6 w-6 text-nexus-cyan" />
                <p className="text-sm text-nexus-navy/70">
                  {filteredPartners.length} partnership proposal{filteredPartners.length === 1 ? "" : "s"} are handled in the dedicated inbox, where you can review details and email a response.
                </p>
                <Link href="/admin/partnerships" className="rounded-lg bg-nexus-cyan px-4 py-2 text-sm font-semibold text-white hover:bg-nexus-cyan-bright">
                  Open Partnerships inbox
                </Link>
              </div>
            )}

            {activeTab === "messages" &&
              (filteredMessages.length === 0 ? (
                <EmptyState
                  icon={MessageSquare}
                  title="No contact messages yet"
                  description="Messages submitted via the public contact form will appear here."
                />
              ) : (
                filteredMessages.map((msg) => (
                  <div key={msg.id} className="px-6 py-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-nexus-navy">{msg.name}</p>
                          {msg.status === "new" && (
                            <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                          )}
                        </div>
                        <a
                          href={`mailto:${msg.email}`}
                          className="text-sm text-nexus-cyan hover:underline"
                        >
                          {msg.email}
                        </a>
                        {msg.phone && (
                          <p className="text-sm text-nexus-navy/70">{msg.phone}</p>
                        )}
                        <div className="mt-2 rounded-md border border-nexus-navy/10 bg-nexus-gray/30 p-3">
                          <p className="text-xs font-semibold text-nexus-navy/60">
                            Subject: {msg.subject}
                          </p>
                          <p className="mt-1 text-sm text-nexus-navy whitespace-pre-wrap">
                            {msg.message}
                          </p>
                        </div>
                        <p className="mt-2 text-xs text-nexus-navy/50">
                          {new Date(msg.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-2">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            msg.status === "new"
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {msg.status}
                        </span>
                        <div className="flex gap-1">
                          {msg.status === "new" && (
                            <button
                              onClick={() => markMessageRead(msg.id)}
                              className="rounded-md p-1.5 text-nexus-navy/60 hover:bg-nexus-navy/5 hover:text-nexus-navy"
                              title="Mark as read"
                            >
                              <Check className="h-4 w-4" />
                            </button>
                          )}
                          <a
                            href={`mailto:${msg.email}?subject=Re: ${msg.subject}`}
                            className="rounded-md p-1.5 text-nexus-navy/60 hover:bg-nexus-navy/5 hover:text-nexus-navy"
                            title="Reply via email"
                          >
                            <MailIcon className="h-4 w-4" />
                          </a>
                          <button
                            onClick={() => deleteMessage(msg.id)}
                            className="rounded-md p-1.5 text-red-600 hover:bg-red-50"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
