"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AdminModal from "@/components/admin/AdminModal";
import { Users, Loader2, Search, Mail, MessageCircle, Send } from "lucide-react";

interface Student {
  id: string;
  studentCode?: string;
  fullName: string;
  email: string;
  phone: string;
  programSlug: string;
  location?: string;
  status: string;
  paymentStatus?: string;
  createdAt: string;
  notificationDeliveries?: Array<{
    channel: string;
    status: string;
    attemptCount: number;
    error?: string | null;
    sentAt?: string | null;
    updatedAt: string;
  }>;
}

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showClearModal, setShowClearModal] = useState(false);
  const [clearPhrase, setClearPhrase] = useState("");
  const [clearing, setClearing] = useState(false);
  const [notifying, setNotifying] = useState(false);
  const [testEmailSending, setTestEmailSending] = useState(false);
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [sendingStudentIds, setSendingStudentIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadStudents();
  }, []);

  async function loadStudents() {
    try {
      const response = await fetch("/api/admin/academy/students");
      if (!response.ok) throw new Error("Failed to load students");
      const data = await response.json();
      setStudents(data.students);
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Failed to load students");
    } finally {
      setLoading(false);
    }
  }

  async function clearStudents() {
    if (clearPhrase !== "DELETE ALL") return;
    setClearing(true);
    try {
      const response = await fetch("/api/admin/academy/clear-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entity: "students", confirm: "DELETE ALL" }),
      });
      if (!response.ok) throw new Error("Failed to clear students");
      setStudents([]);
      setShowClearModal(false);
      setClearPhrase("");
    } finally {
      setClearing(false);
    }
  }

  async function sendSelectedStudents() {
    const selected = filteredStudents.filter((student) => selectedStudentIds.includes(student.id));
    if (!selected.length) return;
    const recipientPreview = selected.map((student) => `${student.fullName} — ${student.email || "no email"} — ${student.phone || "no phone"}`).join("\n");
    if (!window.confirm(
      `Send the welcome email and WhatsApp to these ${selected.length} selected active, paid student(s)?\nAlready-sent channels will be skipped; failed or skipped channels can be retried.\n\n${recipientPreview}`
    )) return;
    setNotifying(true);
    try {
      const res = await fetch("/api/admin/academy/students/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentIds: selected.map((student) => student.id) }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        alert(data.error || "Failed to notify students");
      } else {
        alert(`Channel results across the selected students: ${data.counts?.sent || 0} sent, ${data.counts?.failed || 0} failed, ${data.counts?.skipped || 0} skipped, ${data.counts?.alreadySent || 0} already sent.`);
        setSelectedStudentIds([]);
        await loadStudents();
      }
    } catch (error) {
      console.error("Failed to notify students:", error);
      alert("Failed to notify students");
    } finally {
      setNotifying(false);
    }
  }

  async function sendWelcomeToStudent(student: Student) {
    if (!window.confirm(`Send the welcome email and WhatsApp to ${student.fullName} at the saved email and phone? Previously sent channels will not be resent.`)) return;
    setSendingStudentIds((current) => [...current, student.id]);
    try {
      const res = await fetch("/api/admin/academy/students/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentIds: [student.id] }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) alert(data.error || "Failed to send welcome message");
      else {
        const delivery = data.deliveries?.[0];
        alert(`Email: ${delivery?.email?.status || "unknown"}. WhatsApp: ${delivery?.whatsapp?.status || "unknown"}.`);
        await loadStudents();
      }
    } catch {
      alert("Failed to send welcome message");
    } finally {
      setSendingStudentIds((current) => current.filter((id) => id !== student.id));
    }
  }

  async function sendTestEmailToMe() {
    if (!window.confirm("Send a clearly marked TEST welcome email to your signed-in admin email only? No student will be contacted.")) return;
    setTestEmailSending(true);
    try {
      const res = await fetch("/api/admin/academy/students/notifications/test", { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (data.status === "sent") alert(`Test email sent to ${data.recipient}.`);
      else if (data.status === "skipped") alert(`Test email skipped: ${data.reason || "Resend is not configured."}`);
      else alert(`Test email failed: ${data.error || "Check the saved delivery log for details."}`);
    } catch {
      alert("Failed to send the test email.");
    } finally {
      setTestEmailSending(false);
    }
  }

  function toggleStudentSelection(studentId: string, checked: boolean) {
    setSelectedStudentIds((current) => {
      if (checked) return current.includes(studentId) || current.length >= 10 ? current : [...current, studentId];
      return current.filter((id) => id !== studentId);
    });
  }

  // Update modal text as well to match

  if (loading) return <p className="py-12 text-center">Loading...</p>;
  if (error) return <p className="py-12 text-center text-red-500">Error: {error}</p>;

  const filteredStudents = students.filter((s) => {
    const q = searchQuery.toLowerCase();
    return (
      !q ||
      s.fullName.toLowerCase().includes(q) ||
      s.email.toLowerCase().includes(q) ||
      s.phone?.toLowerCase().includes(q) ||
      s.studentCode?.toLowerCase().includes(q)
    );
  });

  const stats = {
    total: filteredStudents.length,
    registered: filteredStudents.filter((s) => s.status === "Registered").length,
    pending: filteredStudents.filter((s) => s.status === "Pending").length,
    active: filteredStudents.filter((s) => s.status === "Active").length,
  };

  return (
    <div className="bg-nexus-white p-6 rounded-lg border border-nexus-navy/10">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-nexus-navy">
          Student Management
        </h2>
        <div className="flex gap-2">
          <button
            onClick={sendTestEmailToMe}
            disabled={testEmailSending}
            className="flex items-center gap-2 rounded-lg border border-nexus-cyan/30 px-4 py-2 font-medium text-nexus-cyan hover:bg-nexus-cyan/5 text-sm transition disabled:opacity-50"
            title="Send a sample welcome message only to your signed-in admin email"
          >
            <Mail className="h-4 w-4" />
            {testEmailSending ? "Sending test..." : "Send Test to Me"}
          </button>
          <button
            onClick={sendSelectedStudents}
            disabled={notifying || selectedStudentIds.length === 0}
            className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 font-medium text-white hover:bg-emerald-700 text-sm transition disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
            {notifying ? "Sending..." : `Send to Selected (${selectedStudentIds.length})`}
          </button>
          <button
            onClick={() => setShowClearModal(true)}
            className="rounded-lg border border-red-500 bg-red-50 px-4 py-2 font-medium text-red-600 hover:bg-red-100 text-sm transition"
          >
            Clear Data
          </button>
          <Link
            href="/admin/academy/students/new"
            className="bg-nexus-cyan text-nexus-dark px-4 py-2 rounded-lg font-medium text-sm transition hover:bg-nexus-cyan-bright"
          >
            <Users className="h-4 w-4 mr-2" /> Register New Student
          </Link>
        </div>
      </div>

      <AdminModal
        open={showClearModal}
        onClose={() => {
          setShowClearModal(false);
          setClearPhrase("");
        }}
        title="Clear Student Data"
      >
        <div className="space-y-4">
          <p className="text-sm text-nexus-navy">
            This action will permanently delete ALL student records on this page. This cannot be undone.
          </p>
          <p className="text-sm font-bold text-red-600">
            Type DELETE ALL to confirm:
          </p>
          <input
            type="text"
            className="w-full rounded-lg border border-nexus-navy/10 px-3 py-2 text-sm focus:border-red-500 focus:outline-none"
            value={clearPhrase}
            onChange={(e) => setClearPhrase(e.target.value)}
          />
          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => {
                setShowClearModal(false);
                setClearPhrase("");
              }}
              className="rounded-lg border border-nexus-navy/10 px-4 py-2 text-sm font-medium hover:bg-nexus-navy/5"
            >
              Cancel
            </button>
            <button
              onClick={clearStudents}
              disabled={clearPhrase !== "DELETE ALL" || clearing}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              {clearing ? "Clearing..." : "Confirm Delete"}
            </button>
          </div>
        </div>
      </AdminModal>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-nexus-navy/40" />
        <input
          type="text"
          placeholder="Search by name, email, phone, or student code..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-lg border border-nexus-navy/10 bg-white py-2.5 pl-10 pr-4 text-sm text-nexus-navy placeholder:text-nexus-navy/40 focus:border-nexus-cyan focus:outline-none"
        />
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className="rounded-xl border border-nexus-navy/10 bg-white p-4">
          <div className="text-2xl font-bold text-nexus-cyan">{stats.total}</div>
          <p className="text-sm text-nexus-navy">Total</p>
        </div>
        <div className="rounded-xl border border-nexus-navy/10 bg-white p-4">
          <div className="text-2xl font-bold text-emerald-600">{stats.registered}</div>
          <p className="text-xs text-nexus-navy">Registered</p>
        </div>
        <div className="rounded-xl border border-nexus-navy/10 bg-white p-4">
          <div className="text-2xl font-bold text-amber-600">{stats.pending}</div>
          <p className="text-xs text-nexus-navy">Pending</p>
        </div>
        <div className="rounded-xl border border-nexus-navy/10 bg-white p-4">
          <div className="text-2xl font-bold text-blue-600">{stats.active}</div>
          <p className="text-xs text-nexus-navy">Active</p>
        </div>
      </div>

      {/* Students Table */}
      <div className="overflow-x-auto">
        <p className="mb-2 text-xs text-nexus-navy/55">Select up to 10 active, paid students for a reviewed batch send. Already-sent channels are protected from duplicates.</p>
        <table className="w-full rounded-lg border border-nexus-navy/10">
          <thead>
            <tr className="border-b border-nexus-navy/10">
              <th className="px-3 py-3"><input
                type="checkbox"
                aria-label="Select up to 10 eligible students shown"
                checked={filteredStudents.filter((student) => student.status === "Active" && student.paymentStatus === "Paid").length > 0 && filteredStudents.filter((student) => student.status === "Active" && student.paymentStatus === "Paid").slice(0, 10).every((student) => selectedStudentIds.includes(student.id))}
                onChange={(event) => {
                  const eligible = filteredStudents.filter((student) => student.status === "Active" && student.paymentStatus === "Paid").slice(0, 10);
                  setSelectedStudentIds(event.target.checked ? eligible.map((student) => student.id) : []);
                }}
              /></th>
              <th className="text-left text-sm font-medium text-nexus-navy px-6 py-3">Name</th>
              <th className="text-left text-sm font-medium text-nexus-navy px-6 py-3">Email</th>
              <th className="text-left text-sm font-medium text-nexus-navy px-6 py-3">Program</th>
              <th className="text-left text-sm font-medium text-nexus-navy px-6 py-3">Status</th>
              <th className="text-left text-sm font-medium text-nexus-navy px-6 py-3">Welcome delivery</th>
              <th className="text-left text-sm font-medium text-nexus-navy px-6 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.map((student) => (
              <tr key={student.id} className="border-b border-nexus-navy/15 hover:bg-nexus-gray/50">
                <td className="px-3 py-4"><input
                  type="checkbox"
                  aria-label={`Select ${student.fullName}`}
                  checked={selectedStudentIds.includes(student.id)}
                  disabled={!(student.status === "Active" && student.paymentStatus === "Paid") || (!selectedStudentIds.includes(student.id) && selectedStudentIds.length >= 10)}
                  onChange={(event) => toggleStudentSelection(student.id, event.target.checked)}
                /></td>
                <td className="text-nexus-navy/80 px-6 py-4">
                  {student.fullName}
                </td>
                <td className="text-nexus-navy/80 px-6 py-4">
                  {student.email}
                </td>
                <td className="text-nexus-navy/80 px-6 py-4">
                  {student.programSlug}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                      student.status === "Registered"
                        ? "bg-nexus-cyan/10 text-nexus-cyan"
                        : student.status === "Pending"
                        ? "bg-amber/10 text-amber-600"
                        : student.status === "Active"
                        ? "bg-emerald-100 text-emerald-600"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {student.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-xs text-nexus-navy/65">
                  <p><Mail className="mr-1 inline h-3 w-3" />{student.notificationDeliveries?.find((item) => item.channel === "email")?.status || "not sent"}</p>
                  <p><MessageCircle className="mr-1 inline h-3 w-3" />{student.notificationDeliveries?.find((item) => item.channel === "whatsapp")?.status || "not sent"}</p>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => void sendWelcomeToStudent(student)}
                      disabled={sendingStudentIds.includes(student.id) || !(student.status === "Active" && student.paymentStatus === "Paid")}
                      className="text-emerald-700 text-sm hover:underline disabled:opacity-40"
                    >
                      {sendingStudentIds.includes(student.id) ? <Loader2 className="inline h-4 w-4 animate-spin" /> : "Send / Retry"}
                    </button>
                    <Link
                      href={`/admin/academy/students/${student.id}`}
                      className="text-nexus-cyan text-sm hover:underline"
                    >
                      Edit
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredStudents.length === 0 && (
          <p className="py-10 text-center text-sm text-nexus-navy/50">
            {searchQuery ? "No students match your search." : "No students registered yet."}
          </p>
        )}
      </div>
    </div>
  );
}
