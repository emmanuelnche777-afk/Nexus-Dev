"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Mail,
  Phone,
  Save,
  Send,
  MessageSquare,
  UserPlus,
} from "lucide-react";
import LoadingState from "@/components/admin/LoadingState";
import { hasPermission } from "@/lib/permissions";
import { PERMISSIONS, type AdminRole } from "@/lib/permissions-data";
import {
  type PathwayDetailRow,
} from "@/lib/join-us-pathways";

interface OwnerSummary {
  id: string;
  name: string;
  role: string;
}

interface SlaResult {
  state: string;
  ageHours: number | null;
  targetHours: number | null;
  overdue: boolean;
}

interface Inquiry {
  id: string;
  pathway: string;
  pathwayLabel: string;
  fullName: string;
  email: string;
  phone: string | null;
  status: string;
  adminNotes: string | null;
  responseMessage: string | null;
  respondedAt: string | null;
  reviewedAt: string | null;
  ownerId: string | null;
  ownerAssignedAt: string | null;
  owner: OwnerSummary | null;
  sla: SlaResult;
  createdAt: string;
  detailRows: PathwayDetailRow[];
}

const STATUSES = ["NEW", "REVIEWED"] as const;

const STATUS_STYLES: Record<string, string> = {
  NEW: "bg-amber-100 text-amber-700",
  REVIEWED: "bg-blue-100 text-blue-700",
  RESPONDED: "bg-emerald-100 text-emerald-700",
};

