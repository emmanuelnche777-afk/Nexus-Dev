"use client";

import { useEffect, useState } from "react";

import Link from "next/link";
import { Search, ArrowLeft, MessageSquare, RefreshCw, Trash2 } from "lucide-react";
import LoadingState from "@/components/admin/LoadingState";
import EmptyState from "@/components/admin/EmptyState";
import { CONTACT_DEPARTMENT_LABELS, isContactDepartment } from "@/lib/contact-routing";
import { fetchWithFreshTwoFactor } from "@/lib/admin-sensitive-fetch";

interface ContactInquiry {
  id: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  subject: string;
  message: string;
  status: string;
  source: string;
  createdAt: string;
}

export default function ContactInquiriesPage() {
  const [inquiries, setInquiries] = useState<ContactInquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setError("");
    try {
      const res = await fetch("/api/admin/contact-inquiries", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load contact inquiries.");
      setInquiries(data.inquiries || []);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Failed to load contact inquiries.");
    } finally {
      setLoading(false);
    }
  }

  async function updateInquiry(id: string, updates: Partial<ContactInquiry>) {
    try {
      const response = await fetchWithFreshTwoFactor("/api/admin/contact-inquiries", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...updates }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Failed to update inquiry.");
      await loadData();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Failed to update inquiry.");
    }
  }

  async function deleteInquiry(id: string) {
    if (!confirm("Delete this contact inquiry?")) return;
    try {
      const response = await fetchWithFreshTwoFactor("/api/admin/contact-inquiries", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to delete inquiry.");
      await loadData();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Failed to delete inquiry.");
    }
  }

  const filteredInquiries = inquiries.filter(inq =>
    (statusFilter === "all" || inq.status === statusFilter) && (
      inq.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inq.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inq.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inq.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inq.message.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  if (loading) {
    return <LoadingState />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-nexus-navy">Contact Inquiries</h1>
          <p className="text-nexus-navy/60 mt-1">Public contact form messages</p>
        </div>
        <Link
          href="/admin/requests"
          className="flex items-center gap-2 px-4 py-2 text-nexus-navy/70 hover:text-nexus-navy"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Requests
        </Link>
      </div>

      <div className="bg-nexus-white rounded-lg border border-nexus-cyan/10 p-6">
        <label className="mb-4 block max-w-xs text-sm font-medium text-nexus-navy">Filter by status
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="mt-1 w-full rounded-md border border-nexus-cyan/20 bg-white px-3 py-2 text-sm">
            <option value="all">All statuses</option><option value="new">New</option><option value="read">Read</option><option value="replied">Replied</option><option value="archived">Archived</option>
          </select>
        </label>
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-nexus-navy/40" />
            <input
              type="text"
              placeholder="Search by name, email, subject, or message..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-nexus-cyan/20 rounded-md focus:outline-none focus:ring-2 focus:ring-nexus-cyan/50"
            />
          </div>
        </div>

        {error && <div role="alert" className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}<button type="button" onClick={() => void loadData()} disabled={loading} className="inline-flex items-center gap-2 font-semibold underline"><RefreshCw className="h-4 w-4" />Try again</button></div>}
        {error && inquiries.length === 0 ? null : filteredInquiries.length === 0 ? (
          <EmptyState
            icon={MessageSquare}
            title="No contact inquiries"
            description="No contact form messages found."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-nexus-cyan/10">
                  <th className="text-left py-3 px-4 font-medium text-nexus-navy">Name</th>
                  <th className="text-left py-3 px-4 font-medium text-nexus-navy">Contact</th>
                  <th className="text-left py-3 px-4 font-medium text-nexus-navy">Department / Subject</th>
                  <th className="text-left py-3 px-4 font-medium text-nexus-navy">Message</th>
                  <th className="text-left py-3 px-4 font-medium text-nexus-navy">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-nexus-navy">Source</th>
                  <th className="text-left py-3 px-4 font-medium text-nexus-navy">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInquiries.map(inquiry => (
                  <tr key={inquiry.id} className="border-b border-nexus-cyan/5 hover:bg-nexus-cyan/5">
                    <td className="py-4 px-4">
                      <div className="font-medium text-nexus-navy">{inquiry.name}</div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-sm">{inquiry.email}</div>
                      <div className="text-sm text-nexus-navy/60">{inquiry.phone}</div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-medium text-nexus-navy">
                        {isContactDepartment(inquiry.department) ? CONTACT_DEPARTMENT_LABELS[inquiry.department] : "Unassigned"}
                      </div>
                      <div className="text-sm text-nexus-navy/60">{inquiry.subject}</div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-sm line-clamp-2">{inquiry.message}</div>
                    </td>
                    <td className="py-4 px-4">
                      <select
                        value={inquiry.status}
                        onChange={(e) => updateInquiry(inquiry.id, { status: e.target.value })}
                        className="px-2 py-1 text-sm border border-nexus-cyan/20 rounded focus:outline-none focus:ring-1 focus:ring-nexus-cyan/50"
                      >
                        <option value="new">New</option>
                        <option value="read">Read</option>
                        <option value="replied">Replied</option>
                        <option value="archived">Archived</option>
                      </select>
                    </td>
                    <td className="py-4 px-4">
                      <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                        {inquiry.source}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <button
                        onClick={() => deleteInquiry(inquiry.id)}
                        className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
