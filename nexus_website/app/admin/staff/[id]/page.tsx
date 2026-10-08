"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Shield, Save, User, Key } from "lucide-react";
import PageHeader from "@/components/admin/ui/page-header";
import Card from "@/components/admin/ui/card";
import Badge from "@/components/admin/ui/badge";
import Button from "@/components/admin/ui/button";
import Avatar from "@/components/admin/ui/avatar";
import { InputField, SelectField } from "@/components/admin/ui/form-field";
import { Skeleton } from "@/components/admin/ui/skeleton";


import { ROLE_PERMISSIONS, ROLE_DESCRIPTIONS } from "@/lib/permissions-data";
import type { AdminRole } from "@/lib/permissions-data";

type TabId = "profile" | "security" | "payroll";

interface StaffMember {
  id: string;
  email: string;
  name: string;
  role: string;
  phone: string;
  status: string;
  twoFactorEnabled: boolean;
  invitedAt: string | null;
  createdAt: string;
}

interface PayrollData {
  momoPayoutName: string | null;
  momoPayoutNumber: string | null;
  salaryAmount: string | null;
  salaryCurrency: string | null;
}

interface Session {
  id: string;
  createdAt: string;
  lastActiveAt: string;
  userAgent: string | null;
  ipAddress: string | null;
  expiresAt: string;
}

