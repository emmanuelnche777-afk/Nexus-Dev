"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AuthPageShell, FormField, AUTH_ERROR_CLASS } from "@/components/admin/auth/AuthPageShell";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    const res = await fetch("/api/admin/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const data = await res.json();

    setSubmitting(false);

    if (!res.ok) {
      setError(data.error || "Failed to send reset email");
      return;
    }

    setSubmitted(true);
  }

  return (
    <AuthPageShell
      title="NEXUS Admin"
      subtitle="Reset Your Password"
    >
      {error && (
        <p className={AUTH_ERROR_CLASS}>
          {error}
        </p>
      )}

      {submitted ? (
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="rounded-full bg-emerald-900/30 p-3">
              <svg className="h-8 w-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.957 11.957 0 0112 2.94M12 2.94a9 9 0 11-3.912 14.82M9 12l2 2 4-4" />
              </svg>
            </div>
          </div>
          <p className="text-sm text-nexus-gray/80">
            If an account with that email exists, a reset link has been sent.
            Please check your inbox and spam folder.
          </p>
          <button
            onClick={() => router.push("/admin/login")}
            className="text-sm text-nexus-cyan hover:underline"
          >
            Back to Login
          </button>
        </div>
      ) : (
        <>
          <p className="text-sm text-nexus-gray/80">
            Enter your email address and we will send you a link to reset your
            password.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <FormField
              label="Email"
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              required
              disabled={submitting}
              autoComplete="email"
            />

            <button
              type="submit"
              disabled={submitting || !email}
              className="w-full rounded-md bg-nexus-cyan px-6 py-3 text-sm font-semibold text-nexus-dark transition hover:bg-nexus-cyan-bright disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-nexus-cyan"
            >
              {submitting ? "Sending..." : "Send Reset Link"}
            </button>
          </form>
        </>
      )}

      <button
        onClick={() => router.push("/admin/login")}
        className="w-full rounded-md border border-nexus-gray/30 px-6 py-3 text-sm font-medium text-nexus-gray/80 transition hover:bg-nexus-white/10 focus:outline-none focus:ring-2 focus:ring-nexus-cyan"
      >
        Back to Login
      </button>
    </AuthPageShell>
  );
}
