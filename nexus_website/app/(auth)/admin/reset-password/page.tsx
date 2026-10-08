"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthPageShell, FormField, AUTH_ERROR_CLASS, AUTH_SUCCESS_CLASS } from "@/components/admin/auth/AuthPageShell";

const PASSWORD_MIN_LENGTH = 10;

export const dynamic = "force-dynamic";

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [token] = useState(() => searchParams.get("token") || "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  if (!token && typeof window !== "undefined") {
    setError("No reset token provided. Please request a new password reset.");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;

    if (password.length < PASSWORD_MIN_LENGTH) {
      setError(`Password must be at least ${PASSWORD_MIN_LENGTH} characters`);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setSubmitting(true);
    setError("");

    let res: Response;
    try {
      res = await fetch("/api/admin/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
    } catch {
      setError("Network error. Please try again.");
      setSubmitting(false);
      return;
    }

    let data;
    try {
      data = await res.json();
    } catch {
      setError(`Server error (HTTP ${res.status}). Check the server terminal.`);
      setSubmitting(false);
      return;
    }

    if (!res.ok) {
      setError(data.error || "Failed to reset password");
      setSubmitting(false);
      return;
    }

    setSuccess("Password reset successfully. Redirecting to login...");
    setSubmitting(false);

    setTimeout(() => {
      router.push("/admin/login");
      router.refresh();
    }, 2000);
  }

  return (
    <AuthPageShell
      title="NEXUS Admin"
      subtitle="Reset Your Password"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <p className={AUTH_ERROR_CLASS}>
            {error}
          </p>
        )}

        {success && (
          <p className={AUTH_SUCCESS_CLASS}>
            {success}
          </p>
        )}

        <FormField
          label="New Password"
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Minimum 10 characters"
          required
          disabled={!token || submitting}
          minLength={PASSWORD_MIN_LENGTH}
          autoComplete="new-password"
        />

        <FormField
          label="Confirm Password"
          id="confirmPassword"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Minimum 10 characters"
          required
          disabled={!token || submitting}
          minLength={PASSWORD_MIN_LENGTH}
          autoComplete="new-password"
        />

        <button
          type="submit"
          disabled={submitting || !token}
          className="w-full rounded-md bg-nexus-cyan px-6 py-3 text-sm font-semibold text-nexus-dark transition hover:bg-nexus-cyan-bright disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-nexus-cyan"
        >
          {submitting ? "Resetting Password..." : "Reset Password"}
        </button>

        <p className="text-center text-xs text-nexus-gray/60">
          Password must be at least {PASSWORD_MIN_LENGTH} characters long.
        </p>
      </form>
    </AuthPageShell>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordContent />
    </Suspense>
  );
}