export default function StaffDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [staffId, setStaffId] = useState<string | null>(null);
  const [staff, setStaff] = useState<StaffMember | null>(null);
  const [payroll, setPayroll] = useState<PayrollData | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabId>("profile");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState("");
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  useEffect(() => {
    void params.then(({ id }) => setStaffId(id));
  }, [params]);

  useEffect(() => {
    if (!staffId) return;

    const fetchSessionAndData = async () => {
      try {
        const res = await fetch("/api/admin/session", { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        if (data.authenticated) {
          setIsSuperAdmin(data.user.role === "SUPER_ADMIN");
        }
      } catch {}

      const res = await fetch(`/api/admin/staff/${staffId}`, { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to load staff");
      const data = await res.json();
      setStaff(data.staff);
      setPayroll(data.payroll || null);

      // Fetch sessions (inlined to avoid hoisting issues)
      void fetch(`/api/admin/staff/${staffId}/sessions`, { cache: "no-store" })
        .then((res) => {
          if (!res.ok) return;
          return res.json();
        })
        .then((data) => setSessions(data.sessions || []))
        .catch(() => setSessions([]));
    };

    let cancelled = false;
    fetchSessionAndData()
      .catch((err) => {
        if (!cancelled) setSaveError(err instanceof Error ? err.message : "Failed to load staff");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true };
  }, [staffId]);

   async function saveProfile() {
    if (!staffId || !staff) return;
    setSaving(true);
    setSaveError("");
    setSaveSuccess("");

    try {
      const res = await fetch(`/api/admin/staff/${staffId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: staff.name,
          email: staff.email,
          phone: staff.phone,
          role: staff.role,
          status: staff.status,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save");
      setSaveSuccess("Profile updated successfully");
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  async function revokeSession(id: string) {
    if (!staffId) return;
    if (!confirm("Revoke this session? The user will be logged out immediately.")) return;

    try {
      const res = await fetch(`/api/admin/staff/${staffId}/sessions`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: id }),
      });
      if (!res.ok) throw new Error("Failed to revoke");
      setSessions((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to revoke session");
    }
  }

  async function revokeAllSessions() {
    if (!staffId) return;
    if (!confirm("Revoke ALL sessions? The user will be logged out everywhere.")) return;

    try {
      const res = await fetch(`/api/admin/staff/${staffId}/sessions`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      if (!res.ok) throw new Error("Failed to revoke");
      setSessions([]);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to revoke sessions");
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Card>
          <div className="flex items-center gap-6">
            <Skeleton className="h-20 w-20 rounded-full" />
            <Skeleton className="h-6 w-40" />
          </div>
          <Skeleton className="mt-4 h-4 w-full" count={3} />
        </Card>
      </div>
    );
  }

  if (!staff) {
    return (
      <div className="p-8">
        <p className="text-red-600">{saveError || "Staff member not found"}</p>
      </div>
    );
  }

  const tabs: { id: TabId; label: string; icon: React.ElementType }[] = [
    { id: "profile", label: "Profile", icon: User },
    { id: "security", label: "Security", icon: Shield },
    ...(isSuperAdmin ? [{ id: "payroll" as TabId, label: "Payroll", icon: Key }] : []),
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={staff.name}
        subtitle={staff.email}
        backHref="/admin/staff"
      />

      <Card>
        <div className="flex items-center gap-6">
          <Avatar name={staff.name} size="lg" />
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-semibold text-nexus-navy">{staff.name}</h2>
              <Badge variant={staff.status === "ACTIVE" ? "active" : "suspended"}>
                {staff.status}
              </Badge>
              {staff.role === "SUPER_ADMIN" && (
                <Badge variant="info">
                  {staff.role.replace("_", " ")}
                </Badge>
              )}
            </div>
            <p className="mt-1 text-sm text-nexus-navy/60">{staff.email}</p>
            <p className="text-xs text-nexus-navy/50">
              Role: <span className="font-medium">{staff.role.replace("_", " ")}</span>
              {staff.invitedAt && " · Invited"}
              {staff.role !== "SUPER_ADMIN" && " · Can view and manage this staff member"}
            </p>
          </div>
        </div>
      </Card>

      <div className="border-b border-nexus-navy/10">
        <nav className="flex -mx-4 gap-x-2 overflow-x-auto sm:mx-0 sm:gap-x-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? "border-nexus-cyan text-nexus-cyan"
                  : "border-transparent text-nexus-navy/50 hover:text-nexus-navy"
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {saveError && (
        <Card>
          <p className="text-sm text-red-600">{saveError}</p>
        </Card>
      )}

      {saveSuccess && (
        <Card>
          <p className="text-sm text-emerald-600">{saveSuccess}</p>
        </Card>
      )}

      {activeTab === "profile" && (
        <Card>
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-medium text-nexus-navy">Profile information</h3>
              <p className="mt-1 text-xs text-nexus-navy/50">
                {staff.role === "SUPER_ADMIN"
                  ? "Edit name and phone. Role and email cannot be changed from here."
                  : `Edit name, phone, and role. ${ROLE_DESCRIPTIONS[staff.role as AdminRole]}`}
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <InputField
                label="Full name"
                id="name"
                value={staff.name}
                onChange={(e) => setStaff({ ...staff, name: e.target.value })}
              />
              <InputField
                label="Email address"
                id="email"
                type="email"
                value={staff.email}
                onChange={(e) => setStaff({ ...staff, email: e.target.value })}
              />
              <div className="sm:col-span-2">
                <InputField
                  label="Phone number"
                  id="phone"
                  type="tel"
                  value={staff.phone}
                  onChange={(e) => setStaff({ ...staff, phone: e.target.value })}
                />
              </div>

              {(isSuperAdmin || staff.role !== "SUPER_ADMIN") && (
                <div>
                  <SelectField
                    label="Role"
                    id="role"
                    value={staff.role}
                    onChange={(e) => setStaff({ ...staff, role: e.target.value })}
                  >
                    {Object.entries(ROLE_PERMISSIONS)
                      .filter(([r]) => r !== "SUPER_ADMIN")
                      .map(([r]) => (
                        <option key={r} value={r}>
                          {r.replace("_", " ")}
                        </option>
                      ))}
                  </SelectField>
                  <p className="mt-1 text-xs text-nexus-navy/50">
                    {ROLE_DESCRIPTIONS[staff.role as AdminRole]}
                  </p>
                </div>
              )}

              {isSuperAdmin && (
                <SelectField
                  label="Status"
                  id="status"
                  value={staff.status}
                  onChange={(e) => setStaff({ ...staff, status: e.target.value })}
                >
                  <option value="ACTIVE">Active</option>
                  <option value="SUSPENDED">Suspended</option>
                </SelectField>
              )}
            </div>

            <div className="flex justify-end gap-3">
              <Button
                variant="secondary"
                onClick={() => router.push("/admin/staff")}
              >
                Cancel
              </Button>
              <Button
                onClick={saveProfile}
                loading={saving}
                disabled={!staff.name || !staff.email}
                icon={<Save className="h-4 w-4" />}
                iconPosition="right"
              >
                {saving ? "Saving..." : "Save changes"}
              </Button>
            </div>
          </div>
        </Card>
      )}

      {activeTab === "security" && (
        <div className="space-y-4">
          <Card>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-nexus-navy">Two-factor authentication</h3>
                <p className="mt-1 text-xs text-nexus-navy/50">
                  {staff.twoFactorEnabled
                    ? "2FA is enabled for this staff member. Only they can disable it from their own My Profile page."
                    : "2FA is not enabled. This staff member will be prompted to set it up on next login (if required)."}
                </p>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full ${
                      staff.twoFactorEnabled ? "bg-emerald-100" : "bg-nexus-navy/5"
                    }`}
                  >
                    <Shield
                      className={`h-5 w-5 ${staff.twoFactorEnabled ? "text-emerald-600" : "text-nexus-navy/30"}`}
                    />
                  </div>
                  <Badge variant={staff.twoFactorEnabled ? "success" : "neutral"}>
                    {staff.twoFactorEnabled ? "2FA Enabled" : "2FA Disabled"}
                  </Badge>
                </div>
                {staff.role === "SUPER_ADMIN" && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => router.push(`/admin/staff/${staff.id}/2fa`)}
                  >
                    Manage 2FA
                  </Button>
                )}
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-nexus-navy">Active sessions</h3>
                <p className="mt-1 text-xs text-nexus-navy/50">
                  {sessions.length} active session{sessions.length !== 1 ? "s" : ""}
                </p>
              </div>
              {sessions.length > 0 && (
                <Button variant="secondary" size="sm" onClick={revokeAllSessions}>
                  Revoke all
                </Button>
              )}
            </div>

            {sessions.length === 0 ? (
              <p className="mt-4 text-center text-sm text-nexus-navy/50">No active sessions.</p>
            ) : (
              <div className="mt-4 space-y-3">
                {sessions.map((session) => (
                  <div key={session.id} className="flex items-center justify-between rounded-md border border-nexus-navy/10 p-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-nexus-navy truncate">
                        {session.userAgent || "Unknown device"}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-nexus-navy/50">
                        <span>{session.ipAddress || "Unknown IP"}</span>
                        <span>·</span>
                        <span>Active since {new Date(session.lastActiveAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => revokeSession(session.id)}
                    >
                      Revoke
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}

      {activeTab === "payroll" && isSuperAdmin && payroll && (
        <Card>
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-medium text-nexus-navy">Payroll details</h3>
              <p className="mt-1 text-xs text-nexus-navy/50">
                Mobile Money payout and salary information.
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <InputField
                label="Momo payout name"
                id="momoPayoutName"
                value={payroll.momoPayoutName || ""}
                onChange={(e) =>
                  setPayroll({ ...payroll, momoPayoutName: e.target.value || null })
                }
                helperText="Name on the Mobile Money account"
              />
              <InputField
                label="Momo payout number"
                id="momoPayoutNumber"
                value={payroll.momoPayoutNumber || ""}
                onChange={(e) =>
                  setPayroll({ ...payroll, momoPayoutNumber: e.target.value || null })
                }
                helperText="Phone number linked to the MoMo account"
              />
              <InputField
                label="Salary amount"
                id="salaryAmount"
                type="number"
                value={payroll.salaryAmount || ""}
                onChange={(e) =>
                  setPayroll({ ...payroll, salaryAmount: e.target.value || null })
                }
              />
              <SelectField
                label="Currency"
                id="salaryCurrency"
                value={payroll.salaryCurrency || "XAF"}
                onChange={(e) =>
                  setPayroll({ ...payroll, salaryCurrency: e.target.value })
                }
              >
                <option value="XAF">XAF (Central African CFA Franc)</option>
                <option value="USD">USD (US Dollar)</option>
                <option value="EUR">EUR (Euro)</option>
              </SelectField>
            </div>

            <div className="flex justify-end">
              <Button
                onClick={async () => {
                  setSaving(true);
                  setSaveError("");
                  try {
                    const res = await fetch(`/api/admin/staff/${staffId}`, {
                      method: "PUT",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        momoPayoutName: payroll.momoPayoutName,
                        momoPayoutNumber: payroll.momoPayoutNumber,
                        salaryAmount: payroll.salaryAmount,
                        salaryCurrency: payroll.salaryCurrency,
                      }),
                    });
                    const data = await res.json();
                    if (!res.ok) throw new Error(data.error || "Failed to save");
                    setSaveSuccess("Payroll details updated");
                  } catch (err) {
                    setSaveError(err instanceof Error ? err.message : "Failed to save");
                  } finally {
                    setSaving(false);
                  }
                }}
                loading={saving}
                icon={<Save className="h-4 w-4" />}
                iconPosition="right"
              >
                Save payroll
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
