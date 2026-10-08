"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { FormField, AUTH_ERROR_CLASS } from "@/components/admin/auth/AuthPageShell";

type LoginState = "idle" | "loading" | "error";

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [state, setState] = useState<LoginState>("idle");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setState("loading");
    setError("");

    let res: Response;
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, rememberMe }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
    } catch (err) {
      setError(
        err instanceof Error && err.name === "AbortError"
          ? "Request timed out. Please try again."
          : "Network error. Please try again."
      );
      setState("error");
      return;
    }

    let data;
    try {
      data = await res.json();
    } catch {
      setError(`Server error (HTTP ${res.status}). Check the server terminal.`);
      setState("error");
      return;
    }

    if (!res.ok || !data.success) {
      setError(data.error || "Invalid credentials");
      setState("error");
      return;
    }

    if (data.requires2FA) {
      router.push("/admin/2fa");
      return;
    }

    window.location.href = "/admin/dashboard"; // eslint-disable-line @next/next/no-location-assign-relative-destination
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <FormField
        label="Email"
        id="email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="admin@example.com"
        required
        autoComplete="email"
      />

      <FormField
        label="Password"
        id="password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="••••••••"
        required
        autoComplete="current-password"
      />

      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="h-4 w-4 rounded border-nexus-gray/50 text-nexus-cyan focus:ring-nexus-cyan"
          />
          <span className="text-sm text-nexus-white">Remember me (30 days)</span>
        </label>
        <Link
          href="/admin/forgot-password"
          className="text-sm text-nexus-cyan hover:underline"
        >
          Forgot password?
        </Link>
      </div>

      {state === "error" && (
        <p className={AUTH_ERROR_CLASS}>
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={state === "loading"}
        className="w-full rounded-md bg-nexus-cyan px-6 py-3 text-sm font-semibold text-nexus-dark transition hover:bg-nexus-cyan-bright disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-nexus-cyan"
      >
        {state === "loading" ? "Signing in..." : "Sign In"}
      </button>
    </form>
  );
}
