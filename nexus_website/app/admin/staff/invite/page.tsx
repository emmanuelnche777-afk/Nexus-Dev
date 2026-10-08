"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Send, Info } from "lucide-react";
import Card from "@/components/admin/ui/card";
import PageHeader from "@/components/admin/ui/page-header";
import Button from "@/components/admin/ui/button";
import { InputField, SelectField } from "@/components/admin/ui/form-field";
import { ROLE_DESCRIPTIONS } from "@/lib/permissions-data";
import type { AdminRole } from "@/lib/permissions-data";

const ROLES: AdminRole[] = [
  "ACADEMY_MANAGER",
  "TECH_HUB_MANAGER",
  "MENTORSHIP_COORDINATOR",
  "CONTENT_EDITOR",
  "SUPPORT_STAFF",
  "NEWSLETTER_MANAGER",
  "FINANCE",
];

export default function InviteStaffPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<AdminRole>("CONTENT_EDITOR");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");

    const res = await fetch("/api/admin/staff", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, phone, role }),
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      setError(data.error || "Failed to invite staff member");
      setSubmitting(false);
      return;
    }

    setSuccess(`Invitation sent to ${email}`);
    setName("");
    setEmail("");
    setPhone("");
    setRole("CONTENT_EDITOR");
    setSubmitting(false);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Invite staff"
        subtitle="Add a new team member. They'll receive an email with a link to set their password."
        backHref="/admin/staff"
      />

      {error && (
        <Card>
          <p className="text-sm text-red-600">{error}</p>
        </Card>
      )}

      {success && (
        <Card>
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100">
              <Send className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="font-medium text-nexus-navy">{success.split(" ")[2]} was invited</p>
              <p className="text-sm text-nexus-navy/60">
                An email with setup instructions has been sent to {email}.
              </p>
            </div>
          </div>
        </Card>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <div className="space-y-6">
            <div>
              <p className="text-sm font-medium text-nexus-navy">Send invite to</p>
              <p className="text-sm text-nexus-navy/60">
                Choose a role and enter their details below. You can change the role later.
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <InputField
                  label="Full name"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Jane Doe"
                  required
                />
              </div>
              <div>
                <InputField
                  label="Email address"
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="jane@example.com"
                  required
                />
              </div>
              <div className="sm:col-span-2">
                <InputField
                  label="Phone number"
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+237 6XX XXX XXX"
                  helperText="Used for WhatsApp alerts"
                  required
                />
              </div>
              <div className="sm:col-span-2">
                <SelectField
                  label="Role"
                  id="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value as AdminRole)}
                  required
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r}>
                      {r.replace("_", " ")}
                    </option>
                  ))}
                </SelectField>
                <div className="mt-2 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                  <Info className="mb-1 h-4 w-4" />
                  <p>{ROLE_DESCRIPTIONS[role]}</p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <div className="flex items-center justify-between">
          <Button
            type="button"
            variant="secondary"
            onClick={() => router.push("/admin/staff")}
          >
            Cancel
          </Button>
          <Button type="submit" loading={submitting} disabled={!name || !email || !phone}>
            {submitting ? "Sending..." : "Send invitation"}
          </Button>
        </div>
      </form>
    </div>
  );
}
