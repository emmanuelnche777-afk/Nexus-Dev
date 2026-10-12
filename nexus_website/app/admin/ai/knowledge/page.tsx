"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { BookOpen, RefreshCw } from "lucide-react";

interface KnowledgeEntry {
  id: string;
  title: string;
  content: string;
  category: "academy" | "policy" | "service" | "faq" | "general";
  approved: boolean;
  createdAt: string;
  createdBy?: string;
}

export default function AIKnowledgeBase() {
  const [knowledge, setKnowledge] = useState<KnowledgeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const loadKnowledge = useCallback(async (refresh = false) => {
    if (refresh) { setLoading(true); setError(""); }
    try {
      const response = await fetch("/api/admin/ai/knowledge", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not load knowledge entries.");
      setKnowledge(Array.isArray(data.knowledge) ? data.knowledge : []);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not load knowledge entries.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial loading is already true; the loader only sets state after its network request.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { void loadKnowledge(); }, [loadKnowledge]);

  const filteredKnowledge = knowledge.filter((k) => {
    const matchesCategory = filterCategory === "All" || k.category === filterCategory;
    const matchesSearch = k.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      k.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      k.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="bg-nexus-white p-6 rounded-lg border border-nexus-cyan/20">
      <header className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <BookOpen className="h-5 w-5 text-nexus-cyan" />
          <h1 className="text-xl font-bold text-nexus-dark">Knowledge Base</h1>
        </div>
        <div className="flex items-center gap-3"><button type="button" onClick={() => void loadKnowledge(true)} disabled={loading} className="inline-flex items-center gap-2 rounded-md border border-nexus-navy/15 px-3 py-2 text-sm"><RefreshCw className="h-4 w-4" />Refresh</button><Link href="/admin/ai" className="text-sm text-nexus-navy hover:text-nexus-cyan">← Back to AI Management</Link></div>
      </header>

      <div role="note" className="mb-5 rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950">
        Approved entries can be included in answers to public visitors. Never add client, student, applicant, staff, payment, login, or other confidential information. Approval checks also block common email, phone, and credential patterns.
      </div>

      <div className="mb-4">
        <select
          onChange={(e) => setFilterCategory(e.target.value)}
          className="rounded-md border border-nexus-navy/10 bg-white px-3 py-2 text-sm text-nexus-dark focus:border-nexus-cyan"
        >
          <option value="All">Show All Categories</option>
          <option value="academy">Academy</option>
          <option value="policy">Policy</option>
          <option value="service">Service</option>
          <option value="faq">FAQ</option>
          <option value="general">General</option>
        </select>
        <input
          type="text"
          placeholder="Search knowledge..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="ml-4 rounded-md border border-nexus-navy/10 bg-white px-3 py-2 text-sm text-nexus-dark placeholder:text-nexus-navy/40 focus:border-nexus-cyan focus:outline-none"
        />
      </div>

      <div className="mt-4">
        {error ? (
          <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-nexus-navy-800">{error} <button type="button" onClick={() => void loadKnowledge(true)} className="ml-2 font-semibold underline">Try again</button></div>
        ) : loading ? (
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-nexus-cyan border-t-transparent" />
        ) : knowledge.length === 0 ? (
          <p className="text-nexus-navy mt-4">No knowledge entries found</p>
        ) : filteredKnowledge.length === 0 ? (
          <p className="text-nexus-navy mt-4">No knowledge entries match those filters.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {filteredKnowledge.map((entry) => (
              <Link
                href={`/admin/ai/knowledge/${entry.id}`}
                key={entry.id}
                className="block rounded-lg border border-nexus-cyan/10 bg-white p-4 transition hover:border-nexus-cyan/30"
              >
                <div className="flex items-start gap-3">
                  <div className="flex-1">
                    <h3 className="font-medium text-nexus-dark">{entry.title}</h3>
                    <p className="mt-1 text-sm text-nexus-navy">
                      {entry.content.substring(0, 100) }...
                    </p>
                  </div>
                  <div className="text-xs text-nexus-navy/70">
                    {entry.category}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="mt-6">
        <Link
          href="/admin/ai/knowledge/new"
          className="flex items-center gap-2 rounded-md bg-nexus-cyan px-4 py-2 text-sm font-medium text-white transition hover:bg-nexus-cyan-bright"
        >
          <BookOpen className="h-4 w-4" /> Add Knowledge Entry
        </Link>
      </div>
    </div>
  );
}
