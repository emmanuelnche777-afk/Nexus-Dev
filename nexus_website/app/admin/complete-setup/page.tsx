"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { FormField, AUTH_ERROR_CLASS } from "@/components/admin/auth/AuthPageShell";

export default function CompleteAdminSetupPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [code, setCode] = useState("");
  const [savedCodes, setSavedCodes] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/admin/session", { cache: "no-store" })
      .then((response) => response.json())
      .then((data) => {
        if (!data.authenticated) router.replace("/admin/login");
        else if (!data.user?.requiresTwoFactorSetup) router.replace("/admin/dashboard");
        setChecking(false);
      })
      .catch(() => {
        setError("Could not verify your session. Please sign in again.");
        setChecking(false);
      });
  }, [router]);

  async function beginSetup() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/admin/2fa/setup", { method: "POST" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not start two-factor setup");
      setQrDataUrl(data.qrDataUrl);
      setBackupCodes(data.backupCodes || []);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not start two-factor setup");
    } finally {
      setLoading(false);
    }
  }

  async function finishSetup(event: React.FormEvent) {
    event.preventDefault();
    if (!savedCodes) {
      setError("Save the backup codes before continuing.");
      return;
    }
    setVerifying(true);
    setError("");
    try {
      const response = await fetch("/api/admin/2fa/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "That code could not be verified");
      router.replace("/admin/dashboard");
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "That code could not be verified");
    } finally {
      setVerifying(false);
    }
  }

  if (checking) return <main className="p-8 text-center text-nexus-navy">Checking account setup…</main>;

  return (
    <main className="mx-auto flex min-h-[75vh] max-w-2xl items-center px-4 py-10">
      <section className="w-full space-y-6 rounded-xl bg-white p-6 shadow sm:p-8">
        <div className="flex items-start gap-4">
          <div className="rounded-full bg-emerald-50 p-3 text-emerald-700"><ShieldCheck className="h-6 w-6" /></div>
          <div>
            <h1 className="text-2xl font-semibold text-nexus-navy">Complete your account security setup</h1>
            <p className="mt-2 text-sm text-nexus-navy/70">Set up an authenticator app and save your one-time backup codes. Two-factor authentication is required before you can enter the admin workspace.</p>
          </div>
        </div>
        {error && <p className={AUTH_ERROR_CLASS}>{error}</p>}
        {!qrDataUrl ? (
          <button type="button" onClick={beginSetup} disabled={loading} className="rounded-md bg-nexus-navy px-5 py-2.5 font-medium text-white disabled:opacity-60">
            {loading ? "Preparing setup…" : "Set up authenticator"}
          </button>
        ) : (
          <form onSubmit={finishSetup} className="space-y-5">
            <div className="rounded-lg border border-nexus-navy/10 p-4 text-center">
              <p className="mb-3 text-sm text-nexus-navy/70">Scan this code with an authenticator app.</p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={qrDataUrl} alt="Authenticator setup QR code" className="mx-auto h-48 w-48" />
            </div>
            <div>
              <p className="mb-2 text-sm font-medium text-nexus-navy">Save these backup codes somewhere private</p>
              <div className="grid grid-cols-2 gap-2 rounded-lg bg-nexus-navy/5 p-3 sm:grid-cols-4">
                {backupCodes.map((backupCode) => <code key={backupCode} className="text-center text-xs">{backupCode}</code>)}
              </div>
              <label className="mt-3 flex items-start gap-2 text-sm text-nexus-navy/80">
                <input type="checkbox" checked={savedCodes} onChange={(event) => setSavedCodes(event.target.checked)} className="mt-1" />
                I have saved these backup codes.
              </label>
            </div>
            <FormField label="6-digit authenticator code" id="setup-code" value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))} inputMode="numeric" autoComplete="one-time-code" required />
            <button type="submit" disabled={verifying || code.length !== 6 || !savedCodes} className="w-full rounded-md bg-nexus-navy px-5 py-2.5 font-medium text-white disabled:opacity-60">
              {verifying ? "Verifying…" : "Verify and finish setup"}
            </button>
          </form>
        )}
      </section>
    </main>
  );
}
