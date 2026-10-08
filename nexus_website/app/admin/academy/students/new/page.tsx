"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Users, ArrowLeft, Loader2 } from "lucide-react";

export default function StudentRegistrationForm() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    programSlug: "software-development",
    status: "Pending",
  });

  const programs = [
    { value: "software-development", label: "Software Development" },
    { value: "ui-ux-design", label: "UI/UX Design" },
    { value: "graphic-design", label: "Graphic Design" },
    { value: "ai-automation", label: "AI Automation" },
    { value: "ethical-hacking-foundations", label: "Ethical Hacking Foundations" },
  ];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/academy/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Failed to register student");
        return;
      }
      router.push("/admin/academy/students");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to register student");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl">
      <div className="mb-6 flex items-center gap-3">
        <Link
          href="/admin/academy/students"
          className="rounded-md p-2 text-nexus-navy hover:bg-nexus-navy/5"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-nexus-navy">Register New Student</h1>
          <p className="mt-1 text-sm text-nexus-navy/70">
            Create an official student record
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-lg border border-nexus-cyan/20 bg-white p-6"
      >
        <div>
          <label className="block text-sm font-medium text-nexus-dark">
            Full Name *
          </label>
          <input
            required
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            placeholder="John Doe"
            className="mt-1 w-full rounded-md border border-nexus-navy/20 bg-nexus-gray px-3 py-2.5 text-sm text-nexus-dark outline-none focus:border-nexus-cyan transition"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-nexus-dark">Email *</label>
          <input
            required
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="john@email.com"
            className="mt-1 w-full rounded-md border border-nexus-navy/20 bg-nexus-gray px-3 py-2.5 text-sm text-nexus-dark outline-none focus:border-nexus-cyan transition"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-nexus-dark">Phone</label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="+2376XXXXXXX"
            className="mt-1 w-full rounded-md border border-nexus-navy/20 bg-nexus-gray px-3 py-2.5 text-sm text-nexus-dark outline-none focus:border-nexus-cyan transition"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-nexus-dark">Program *</label>
          <select
            required
            value={formData.programSlug}
            onChange={(e) => setFormData({ ...formData, programSlug: e.target.value })}
            className="mt-1 w-full rounded-md border border-nexus-navy/20 bg-nexus-gray px-3 py-2.5 text-sm text-nexus-dark outline-none focus:border-nexus-cyan transition"
          >
            {programs.map((p) => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-2">
          <Link
            href="/admin/academy/students"
            className="rounded-lg border border-nexus-navy/10 px-4 py-2 text-sm font-medium text-nexus-navy hover:bg-nexus-navy/5"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 rounded-lg bg-nexus-cyan px-4 py-2 text-sm font-medium text-white transition hover:bg-nexus-cyan-bright disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Users className="h-4 w-4" />
                Register Student
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
