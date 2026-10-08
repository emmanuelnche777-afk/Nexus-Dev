"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Briefcase,
  FileText,
  Mail,
  Paperclip,
  Phone,
  Save,
  Send,
  MessageSquare,
} from "lucide-react";
import LoadingState from "@/components/admin/LoadingState";

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

interface Application {
  id: string;
  opportunityId: string;
  fullName: string;
  email: string;
  phone: string | null;
  message: string | null;
  documentUrls: string[];
  status: string;
  adminNotes: string | null;
  responseMessage: string | null;
  respondedAt: string | null;
  reviewedAt: string | null;
  ownerId: string | null;
  ownerAssignedAt: string | null;
  owner: { id: string; name: string; role: string } | null;
  sla: SlaResult;
  createdAt: string;
  opportunity: {
    id: string;
    title: string;
    type: string;
    status: string;
    location: string | null;
    deadline: string | null;
  };
}

const STATUSES = ["NEW", "UNDER_REVIEW", "MATCHED", "NOT_A_FIT"] as const;

const STATUS_STYLES: Record<string, string> = {
  NEW: "bg-amber-100 text-amber-700",
  UNDER_REVIEW: "bg-blue-100 text-blue-700",
  MATCHED: "bg-emerald-100 text-emerald-700",
  NOT_A_FIT: "bg-red-100 text-red-700",
}

/** Starting points for the two response outcomes. Both stay fully editable. */
const TEMPLATES: Record<string, { label: string; subject: string; body: string }> = {
  MATCHED: {
    label: "Matched — next steps",
    subject: "Good news — we would like to proceed",
    body: `Thank you for applying. After reviewing your application we would like to move forward with you.

Next steps:
1. A short call to introduce you to the team.
2. A practical task so we can align on expectations.
3. Confirmation of timelines and logistics.

Please let us know your availability and we will schedule.`,
  },
  NOT_A_FIT: {
    label: "Thank you — not a fit",
    subject: "Update on your application",
    body: `Thank you for taking the time to apply and for sharing your details with us.

After careful review we are not able to take this further on the current occasion. This is not a reflection of your abilities — it is usually a matter of fit with what this particular role needs right now.

We would genuinely welcome you applying again for a future opening.`,
  },
};

function documentName(url: string, index: number): string {
  const base = url.split("/").pop() || `document-${index + 1}`;
  try {
    // Stored names are `${timestamp}-${originalName}`; the timestamp is an
    // internal ordering aid and only makes the label harder to read.
    return decodeURIComponent(base).replace(/^\d+-/, "");
  } catch {
    return base.replace(/^\d+-/, "");
  }
}

