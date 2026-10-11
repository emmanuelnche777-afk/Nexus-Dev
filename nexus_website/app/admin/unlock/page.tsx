"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FormField, AUTH_ERROR_CLASS } from "@/components/admin/auth/AuthPageShell";

export default function AdminUnlockPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/admin/session/unlock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not unlock session");
      router.replace("/admin/dashboard");
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not unlock session");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-md items-center px-4">
      <form onSubmit={submit} className="w-full space-y-5 rounded-xl bg-white p-6 shadow">
        <div>
          <h1 className="text-2xl font-semibold text-nexus-navy">Session locked</h1>
          <p className="mt-2 text-sm text-nexus-navy/70">For your security, this session locked after five minutes without activity. Enter your password to continue.</p>
        </div>
        {error && <p className={AUTH_ERROR_CLASS}>{error}</p>}
        <FormField label="Password" id="unlock-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" required />
        <button type="submit" disabled={loading} className="w-full rounded-md bg-nexus-navy px-4 py-2.5 font-medium text-white disabled:opacity-60">
          {loading ? "Unlocking..." : "Unlock session"}
        </button>
      </form>
    </main>
  );
}
