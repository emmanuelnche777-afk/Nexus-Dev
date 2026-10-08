"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function KnowledgeNewPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("academy");

  async function handleSubmit() {
    await fetch("/api/admin/ai/knowledge", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content, category }),
    });
    router.push("/admin/ai/knowledge");
  }

  return (
    <div className="bg-nexus-white p-6 rounded-lg border border-nexus-cyan/20 max-w-2xl mx-auto">
      <header className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-nexus-dark">Add Knowledge Entry</h2>
        <Link href="/admin/ai/knowledge" className="text-sm text-nexus-navy hover:text-nexus-navy">
          ← Back to Knowledge Base
        </Link>
      </header>

      <div role="note" className="mb-5 rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950">
        New entries stay unapproved until reviewed. Approving an entry makes it available to the public assistant, so include only information intended for everyone. Never include client, student, applicant, staff, payment, login, or confidential records.
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label>Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter knowledge title"
            className="w-full rounded-lg border border-nexus-navy/10 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label>Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded-lg border border-nexus-navy/10 px-3 py-2 text-sm"
          >
            <option value="academy">Academy</option>
            <option value="policy">Policy</option>
            <option value="service">Service</option>
            <option value="faq">FAQ</option>
            <option value="general">General</option>
          </select>
        </div>

        <div>
          <label>Content</label>
          <textarea
            rows={3}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Enter knowledge content..."
            className="w-full rounded-lg border border-nexus-navy/10 px-3 py-2 text-sm resize-none"
          />
        </div>

        <button type="submit" className="w-full rounded-md bg-nexus-cyan px-4 py-2.5 text-sm font-medium text-white transition hover:bg-nexus-cyan-bright">
          Add Knowledge Entry
        </button>
      </form>
    </div>
  );
}
