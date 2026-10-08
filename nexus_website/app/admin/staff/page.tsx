"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Users, Search, Send, MoreVertical, UserCheck, Clock, Shield, Trash2 } from "lucide-react";
import PageHeader from "@/components/admin/ui/page-header";
import Card from "@/components/admin/ui/card";
import Badge from "@/components/admin/ui/badge";
import Button from "@/components/admin/ui/button";
import Avatar from "@/components/admin/ui/avatar";
import { Skeleton } from "@/components/admin/ui/skeleton";
import EmptyState from "@/components/admin/EmptyState";
import { ROLE_PERMISSIONS } from "@/lib/permissions-data";

interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: string;
  phone: string;
  status: string;
  twoFactorEnabled: boolean;
  invitedAt: string | null;
  createdAt: string;
  updatedAt: string;
  hasAcceptedInvite: boolean;
}

type FilterTab = "all" | "active" | "invited" | "suspended" | "former";

export default function StaffPage() {
  const router = useRouter();
  const [staff, setStaff] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const [actionMenu, setActionMenu] = useState<string | null>(null);
  const [resendLoading, setResendLoading] = useState<string | null>(null);

   useEffect(() => {
    void fetch("/api/admin/staff", { cache: "no-store" })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load staff");
        return res.json();
      })
      .then((data) => setStaff(data.staff || []))
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load staff"))
      .finally(() => setLoading(false));
  }, []);

  async function loadStaff() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/staff", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to load staff");
      const data = await res.json();
      setStaff(data.staff || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load staff");
    } finally {
      setLoading(false);
    }
  }

  async function handleResendInvite(id: string) {
    setResendLoading(id);
    try {
      const res = await fetch(`/api/admin/staff/${id}/resend-invite`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to resend invitation");
      // Reload staff to get updated invitedAt
      await loadStaff();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to resend invitation");
    } finally {
      setResendLoading(null);
    }
  }

  const filtered = useMemo(() => {
    return staff.filter((member) => {
      const matchesSearch =
        member.name.toLowerCase().includes(search.toLowerCase()) ||
        member.email.toLowerCase().includes(search.toLowerCase());

      const matchesRole = roleFilter === "all" || member.role === roleFilter;

      const matchesTab =
        activeTab === "all" ||
        (activeTab === "active" && member.status === "ACTIVE" && (!member.invitedAt || member.hasAcceptedInvite)) ||
        (activeTab === "invited" && member.invitedAt && !member.hasAcceptedInvite) ||
        (activeTab === "suspended" && member.status === "SUSPENDED") ||
        (activeTab === "former" && member.status === "DELETED");

      return matchesSearch && matchesRole && matchesTab;
    });
  }, [staff, search, roleFilter, activeTab]);

  const summary = useMemo(() => {
    return {
      active: staff.filter((s) => s.status === "ACTIVE" && (!s.invitedAt || s.hasAcceptedInvite)).length,
      pending: staff.filter((s) => s.invitedAt && !s.hasAcceptedInvite).length,
      suspended: staff.filter((s) => s.status === "SUSPENDED").length,
      twoFactor: staff.filter((s) => s.twoFactorEnabled).length,
    };
  }, [staff]);

  const tabs: { id: FilterTab; label: string; icon: React.ElementType }[] = [
    { id: "all", label: "All Staff", icon: Users },
    { id: "active", label: "Active", icon: UserCheck },
    { id: "invited", label: "Invited", icon: Clock },
    { id: "suspended", label: "Suspended", icon: Shield },
    { id: "former", label: "Former", icon: Trash2 },
  ];  const roleOptions = Array.from(
    new Set(["all", ...Object.keys(ROLE_PERMISSIONS)])
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Staff"
        subtitle="Manage admin staff accounts, roles, and security settings"
         action={
          <Button onClick={() => router.push("/admin/staff/invite")} icon={<Send className="h-4 w-4" />} iconPosition="left">
            Invite staff
          </Button>
        }
      />

      {error && (
        <Card>
          <p className="text-sm text-red-600">{error}</p>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-4">
          <p className="text-2xl font-bold text-nexus-navy">{loading ? "?" : summary.active}</p>
          <p className="text-xs text-nexus-navy/60">Active</p>
        </Card>
        <Card className="p-4">
          <p className="text-2xl font-bold text-amber-600">{loading ? "?" : summary.pending}</p>
          <p className="text-xs text-nexus-navy/60">Pending invites</p>
        </Card>
        <Card className="p-4">
          <p className="text-2xl font-bold text-red-600">{loading ? "?" : summary.suspended}</p>
          <p className="text-xs text-nexus-navy/60">Suspended</p>
        </Card>
        <Card className="p-4">
          <p className="text-2xl font-bold text-emerald-600">{loading ? "?" : summary.twoFactor}</p>
          <p className="text-xs text-nexus-navy/60">2FA enabled</p>
        </Card>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-3 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-nexus-navy text-white"
                  : "text-nexus-navy/60 hover:bg-nexus-navy/5 hover:text-nexus-navy"
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-nexus-navy/40" />
            <input
              type="text"
              placeholder="Search staff..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-nexus-navy/10 px-4 py-2 pl-10 text-sm text-nexus-navy placeholder:text-nexus-navy/30 focus:border-nexus-cyan focus:outline-none"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="rounded-lg border border-nexus-navy/10 px-3 py-2 text-sm text-nexus-navy focus:border-nexus-cyan focus:outline-none"
          >
            {roleOptions.map((role) => (
              <option key={role} value={role}>
                {role === "all" ? "All roles" : role.replace("_", " ")}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-14 w-full" count={5} />
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No staff found"
            description="Try adjusting your search or filter"
            action={
              <button
                onClick={() => router.push("/admin/staff/invite")}
                className="text-sm text-nexus-cyan hover:underline"
              >
                Invite your first staff member →
              </button>
            }
          />
        ) : (
          <div className="overflow-x-auto rounded-lg border border-nexus-navy/10 bg-white">
            <table className="hidden w-full sm:table">
              <thead>
                <tr className="border-b border-nexus-navy/10">
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-nexus-navy/60">Staff</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-nexus-navy/60">Role</th>
                  <th className="px-4 py-3 text-center text-xs font-medium uppercase text-nexus-navy/60">2FA</th>
                  <th className="px-4 py-3 text-center text-xs font-medium uppercase text-nexus-navy/60">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase text-nexus-navy/60">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((member) => (
                  <tr key={member.id} className="border-b border-nexus-navy/5 last:border-0">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar name={member.name} size="sm" />
                        <div>
                          <span className="font-medium text-nexus-navy">{member.name}</span>
                          <div className="text-sm text-nexus-navy/60">{member.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="info" size="sm">
                        {member.role.replace("_", " ")}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {member.twoFactorEnabled ? (
                        <Badge variant="success" size="sm">Enabled</Badge>
                      ) : (
                        <Badge variant="neutral" size="sm">Disabled</Badge>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {member.invitedAt && member.status === "ACTIVE" && !member.hasAcceptedInvite && (
                        <Badge variant="pending" size="sm">Invited</Badge>
                      )}
                      {member.status === "ACTIVE" && (!member.invitedAt || member.hasAcceptedInvite) && (
                        <Badge variant="active" size="sm">Active</Badge>
                      )}
                      {member.status === "SUSPENDED" && (
                        <Badge variant="suspended" size="sm">Suspended</Badge>
                      )}
                      {member.status === "DELETED" && (
                        <Badge variant="deleted" size="sm">Former</Badge>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="relative inline-block">
                        <button
                          onClick={() => setActionMenu(actionMenu === member.id ? null : member.id)}
                          className="rounded-md p-1.5 text-nexus-navy/50 hover:bg-nexus-navy/5 hover:text-nexus-navy"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </button>
                        {actionMenu === member.id && (
                          <div
                            className="fixed inset-0 z-10"
                            onClick={() => setActionMenu(null)}
                          />
                        )}
                        {actionMenu === member.id && (
                          <div className="absolute right-0 z-20 mt-1 w-40 rounded-md border border-nexus-navy/10 bg-white py-1 shadow-lg">
                            <button
                              onClick={() => {
                                setActionMenu(null);
                                router.push(`/admin/staff/${member.id}`);
                              }}
                              className="block w-full px-3 py-2 text-left text-sm text-nexus-navy hover:bg-nexus-navy/5"
                            >
                              View details
                            </button>
                            {member.invitedAt && member.status === "ACTIVE" && (
                              <button
                                onClick={async (e) => {
                                  e.stopPropagation();
                                  await handleResendInvite(member.id);
                                  setActionMenu(null);
                                }}
                                disabled={resendLoading === member.id}
                                className="block w-full px-3 py-2 text-left text-sm text-nexus-navy hover:bg-nexus-navy/5 disabled:opacity-60"
                              >
                                {resendLoading === member.id ? "Resending..." : "Resend invite"}
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="divide-y divide-nexus-navy/5 sm:hidden">
              {filtered.map((member) => (
                <div key={member.id} className="p-4">
                  <div className="flex items-center gap-3">
                    <Avatar name={member.name} size="md" />
                    <div className="flex-1">
                      <span className="font-medium text-nexus-navy">{member.name}</span>
                      <div className="text-sm text-nexus-navy/60">{member.email}</div>
                      <Badge variant="info" size="sm" className="mt-1">
                        {member.role.replace("_", " ")}
                      </Badge>
                    </div>
                    <button
                      onClick={() => router.push(`/admin/staff/${member.id}`)}
                      className="text-nexus-navy/50 hover:text-nexus-navy"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
