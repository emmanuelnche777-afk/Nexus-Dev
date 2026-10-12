"use client";

import { useCallback, useEffect, useState } from "react";

import Link from "next/link";
import { FileText, Map, BookOpen as OpportunitiesIcon, ArrowRight, Share2 } from "lucide-react";

interface BlogStats {
  posts: number;
}

interface JourneyStats {
  entries: number;
}

interface OpportunityStats {
  opportunities: number;
}

export default function ContentOverviewPage() {
  const [blogStats, setBlogStats] = useState<BlogStats>({ posts: 0 });
  const [journeyStats, setJourneyStats] = useState<JourneyStats>({ entries: 0 });
  const [oppStats, setOppStats] = useState<OpportunityStats>({ opportunities: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadStats = useCallback(async (refresh = false) => {
    if (refresh) { setLoading(true); setError(""); }
    try {
      const [blogRes, journeyRes, oppRes] = await Promise.all([
        fetch("/api/admin/content/blog"),
        fetch("/api/admin/content/journey"),
        fetch("/api/admin/opportunities"),
      ]);

      const responses = [blogRes, journeyRes, oppRes];
      const data = await Promise.all(responses.map((response) => response.json()));
      const failed = responses.find((response) => !response.ok);
      if (failed) throw new Error(data[responses.indexOf(failed)]?.error || "Could not load content totals.");
      const [blog, journey, opp] = data;

      setBlogStats({ posts: blog.posts?.length || 0 });
      setJourneyStats({ entries: journey.entries?.length || 0 });
      setOppStats({ opportunities: opp.opportunities?.length || 0 });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not load content totals.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial loading is already true; the loader only sets state after its network request.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadStats();
  }, [loadStats]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-nexus-navy">Content Management</h1>
        <p className="mt-1 text-sm text-nexus-navy">
          Manage blog posts, journey entries, and opportunities
        </p>
      </div>

      {error && <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error} <button type="button" onClick={() => void loadStats(true)} disabled={loading} className="ml-2 font-semibold underline">Try again</button></div>}

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Link
          href="/admin/content/blog"
          className="group rounded-xl border border-nexus-navy/10 bg-white p-6 transition hover:border-nexus-cyan/30 hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="rounded-lg bg-blue-50 p-3">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-nexus-navy">{loading ? "…" : error ? "—" : blogStats.posts}</p>
                <p className="text-sm text-nexus-navy">Blog Posts</p>
              </div>
            </div>
            <ArrowRight className="h-5 w-5 text-nexus-cyan transition group-hover:translate-x-1" />
          </div>
        </Link>

        <Link
          href="/admin/content/journey"
          className="group rounded-xl border border-nexus-navy/10 bg-white p-6 transition hover:border-nexus-cyan/30 hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="rounded-lg bg-emerald-50 p-3">
                <Map className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-nexus-navy">{loading ? "…" : error ? "—" : journeyStats.entries}</p>
                <p className="text-sm text-nexus-navy">Journey Entries</p>
              </div>
            </div>
            <ArrowRight className="h-5 w-5 text-nexus-cyan transition group-hover:translate-x-1" />
          </div>
        </Link>

        <Link
          href="/admin/content/opportunities"
          className="group rounded-xl border border-nexus-navy/10 bg-white p-6 transition hover:border-nexus-cyan/30 hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="rounded-lg bg-orange-50 p-3">
                <OpportunitiesIcon className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-nexus-navy">{loading ? "…" : error ? "—" : oppStats.opportunities}</p>
                <p className="text-sm text-nexus-navy">Opportunities</p>
              </div>
            </div>
            <ArrowRight className="h-5 w-5 text-nexus-cyan transition group-hover:translate-x-1" />
          </div>
        </Link>

        <Link
          href="/admin/content/social"
          className="group rounded-xl border border-nexus-navy/10 bg-white p-6 transition hover:border-nexus-cyan/30 hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="rounded-lg bg-cyan-50 p-3"><Share2 className="h-6 w-6 text-nexus-cyan" /></div>
              <div><p className="text-sm font-semibold text-nexus-navy">Social post review</p><p className="text-sm text-nexus-navy/70">Approve and schedule drafts</p></div>
            </div>
            <ArrowRight className="h-5 w-5 text-nexus-cyan transition group-hover:translate-x-1" />
          </div>
        </Link>
      </div>
    </div>
  );
}
