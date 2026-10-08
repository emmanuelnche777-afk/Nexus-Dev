"use client";

import { useCallback, useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Mail, Phone, Save, X, User } from "lucide-react";


interface Student {
  id: string;
  studentCode?: string;
  fullName: string;
  email: string;
  phone: string;
  programSlug: string;
  cohortId?: string;
  registrationDate: string;
  status: string;
  paymentStatus: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  notificationDeliveries?: Array<{
    id: string;
    channel: string;
    status: string;
    recipient: string;
    attemptCount: number;
    error?: string | null;
    lastAttemptAt?: string | null;
    sentAt?: string | null;
    updatedAt: string;
  }>;
}

export default function StudentDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ edit?: string }>;
}) {
  const router = useRouter();
  const { id } = use(params);
  const { edit } = use(searchParams);
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    programSlug: "",
    cohortId: "",
    status: "",
    paymentStatus: "",
    notes: "",
  });

  const loadStudent = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/academy/students/${id}`);
      if (res.ok) {
        const data = await res.json();
        setStudent(data);
        setFormData({
          fullName: data.fullName,
          email: data.email,
          phone: data.phone,
          programSlug: data.programSlug,
          cohortId: data.cohortId || "",
          status: data.status,
          paymentStatus: data.paymentStatus,
          notes: data.notes || "",
        });
        if (edit === "1") setEditMode(true);
      }
    } catch (error) {
      console.error("Failed to load student:", error);
    } finally {
      setLoading(false);
    }
  }, [id, edit]);

  useEffect(() => {
    queueMicrotask(() => void loadStudent());
  }, [loadStudent]);

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/academy/students/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...formData }),
      });
      if (res.ok) {
        const updated = await res.json();
        setStudent(updated);
        setEditMode(false);
        if (edit === "1") {
          router.push("/admin/academy/students");
        }
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.error || "Failed to update student");
      }
    } catch (error) {
      console.error("Failed to save:", error);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="py-12 text-center">Loading student...</div>;
  }

  if (!student) {
    return (
      <div className="py-12 text-center">
        <p className="text-nexus-navy">Student not found</p>
        <Link href="/admin/academy/students" className="mt-4 inline-block text-nexus-cyan hover:underline">
          Back to students
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/academy/students" className="rounded-md p-2 text-nexus-navy hover:bg-nexus-navy/5">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-nexus-navy">{student.fullName}</h1>
          <p className="mt-1 text-sm text-nexus-navy/70">
            Code: <span className="font-mono font-bold text-nexus-cyan">{student.studentCode || "—"}</span>
          </p>
        </div>
        {!editMode && (
          <button
            onClick={() => setEditMode(true)}
            className="rounded-lg border border-nexus-navy/10 px-4 py-2 text-sm font-medium hover:bg-nexus-navy/5"
          >
            Edit
          </button>
        )}
      </div>

      <section className="rounded-xl border border-nexus-navy/10 bg-white p-6">
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-nexus-navy/60">
          Student Details
        </h3>
        {editMode ? (
          <div className="space-y-4">
            {[
              { key: "fullName", label: "Full Name", type: "text" },
              { key: "email", label: "Email", type: "email" },
              { key: "phone", label: "Phone", type: "tel" },
              { key: "programSlug", label: "Program", type: "text" },
              { key: "status", label: "Status", type: "select", options: ["Pending", "Active", "Completed", "Suspended"] },
              { key: "paymentStatus", label: "Payment Status", type: "select", options: ["Pending", "Processing", "Requires Verification", "Paid"] },
              { key: "notes", label: "Notes", type: "textarea" },
            ].map((field) => (
              <div key={field.key}>
                <label className="block text-sm font-medium text-nexus-navy">{field.label}</label>
                {field.type === "select" ? (
                  <select
                    value={formData[field.key as keyof typeof formData]}
                    onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-nexus-navy/10 px-3 py-2 text-sm focus:border-nexus-cyan focus:outline-none"
                  >
                    {field.options?.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                ) : field.type === "textarea" ? (
                  <textarea
                    rows={3}
                    value={formData[field.key as keyof typeof formData]}
                    onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-nexus-navy/10 px-3 py-2 text-sm focus:border-nexus-cyan focus:outline-none"
                  />
                ) : (
                  <input
                    type={field.type}
                    value={formData[field.key as keyof typeof formData]}
                    onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-nexus-navy/10 px-3 py-2 text-sm focus:border-nexus-cyan focus:outline-none"
                  />
                )}
              </div>
            ))}
            <div className="flex gap-3 pt-2">
              <button onClick={handleSave} disabled={saving}
                className="flex items-center gap-1.5 rounded-lg bg-nexus-cyan px-4 py-2 text-sm font-medium text-white hover:bg-nexus-cyan-bright disabled:opacity-50">
                <Save className="h-4 w-4" /> {saving ? "Saving..." : "Save"}
              </button>
              <button onClick={() => setEditMode(false)}
                className="flex items-center gap-1.5 rounded-lg border border-nexus-navy/10 px-4 py-2 text-sm font-medium hover:bg-nexus-navy/5">
                <X className="h-4 w-4" /> Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {[
              { icon: User, label: "Full Name", value: student.fullName },
              { icon: Mail, label: "Email", value: student.email },
              { icon: Phone, label: "Phone", value: student.phone },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-3">
                <item.icon className="h-4 w-4 text-nexus-navy/50" />
                <div>
                  <p className="text-xs text-nexus-navy/50">{item.label}</p>
                  <p className="text-sm font-medium text-nexus-navy">{item.value}</p>
                </div>
              </div>
            ))}
            <div>
              <p className="text-xs text-nexus-navy/50">Student Code</p>
              <p className="text-sm font-mono font-bold text-nexus-cyan">{student.studentCode || "Not yet assigned"}</p>
            </div>
            <div>
              <p className="text-xs text-nexus-navy/50">Program</p>
              <p className="text-sm font-medium text-nexus-navy">{student.programSlug}</p>
            </div>
            <div>
              <p className="text-xs text-nexus-navy/50">Status</p>
              <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                student.status === "Active" ? "bg-green-100 text-green-700" :
                student.status === "Completed" ? "bg-blue-100 text-blue-700" :
                student.status === "Suspended" ? "bg-red-100 text-red-700" :
                "bg-amber-100 text-amber-700"
              }`}>
                {student.status}
              </span>
            </div>
            <div>
              <p className="text-xs text-nexus-navy/50">Payment Status</p>
              <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                student.paymentStatus === "Paid" ? "bg-green-100 text-green-700" :
                student.paymentStatus === "Processing" ? "bg-blue-100 text-blue-700" :
                student.paymentStatus === "Requires Verification" ? "bg-orange-100 text-orange-700" :
                "bg-gray-100 text-gray-700"
              }`}>
                {student.paymentStatus}
              </span>
            </div>
            {student.notes && (
              <div>
                <p className="text-xs text-nexus-navy/50">Notes</p>
                <p className="text-sm text-nexus-navy">{student.notes}</p>
              </div>
            )}
          </div>
        )}
      </section>

      <section className="rounded-xl border border-nexus-navy/10 bg-white p-6">
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-nexus-navy/60">Welcome message delivery</h3>
        {student.notificationDeliveries?.length ? (
          <div className="space-y-3">
            {student.notificationDeliveries.map((delivery) => (
              <div key={delivery.id} className="flex flex-wrap items-start justify-between gap-2 rounded-lg border border-nexus-navy/10 p-3">
                <div>
                  <p className="font-medium capitalize text-nexus-navy">{delivery.channel} · {delivery.status.replaceAll("_", " ")}</p>
                  <p className="text-xs text-nexus-navy/60">To {delivery.recipient || "no valid recipient"} · {delivery.attemptCount} attempt(s)</p>
                  {delivery.error && <p className="mt-1 text-xs text-red-700">{delivery.error}</p>}
                </div>
                <p className="text-xs text-nexus-navy/50">
                  {delivery.sentAt ? `Sent ${new Date(delivery.sentAt).toLocaleString()}` : delivery.lastAttemptAt ? `Last attempt ${new Date(delivery.lastAttemptAt).toLocaleString()}` : "Not sent"}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-nexus-navy/55">No welcome email or WhatsApp attempts recorded.</p>
        )}
      </section>
    </div>
  );
}
