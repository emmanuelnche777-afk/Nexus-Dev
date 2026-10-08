"use client";

import { useState } from "react";



export default function NewRegistrationForm() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    pathway: "student",
    program: "",
    message: "",
  });

  const pathways: { value: string; label: string }[] = [
    { value: "student", label: "Student - Academy Program" },
    { value: "client", label: "Client - Service Request" },
    { value: "partner", label: "Partner - Partnership" },
  ];

  const programs: { value: string; label: string }[] = [
    { value: "software-development", label: "Software Development" },
    { value: "ui-ux-design", label: "UI/UX Design" },
    { value: "graphic-design", label: "Graphic Design" },
    { value: "ai-automation", label: "AI Automation" },
    { value: "", label: "General (No Specific Program)" },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In production, would submit to API
    alert("New registration submitted!");
  };

  return (
    <div className="bg-nexus-white p-6 rounded-lg border border-nexus-cyan/20 max-w-md mx-auto">
      <h2 className="text-xl font-bold text-nexus-dark mb-6">
        New Registration
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-nexus-dark">
              Full Name *
            </label>
            <input
              id="fullName"
              name="fullName"
              required
              value={formData.fullName}
              onChange={(e) =>
                setFormData({ ...formData, fullName: e.target.value })
              }
              placeholder="John Doe"
              className="w-full rounded-md border border-nexus-navy/20 bg-nexus-gray px-3 py-2.5 text-sm text-nexus-dark outline-none focus:focus:border-nexus-cyan transition"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-nexus-dark">
              Email *
            </label>
            <input
              id="email"
              name="email"
              required
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              placeholder="john@email.com"
              className="w-full rounded-md border border-nexus-navy/20 bg-nexus-gray px-3 py-2.5 text-sm text-nexus-dark outline-none focus:focus:border-nexus-cyan transition"
            />
          </div>
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-nexus-dark">
            Phone
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={(e) =>
              setFormData({ ...formData, phone: e.target.value })
            }
            placeholder="+2376XXXXXXX"
            className="w-full rounded-md border border-nexus-navy/20 bg-nexus-gray px-3 py-2.5 text-sm text-nexus-dark outline-none focus:focus:border-nexus-cyan transition"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="pathway" className="block text-sm font-medium text-nexus-dark">
              Pathway *
            </label>
            <select
              id="pathway"
              name="pathway"
              required
              value={formData.pathway}
              onChange={(e) =>
                setFormData({ ...formData, pathway: e.target.value })
              }
              className="w-full rounded-md border border-nexus-navy/20 bg-nexus-gray px-3 py-2.5 text-sm text-nexus-dark outline-none focus:focus:border-nexus-cyan transition"
            >
              <option value="">Select pathway</option>
              {pathways.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="program" className="block text-sm font-medium text-nexus-dark">
              Program
            </label>
            <select
              id="program"
              name="program"
              value={formData.program}
              onChange={(e) =>
                setFormData({ ...formData, program: e.target.value })
              }
              className="w-full rounded-md border border-nexus-navy/20 bg-nexus-gray px-3 py-2.5 text-sm text-nexus-dark outline-none focus:focus:border-nexus-cyan transition"
            >
              <option value="">Select program</option>
              {programs.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="message" className="block text-sm font-medium text-nexus-dark">
            Message
          </label>
          <textarea
            id="message"
            name="message"
            rows={3}
            value={formData.message}
            onChange={(e) =>
              setFormData({ ...formData, message: e.target.value })
            }
            placeholder="Why do you want to join NEXUS Academy?"
            className="w-full rounded-md border border-nexus-navy/20 bg-nexus-gray px-3 py-2.5 text-sm text-nexus-dark outline-none focus:focus:border-nexus-cyan transition resize-none"
          />
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => window.history.back()}
            className="rounded-md border border-nexus-navy/20 px-4 py-2.5 text-sm font-medium text-nexus-gray/60 transition hover:bg-nexus-navy hover:text-nexus-white"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="rounded-md bg-nexus-cyan px-4 py-2.5 text-sm font-medium text-white transition hover:bg-nexus-cyan-bright"
          >
            Submit Registration
          </button>
        </div>
      </form>
    </div>
  );
}