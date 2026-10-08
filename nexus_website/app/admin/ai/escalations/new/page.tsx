"use client";

import { useState } from "react";
import Link from "next/link";

import { useRouter } from "next/navigation";

export default function EscalationNewPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    clientName: "",
    clientEmail: "",
    clientPhone: "",
    reason: "",
    aiMessages: [],
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      const res = await fetch("/api/admin/ai/escalations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        alert("Failed to create escalation: " + (data.error || "Unknown error"));
        return;
      }

      router.push("/admin/ai/escalations");
    } catch {
      alert("Network error. Please try again.");
    }
  }

  const inputClass =
    "w-full rounded-md border border-nexus-navy/10 bg-nexus-gray px-4 py-2 text-sm text-nexus-white outline-none focus:border-nexus-cyan focus:outline-none";
  const labelClass = "block text-sm font-medium text-nexus-gray/80";

  return (
    <div className="bg-nexus-white p-6 rounded-lg border border-nexus-cyan/20 max-w-2xl mx-auto">
      <header className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-nexus-dark">
          Create Escalation
        </h2>
        <Link
          href="/admin/ai/escalations"
          className="text-sm text-nexus-navy/70 hover:text-nexus-navy"
        >
          ← Back to Escalations
        </Link>
      </header>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className={labelClass}>Client Name</label>
          <input
            type="text"
            required
            value={formData.clientName}
            onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
            placeholder="John Doe"
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>Client Email</label>
          <input
            type="email"
            required
            value={formData.clientEmail}
            onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
            placeholder="john@email.com"
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>Client Phone</label>
          <input
            type="tel"
            value={formData.clientPhone}
            onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })}
            placeholder="+1-555-123-4567"
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>Reason for Escalation</label>
          <textarea
            rows={3}
            required
            value={formData.reason}
            onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
            placeholder="AI cannot resolve this issue..."
            className={inputClass}
          />
        </div>

        <div>
          <button type="submit" className="w-full rounded-md bg-nexus-cyan px-4 py-2.5 text-sm font-medium text-white transition hover:bg-nexus-cyan-bright">
            Create Escalation
          </button>
        </div>
      </form>
    </div>
  );
}
