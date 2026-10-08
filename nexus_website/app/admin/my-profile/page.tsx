"use client";

import { useState, useEffect } from "react";
import { Shield, User, Save, Eye, EyeOff } from "lucide-react";
import Card from "@/components/admin/ui/card";
import Badge from "@/components/admin/ui/badge";
import Button from "@/components/admin/ui/button";
import Avatar from "@/components/admin/ui/avatar";
import { InputField } from "@/components/admin/ui/form-field";
import { Skeleton } from "@/components/admin/ui/skeleton";
import PageHeader from "@/components/admin/ui/page-header";
import type { AdminRole } from "@/lib/permissions-data";

type TabId = "profile" | "security";

interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
  phone: string;
  status: string;
  twoFactorEnabled: boolean;
}

interface Session {
  id: string;
  createdAt: string;
  lastActiveAt: string;
  userAgent: string | null;
  ipAddress: string | null;
  expiresAt: string;
}

interface TwoFactorState {
  enabled: boolean;
  qrDataUrl?: string;
  backupCodes?: string[];
}

export default function MyProfilePage() {
  const [activeTab, setActiveTab] = useState<TabId>("profile");
  const [user, setUser] = useState<UserProfile | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Profile form state
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  // Security / 2FA state
  const [twoFactor, setTwoFactor] = useState<TwoFactorState>({ enabled: false });
  const [settingUp, setSettingUp] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verifyStep, setVerifyStep] = useState<"setup" | "verify">("setup");
  const [verificationCode, setVerificationCode] = useState("");
  const [disablePassword, setDisablePassword] = useState("");
  const [showDisablePassword, setShowDisablePassword] = useState(false);

  useEffect(() => {
    void fetch("/api/admin/user/me", { cache: "no-store" })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load profile");
        return res.json();
      })
      .then((data) => {
        setUser(data.user);
        setName(data.user.name);
        setPhone(data.user.phone);
        setTwoFactor({ enabled: data.user.twoFactorEnabled });
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load profile"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!user?.id) return;
    void fetch(`/api/admin/staff/${user.id}/sessions`, { cache: "no-store" })
      .then((res) => {
        if (!res.ok) return { sessions: [] };
        return res.json();
      })
      .then((data) => setSessions(data.sessions || []))
      .catch(() => setSessions([]));
  }, [user?.id]);

  async function saveProfile() {
    if (!user) return;
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/admin/user/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save");
      setUser({ ...user, name, phone });
      setSuccess("Profile updated");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  async function changePassword() {
    if (!currentPassword || !newPassword) return;
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/admin/user/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to change password");
      setSuccess("Password changed successfully. You have been signed out of other sessions.");
      setCurrentPassword("");
      setNewPassword("");
      setShowCurrent(false);
      setShowNew(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to change password");
    } finally {
      setSaving(false);
    }
  }

  const start2FASetup = async () => {
    setSettingUp(true);
    setError("");

    try {
      const res = await fetch("/api/admin/2fa/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      if (!res.ok) throw new Error("Failed to generate 2FA secret");
      const data = await res.json();

      setTwoFactor({
        enabled: false,
        qrDataUrl: data.qrDataUrl,
        backupCodes: data.backupCodes,
      });
      setVerifyStep("verify");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start 2FA setup");
    } finally {
      setSettingUp(false);
    }
  };

  const verify2FA = async () => {
    if (!verificationCode) return;
    setVerifying(true);
    setError("");

    try {
      const res = await fetch("/api/admin/2fa/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: verificationCode }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Invalid verification code");

      if (data.success) {
        setTwoFactor({ enabled: true, backupCodes: twoFactor.backupCodes });
        setVerifyStep("setup");
        setVerificationCode("");
        setSuccess("Two-factor authentication enabled");
        if (user) setUser({ ...user, twoFactorEnabled: true });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to verify");
    } finally {
      setVerifying(false);
    }
  };

  const cancel2FASetup = () => {
    setVerifyStep("setup");
    setTwoFactor({ enabled: false, qrDataUrl: undefined, backupCodes: undefined });
    setVerificationCode("");
  };

  const disable2FA = async () => {
    if (!confirm("Disable 2FA on your account? You will need to re-setup next time you sign in.")) return;

    setError("");
    setSuccess("");

    const res = await fetch("/api/admin/2fa/disable", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: disablePassword }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Failed to disable 2FA");
    } else {
      setTwoFactor({ enabled: false, qrDataUrl: undefined, backupCodes: undefined });
      setSuccess("Two-factor authentication disabled");
      setDisablePassword("");
      setShowDisablePassword(false);
      if (user) setUser({ ...user, twoFactorEnabled: false });
    }
  };

  const revokeSession = async (id: string) => {
    if (!confirm("Revoke this session? You will be logged out immediately.")) return;

    try {
      const res = await fetch(`/api/admin/staff/${user?.id}/sessions`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: id }),
      });
      if (!res.ok) throw new Error("Failed to revoke");
      setSessions((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to revoke session");
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Card>
          <Skeleton className="h-20 w-20 rounded-full" />
          <Skeleton className="mt-4 h-4 w-full" count={3} />
        </Card>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-8">
        <p className="text-red-600">{error || "User not found"}</p>
      </div>
    );
  }

  const tabs: { id: TabId; label: string; icon: React.ElementType }[] = [
    { id: "profile", label: "Profile", icon: User },
    { id: "security", label: "Security", icon: Shield },
  ];

  const PASSWORD_MIN = 10;

  return (
    <div className="space-y-6">
      <PageHeader
        title={user.name}
        subtitle={user.email}
        backHref="/admin/dashboard"
      />

      <Card>
        <div className="flex items-center gap-6">
          <Avatar name={user.name} size="lg" />
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-semibold text-nexus-navy">{user.name}</h2>
              <Badge variant={user.status === "ACTIVE" ? "active" : "suspended"}>
                {user.status}
              </Badge>
            </div>
            <p className="mt-1 text-sm text-nexus-navy/60">{user.email}</p>
            <p className="text-xs text-nexus-navy/50">
              Role: <span className="font-medium">{user.role.replace("_", " ")}</span>
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

      {error && (
        <Card>
          <p className="text-sm text-red-600">{error}</p>
        </Card>
      )}

      {success && (
        <Card>
          <p className="text-sm text-emerald-600">{success}</p>
        </Card>
      )}

      {activeTab === "profile" && (
        <div className="space-y-4">
          <Card>
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium text-nexus-navy">Personal information</h3>
                <p className="mt-1 text-xs text-nexus-navy/50">Update your name and phone number.</p>
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <InputField
                  label="Full name"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <InputField
                  label="Email address"
                  id="email"
                  type="email"
                  value={user.email}
                  readOnly
                  className="bg-nexus-navy/5 cursor-default"
                />
                <div className="sm:col-span-2">
                  <InputField
                    label="Phone number"
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={saveProfile}
                  loading={saving}
                  disabled={!name || !phone}
                  icon={<Save className="h-4 w-4" />}
                  iconPosition="right"
                >
                  {saving ? "Saving..." : "Save changes"}
                </Button>
              </div>
            </div>
          </Card>

          <Card>
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium text-nexus-navy">Change password</h3>
                <p className="mt-1 text-xs text-nexus-navy/50">
                  Passwords must be at least {PASSWORD_MIN} characters.
                </p>
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <div className="relative sm:col-span-1">
                  <InputField
                    label="Current password"
                    id="currentPassword"
                    type={showCurrent ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrent(!showCurrent)}
                    className="absolute right-3 top-9 text-nexus-navy/40 hover:text-nexus-navy"
                  >
                    {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <div></div>
                <div className="relative sm:col-span-1">
                  <InputField
                    label="New password"
                    id="newPassword"
                    type={showNew ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    helperText={newPassword.length < PASSWORD_MIN
                      ? `Must be at least ${PASSWORD_MIN} characters (${newPassword.length}/${PASSWORD_MIN})`
                      : ""}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    className="absolute right-3 top-9 text-nexus-navy/40 hover:text-nexus-navy"
                  >
                    {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <div></div>
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={changePassword}
                  loading={saving}
                  disabled={!currentPassword || newPassword.length < PASSWORD_MIN}
                  variant="secondary"
                >
                  Change password
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {activeTab === "security" && (
        <div className="space-y-4">
          <Card>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-nexus-navy">Two-factor authentication</h3>
                <p className="mt-1 text-xs text-nexus-navy/50">
                  {user.twoFactorEnabled
                    ? "2FA is enabled on your account. You'll be asked for a verification code when signing in."
                    : "Add an extra layer of security to your account."}
                </p>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full ${
                      user.twoFactorEnabled ? "bg-emerald-100" : "bg-nexus-navy/5"
                    }`}
                  >
                    <Shield
                      className={`h-5 w-5 ${
                        user.twoFactorEnabled ? "text-emerald-600" : "text-nexus-navy/30"
                      }`}
                    />
                  </div>
                  <Badge variant={user.twoFactorEnabled ? "success" : "neutral"}>
                    {user.twoFactorEnabled ? "Enabled" : "Disabled"}
                  </Badge>
                </div>
              </div>

              {!user.twoFactorEnabled && verifyStep === "setup" && (
                <Button onClick={start2FASetup} loading={settingUp}>
                  Enable two-factor authentication
                </Button>
              )}

              {verifyStep === "verify" && twoFactor.qrDataUrl && (
                <div className="space-y-6 pt-2">
                  <div className="text-center">
                    <p className="mb-4 text-sm text-nexus-navy/70">
                      Scan this QR code with your authenticator app
                    </p>
                    <div className="mb-4 flex justify-center">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={twoFactor.qrDataUrl}
                        alt="2FA QR Code"
                        className="h-48 w-48 rounded-lg border border-nexus-navy/10 bg-white p-2"
                      />
                    </div>
                  </div>

                  {twoFactor.backupCodes && twoFactor.backupCodes.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-nexus-navy mb-2">
                        Save these backup codes somewhere safe:
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {twoFactor.backupCodes.map((code, i) => (
                          <code
                            key={i}
                            className="rounded-lg border border-nexus-navy/10 bg-nexus-navy/5 px-3 py-2 text-center text-xs text-nexus-navy font-mono"
                          >
                            {code}
                          </code>
                        ))}
                      </div>
                    </div>
                  )}

                  <InputField
                    label="Enter the 6-digit code from your app"
                    id="verificationCode"
                    type="text"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    placeholder="000000"
                    maxLength={6}
                  />

                  <div className="flex gap-3">
                    <Button
                      variant="secondary"
                      onClick={cancel2FASetup}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={verify2FA}
                      loading={verifying}
                      disabled={!verificationCode || verificationCode.length < 6}
                      className="flex-1"
                    >
                      {verifying ? "Verifying..." : "Verify & enable"}
                    </Button>
                  </div>
                </div>
              )}

              {user.twoFactorEnabled && (
                <div className="pt-2">
                  <div className="relative">
                    <InputField
                      label="Enter your password to disable 2FA"
                      id="disablePassword"
                      type={showDisablePassword ? "text" : "password"}
                      value={disablePassword}
                      onChange={(e) => setDisablePassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowDisablePassword(!showDisablePassword)}
                      className="absolute right-3 top-9 text-nexus-navy/40 hover:text-nexus-navy"
                    >
                      {showDisablePassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <Button variant="danger" onClick={disable2FA}>
                    Disable two-factor authentication
                  </Button>
                </div>
              )}
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-nexus-navy">Active sessions</h3>
                <p className="mt-1 text-xs text-nexus-navy/50">
                  {sessions.length} active session{sessions.length !== 1 ? "s" : ""} on this account
                </p>
              </div>
              {sessions.length > 1 && (
                <Button
                  variant="danger"
                  size="sm"
                  onClick={async () => {
                    if (!confirm("Revoke ALL sessions? You will be logged out of other devices.")) return;
                    try {
                      const res = await fetch(`/api/admin/staff/${user?.id}/sessions`, {
                        method: "DELETE",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({}),
                      });
                      if (!res.ok) throw new Error("Failed to revoke");
                      setSessions((prev) => prev.slice(0, 1));
                    } catch (err) {
                      setError(err instanceof Error ? err.message : "Failed");
                    }
                  }}
                >
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
                        <span>Last active {new Date(session.lastActiveAt).toLocaleString()}</span>
                      </div>
                    </div>
                    <Button variant="danger" size="sm" onClick={() => revokeSession(session.id)}>
                      Revoke
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
