"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, Loader2, Mail } from "lucide-react";

export default function UnsubscribeForm({ token }: { token: string }) {
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function unsubscribe() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/newsletter/unsubscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      if (!response.ok) throw new Error("Please try again in a moment.");
      setDone(true);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to unsubscribe right now.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg rounded-2xl border border-nexus-cyan/20 bg-white p-8 text-center shadow-xl">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-nexus-cyan/10 text-nexus-cyan">
        {done ? <CheckCircle2 className="h-7 w-7" /> : <Mail className="h-7 w-7" />}
      </div>
      <h1 className="mt-5 text-2xl font-bold text-nexus-dark">
        {done ? "You’re unsubscribed" : "Unsubscribe from NEXUS updates?"}
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-nexus-navy/70">
        {done
          ? "This email address will no longer receive newsletter campaigns."
          : "Confirm below to stop receiving newsletter emails from NEXUS."}
      </p>
      {!done && (
        <button
          type="button"
          onClick={unsubscribe}
          disabled={loading}
          className="mt-6 inline-flex items-center justify-center gap-2 rounded-lg bg-nexus-cyan px-6 py-3 font-semibold text-nexus-dark transition hover:bg-nexus-cyan-bright disabled:opacity-60"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {loading ? "Processing…" : "Unsubscribe"}
        </button>
      )}
      {error && <p role="alert" className="mt-4 text-sm text-red-700">{error}</p>}
      <Link href="/" className="mt-5 block text-sm font-medium text-nexus-cyan hover:underline">Return to NEXUS</Link>
    </div>
  );
}
