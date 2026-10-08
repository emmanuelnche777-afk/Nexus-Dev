"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BookOpen } from "lucide-react";

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
  const [filterCategory, setFilterCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetch("/api/admin/ai/knowledge", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        setKnowledge(data.knowledge || []);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

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
        <Link
          href="/admin/ai"
          className="text-sm text-nexus-navy hover:text-nexus-navy"
        >
          ← Back to AI Management
        </Link>
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
        {loading ? (
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-nexus-cyan border-t-transparent" />
        ) : knowledge.length === 0 ? (
          <p className="text-nexus-navy mt-4">No knowledge entries found</p>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {filteredKnowledge.map((entry) => (
              <div
                key={entry.id}
                className="p-4 rounded-lg border border-nexus-cyan/10 bg-white hover:border-nexus-cyan/30 transition"
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
              </div>
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
