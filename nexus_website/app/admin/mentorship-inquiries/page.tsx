"use client";

import { useEffect, useState } from "react";

import Link from "next/link";
import { Search, ArrowLeft, Users, Trash2 } from "lucide-react";
import LoadingState from "@/components/admin/LoadingState";
import EmptyState from "@/components/admin/EmptyState";

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
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const res = await fetch("/api/admin/mentorship-inquiries");
      if (!res.ok) throw new Error("Failed to load");
      const data = await res.json();
      setInquiries(data.inquiries || []);
    } catch (error) {
      console.error("Failed to load mentorship inquiries:", error);
    } finally {
      setLoading(false);
    }
  }

  async function updateInquiry(id: string, data: Partial<PathwayInquiry>) {
    try {
      await fetch("/api/admin/mentorship-inquiries", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...data }),
      });
      loadData();
    } catch (err) {
      console.error("Failed to update:", err);
    }
  }

  async function deleteInquiry(id: string) {
    if (!confirm("Delete this mentorship inquiry?")) return;
    try {
      await fetch("/api/admin/mentorship-inquiries", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      loadData();
    } catch (err) {
      console.error("Failed to delete:", err);
    }
  }

  const filteredInquiries = inquiries.filter(inq =>
    inq.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    inq.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    inq.pathway.toLowerCase().includes(searchQuery.toLowerCase())
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
          href="/admin/inquiries"
          className="flex items-center gap-2 px-4 py-2 text-nexus-navy/70 hover:text-nexus-navy"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Inquiries
        </Link>
      </div>

      <div className="bg-nexus-white rounded-lg border border-nexus-cyan/10 p-6">
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

        {filteredInquiries.length === 0 ? (
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
                        onChange={(e) => updateInquiry(inquiry.id, { status: e.target.value, reviewedAt: new Date().toISOString() })}
                        className="px-2 py-1 text-sm border border-nexus-cyan/20 rounded focus:outline-none focus:ring-1 focus:ring-nexus-cyan/50"
                      >
                        <option value="NEW">New</option>
                        <option value="REVIEWING">Reviewing</option>
                        <option value="APPROVED">Approved</option>
                        <option value="REJECTED">Rejected</option>
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
