"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Search,
  ArrowLeft,
  DollarSign,
  CheckCircle2,
  Pencil,
  Bell,
  Loader2,
  User,
  GraduationCap,
} from "lucide-react";
import LoadingState from "@/components/admin/LoadingState";
import EmptyState from "@/components/admin/EmptyState";
import AdminModal from "@/components/admin/AdminModal";
import { hasPermission, type AdminRole } from "@/lib/permissions";

interface Payment {
  id: string;
  studentId?: string | null;
  registrationId?: string;
  studentCode?: string | null;
  amount: number;
  currency: string;
  method?: string;
  reference?: string;
  status: string;
  notes?: string;
  verifiedBy?: string;
  verifiedAt?: string;
  createdAt: string;
  updatedAt: string;
  // Joined data
  studentName?: string;
  studentEmail?: string;
  studentPhone?: string;
  programSlug?: string;
  programTitle?: string;
  programDuration?: number;
  programPrice?: number;
  cohortName?: string;
  // Payment fields from DB
}

const STATUS_STYLES: Record<string, string> = {
  Pending: "bg-amber-100 text-amber-700",
  Processing: "bg-blue-100 text-blue-700",
  "Requires Verification": "bg-orange-100 text-orange-700",
  Paid: "bg-emerald-100 text-emerald-700",
};