export default function JoinerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [inquiry, setInquiry] = useState<Inquiry | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [status, setStatus] = useState("NEW");
  const [adminNotes, setAdminNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [responseMessage, setResponseMessage] = useState("");
  const [sendSmsToo, setSendSmsToo] = useState(false);
  const [responding, setResponding] = useState(false);
  const [respondError, setRespondError] = useState<string | null>(null);
  const [respondResult, setRespondResult] = useState<string | null>(null);

  const [assignees, setAssignees] = useState<OwnerSummary[]>([]);
  const [assigning, setAssigning] = useState(false);
  const [assignError, setAssignError] = useState<string | null>(null);
  const [canTriage, setCanTriage] = useState(false);
  const [canRespond, setCanRespond] = useState(false);

  useEffect(() => {
    loadPermissions();
    loadAssignees();
  }, []);

  async function loadPermissions() {
    try {
      const res = await fetch("/api/admin/session", { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();
      const role = data.user?.role;
      if (typeof role !== "string") return;
      const adminRole = role as AdminRole;
      setCanTriage(hasPermission(adminRole, PERMISSIONS.PATHWAY_INQUIRIES_TRIAGE));
      setCanRespond(hasPermission(adminRole, PERMISSIONS.PATHWAY_INQUIRIES_RESPOND));
    } catch {
      // Keep controls hidden unless the signed-in role can be confirmed.
    }
  }

  async function loadAssignees() {
    try {
      const res = await fetch("/api/admin/joiners/assignees");
      if (res.status === 403) return; // read-only role: no picker, no error noise
      const data = await res.json();
      setAssignees(data.assignees || []);
    } catch {
      // Non-fatal: the record still displays, just without assignment.
    }
  }

  async function handleAssign(ownerId: string) {
    setAssigning(true);
    setAssignError(null);
    try {
      const res = await fetch(`/api/admin/joiners/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ownerId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setAssignError(data.error || "Failed to update owner");
        return;
      }
      await loadInquiry();
    } catch {
      setAssignError("Failed to update owner. Please try again.");
    } finally {
      setAssigning(false);
    }
  }

  useEffect(() => {
    loadInquiry();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function loadInquiry() {
    setLoading(true);
    setLoadError(null);
    setNotFound(false);
    try {
      const res = await fetch(`/api/admin/joiners/${id}`, { cache: "no-store" });
      const data = await res.json().catch(() => ({}));
      if (res.status === 404) {
        setNotFound(true);
        setInquiry(null);
        return;
      }
      if (!res.ok) throw new Error(data.error || "Could not load this inquiry.");
      if (!data.inquiry) throw new Error("The inquiry response was incomplete. Please try again.");
      const record: Inquiry = data.inquiry;
      setInquiry(record);
      setStatus(record.status);
      setAdminNotes(record.adminNotes || "");
    } catch (error) {
      console.error("Failed to load inquiry:", error);
      setLoadError(error instanceof Error ? error.message : "Could not load this inquiry.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    setSaveError(null);
    try {
      const res = await fetch(`/api/admin/joiners/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, adminNotes }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSaveError(data.error || "Failed to save");
        return;
      }
      setAdminNotes(data.adminNotes || "");
      await loadInquiry();
    } catch (error) {
      console.error("Failed to save inquiry:", error);
      setSaveError("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handleRespond() {
    setResponding(true);
    setRespondError(null);
    setRespondResult(null);
    try {
      const res = await fetch(`/api/admin/joiners/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: responseMessage, sendSms: sendSmsToo }),
      });
      const data = await res.json();
      if (!res.ok) {
        setRespondError(data.error || "Failed to send response");
        return;
      }
      if (!data.sent) {
        setRespondError(data.delivery || "No delivery was confirmed. Your draft is still here so you can retry.");
        return;
      }
      setRespondResult(`${data.delivery || "At least one delivery channel confirmed the response."}${data.smsStatus === "queued" ? " SMS queued through TextBee." : data.smsStatus === "failed" ? " SMS failed; check Notifications." : data.smsStatus === "skipped" ? " SMS was skipped because no provider is configured." : ""}`);
      setResponseMessage("");
      await loadInquiry();
    } catch (error) {
      console.error("Failed to respond:", error);
      setRespondError("Failed to send response. Please try again.");
    } finally {
      setResponding(false);
    }
  }

  if (loading) return <LoadingState label="Loading inquiry..." />;

  if (notFound) {
    return (
      <div className="py-12 text-center">
        <p className="text-nexus-navy">Inquiry not found</p>
        <Link href="/admin/joiners" className="mt-4 inline-block text-nexus-cyan hover:underline">
          Back to joiners
        </Link>
      </div>
    );
  }

  if (loadError || !inquiry) {
    return (
      <div className="mx-auto max-w-xl rounded-xl border border-red-200 bg-red-50 p-6 text-center">
        <p role="alert" className="text-sm text-red-700">
          {loadError || "The inquiry could not be loaded."}
        </p>
        <button
          type="button"
          onClick={() => void loadInquiry()}
          className="mt-4 rounded-lg bg-nexus-navy px-4 py-2 text-sm font-medium text-white hover:bg-nexus-navy-deep"
        >
          Try again
        </button>
        <Link href="/admin/joiners" className="ml-4 text-sm text-nexus-cyan hover:underline">
          Back to joiners
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/joiners"
          className="rounded-md p-2 text-nexus-navy/60 hover:bg-nexus-navy/5"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-nexus-navy">
            {inquiry.fullName}
          </h1>
          <p className="mt-1 flex items-center gap-2 text-sm text-nexus-navy/70">
            <UserPlus className="h-4 w-4 text-nexus-cyan" />
            {inquiry.pathwayLabel}
            <span className="font-mono text-xs text-nexus-navy/40">
              {inquiry.id}
            </span>
          </p>
        </div>
        <span
          className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
            STATUS_STYLES[inquiry.status] || "bg-gray-100 text-gray-700"
          }`}
        >
          {inquiry.status}
        </span>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Submitted information — read only */}
        <div className="space-y-6 lg:col-span-2">
          <section className="rounded-xl border border-nexus-navy/10 bg-white p-6">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-nexus-navy/60">
              Contact
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-nexus-navy/50" />
                <div>
                  <p className="text-xs text-nexus-navy/50">Email</p>
                  <a
                    href={`mailto:${inquiry.email}`}
                    className="text-sm font-medium text-nexus-cyan hover:underline"
                  >
                    {inquiry.email}
                  </a>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-nexus-navy/50" />
                <div>
                  <p className="text-xs text-nexus-navy/50">Phone</p>
                  <p className="text-sm font-medium text-nexus-navy">
                    {inquiry.phone || "Not provided"}
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-xl border border-nexus-navy/10 bg-white p-6">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-nexus-navy/60">
              Submitted Information ({inquiry.pathwayLabel})
            </h3>
            {inquiry.detailRows.length === 0 ? (
              <p className="text-sm text-nexus-navy/60">
                No pathway-specific fields were provided.
              </p>
            ) : (
              <dl className="space-y-4">
                {inquiry.detailRows.map((row) => (
                  <div key={row.key}>
                    <dt className="text-xs text-nexus-navy/50">{row.label}</dt>
                    <dd
                      className={`mt-1 text-sm text-nexus-navy ${
                        row.long ? "whitespace-pre-wrap leading-relaxed" : ""
                      }`}
                    >
                      {row.value || "—"}
                    </dd>
                  </div>
                ))}
              </dl>
            )}
            <p className="mt-5 border-t border-nexus-navy/10 pt-4 text-xs text-nexus-navy/50">
              Submitted{" "}
              {new Date(inquiry.createdAt).toLocaleString()} via the public Join
              Us page. These fields are applicant-provided and read-only.
            </p>
          </section>
        </div>

        {/* Admin controls */}
        <div className="space-y-6">
          {canTriage && <section className="rounded-xl border border-nexus-navy/10 bg-white p-6">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-nexus-navy/60">
              Review
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-nexus-navy">
                  Status
                </label>
                <select
                  value={status}
                  disabled={inquiry.status === "RESPONDED"}
                  onChange={(e) => setStatus(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-nexus-navy/10 px-3 py-2 text-sm focus:border-nexus-cyan focus:outline-none"
                >
                  {inquiry.status === "RESPONDED" && <option value="RESPONDED">RESPONDED</option>}
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-nexus-navy">
                  Internal Notes
                </label>
                <textarea
                  rows={4}
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Visible to admins only."
                  className="mt-1 w-full rounded-lg border border-nexus-navy/10 px-3 py-2 text-sm focus:border-nexus-cyan focus:outline-none"
                />
              </div>
              {saveError && (
                <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                  {saveError}
                </p>
              )}
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-nexus-cyan px-4 py-2 text-sm font-medium text-white transition hover:bg-nexus-cyan-bright disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                {saving ? "Saving..." : "Save"}
              </button>
              <dl className="space-y-1 border-t border-nexus-navy/10 pt-3 text-xs text-nexus-navy/50">
                <div className="flex justify-between">
                  <dt>Time in stage</dt>
                  <dd
                    className={
                      inquiry.sla.overdue ? "font-medium text-red-600" : undefined
                    }
                  >
                    {inquiry.sla.ageHours != null
                      ? `${inquiry.sla.ageHours}h of ${inquiry.sla.targetHours ?? "?"}h`
                      : inquiry.sla.state === "done"
                        ? "Complete"
                        : "—"}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt>Reviewed at</dt>
                  <dd>
                    {inquiry.reviewedAt
                      ? new Date(inquiry.reviewedAt).toLocaleString()
                      : "—"}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt>Responded at</dt>
                  <dd>
                    {inquiry.respondedAt
                      ? new Date(inquiry.respondedAt).toLocaleString()
                      : "—"}
                  </dd>
                </div>
              </dl>
            </div>
          </section>}

          {canTriage && assignees.length > 0 && (
            <section className="rounded-xl border border-nexus-navy/10 bg-white p-6">
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-nexus-navy/60">
                Ownership
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-nexus-navy">
                    Assigned to
                  </label>
                  <select
                    value={inquiry.ownerId || ""}
                    disabled={assigning}
                    onChange={(e) => handleAssign(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-nexus-navy/10 px-3 py-2 text-sm focus:border-nexus-cyan focus:outline-none disabled:opacity-50"
                  >
                    <option value="">Unassigned — shared queue</option>
                    {assignees.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name} ({a.role.replace(/_/g, " ").toLowerCase()})
                      </option>
                    ))}
                  </select>
                </div>
                {assignError && (
                  <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                    {assignError}
                  </p>
                )}
                <p className="text-xs text-nexus-navy/50">
                  {inquiry.ownerAssignedAt
                    ? `Claimed ${new Date(inquiry.ownerAssignedAt).toLocaleString()}`
                    : "Not yet claimed by anyone."}
                </p>
              </div>
            </section>
          )}

          {canRespond && <section className="rounded-xl border border-nexus-navy/10 bg-white p-6">
            <h3 className="mb-1 text-sm font-semibold uppercase tracking-wide text-nexus-navy/60">
              Respond
            </h3>
            <p className="mb-4 text-xs text-nexus-navy/60">
              Sends your message to the applicant by email
              {inquiry.phone ? " and WhatsApp" : ""}, then sets the status to
              RESPONDED.{inquiry.phone ? " Choose SMS below to also text the saved number; TextBee may use SIM airtime." : ""}
            </p>
            <div className="space-y-3">
              <textarea
                rows={6}
                value={responseMessage}
                onChange={(e) => setResponseMessage(e.target.value)}
                placeholder="Write your reply to the applicant..."
                className="w-full rounded-lg border border-nexus-navy/10 px-3 py-2 text-sm focus:border-nexus-cyan focus:outline-none"
              />
              {inquiry.phone && <label className="flex items-start gap-2 text-xs text-nexus-navy/70">
                <input type="checkbox" checked={sendSmsToo} onChange={(event) => setSendSmsToo(event.target.checked)} disabled={responseMessage.length > 1600 && !sendSmsToo} />
                <span>Also send this reply by SMS to {inquiry.phone} (may use SIM airtime; max 1,600 characters)</span>
              </label>}
              {sendSmsToo && responseMessage.length > 1600 && <p className="text-xs text-red-700">Shorten the reply to 1,600 characters or fewer to send it by SMS.</p>}
              {respondError && (
                <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                  {respondError}
                </p>
              )}
              {respondResult && (
                <p className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
                  {respondResult}
                </p>
              )}
              <button
                onClick={handleRespond}
                disabled={responding || !responseMessage.trim() || (sendSmsToo && responseMessage.length > 1600)}
                className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-nexus-navy px-4 py-2 text-sm font-medium text-white transition hover:bg-nexus-navy-deep disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
                {responding ? "Sending..." : "Send Response"}
              </button>
            </div>
            {inquiry.responseMessage && (
              <div className="mt-4 border-t border-nexus-navy/10 pt-4">
                <p className="flex items-center gap-1.5 text-xs font-semibold text-nexus-navy/60">
                  <MessageSquare className="h-3.5 w-3.5" />
                  Last response sent
                </p>
                <p className="mt-1.5 whitespace-pre-wrap text-sm text-nexus-navy/70">
                  {inquiry.responseMessage}
                </p>
              </div>
            )}
          </section>}
          {!canTriage && !canRespond && (
            <p className="rounded-lg border border-nexus-navy/10 bg-white p-4 text-sm text-nexus-navy/60">
              You can view this inquiry, but your role does not include update or response access.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
