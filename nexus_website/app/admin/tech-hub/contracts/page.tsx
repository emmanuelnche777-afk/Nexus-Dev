"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, FileText, Edit, Trash2, Plus, Search, Save, Eye, Download, Send as SendIcon, Archive, RotateCcw } from "lucide-react";
import LoadingState from "@/components/admin/LoadingState";
import EmptyState from "@/components/admin/EmptyState";
import AdminModal from "@/components/admin/AdminModal";
import SignaturePad from "@/components/SignaturePad";

interface Contract {
  id: string;
  orderId?: string | null;
  contractType: string;
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  company?: string;
  serviceType: string;
  serviceTypeKey: string;
  status: string;
  totalAmount?: number | null;
  currency?: string;
  bodyText: string;
  sentAt?: string;
  archivedAt?: string | null;
  signedAt?: string;
  signatureClientAt?: string | null;
  signatureTechHubAt?: string | null;
  signedPdfUrl?: string;
  pdfUrl?: string;
  createdAt: string;
  updatedAt: string;
  client?: {
    serviceType: string;
    serviceTypeKey: string;
    budget?: string | null;
    description?: string;
    status: string;
  } | null;
}

const CONTRACT_TYPE_OPTIONS = [
  { value: "service-agreement", label: "Service Agreement" },
  { value: "nda", label: "Non-Disclosure Agreement" },
  { value: "proposal", label: "Project Proposal" },
  { value: "statement-of-work", label: "Statement of Work" },
];

const STATUS_STYLES: Record<string, string> = {
  draft: "bg-gray-100 text-gray-800",
  sent: "bg-blue-100 text-blue-800",
  viewed: "bg-purple-100 text-purple-800",
  signed: "bg-emerald-100 text-emerald-800",
};

const emptyForm = {
  contractType: "service-agreement",
  orderId: "",
  clientName: "",
  clientEmail: "",
  clientPhone: "",
  company: "",
  serviceType: "",
  serviceTypeKey: "",
  bodyText: "",
};

function createContractDraft(order: {
  clientName: string;
  company?: string;
  serviceType: string;
  description?: string;
  quoteAmount?: number | null;
  quoteCurrency?: string;
  timeline?: string;
  desiredTimeline?: string;
  milestones?: Array<{ title: string }>;
}) {
  return [
    "NEXUS TECH HUB — SERVICE AGREEMENT (DRAFT)",
    `Client: ${order.clientName}${order.company ? ` (${order.company})` : ""}`,
    `Service: ${order.serviceType}`,
    "",
    "SCOPE OF WORK",
    order.description || "Confirm the project scope with the client before sending.",
    "",
    "DELIVERABLES",
    ...(order.milestones?.length ? order.milestones.map((milestone) => `• ${milestone.title}`) : ["Confirm deliverables with the client."]),
    "",
    "FEES AND PAYMENT",
    order.quoteAmount ? `${order.quoteAmount.toLocaleString()} ${order.quoteCurrency || "XAF"}` : "Agree and enter the project fee before sending.",
    "Payment schedule: confirm with the client before sending.",
    "",
    "TIMELINE",
    order.desiredTimeline || order.timeline || "Agree and enter the delivery timeline before sending.",
    "",
    "CHANGES AND ACCEPTANCE",
    "Both parties should agree in writing to changes in scope, fees, or timing. Confirm how deliverables will be reviewed and accepted before sending.",
    "",
    "SIGNATURES",
    "The client signs first. A NEXUS super admin adds the NEXUS signature to finalize the agreement.",
    "",
    "DRAFT: Review and complete all terms with the client before sending for signature.",
  ].join("\n");
}

