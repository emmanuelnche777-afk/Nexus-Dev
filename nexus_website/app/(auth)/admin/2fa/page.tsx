"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AuthPageShell, AUTH_INPUT_CLASS, AUTH_LABEL_CLASS, AUTH_ERROR_CLASS } from "@/components/admin/auth/AuthPageShell";

export default function TwoFactorLoginPage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [useBackup, setUseBackup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [canReplaceActiveSession, setCanReplaceActiveSession] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      const res = await fetch("/api/admin/session", { cache: "no-store" });
      const data = await res.json();
      if (data.authenticated) {
        router.push("/admin/dashboard");
      }
    };
    void checkSession();
  }, [router]);

  async function verifyLogin(replaceActiveSession = false) {
    if (!replaceActiveSession && !code.trim()) return;
    setLoading(true);
    setError("");

    const res = await fetch("/api/admin/2fa/verify-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code,
        type: useBackup ? "backup" : "totp",
        replaceActiveSession,
      }),
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      setError(data.error || "Invalid code");
      setCanReplaceActiveSession(Boolean(data.canReplaceActiveSession));
      setLoading(false);
      return;
    }

    window.location.href = "/admin/dashboard"; // eslint-disable-line @next/next/no-location-assign-relative-destination
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await verifyLogin();
  }

  return (
    <AuthPageShell
      title="NEXUS Admin"
      subtitle="Two-Factor Authentication"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="code" className={AUTH_LABEL_CLASS}>
            {useBackup ? "Backup Code" : "Authenticator Code"}
          </label>
          <input
            id="code"
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder={useBackup ? "Enter backup code" : "000000"}
            required
            className={AUTH_INPUT_CLASS}
            maxLength={useBackup ? 32 : 6}
            autoFocus
          />
        </div>

        {error && (
          <p className={AUTH_ERROR_CLASS}>
            {error}
          </p>
        )}

        {canReplaceActiveSession && (
          <div className="rounded-md border border-amber-300/40 bg-amber-100/10 p-4 text-sm text-nexus-white">
            <p>Your password and authenticator code were verified. Replacing the active session will sign out the old browser or device.</p>
            <button
              type="button"
              onClick={() => void verifyLogin(true)}
              disabled={loading}
              className="mt-3 w-full rounded-md border border-nexus-cyan px-4 py-2 font-semibold text-nexus-cyan transition hover:bg-nexus-cyan hover:text-nexus-dark disabled:opacity-60"
            >
              {loading ? "Replacing session..." : "Replace active session"}
            </button>
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !code.trim()}
          className="w-full rounded-md bg-nexus-cyan px-6 py-3 text-sm font-semibold text-nexus-dark transition hover:bg-nexus-cyan-bright disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-nexus-cyan"
        >
          {loading ? "Verifying..." : "Verify and Sign In"}
        </button>

        <div className="text-center">
          <button
            type="button"
            onClick={() => setUseBackup(!useBackup)}
            className="text-sm text-nexus-cyan hover:underline"
          >
            {useBackup ? "Use Authenticator App" : "Use Backup Code"}
          </button>
        </div>

        <p className="text-center text-xs text-nexus-gray/60">
          Enter the 6-digit code from your authenticator app.
        </p>
      </form>
    </AuthPageShell>
  );
}
