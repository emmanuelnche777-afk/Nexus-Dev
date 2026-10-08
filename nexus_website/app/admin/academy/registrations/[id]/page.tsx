"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { ArrowLeft, Save, User, Mail, Phone, CheckCircle } from "lucide-react";

interface Registration {
  id: string;
  studentId?: string | null;
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

export default function RegistrationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [registration, setRegistration] = useState<Registration | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [reviewNotes, setReviewNotes] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    let active = true;
    async function loadRegistration() {
      try {
        const regRes = await fetch(`/api/admin/academy/registrations/${id}`);
        if (regRes.ok) {
          const data = await regRes.json();
          if (!active) return;
          setRegistration(data);
          setStatus(data.status);
          setReviewNotes(data.reviewNotes || "");
        }
      } catch (error) {
        console.error("Failed to load registration:", error);
      } finally {
        if (active) setLoading(false);
      }
    }
    void loadRegistration();
    return () => {
      active = false;
    };
  }, [id]);

  async function handleUpdate() {
    if (!registration) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/academy/registrations/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ registrationId: id, status, notes: reviewNotes }),
      });
      if (res.ok) {
        const updated = await res.json();
        setRegistration((previous) => previous ? { ...previous, ...updated } : updated);
      }
    } catch (error) {
      console.error("Failed to update:", error);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="py-12 text-center">Loading registration...</div>;
  }

  if (!registration) {
    return (
      <div className="py-12 text-center">
        <p className="text-nexus-navy">Registration not found</p>
        <Link href="/admin/academy/registrations" className="mt-4 inline-block text-nexus-cyan hover:underline">
          Back to registrations
        </Link>
      </div>
    );
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

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/academy/registrations"
          className="rounded-md p-2 text-nexus-navy hover:bg-nexus-navy/5"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-nexus-navy">Registration {registration.id}</h1>
          <p className="mt-1 text-sm text-nexus-navy/70">
            Submitted on {new Date(registration.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-nexus-navy/10 bg-white p-6">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-nexus-navy/60">
            Student Information
          </h3>
          <div className="space-y-3">
            {registration.fullName && (
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-nexus-navy/50" />
                <span className="text-sm font-medium text-nexus-navy">{registration.fullName}</span>
              </div>
            )}
            {registration.email && (
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-nexus-navy/50" />
                <span className="text-sm text-nexus-navy">{registration.email}</span>
              </div>
            )}
            {registration.phone && (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-nexus-navy/50" />
                <span className="text-sm text-nexus-navy">{registration.phone}</span>
              </div>
            )}
            {registration.studentCode && (
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm font-mono font-bold text-nexus-cyan">{registration.studentCode}</span>
              </div>
            )}
            <div>
              <p className="text-xs text-nexus-navy/50">Program</p>
              <p className="text-sm font-medium text-nexus-navy">{registration.programSlug}</p>
            </div>
            {registration.cohort && (
              <div>
                <p className="text-xs text-nexus-navy/50">Cohort</p>
                <p className="text-sm font-medium text-nexus-navy">{registration.cohort.name} · {registration.cohort.period}</p>
              </div>
            )}
            <div>
              <p className="text-xs text-nexus-navy/50">Registration Status</p>
              <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(registration.status)}`}>
                {registration.status}
              </span>
            </div>
            {registration.paymentStatus && (
              <div>
                <p className="text-xs text-nexus-navy/50">Payment Status</p>
                <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${getPaymentStatusColor(registration.paymentStatus)}`}>
                  {registration.paymentStatus}
                </span>
              </div>
            )}
          </div>
        </section>

        <section className="rounded-xl border border-nexus-navy/10 bg-white p-6">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-nexus-navy/60">
            Registration Management
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-nexus-navy">Review Notes</label>
              <textarea
                rows={4}
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                className="mt-1 w-full rounded-lg border border-nexus-navy/10 px-3 py-2 text-sm focus:border-nexus-cyan focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-nexus-navy">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="mt-1 w-full rounded-lg border border-nexus-navy/10 px-3 py-2 text-sm focus:border-nexus-cyan focus:outline-none"
              >
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="viewed">Viewed</option>
              </select>
            </div>
            <button
              onClick={handleUpdate}
              disabled={saving}
              className="flex items-center gap-1.5 rounded-lg bg-nexus-cyan px-4 py-2 text-sm font-medium text-white transition hover:bg-nexus-cyan-bright disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {saving ? "Saving..." : "Update Status"}
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
