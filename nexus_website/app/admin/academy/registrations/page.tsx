"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, UserPlus, Eye, Check, Loader2, Search } from "lucide-react";
import LoadingState from "@/components/admin/LoadingState";
import EmptyState from "@/components/admin/EmptyState";
import AdminModal from "@/components/admin/AdminModal";

interface Registration {
  id: string;
  studentId: string;
  studentCode?: string;
  programSlug: string;
  cohortId?: string;
  cohort?: { name: string; period: string } | null;
  status: string;
  submittedData?: unknown;
  reviewerId?: string;
  reviewedAt?: string;
  reviewNotes?: string;
  createdAt: string;
  paymentStatus?: string;
  fullName?: string;
  email?: string;
  phone?: string;
}

type RegistrationApiRecord = Registration & {
  payment?: {
    student?: { studentCode?: string } | null;
    studentId?: string | null;
    studentCode?: string | null;
    status?: string;
  } | null;
};

export default function RegistrationsPage() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [registering, setRegistering] = useState<string | null>(null);
  const [registeringAll, setRegisteringAll] = useState(false);
  const [showClearModal, setShowClearModal] = useState(false);
  const [clearConfirm, setClearConfirm] = useState("");
  const [clearing, setClearing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  async function handleClearData() {
    if (clearConfirm !== "DELETE ALL") return;
    setClearing(true);
    try {
      const res = await fetch("/api/admin/academy/clear-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entity: "registrations", confirm: "DELETE ALL" }),
      });
      if (res.ok) {
        setClearConfirm("");
        setShowClearModal(false);
        await loadRegistrations();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setClearing(false);
    }
  }

  const loadRegistrations = useCallback(async () => {
    try {
      const regRes = await fetch("/api/admin/academy/registrations", { cache: "no-store" });
      if (!regRes.ok) throw new Error("Failed to load data");
      const regData = await regRes.json();
      const apiRegistrations: RegistrationApiRecord[] = Array.isArray(regData.registrations)
        ? regData.registrations
        : [];
      const paidRegistrations = apiRegistrations
        .map((reg) => {
          return {
            ...reg,
            studentCode: reg.payment?.student?.studentCode || reg.payment?.studentCode || "—",
            studentId: reg.payment?.studentId || "—",
            paymentStatus: reg.payment?.status || "Pending",
          };
        })
        // Only show students the admin marked as PAID in the Payment page
        .filter((reg) => reg.paymentStatus === "Paid");
      setRegistrations(paidRegistrations);
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadRegistrations();
  }, [loadRegistrations]);

  async function registerStudent(reg: Registration | null = null) {
    const isAll = reg === null;
    if (isAll) setRegisteringAll(true);
    else setRegistering(reg?.id || null);
    try {
      const res = await fetch("/api/admin/academy/registrations/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(isAll ? {} : { registrationId: reg?.id }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        alert(data.error || "Failed to register student(s)");
      } else {
        alert(`Successfully registered ${data.count || 0} student(s) as official students.`);
        await loadRegistrations();
      }
    } catch (err) {
      console.error("Failed to register student(s):", err);
      alert("Failed to register student(s)");
    } finally {
      setRegistering(null);
      setRegisteringAll(false);
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-700";
      case "rejected":
        return "bg-red-100 text-red-700";
      case "viewed":
        return "bg-blue-100 text-blue-700";
      default:
        return "bg-amber-100 text-amber-700";
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "Paid":
        return "bg-green-100 text-green-700";
      case "Requires Verification":
        return "bg-amber-100 text-amber-700";
      case "Failed":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const filteredRegistrations = registrations.filter((reg) => {
    const q = searchQuery.toLowerCase();
    return (
      !q ||
      reg.id.toLowerCase().includes(q) ||
      reg.fullName?.toLowerCase().includes(q) ||
      reg.email?.toLowerCase().includes(q) ||
      reg.phone?.toLowerCase().includes(q) ||
      reg.studentCode?.toLowerCase().includes(q) ||
      reg.paymentStatus?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/academy"
          className="rounded-md p-2 text-nexus-navy hover:bg-nexus-navy/5"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-nexus-navy">Registrations</h1>
          <p className="mt-1 text-sm text-nexus-navy/70">
            Review and manage academy registration applications
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={() => registerStudent()}
          disabled={registeringAll || registrations.length === 0}
          className="flex items-center gap-2 rounded-lg bg-nexus-cyan px-4 py-2 text-sm font-medium text-white transition hover:bg-nexus-cyan-bright disabled:opacity-50"
          title="Approve all paid registrations and move them to the Student page"
        >
          {registeringAll ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Registering...
            </>
          ) : (
            <UserPlus className="h-4 w-4" />
          )}
          <span>Register All Students</span>
        </button>
        <button
          onClick={() => setShowClearModal(true)}
          className="rounded-lg border border-red-500 bg-red-50 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-100 transition"
        >
          Clear Data
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-nexus-navy/40" />
        <input
          type="text"
          placeholder="Search by name, email, phone, or student code..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-lg border border-nexus-navy/10 bg-white py-2.5 pl-10 pr-4 text-sm text-nexus-navy placeholder:text-nexus-navy/40 focus:border-nexus-cyan focus:outline-none"
        />
      </div>

      <AdminModal
        open={showClearModal}
        onClose={() => {
          setShowClearModal(false);
          setClearConfirm("");
        }}
        title="Clear Registration Data"
      >
        <div className="space-y-4">
          <p className="text-sm text-nexus-navy">
            This action will permanently delete ALL registration records on this page. This cannot be undone.
          </p>
          <p className="text-sm font-bold text-red-600">
            Type DELETE ALL to confirm:
          </p>
          <input
            type="text"
            className="w-full rounded-lg border border-nexus-navy/10 px-3 py-2 text-sm focus:border-red-500 focus:outline-none"
            value={clearConfirm}
            onChange={(e) => setClearConfirm(e.target.value)}
          />
          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => {
                setShowClearModal(false);
                setClearConfirm("");
              }}
              className="rounded-lg border border-nexus-navy/10 px-4 py-2 text-sm font-medium hover:bg-nexus-navy/5"
            >
              Cancel
            </button>
            <button
              onClick={handleClearData}
              disabled={clearConfirm !== "DELETE ALL" || clearing}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              {clearing ? "Clearing..." : "Confirm Delete"}
            </button>
          </div>
        </div>
      </AdminModal>

      {loading ? (
        <LoadingState label="Loading registrations..." />
      ) : error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-red-600">
          {error}
        </div>
      ) : registrations.length === 0 ? (
        <EmptyState
          icon={UserPlus}
          title="No paid registrations yet"
          description="Students marked as PAID in the Payment page will appear here for registration."
        />
      ) : filteredRegistrations.length === 0 ? (
        <div className="rounded-xl border border-nexus-navy/10 bg-white p-10 text-center text-nexus-navy/50">
          No registrations match your search.
        </div>
      ) : (
        <div className="rounded-xl border border-nexus-navy/10 bg-white overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-nexus-navy/10 bg-nexus-gray/30">
                  <th className="text-left text-sm font-medium text-nexus-navy px-6 py-3">ID</th>
                  <th className="text-left text-sm font-medium text-nexus-navy px-6 py-3">Student Code</th>
                  <th className="text-left text-sm font-medium text-nexus-navy px-6 py-3">Student ID</th>
                  <th className="text-left text-sm font-medium text-nexus-navy px-6 py-3">Program</th>
                  <th className="text-left text-sm font-medium text-nexus-navy px-6 py-3">Reg Status</th>
                  <th className="text-left text-sm font-medium text-nexus-navy px-6 py-3">Payment Status</th>
                  <th className="text-left text-sm font-medium text-nexus-navy px-6 py-3">Submitted</th>
                  <th className="text-right text-sm font-medium text-nexus-navy px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-nexus-navy/10">
                {filteredRegistrations.map((reg) => (
                  <tr key={reg.id} className="hover:bg-nexus-gray/20 transition">
                    <td className="px-6 py-4 text-sm font-medium text-nexus-navy">
                      {reg.id}
                    </td>
                    <td className="px-6 py-4 text-sm text-nexus-navy font-mono">
                      {reg.studentCode || "—"}
                    </td>
                    <td className="px-6 py-4 text-sm text-nexus-navy">
                      {reg.studentId}
                    </td>
                    <td className="px-6 py-4 text-sm text-nexus-navy">
                      {reg.programSlug}
                      {reg.cohortId && (
                        <span className="ml-2 text-xs text-nexus-navy/50">
                          ({reg.cohort?.name || reg.cohortId})
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(reg.status)}`}
                      >
                        {reg.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${getPaymentStatusColor(reg.paymentStatus || "Pending")}`}
                      >
                        {reg.paymentStatus || "Pending"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-nexus-navy/70">
                      {new Date(reg.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/academy/registrations/${reg.id}`}
                          className="rounded-md p-1.5 text-nexus-navy/60 hover:bg-nexus-navy/5 hover:text-nexus-navy"
                          title="View details"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        {reg.paymentStatus === "Paid" && reg.studentId === "—" && (
                          <button
                            onClick={() => registerStudent(reg)}
                            disabled={registering === reg.id}
                            className="flex items-center gap-1.5 rounded-lg bg-nexus-cyan px-3 py-1.5 text-sm font-medium text-white transition hover:bg-nexus-cyan-bright disabled:opacity-50"
                            title="Register this student officially"
                          >
                            {registering === reg.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Check className="h-4 w-4" />
                            )}
                            <span>{registering === reg.id ? "Registering..." : "Register Student"}</span>
                          </button>
                        )}
                        {reg.studentId !== "—" && (
                          <span className="rounded-lg bg-green-50 px-3 py-1.5 text-sm font-medium text-green-700">
                            Registered
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
