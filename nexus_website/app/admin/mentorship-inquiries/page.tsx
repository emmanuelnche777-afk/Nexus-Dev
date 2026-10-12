"use client";

import { useEffect, useState } from "react";

import Link from "next/link";
import { Search, ArrowLeft, RefreshCw, Users, Trash2 } from "lucide-react";
import LoadingState from "@/components/admin/LoadingState";
import EmptyState from "@/components/admin/EmptyState";
import { fetchWithFreshTwoFactor } from "@/lib/admin-sensitive-fetch";

interface PathwayInquiry {
  id: string;
  pathway: string;
  fullName: string;
  email: string;
  phone: string;
  details: Record<string, unknown>;
  status: string;
  adminNotes: string;
  responseMessage: string;
  respondedAt: string;
  reviewedAt: string;
  stageEnteredAt: string;
  owner: { id: string; name: string; email: string } | null;
  createdAt: string;
}

export default function MentorshipInquiriesPage() {
  const [inquiries, setInquiries] = useState<PathwayInquiry[]>([]);
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
      const res = await fetch("/api/admin/mentorship-inquiries", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load mentor and volunteer requests.");
      setInquiries(data.inquiries || []);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Failed to load mentor and volunteer requests.");
    } finally {
      setLoading(false);
    }
  }

  async function updateInquiry(id: string, updates: Partial<PathwayInquiry>) {
    try {
      const response = await fetchWithFreshTwoFactor("/api/admin/mentorship-inquiries", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...updates }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not update request.");
      await loadData();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not update request.");
    }
  }

  async function deleteInquiry(id: string) {
    if (!confirm("Delete this mentorship inquiry?")) return;
    try {
      const response = await fetchWithFreshTwoFactor("/api/admin/mentorship-inquiries", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not delete request.");
      await loadData();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not delete request.");
    }
  }

  const filteredInquiries = inquiries.filter(inq =>
    (statusFilter === "all" || inq.status === statusFilter) && (
      inq.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inq.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inq.pathway.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  if (loading) {
    return <LoadingState />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-nexus-navy">Mentorship Inquiries</h1>
          <p className="text-nexus-navy/60 mt-1">Mentor and volunteer applications</p>
        </div>
        <Link
          href="/admin/requests"
          className="flex items-center gap-2 px-4 py-2 text-nexus-navy/70 hover:text-nexus-navy"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Requests
        </Link>
      </div>

      <p className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-900">Mentor and volunteer submissions also appear in Join Us Requests. This page is a focused view of those same records.</p>

      <div className="bg-nexus-white rounded-lg border border-nexus-cyan/10 p-6">
        <label className="mb-4 block max-w-xs text-sm font-medium text-nexus-navy">Filter by status
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="mt-1 w-full rounded-md border border-nexus-cyan/20 bg-white px-3 py-2 text-sm">
            <option value="all">All statuses</option><option value="NEW">New</option><option value="REVIEWED">Reviewed</option><option value="RESPONDED">Responded</option>
          </select>
        </label>
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-nexus-navy/40" />
            <input
              type="text"
              placeholder="Search by name, email, or pathway..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-nexus-cyan/20 rounded-md focus:outline-none focus:ring-2 focus:ring-nexus-cyan/50"
            />
          </div>
        </div>

        {error && <div role="alert" className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}<button type="button" onClick={() => void loadData()} disabled={loading} className="inline-flex items-center gap-2 font-semibold underline"><RefreshCw className="h-4 w-4" />Try again</button></div>}
        {error && inquiries.length === 0 ? null : filteredInquiries.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No mentorship inquiries"
            description="No mentorship or volunteer inquiries found."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-nexus-cyan/10">
                  <th className="text-left py-3 px-4 font-medium text-nexus-navy">Name</th>
                  <th className="text-left py-3 px-4 font-medium text-nexus-navy">Pathway</th>
                  <th className="text-left py-3 px-4 font-medium text-nexus-navy">Contact</th>
                  <th className="text-left py-3 px-4 font-medium text-nexus-navy">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-nexus-navy">Owner</th>
                  <th className="text-left py-3 px-4 font-medium text-nexus-navy">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInquiries.map(inquiry => (
                  <tr key={inquiry.id} className="border-b border-nexus-cyan/5 hover:bg-nexus-cyan/5">
                    <td className="py-4 px-4">
                      <div className="font-medium text-nexus-navy">{inquiry.fullName}</div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800">
                        {inquiry.pathway}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-sm">{inquiry.email}</div>
                      <div className="text-sm text-nexus-navy/60">{inquiry.phone}</div>
                    </td>
                    <td className="py-4 px-4">
                      <select
                        value={inquiry.status}
                        onChange={(e) => {
                          const status = e.target.value;
                          if (status !== "RESPONDED") void updateInquiry(inquiry.id, { status, reviewedAt: new Date().toISOString() });
                        }}
                        className="px-2 py-1 text-sm border border-nexus-cyan/20 rounded focus:outline-none focus:ring-1 focus:ring-nexus-cyan/50"
                      >
                        <option value="NEW">New</option>
                        <option value="REVIEWED">Reviewed</option>
                        <option value="RESPONDED" disabled>Responded (update from Join Us request detail)</option>
                      </select>
                    </td>
                    <td className="py-4 px-4">
                      {inquiry.owner ? (
                        <div>
                          <div className="text-sm font-medium">{inquiry.owner.name}</div>
                          <div className="text-sm text-nexus-navy/60">{inquiry.owner.email}</div>
                        </div>
                      ) : (
                        <span className="text-sm text-nexus-navy/40">Unassigned</span>
                      )}
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
