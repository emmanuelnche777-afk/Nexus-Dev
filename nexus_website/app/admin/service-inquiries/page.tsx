"use client";

import { useEffect, useState } from "react";

import Link from "next/link";
import { Search, ArrowLeft, ClipboardList } from "lucide-react";
import LoadingState from "@/components/admin/LoadingState";
import EmptyState from "@/components/admin/EmptyState";

interface ServiceOrderInquiry {
  id: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  company: string;
  serviceType: string;
  serviceTypeKey: string;
  description: string;
  budget: string;
  timeline: string;
  status: string;
  priority: string;
  createdAt: string;
}

export default function ServiceInquiriesPage() {
  const [inquiries, setInquiries] = useState<ServiceOrderInquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const res = await fetch("/api/admin/service-inquiries");
      if (!res.ok) throw new Error("Failed to load");
      const data = await res.json();
      setInquiries(data.inquiries || []);
    } catch (error) {
      console.error("Failed to load service inquiries:", error);
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(id: string, status: string) {
    try {
      await fetch("/api/admin/service-inquiries", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      loadData();
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  }

  async function deleteInquiry(id: string) {
    if (!confirm("Delete this inquiry?")) return;
    try {
      await fetch("/api/admin/service-inquiries", {
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
    inq.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    inq.clientEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
    inq.serviceType.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return <LoadingState />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-nexus-navy">Service Inquiries</h1>
          <p className="text-nexus-navy/60 mt-1">Client service requests from the Tech Hub</p>
        </div>
        <Link
          href="/admin/tech-hub/services"
          className="flex items-center gap-2 px-4 py-2 text-nexus-navy/70 hover:text-nexus-navy"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Services
        </Link>
      </div>

      <div className="bg-nexus-white rounded-lg border border-nexus-cyan/10 p-6">
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-nexus-navy/40" />
            <input
              type="text"
              placeholder="Search by client name, email, or service type..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-nexus-cyan/20 rounded-md focus:outline-none focus:ring-2 focus:ring-nexus-cyan/50"
            />
          </div>
        </div>

        {filteredInquiries.length === 0 ? (
          <EmptyState
            icon={ClipboardList}
            title="No service inquiries"
            description="No service inquiries found."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-nexus-cyan/10">
                  <th className="text-left py-3 px-4 font-medium text-nexus-navy">Client</th>
                  <th className="text-left py-3 px-4 font-medium text-nexus-navy">Service</th>
                  <th className="text-left py-3 px-4 font-medium text-nexus-navy">Contact</th>
                  <th className="text-left py-3 px-4 font-medium text-nexus-navy">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-nexus-navy">Priority</th>
                  <th className="text-left py-3 px-4 font-medium text-nexus-navy">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInquiries.map(inquiry => (
                  <tr key={inquiry.id} className="border-b border-nexus-cyan/5 hover:bg-nexus-cyan/5">
                    <td className="py-4 px-4">
                      <div className="font-medium text-nexus-navy">{inquiry.clientName}</div>
                      <div className="text-sm text-nexus-navy/60">{inquiry.company}</div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-medium text-nexus-navy">{inquiry.serviceType}</div>
                      <div className="text-sm text-nexus-navy/60 line-clamp-2">{inquiry.description}</div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-sm">{inquiry.clientEmail}</div>
                      <div className="text-sm text-nexus-navy/60">{inquiry.clientPhone}</div>
                    </td>
                    <td className="py-4 px-4">
                      <select
                        value={inquiry.status}
                        onChange={(e) => updateStatus(inquiry.id, e.target.value)}
                        className="px-2 py-1 text-sm border border-nexus-cyan/20 rounded focus:outline-none focus:ring-1 focus:ring-nexus-cyan/50"
                      >
                        <option value="new">New</option>
                        <option value="assigned">Assigned</option>
                        <option value="in-progress">In Progress</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${inquiry.priority === "high" ? "bg-red-100 text-red-800" : inquiry.priority === "medium" ? "bg-yellow-100 text-yellow-800" : "bg-green-100 text-green-800"}`}>
                        {inquiry.priority}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <button
                        onClick={() => deleteInquiry(inquiry.id)}
                        className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5.032 7m5-4a1 1 0 011-1h4a1 1 0 011 1m-5 4v6a2 2 0 102 0V8m-9 0h14"></path>
                        </svg>
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
