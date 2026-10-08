"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AuthPageShell, FormField, AUTH_ERROR_CLASS } from "@/components/admin/auth/AuthPageShell";

export default function AdminSetupPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

   useEffect(() => {
    let fetchFailed = false;

    fetch("/api/admin/setup")
      .then((res) => {
        if (!res.ok) {
          let parseError = false;
          return res.json()
            .catch(() => { parseError = true; })
            .then((data) => {
              if (parseError) {
                setLoading(false);
                setError(`Server error (HTTP ${res.status}). Check the server terminal.`);
                return null;
              }
              setLoading(false);
              setError(data.error || `Server error (HTTP ${res.status}). Check the server terminal.`);
              return null;
            });
        }
        return res.json();
      })
      .then((data) => {
        if (data && !data.setupRequired) {
          router.push("/admin/login");
        }
        if (data) {
          setLoading(false);
        }
      })
      .catch(() => {
        if (!fetchFailed) {
          fetchFailed = true;
          setLoading(false);
          setError("Network error. Please try again.");
        }
      });
  }, [router]);

  if (loading) {
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setSubmitting(false);
      return;
    }

    if (password.length < 10) {
      setError("Password must be at least 10 characters");
      setSubmitting(false);
      return;
    }

    let res: Response;
    try {
      res = await fetch("/api/admin/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: fullName.trim(),
          email: email.trim().toLowerCase(),
          phone: phone.trim(),
          password,
          confirmPassword,
        }),
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

    if (!res.ok || !data.success) {
      setError(data.error || "Setup failed");
      setSubmitting(false);
      return;
    }

    router.push(data.redirectTo || "/admin/dashboard");
    router.refresh();
  }

  return (
    <AuthPageShell
      title="Set Up Admin Account"
      subtitle="First-time Super Admin configuration"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <FormField
          label="Full Name"
          id="fullName"
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Jane Doe"
          required
          disabled={submitting}
          autoComplete="name"
        />

        <FormField
          label="Email"
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="admin@nexus.cm"
          required
          disabled={submitting}
          autoComplete="email"
        />

        <FormField
          label="Phone Number"
          id="phone"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+237653137081"
          required
          disabled={submitting}
          autoComplete="tel"
        />

        <FormField
          label="Password"
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Minimum 10 characters"
          required
          disabled={submitting}
          minLength={10}
          autoComplete="new-password"
        />

        <FormField
          label="Confirm Password"
          id="confirmPassword"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="••••••••"
          required
          disabled={submitting}
          autoComplete="new-password"
        />

        {error && (
          <p className={AUTH_ERROR_CLASS}>
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-md bg-nexus-cyan px-6 py-3 text-sm font-semibold text-nexus-dark transition hover:bg-nexus-cyan-bright disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-nexus-cyan"
        >
          {submitting ? "Setting up..." : "Create Admin Account"}
        </button>
      </form>
    </AuthPageShell>
  );
}