const STATUS_NOTES: Record<string, string> = {
  Pending: "Awaiting payment proof from student",
  Processing: "Payment under review",
  "Requires Verification": "Payment proof submitted, awaiting verification",
  Paid: "Payment verified and confirmed",
};

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showClearModal, setShowClearModal] = useState(false);
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const [formData, setFormData] = useState<Partial<Payment>>({});
  const [saving, setSaving] = useState(false);
  const [notifying, setNotifying] = useState<string | null>(null);
  const [clearing, setClearing] = useState(false);
  const [clearConfirm, setClearConfirm] = useState("");
  const [canClearPayments, setCanClearPayments] = useState(false);

  useEffect(() => {
    loadPayments();
  }, []);

  async function handleClearData() {
    if (clearConfirm !== "DELETE ALL") return;
    setClearing(true);
    try {
      const res = await fetch("/api/admin/academy/clear-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entity: "payments", confirm: "DELETE ALL" }),
      });
      if (res.ok) {
        setClearConfirm("");
        setShowModal(false);
        await loadPayments();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setClearing(false);
    }
  }

  async function loadPayments() {
    try {
      const [payRes, progRes, sessionRes] = await Promise.all([
        fetch("/api/admin/academy/payments"),
        fetch("/api/programs"),
        fetch("/api/admin/session", { cache: "no-store" }),
      ]);
      
      const payData = await payRes.json();
      const progData = await progRes.json();
      const sessionData = await sessionRes.json().catch(() => ({}));
      const role = sessionData?.user?.role as AdminRole | undefined;
      setCanClearPayments(Boolean(role && hasPermission(role, "academy:payments:delete")));

      const payments = payData.payments || [];
      const programs = progData.programs || [];

      const paymentsWithDetails = payments.map((payment: Payment & {
        student?: { fullName?: string; email?: string; phone?: string; studentCode?: string } | null;
        registration?: { fullName?: string; email?: string; phone?: string; programSlug?: string; cohort?: { name?: string; period?: string } | null } | null;
      }) => {
        const programSlug = payment.registration?.programSlug || payment.programSlug;
        const program = programs.find((item: { slug: string; title: string; durationWeeks?: number }) => item.slug === programSlug);
        return {
          ...payment,
          studentCode: payment.student?.studentCode || payment.studentCode,
          studentName: payment.student?.fullName || payment.registration?.fullName,
          studentEmail: payment.student?.email || payment.registration?.email,
          studentPhone: payment.student?.phone || payment.registration?.phone,
          programSlug,
          programTitle: program?.title || programSlug || "Unknown Program",
          programDuration: program?.durationWeeks,
          programPrice: payment.amount,
          cohortName: payment.registration?.cohort?.name,
        };
      });



      setPayments(paymentsWithDetails);
    } catch (error) {
      console.error("Failed to load payments:", error);
    } finally {
      setLoading(false);
    }
  }

  function openEdit(payment: Payment) {
    setEditingPayment(payment);
    // Auto-fill from joined data
    const amount = payment.amount || payment.programPrice || 0;
    const reference = payment.reference || payment.id;
    
    setFormData({
      id: payment.id,
      studentId: payment.studentId,
      registrationId: payment.registrationId,
      studentCode: payment.studentCode,
      studentName: payment.studentName,
      studentEmail: payment.studentEmail,
      studentPhone: payment.studentPhone,
      programSlug: payment.programSlug,
      programTitle: payment.programTitle,
      programDuration: payment.programDuration,
      amount,
      currency: payment.currency || "XAF",
      method: payment.method || "MTN",
      reference,
      status: payment.status,
      notes: payment.notes || STATUS_NOTES[payment.status] || "",
    });
    setShowModal(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingPayment) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/academy/payments`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          paymentId: editingPayment.id, 
          status: formData.status,
          verificationNotes: formData.notes,
          amount: formData.amount,
          currency: formData.currency,
          method: formData.method,
        }),
      });
      if (res.ok) {
        setShowModal(false);
        setEditingPayment(null);
        setFormData({});
        await loadPayments();
      }
    } catch (error) {
      console.error("Failed to save payment:", error);
    } finally {
      setSaving(false);
    }
  }

  async function handleNotify(payment: Payment) {
    if (!payment.studentEmail) return;
    setNotifying(payment.id);
    try {
      const response = await fetch(`/api/admin/academy/payments/${encodeURIComponent(payment.id)}/request-proof`, {
        method: "POST",
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "Notification request failed");
      alert("Notification sent to student email");
    } catch (error) {
      console.error("Failed to send notification:", error);
      alert("Failed to send notification");
    } finally {
      setNotifying(null);
    }
  }

  const filteredPayments = payments.filter((p) => {
    const q = searchQuery.toLowerCase();
    return (
      !q ||
      p.id.toLowerCase().includes(q) ||
      p.studentId?.toLowerCase().includes(q) ||
      p.studentCode?.toLowerCase().includes(q) ||
      p.studentName?.toLowerCase().includes(q) ||
      p.studentEmail?.toLowerCase().includes(q) ||
      p.studentPhone?.toLowerCase().includes(q) ||
      p.reference?.toLowerCase().includes(q) ||
      p.status.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/academy"
            className="rounded-md p-2 text-nexus-navy/60 hover:bg-nexus-navy/5"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-nexus-navy">Payments</h1>
            <p className="mt-1 text-sm text-nexus-navy/70">
              Manage academy payment records and verifications
            </p>
          </div>
        </div>
        {canClearPayments && <button
          onClick={() => setShowClearModal(true)}
          className="rounded-lg border border-red-500 bg-red-50 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-100 transition"
        >
          Clear Data
        </button>}
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-nexus-navy/40" />
        <input
          type="text"
          placeholder="Search by name, email, student code, or status..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-lg border border-nexus-navy/10 bg-white py-2.5 pl-10 pr-4 text-sm text-nexus-navy placeholder:text-nexus-navy/40 focus:border-nexus-cyan focus:outline-none"
        />
      </div>

      <div className="rounded-xl border border-nexus-navy/10 bg-white">
        {loading ? (
          <LoadingState label="Loading payments..." />
        ) : filteredPayments.length === 0 ? (
          <EmptyState
            icon={DollarSign}
            title={payments.length === 0 ? "No payments yet" : "No payments match your search"}
            description={
              payments.length === 0
                ? "Payment attempts will appear here when applicants submit the enrollment form."
                : "Try a different search term."
            }
          />
        ) : (
          <div className="divide-y divide-nexus-navy/10">
            {filteredPayments.map((payment) => (
              <div
                key={payment.id}
                className="flex items-center justify-between gap-4 px-6 py-4 hover:bg-nexus-gray/20 transition"
              >
                <div className="flex items-center gap-4 min-w-0 flex-1">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                    <DollarSign className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="truncate font-medium text-nexus-navy">{payment.id}</p>
                      {payment.studentCode && (
                        <span className="inline-flex rounded-full px-2 py-0.5 text-xs font-mono font-bold bg-nexus-cyan/10 text-nexus-cyan">
                          {payment.studentCode}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-nexus-navy/70">
                      {payment.studentName ? (
                        <>
                          <User className="inline h-3 w-3" />
                          {payment.studentName}
                        </>
                      ) : (
                        payment.studentId
                      )}
                    </p>
                    <p className="text-xs text-nexus-navy/50">
                      {payment.programTitle && (
                        <>
                          <GraduationCap className="inline h-3 w-3" />
                          {payment.programTitle} · {payment.programDuration} weeks
                        </>
                      )}
                      {payment.cohortName && <> <span className="mx-1">•</span>{payment.cohortName}</>}
                      {payment.reference && (
                        <>
                          <span className="mx-1">•</span>
                          {payment.reference}
                        </>
                      )}
                      <span className="mx-1">•</span>
                      {new Date(payment.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      STATUS_STYLES[payment.status] || STATUS_STYLES.Pending
                    }`}
                  >
                    {payment.status}
                  </span>
                  <button
                    onClick={() => openEdit(payment)}
                    className="rounded-md p-1.5 text-nexus-navy/60 hover:bg-nexus-navy/5 hover:text-nexus-navy"
                    title="Edit & Verify"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                      {payment.status === "Pending" && payment.studentEmail && (
                    <button
                      onClick={() => handleNotify(payment)}
                      disabled={notifying === payment.id}
                      className="rounded-md p-1.5 text-blue-600 hover:bg-blue-50 disabled:opacity-50"
                      title="Remind student to send payment proof"
                    >
                      {notifying === payment.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Bell className="h-4 w-4" />
                      )}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <AdminModal
        open={showClearModal}
        onClose={() => {
          setShowClearModal(false);
          setClearConfirm("");
        }}
        title="Clear Payment Data"
      >
        <div className="space-y-4">
          <p className="text-sm text-nexus-navy">
            This action will permanently delete ALL payment records on this page. This cannot be undone.
          </p>
          <p className="text-sm font-bold text-red-600">
            Type &quot;DELETE ALL&quot; to confirm:
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

      <AdminModal
        open={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingPayment(null);
          setFormData({});
        }}
        title="Verify Payment"
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Student Details (Read-only) */}
          <div className="rounded-lg bg-nexus-gray/30 p-4 border border-nexus-navy/10">
            <h4 className="text-sm font-semibold text-nexus-navy mb-3 flex items-center gap-2">
              <User className="h-4 w-4" />
              Applicant Details
            </h4>
            <div className="grid gap-2 sm:grid-cols-2">
              <div>
                <p className="text-xs text-nexus-navy/50">Name</p>
                <p className="font-medium text-nexus-navy">{formData.studentName || "—"}</p>
              </div>
              <div>
                <p className="text-xs text-nexus-navy/50">Student Code</p>
                <p className="font-mono font-bold text-nexus-cyan">{formData.studentCode || "—"}</p>
              </div>
              <div>
                <p className="text-xs text-nexus-navy/50">Email</p>
                <p className="text-sm text-nexus-navy">{formData.studentEmail || "—"}</p>
              </div>
              <div>
                <p className="text-xs text-nexus-navy/50">Phone (WhatsApp)</p>
                <p className="text-sm text-nexus-navy">{formData.studentPhone || "—"}</p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-xs text-nexus-navy/50">Program</p>
                <p className="font-medium text-nexus-navy">
                  {formData.programTitle || formData.programSlug || "—"}
                  {formData.programDuration && (
                    <span className="ml-2 text-sm text-nexus-navy/60">
                      ({formData.programDuration} weeks)
                    </span>
                  )}
                </p>
              </div>
              <div>
                <p className="text-xs text-nexus-navy/50">Program Price</p>
                <p className="font-medium text-nexus-navy">
                  {(formData.programPrice || formData.amount || 0).toLocaleString()} {formData.currency || "XAF"}
                </p>
              </div>
               <div>
                 <p className="text-xs text-nexus-navy/50">Reference</p>
                 <p className="font-mono text-sm text-nexus-navy">{formData.reference || "—"}</p>
               </div>
             </div>
           </div>

           {/* Payment Verification */}
           <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-nexus-navy">Amount</label>
              <input
                type="number"
                required
                min={0}
                value={formData.amount || 0}
                onChange={(e) => setFormData({ ...formData, amount: parseInt(e.target.value) || 0 })}
                className="mt-1 w-full rounded-lg border border-nexus-navy/10 px-3 py-2 text-sm focus:border-nexus-cyan focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-nexus-navy">Currency</label>
              <select
                value={formData.currency || "XAF"}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                className="mt-1 w-full rounded-lg border border-nexus-navy/10 px-3 py-2 text-sm focus:border-nexus-cyan focus:outline-none"
              >
                <option value="XAF">XAF</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-nexus-navy">Method</label>
              <select
                value={formData.method || "MTN"}
                onChange={(e) => setFormData({ ...formData, method: e.target.value })}
                className="mt-1 w-full rounded-lg border border-nexus-navy/10 px-3 py-2 text-sm focus:border-nexus-cyan focus:outline-none"
              >
        <option value="MTN">MTN Mobile Money</option>
        <option value="ORANGE">Orange Money</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-nexus-navy">Status</label>
              <select
                value={formData.status || "Pending"}
                onChange={(e) => {
                  const newStatus = e.target.value;
                  setFormData({ 
                    ...formData, 
                    status: newStatus,
                    // Auto-update notes based on status
                    notes: STATUS_NOTES[newStatus] || "",
                  });
                }}
                className="mt-1 w-full rounded-lg border border-nexus-navy/10 px-3 py-2 text-sm focus:border-nexus-cyan focus:outline-none"
              >
                <option value="Pending">Pending</option>
                <option value="Processing">Processing</option>
                <option value="Requires Verification">Requires Verification</option>
                <option value="Paid">Paid</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-nexus-navy">Notes (auto-updated with status)</label>
            <textarea
              rows={3}
              value={formData.notes || ""}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="mt-1 w-full rounded-lg border border-nexus-navy/10 px-3 py-2 text-sm focus:border-nexus-cyan focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                setShowModal(false);
                setEditingPayment(null);
                setFormData({});
              }}
              className="flex items-center gap-1.5 rounded-lg border border-nexus-navy/10 px-4 py-2 text-sm font-medium text-nexus-navy transition hover:bg-nexus-navy/5"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-1.5 rounded-lg bg-nexus-cyan px-4 py-2 text-sm font-medium text-white transition hover:bg-nexus-cyan-bright disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Update & Close
                </>
              )}
            </button>
          </div>
        </form>
      </AdminModal>
    </div>
  );
}
