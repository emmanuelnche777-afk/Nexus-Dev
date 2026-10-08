"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

const INPUT_CLASS =
  "mt-1 w-full rounded-lg border border-nexus-navy/10 px-3 py-2 text-sm text-nexus-navy placeholder:text-nexus-navy/30 focus:border-nexus-cyan focus:outline-none";
const LABEL_CLASS = "mb-1 block text-sm font-medium text-nexus-navy";

interface TwoFactorState {
  enabled: boolean;
  qrDataUrl?: string;
  backupCodes?: string[];
}

export default function StaffTwoFactorPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [staffId, setStaffId] = useState<string | null>(null);
  const [isCurrentUser, setIsCurrentUser] = useState(false);
  const [state, setState] = useState<TwoFactorState>({ enabled: false });
  const [loading, setLoading] = useState(true);
  const [settingUp, setSettingUp] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [step, setStep] = useState<"setup" | "verify">("setup");
  const [verificationCode, setVerificationCode] = useState("");
  const [disablePassword, setDisablePassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    void params.then(({ id }) => setStaffId(id));
  }, [params]);

  useEffect(() => {
    if (!staffId) return;

    const fetchSessionAndData = () => {
      fetch("/api/admin/session", { cache: "no-store" })
        .then((res) => res.json())
        .then((data) => {
          if (data.authenticated) {
            setIsCurrentUser(data.user.id === staffId);
          }
        })
        .catch(() => {});

      let cancelled = false;
      fetch(`/api/admin/staff/${staffId}`, { cache: "no-store" })
        .then(async (res) => {
          if (!res.ok) throw new Error("Failed to load staff");
          return res.json();
        })
        .then((data) => {
          if (cancelled) return;
          setState({ enabled: data.staff.twoFactorEnabled });
        })
        .catch((err) => {
          if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load staff");
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });

      return () => { cancelled = true };
    };

    const cleanup = fetchSessionAndData();
    return cleanup;
  }, [staffId]);

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

      setState({
        enabled: false,
        qrDataUrl: data.qrDataUrl,
        backupCodes: data.backupCodes,
      });
      setStep("verify");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start 2FA setup");
    } finally {
      setSettingUp(false);
    }
  }

  async function verify2FA() {
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

      if (!res.ok) {
        throw new Error(data.error || "Invalid verification code");
      }

      if (data.success) {
        setState({ enabled: true, backupCodes: state.backupCodes });
        setSuccess("Two-factor authentication enabled successfully");
        setStep("setup");
        setVerificationCode("");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to verify 2FA code");
    } finally {
      setVerifying(false);
    }
  }

  async function disable2FA() {
    if (!confirm("Disable 2FA for your account? You will need to re-setup next login.")) return;

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
      setState({ enabled: false, qrDataUrl: undefined, backupCodes: undefined });
      setSuccess("Two-factor authentication disabled");
      setDisablePassword("");
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 animate-pulse rounded bg-nexus-navy/10"></div>
        <div className="h-32 animate-pulse rounded-lg border border-nexus-navy/10 bg-nexus-navy/5"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="rounded-md p-2 text-nexus-navy hover:bg-nexus-navy/5"
        >
          <ArrowLeft className="h-5 w-4" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-nexus-navy">Two-Factor Authentication</h1>
          <p className="text-sm text-nexus-navy/60">
            {state.enabled
              ? isCurrentUser
                ? "2FA is currently enabled on your account"
                : "2FA is currently enabled for this staff member"
              : isCurrentUser
                ? "2FA is not enabled on your account"
                : "2FA is not enabled for this staff member"}
          </p>
        </div>
      </div>

      {error && (
        <p className="rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600">
          {error}
        </p>
      )}

      {success && (
        <p className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-600">
          {success}
        </p>
      )}

      {!isCurrentUser && !state.enabled && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <p>You can only set up or disable 2FA for your own account. Use the &lsquo;My Profile&rsquo; link in the sidebar to manage your two-factor authentication.</p>
        </div>
      )}

      <div className="rounded-xl border border-nexus-navy/10 bg-white p-8 space-y-6">
        {isCurrentUser && !state.enabled && step === "setup" && (
          <button
            onClick={start2FASetup}
            disabled={settingUp}
            className="rounded-md bg-nexus-cyan px-6 py-3 text-sm font-semibold text-nexus-dark transition hover:bg-nexus-cyan-bright disabled:opacity-60"
          >
            {settingUp ? "Generating..." : "Set Up Two-Factor Authentication"}
          </button>
        )}

        {step === "verify" && state.qrDataUrl && (
          <>
            <div className="text-center">
              <p className="mb-4 text-sm text-nexus-navy/70">
                Scan this QR code with your authenticator app
              </p>
              <div className="mb-4 flex justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                 <img
                   src={state.qrDataUrl}
                   alt="2FA QR Code"
                   className="max-w-full h-auto w-48 max-h-48 rounded-lg border border-nexus-navy/10 bg-white p-2"
                 />
              </div>
            </div>

            {state.backupCodes && state.backupCodes.length > 0 && (
              <div>
                <label className={LABEL_CLASS}>
                  Save these backup codes somewhere safe:
                </label>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {state.backupCodes.map((code, i) => (
                    <code key={i} className="rounded-lg border border-nexus-navy/10 bg-nexus-navy/5 px-3 py-2 text-center text-sm text-nexus-navy font-mono">
                      {code}
                    </code>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label htmlFor="verificationCode" className={LABEL_CLASS}>
                Enter the 6-digit code from your app
              </label>
              <input
                id="verificationCode"
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                placeholder="000000"
                maxLength={6}
                disabled={verifying}
                className={INPUT_CLASS}
              />
            </div>

            <button
              onClick={verify2FA}
              disabled={verifying || !verificationCode}
              className="w-full rounded-md bg-nexus-cyan px-6 py-3 text-sm font-semibold text-nexus-dark transition hover:bg-nexus-cyan-bright disabled:opacity-60"
            >
              {verifying ? "Verifying..." : "Verify & Enable"}
            </button>

            <button
              onClick={() => { setStep("setup"); setState({ enabled: false, qrDataUrl: undefined, backupCodes: undefined }); }}
              className="w-full rounded-md border border-nexus-navy/10 px-6 py-3 text-sm font-medium text-nexus-navy/70 transition hover:bg-nexus-navy/5"
            >
              Cancel
            </button>
          </>
        )}

        {state.enabled && (
          <>
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
              <p className="text-sm text-emerald-700">
                {isCurrentUser
                  ? "Two-factor authentication is enabled on your account."
                  : "Two-factor authentication is enabled for this staff member."}
              </p>
            </div>

            {isCurrentUser && (
              <>
                <div>
                  <label htmlFor="disablePassword" className={LABEL_CLASS}>
                    Enter your password to disable 2FA
                  </label>
                  <input
                    id="disablePassword"
                    type="password"
                    value={disablePassword}
                    onChange={(e) => setDisablePassword(e.target.value)}
                    placeholder="Your current password"
                    className={INPUT_CLASS}
                  />
                </div>

                <button
                  onClick={disable2FA}
                  className="rounded-md border border-red-200 px-6 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                >
                  Disable Two-Factor Authentication
                </button>
              </>
            )}
          </>
        )}

        {!isCurrentUser && state.enabled && (
          <p className="text-sm text-nexus-navy/60">
            This staff member has 2FA enabled. Only they can disable it from their own &lsquo;My Profile&rsquo; page.
          </p>
        )}
      </div>
    </div>
  );
}