export default function TechHubContractManagementPage() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [editing, setEditing] = useState<Contract | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [viewingBody, setViewingBody] = useState<Contract | null>(null);
  const [editingBody, setEditingBody] = useState<Contract | null>(null);
  const [bodyText, setBodyText] = useState("");
  const [generating, setGenerating] = useState(false);
  const [sending, setSending] = useState(false);
  const [archivedView, setArchivedView] = useState(false);
  const [currentRole, setCurrentRole] = useState("");
  const [nexusSigning, setNexusSigning] = useState<Contract | null>(null);
  const [nexusSignature, setNexusSignature] = useState<string | null>(null);
  const [orders, setOrders] = useState<Array<{id: string; clientName: string; clientEmail: string; clientPhone?: string; company?: string; serviceType: string; serviceTypeKey: string; description?: string; quoteAmount?: number | null; quoteCurrency?: string; timeline?: string; desiredTimeline?: string; milestones?: Array<{title: string}>}>>([]);

  useEffect(() => {
    void fetch("/api/admin/user/me", { cache: "no-store" }).then((res) => res.json()).then((data) => setCurrentRole(data.user?.role || "")).catch(() => {});
    void fetch("/api/admin/service-orders", { cache: "no-store" }).then((res) => res.json()).then((data) => setOrders(Array.isArray(data.orders) ? data.orders : [])).catch(() => {});
  }, []);

  useEffect(() => { void loadContracts(); }, [archivedView]);

  async function loadContracts(showArchived = archivedView) {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/tech-hub/contracts${showArchived ? "?archived=true" : ""}`, { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to refresh contracts");
      if (Array.isArray(data.contracts)) setContracts(data.contracts);
    } catch (err) {
      console.error("Failed to load contracts:", err);
      setError(err instanceof Error ? err.message : "Failed to refresh contracts");
    } finally {
      setLoading(false);
    }
  }

  function openCreate() {
    setForm(emptyForm);
    setEditing(null);
    setCreating(true);
    setError(null);
    setSuccessMessage("");
  }

  function openEdit(contract: Contract) {
    setEditing(contract);
    setForm({
      contractType: contract.contractType,
      orderId: contract.orderId || "",
      clientName: contract.clientName,
      clientEmail: contract.clientEmail,
      clientPhone: contract.clientPhone || "",
      company: contract.company || "",
      serviceType: contract.serviceType,
      serviceTypeKey: contract.serviceTypeKey,
      bodyText: contract.bodyText || "",
    });
    setCreating(true);
    setError(null);
  }

  async function handleSave() {
    if (!form.contractType || !form.clientName || !form.clientEmail || !form.serviceType || !form.serviceTypeKey || !form.bodyText.trim()) {
      setError("Complete the required client, service, and contract body fields");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(editing ? `/api/admin/tech-hub/contracts/${editing.id}` : "/api/admin/tech-hub/contracts", {
          method: editing ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        }
      );
      if (res.ok) {
        setCreating(false);
        setEditing(null);
        setError(null);
        setSearchQuery("");
        setSuccessMessage(editing ? "Contract changes saved." : "Contract saved as a draft.");
        setArchivedView(false);
        await loadContracts(false);
      } else {
        const data = await res.json();
        setError(data.error || "Save failed");
      }
    } catch {
      setError("Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function archiveContract(contract: Contract) {
    const action = archivedView ? "restore" : "archive";
    const res = await fetch(`/api/admin/tech-hub/contracts/${contract.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || `Failed to ${action} contract`);
      return;
    }
    await loadContracts();
  }

  async function saveNexusSignature() {
    if (!nexusSigning || !nexusSignature) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/tech-hub/contracts/${nexusSigning.id}/signed`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ signatureTechHubUrl: nexusSignature }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save NEXUS signature");
      setNexusSigning(null);
      setNexusSignature(null);
      await loadContracts();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Failed to save NEXUS signature");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this contract? This cannot be undone.")) return;
    try {
      const res = await fetch(`/api/admin/tech-hub/contracts/${id}`, {
        method: "DELETE",
      });
      if (res.ok) await loadContracts();
    } catch (err) {
      console.error("Failed to delete contract:", err);
    }
  }

  async function generatePdf(contract: Contract) {
    setGenerating(true);
    try {
      const res = await fetch("/api/admin/tech-hub/contracts/generate-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: contract.id }),
      });
      if (!res.ok) throw new Error("PDF generation failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${contract.id}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to generate PDF:", err);
      setError(err instanceof Error ? err.message : "Failed to generate PDF");
    } finally {
      setGenerating(false);
    }
  }

  async function sendForSignature(contract: Contract) {
    if (!confirm("Send this contract to the client for signature?")) return;
    setSending(true);
    try {
      const res = await fetch(`/api/admin/tech-hub/contracts/${contract.id}/send`, {
        method: "POST",
      });
      const data = await res.json();
      if (res.ok) {
        await loadContracts();
        setError(null);
      } else {
        setError(data.emailError || data.error || "Failed to send contract");
      }
    } catch (err) {
      console.error("Failed to send contract:", err);
      setError("Failed to send contract");
    } finally {
      setSending(false);
    }
  }

  function viewBody(contract: Contract) {
    setBodyText(contract.bodyText || "");
    setViewingBody(contract);
  }

  function openEditBody(contract: Contract) {
    setBodyText(contract.bodyText || "");
    setEditingBody(contract);
  }

  async function saveBody() {
    if (!editingBody) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/tech-hub/contracts/${editingBody.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bodyText }),
      });
      const data = await res.json();
      if (res.ok) {
        setEditingBody(null);
        setBodyText("");
        await loadContracts();
        setError(null);
      } else {
        setError(data.error || "Failed to save body");
      }
    } catch (err) {
      console.error("Failed to save body:", err);
      setError("Failed to save body");
    } finally {
      setSaving(false);
    }
  }

  function closeModal() {
    setViewingBody(null);
    setEditingBody(null);
    setBodyText("");
    setError(null);
  }

  const filteredContracts = contracts.filter(
    (c) =>
      c.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.clientEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.serviceType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.contractType.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Link
            href="/admin/tech-hub"
            className="mb-2 inline-flex items-center gap-1 text-sm text-nexus-navy/60 hover:text-nexus-cyan"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
          <h1 className="text-2xl font-bold text-nexus-navy">Contract Management</h1>
          <p className="mt-1 text-sm text-nexus-navy/60">
            Manage client contracts, templates, and digital signatures for Tech Hub services.
          </p>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={() => setArchivedView((value) => !value)} className="rounded-lg border border-nexus-navy/10 px-4 py-2 text-sm font-semibold text-nexus-navy">
            {archivedView ? "Active contracts" : "Archived contracts"}
          </button>
          {!archivedView && <button onClick={openCreate} className="inline-flex items-center gap-2 rounded-lg bg-nexus-cyan px-4 py-2 text-sm font-semibold text-white hover:bg-nexus-cyan-dark">
            <Plus className="h-4 w-4" /> Create Contract
          </button>}
        </div>
      </div>

      {successMessage && <p role="status" className="mb-4 rounded-lg bg-emerald-50 px-4 py-2 text-sm text-emerald-800">{successMessage}</p>}
      {error && !creating && <p role="alert" className="mb-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">{error}</p>}

      <div className="mb-6 flex items-center gap-2 rounded-lg border border-nexus-navy/10 bg-white px-3 py-2">
        <Search className="h-4 w-4 text-nexus-navy/40" />
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search contracts by client, service, or type..."
          className="w-full bg-transparent text-sm focus:outline-none"
        />
      </div>

      {loading ? (
        <LoadingState />
      ) : filteredContracts.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No contracts yet"
          description="Create your first client contract to get started."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredContracts.map((contract) => (
            <div
              key={contract.id}
              className="rounded-xl border border-nexus-navy/10 bg-white p-5"
            >
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-nexus-cyan/10 text-nexus-cyan">
                  <FileText className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <h3 className="truncate font-semibold text-nexus-navy">
                    {contract.contractType.replace(/-/g, " ")}
                  </h3>
                  <p className="truncate text-xs text-nexus-navy/50">
                    {contract.clientName}
                  </p>
                </div>
              </div>
              <div className="mt-3 space-y-1">
                <p className="text-sm text-nexus-navy/60">
                  <span className="font-medium">Service:</span> {contract.serviceType}
                </p>
                <p className="text-sm text-nexus-navy/60">
                  <span className="font-medium">Client:</span> {contract.clientEmail}
                </p>
                <p className="text-sm text-nexus-navy/60">
                  <span className="font-medium">Order:</span>{" "}
                  {contract.orderId || (contract.client?.description ? "Linked order" : "Unlinked")}
                </p>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_STYLES[contract.status] || "bg-gray-100 text-gray-800"}`}
                >
                  {contract.status.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                </span>
                <div className="flex gap-1">
                  <button
                    onClick={() => viewBody(contract)}
                    className="rounded-md p-1.5 text-nexus-navy/60 hover:bg-nexus-navy/5 hover:text-nexus-cyan"
                    aria-label="View body"
                    title="View body"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  {!archivedView && contract.status !== "signed" && (
                    <>
                      <button
                        onClick={() => openEditBody(contract)}
                        className="rounded-md p-1.5 text-nexus-navy/60 hover:bg-nexus-navy/5 hover:text-nexus-cyan"
                        aria-label="Edit body"
                        title="Edit body"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => sendForSignature(contract)}
                        className="rounded-md p-1.5 text-nexus-navy/60 hover:bg-blue-50 hover:text-blue-600"
                        aria-label="Send for signature"
                        title="Send for signature"
                        disabled={sending}
                      >
                        <SendIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => generatePdf(contract)}
                        className="rounded-md p-1.5 text-nexus-navy/60 hover:bg-green-50 hover:text-green-600"
                        aria-label="Download PDF"
                        title="Download PDF"
                        disabled={generating}
                      >
                        <Download className="h-4 w-4" />
                      </button>
                    </>
                  )}
                  {!archivedView && contract.status === "signed" && <button onClick={() => generatePdf(contract)} disabled={generating} className="rounded-md p-1.5 text-emerald-700 hover:bg-emerald-50" aria-label="Download signed PDF" title="Download signed PDF"><Download className="h-4 w-4" /></button>}
                  {!archivedView && contract.status !== "signed" && <button
                    onClick={() => openEdit(contract)}
                    className="rounded-md p-1.5 text-nexus-navy/60 hover:bg-nexus-navy/5 hover:text-nexus-cyan"
                    aria-label="Edit"
                    title="Edit"
                  >
                    <Edit className="h-4 w-4" />
                  </button>}
                  {contract.signatureClientAt && !contract.signatureTechHubAt && contract.status !== "signed" && currentRole === "SUPER_ADMIN" && !archivedView && <button onClick={() => { setNexusSigning(contract); setNexusSignature(null); }} className="rounded-md px-2 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-50">Add NEXUS signature</button>}
                  <button onClick={() => void archiveContract(contract)} className="rounded-md p-1.5 text-nexus-navy/60 hover:bg-amber-50 hover:text-amber-700" aria-label={archivedView ? "Restore contract" : "Archive contract"} title={archivedView ? "Restore contract" : "Archive contract"}>
                    {archivedView ? <RotateCcw className="h-4 w-4" /> : <Archive className="h-4 w-4" />}
                  </button>
                  {!archivedView && contract.status !== "signed" && <button onClick={() => handleDelete(contract.id)} className="rounded-md p-1.5 text-nexus-navy/60 hover:bg-red-50 hover:text-red-500" aria-label="Delete draft contract" title="Delete draft contract"><Trash2 className="h-4 w-4" /></button>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {creating && (
        <AdminModal
          open={creating}
          onClose={() => {
            setCreating(false);
            setEditing(null);
          }}
          title={editing ? "Edit Contract" : "Create Contract"}
        >
          <div className="space-y-4">
            {error && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
                {error}
              </p>
            )}
            <div>
              <label className="block text-sm font-medium text-nexus-navy">Link to service order (recommended)</label>
              <select value={form.orderId} disabled={!!editing} onChange={(e) => {
                const order = orders.find((item) => item.id === e.target.value);
                setForm(order ? {
                  ...form,
                  orderId: order.id,
                  clientName: order.clientName,
                  clientEmail: order.clientEmail,
                  clientPhone: order.clientPhone || "",
                  company: order.company || "",
                  serviceType: order.serviceType,
                  serviceTypeKey: order.serviceTypeKey,
                  bodyText: createContractDraft(order),
                } : { ...emptyForm, contractType: form.contractType });
              }} className="mt-1 w-full rounded-lg border border-nexus-navy/10 px-3 py-2 text-sm">
                <option value="">Standalone contract (no linked order)</option>
                {orders.map((order) => <option key={order.id} value={order.id}>{order.clientName} · {order.serviceType} · {order.id.slice(-6)}</option>)}
              </select>
              <p className="mt-1 text-xs text-nexus-navy/50">Choose an order to fill the client details, service name, service key, and an editable draft body automatically.</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-nexus-navy">
                  Contract Type *
                </label>
                <select
                  value={form.contractType}
                  onChange={(e) =>
                    setForm({ ...form, contractType: e.target.value })
                  }
                  className="mt-1 w-full rounded-lg border border-nexus-navy/10 px-3 py-2 text-sm focus:border-nexus-cyan focus:outline-none"
                >
                  {CONTRACT_TYPE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-nexus-navy">
                Client Name *
              </label>
              <input
                value={form.clientName}
                onChange={(e) =>
                  setForm({ ...form, clientName: e.target.value })
                }
                placeholder="Enter client name"
                className="mt-1 w-full rounded-lg border border-nexus-navy/10 px-3 py-2 text-sm focus:border-nexus-cyan focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-nexus-navy">
                  Client Email *
              </label>
              <input
                value={form.clientEmail}
                onChange={(e) =>
                  setForm({ ...form, clientEmail: e.target.value })
                }
                placeholder="client@example.com"
                className="mt-1 w-full rounded-lg border border-nexus-navy/10 px-3 py-2 text-sm focus:border-nexus-cyan focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-nexus-navy">
                Client Phone
              </label>
              <input
                value={form.clientPhone}
                onChange={(e) =>
                  setForm({ ...form, clientPhone: e.target.value })
                }
                placeholder="+237 ..."
                className="mt-1 w-full rounded-lg border border-nexus-navy/10 px-3 py-2 text-sm focus:border-nexus-cyan focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-nexus-navy">
                Company
              </label>
              <input
                value={form.company}
                onChange={(e) =>
                  setForm({ ...form, company: e.target.value })
                }
                placeholder="Client company name"
                className="mt-1 w-full rounded-lg border border-nexus-navy/10 px-3 py-2 text-sm focus:border-nexus-cyan focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-nexus-navy">
                  Service Type *
              </label>
              <input
                value={form.serviceType}
                readOnly={!!form.orderId}
                onChange={(e) => {
                  const serviceType = e.target.value;
                  const serviceTypeKey = serviceType.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
                  setForm({ ...form, serviceType, serviceTypeKey });
                }}
                placeholder="e.g., Web Development"
                className="mt-1 w-full rounded-lg border border-nexus-navy/10 px-3 py-2 text-sm focus:border-nexus-cyan focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-nexus-navy">Service key (generated)</label>
              <input readOnly value={form.serviceTypeKey} placeholder="Enter the service type to generate a key" className="mt-1 w-full rounded-lg border border-nexus-navy/10 bg-gray-50 px-3 py-2 text-sm text-nexus-navy/70" />
            </div>
            <div>
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-nexus-navy">Contract body *</label>
                {!form.orderId && <button type="button" onClick={() => setForm({ ...form, bodyText: createContractDraft({ clientName: form.clientName || "[Client name]", company: form.company, serviceType: form.serviceType || "[Service name]" }) })} className="text-xs font-semibold text-nexus-cyan hover:underline">Insert starter draft</button>}
              </div>
              <textarea value={form.bodyText} onChange={(e) => setForm({ ...form, bodyText: e.target.value })} rows={10} placeholder="Write or paste the complete terms of this contract..." className="mt-1 w-full rounded-lg border border-nexus-navy/10 px-3 py-2 text-sm" />
            </div>
            <div className="flex gap-3 pt-4">
              <button
                onClick={handleSave}
                disabled={saving}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-nexus-cyan px-4 py-2 text-sm font-semibold text-white hover:bg-nexus-cyan-dark disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                {saving ? "Saving..." : editing ? "Save Changes" : "Create Contract"}
              </button>
              <button
                onClick={() => {
                  setCreating(false);
                  setEditing(null);
                }}
                className="inline-flex items-center justify-center rounded-lg border border-nexus-navy/10 px-4 py-2 text-sm font-semibold text-nexus-navy hover:bg-nexus-navy/5"
              >
                Cancel
              </button>
            </div>
          </div>
        </AdminModal>
      )}

      {viewingBody && (
        <AdminModal
          open={true}
          onClose={closeModal}
          title="Contract Body"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-nexus-navy">
                Body Text
              </label>
              <textarea
                readOnly
                value={bodyText}
                rows={14}
                className="mt-1 w-full rounded-lg border border-nexus-navy/10 bg-gray-50 px-3 py-2 text-sm focus:border-nexus-cyan focus:outline-none"
              />
            </div>
            <div className="flex gap-2">
              {viewingBody.status !== "signed" && !viewingBody.archivedAt && <button
                onClick={() => openEditBody(viewingBody)}
                className="inline-flex items-center gap-2 rounded-lg bg-nexus-cyan px-4 py-2 text-sm font-semibold text-white hover:bg-nexus-cyan-dark"
              ><Edit className="h-4 w-4" /> Edit Body</button>}
              <button
                onClick={() => {
                  closeModal();
                  generatePdf(viewingBody);
                }}
                className="inline-flex items-center gap-2 rounded-lg border border-nexus-navy/10 px-4 py-2 text-sm font-semibold text-nexus-navy hover:bg-nexus-navy/5"
              >
                <Download className="h-4 w-4" /> Download PDF
              </button>
            </div>
          </div>
        </AdminModal>
      )}

      {editingBody && (
        <AdminModal
          open={true}
          onClose={() => {
            setEditingBody(null);
            setBodyText("");
          }}
          title="Edit Contract Body"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-nexus-navy">
                Contract Body
              </label>
              <textarea
                value={bodyText}
                onChange={(e) => setBodyText(e.target.value)}
                rows={14}
                className="mt-1 w-full rounded-lg border border-nexus-navy/10 px-3 py-2 text-sm focus:border-nexus-cyan focus:outline-none"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={saveBody}
                disabled={saving}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-nexus-cyan px-4 py-2 text-sm font-semibold text-white hover:bg-nexus-cyan-dark disabled:opacity-50"
              >
                <Save className="h-4 w-4" /> Save Body
              </button>
              <button
                onClick={() => {
                  setEditingBody(null);
                  setBodyText("");
                }}
                className="inline-flex items-center justify-center rounded-lg border border-nexus-navy/10 px-4 py-2 text-sm font-semibold text-nexus-navy hover:bg-nexus-navy/5"
              >
                Cancel
              </button>
            </div>
          </div>
        </AdminModal>
      )}

      {nexusSigning && (
        <AdminModal open onClose={() => { setNexusSigning(null); setNexusSignature(null); }} title="Add NEXUS signature">
          <div className="space-y-4">
            <p className="text-sm text-nexus-navy/70">The client has signed. Draw the authorized NEXUS signature to finalize and lock this contract. Only a super admin can complete this step.</p>
            <SignaturePad onChange={setNexusSignature} />
            <button onClick={saveNexusSignature} disabled={saving || !nexusSignature} className="rounded-lg bg-nexus-cyan px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">{saving ? "Saving…" : "Save NEXUS signature and lock"}</button>
          </div>
        </AdminModal>
      )}
    </div>
  );
}