export default function OpportunityApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [status, setStatus] = useState("NEW");
  const [adminNotes, setAdminNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

   const [responseMessage, setResponseMessage] = useState("");
   const [respondStatus, setRespondStatus] = useState<"MATCHED" | "NOT_A_FIT">(
     "MATCHED"
   );
   const [responding, setResponding] = useState(false);
   const [respondError, setRespondError] = useState<string | null>(null);
   const [respondResult, setRespondResult] = useState<string | null>(null);

   const [assignees, setAssignees] = useState<OwnerSummary[]>([]);
   const [assigning, setAssigning] = useState(false);
   const [assignError, setAssignError] = useState<string | null>(null);

   useEffect(() => {
     loadAssignees();
   }, []);

   async function loadAssignees() {
     try {
       const res = await fetch("/api/admin/opportunity-applications/assignees");
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
       const res = await fetch(`/api/admin/opportunity-applications/${id}`, {
         method: "PATCH",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({ ownerId }),
       });
       const data = await res.json();
       if (!res.ok) {
         setAssignError(data.error || "Failed to update owner");
         return;
       }
       await loadApplication();
     } catch {
       setAssignError("Failed to update owner. Please try again.");
     } finally {
       setAssigning(false);
     }
   }

  async function loadApplication() {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/opportunity-applications/${id}`, {
        cache: "no-store",
      });
      if (res.status === 404) {
        setNotFound(true);
        return;
      }
      const data = await res.json();
      const record: Application = data.application;
      setApplication(record);
      setStatus(record.status);
      setAdminNotes(record.adminNotes || "");
    } catch (error) {
      console.error("Failed to load application:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    setSaveError(null);
    try {
      const res = await fetch(`/api/admin/opportunity-applications/${id}`, {
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
      await loadApplication();
    } catch (error) {
      console.error("Failed to save application:", error);
      setSaveError("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  function applyTemplate(outcome: "MATCHED" | "NOT_A_FIT") {
    setRespondStatus(outcome);
    const template = TEMPLATES[outcome];
    const name = application?.fullName ? `\n\nHi ${application.fullName},` : "";
    setResponseMessage(`Hi${name},\n\n${template.body}`);
  }

  async function handleRespond() {
    setResponding(true);
    setRespondError(null);
    setRespondResult(null);
    try {
      const res = await fetch(`/api/admin/opportunity-applications/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: responseMessage, status: respondStatus }),
      });
      const data = await res.json();
      if (!res.ok) {
        setRespondError(data.error || "Failed to send response");
        return;
      }
      setRespondResult(data.delivery || "Response recorded.");
      setResponseMessage("");
      await loadApplication();
    } catch (error) {
      console.error("Failed to respond:", error);
      setRespondError("Failed to send response. Please try again.");
    } finally {
      setResponding(false);
    }
  }

  if (loading) return <LoadingState label="Loading application..." />;

  if (notFound || !application) {
    return (
      <div className="py-12 text-center">
        <p className="text-nexus-navy">Application not found</p>
        <Link
          href="/admin/opportunity-applications"
          className="mt-4 inline-block text-nexus-cyan hover:underline"
        >
          Back to applications
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/opportunity-applications"
          className="rounded-md p-2 text-nexus-navy/60 hover:bg-nexus-navy/5"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-nexus-navy">
            {application.fullName}
          </h1>
          <p className="mt-1 flex items-center gap-2 text-sm text-nexus-navy/70">
            <Briefcase className="h-4 w-4 text-orange-500" />
            {application.opportunity.title}
            <span className="font-mono text-xs text-nexus-navy/40">
              {application.id}
            </span>
          </p>
        </div>
        <span
          className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
            STATUS_STYLES[application.status] || "bg-gray-100 text-gray-700"
          }`}
        >
          {application.status}
        </span>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Submitted information — read only */}
        <div className="space-y-6 lg:col-span-2">
          <section className="rounded-xl border border-nexus-navy/10 bg-white p-6">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-nexus-navy/60">
              Applicant
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-nexus-navy/50" />
                <div>
                  <p className="text-xs text-nexus-navy/50">Email</p>
                  <a
                    href={`mailto:${application.email}`}
                    className="text-sm font-medium text-nexus-cyan hover:underline"
                  >
                    {application.email}
                  </a>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-nexus-navy/50" />
                <div>
                  <p className="text-xs text-nexus-navy/50">Phone</p>
                  <p className="text-sm font-medium text-nexus-navy">
                    {application.phone || "Not provided"}
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-xl border border-nexus-navy/10 bg-white p-6">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-nexus-navy/60">
              Cover Message
            </h3>
            <p className="whitespace-pre-wrap leading-relaxed text-sm text-nexus-navy">
              {application.message || "—"}
            </p>
          </section>

          <section className="rounded-xl border border-nexus-navy/10 bg-white p-6">
            <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-nexus-navy/60">
              <Paperclip className="h-4 w-4" />
              Uploaded Documents
            </h3>
            {application.documentUrls.length === 0 ? (
              <p className="text-sm text-nexus-navy/60">
                No documents were attached to this application.
              </p>
            ) : (
              <ul className="space-y-2">
                {application.documentUrls.map((url, i) => (
                  <li key={url}>
                    <a
                      // Documents are private: they are not reachable by their
                      // stored URL. This endpoint checks the admin's permission
                      // and listing scope, then redirects to a short-lived signed
                      // URL or streams the file.
                      href={`/api/admin/opportunity-applications/${application.id}/documents/${i}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 rounded-lg border border-nexus-navy/10 px-3 py-2 text-sm text-nexus-cyan transition hover:bg-nexus-navy/5"
                    >
                      <FileText className="h-4 w-4 shrink-0" />
                      <span className="truncate">
                        {documentName(url, i)}
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        {/* Admin controls */}
        <div className="space-y-6">
          <section className="rounded-xl border border-nexus-navy/10 bg-white p-6">
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
                  onChange={(e) => setStatus(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-nexus-navy/10 px-3 py-2 text-sm focus:border-nexus-cyan focus:outline-none"
                >
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
                  <dt>Applied</dt>
                  <dd>{new Date(application.createdAt).toLocaleString()}</dd>
                </div>
                <div className="flex justify-between">
                  <dt>Reviewed at</dt>
                  <dd>
                    {application.reviewedAt
                      ? new Date(application.reviewedAt).toLocaleString()
                      : "—"}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt>Time in stage</dt>
                  <dd
                    className={
                      application.sla.overdue ? "font-medium text-red-600" : undefined
                    }
                  >
                    {application.sla.ageHours != null
                      ? `${application.sla.ageHours}h of ${application.sla.targetHours ?? "?"}h`
                      : application.sla.state === "done"
                        ? "Complete"
                        : "—"}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt>Responded at</dt>
                  <dd>
                    {application.respondedAt
                      ? new Date(application.respondedAt).toLocaleString()
                      : "—"}
                  </dd>
                </div>
              </dl>
            </div>
          </section>

          {assignees.length > 0 && (
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
                    value={application.ownerId || ""}
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
                  {application.ownerAssignedAt
                    ? `Claimed ${new Date(application.ownerAssignedAt).toLocaleString()}`
                    : "Not yet claimed by anyone."}
                </p>
              </div>
            </section>
          )}

          <section className="rounded-xl border border-nexus-navy/10 bg-white p-6">
            <h3 className="mb-1 text-sm font-semibold uppercase tracking-wide text-nexus-navy/60">
              Respond
            </h3>
            <p className="mb-4 text-xs text-nexus-navy/60">
              Sends by email{application.phone ? " and WhatsApp" : ""} and sets
              the status you choose.
            </p>
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {(Object.keys(TEMPLATES) as ("MATCHED" | "NOT_A_FIT")[]).map(
                  (outcome) => (
                    <button
                      key={outcome}
                      type="button"
                      onClick={() => applyTemplate(outcome)}
                      className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                        respondStatus === outcome
                          ? "bg-nexus-navy text-white"
                          : "border border-nexus-navy/10 bg-white text-nexus-navy hover:bg-nexus-navy/5"
                      }`}
                    >
                      {TEMPLATES[outcome].label}
                    </button>
                  )
                )}
              </div>
              <textarea
                rows={8}
                value={responseMessage}
                onChange={(e) => setResponseMessage(e.target.value)}
                placeholder="Write your reply to the applicant..."
                className="w-full rounded-lg border border-nexus-navy/10 px-3 py-2 text-sm focus:border-nexus-cyan focus:outline-none"
              />
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
                disabled={responding || !responseMessage.trim()}
                className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-nexus-navy px-4 py-2 text-sm font-medium text-white transition hover:bg-nexus-navy-deep disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
                {responding ? "Sending..." : `Send & mark ${respondStatus}`}
              </button>
            </div>
            {application.responseMessage && (
              <div className="mt-4 border-t border-nexus-navy/10 pt-4">
                <p className="flex items-center gap-1.5 text-xs font-semibold text-nexus-navy/60">
                  <MessageSquare className="h-3.5 w-3.5" />
                  Last response sent
                </p>
                <p className="mt-1.5 whitespace-pre-wrap text-sm text-nexus-navy/70">
                  {application.responseMessage}
                </p>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}