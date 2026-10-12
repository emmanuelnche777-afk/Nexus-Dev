"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  BookOpen, Calendar, FileText, Handshake, Loader2, RefreshCw, UserPlus,
} from "lucide-react";

type DashboardStats = {
  blogPosts: number | null;
  journeyEntries: number | null;
  openOpportunities: number | null;
  activeCohorts: number | null;
  pendingApplications: number | null;
  activePartnerships: number | null;
};

const EMPTY_STATS: DashboardStats = {
  blogPosts: null,
  journeyEntries: null,
  openOpportunities: null,
  activeCohorts: null,
  pendingApplications: null,
  activePartnerships: null,
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>(EMPTY_STATS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState("");

  const loadDashboard = useCallback(async (refresh = false) => {
    if (refresh) { setLoading(true); setError(""); }
    try {
      const response = await fetch("/api/admin/dashboard/alerts", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not load dashboard data.");
      setStats({ ...EMPTY_STATS, ...(data.stats || {}) });
      setLastUpdated(data.lastUpdated || "");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not load dashboard data.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial loading is already true; the loader only sets state after its network request.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { void loadDashboard(); }, [loadDashboard]);

  const cards = [
    { label: "Blog Posts", value: stats.blogPosts, href: "/admin/content/blog", icon: FileText, color: "text-blue-600" },
    { label: "Journey Entries", value: stats.journeyEntries, href: "/admin/content/journey", icon: BookOpen, color: "text-emerald-600" },
    { label: "Applications Awaiting Review", value: stats.pendingApplications, href: "/admin/opportunity-applications", icon: UserPlus, color: "text-amber-700" },
    { label: "Partnerships In Progress", value: stats.activePartnerships, href: "/admin/partnerships", icon: Handshake, color: "text-violet-700" },
    { label: "Open Opportunity Listings", value: stats.openOpportunities, href: "/admin/content/opportunities", icon: BookOpen, color: "text-orange-700" },
    { label: "Active Cohorts", value: stats.activeCohorts, href: "/admin/academy/cohorts", icon: Calendar, color: "text-pink-700" },
  ].filter((card) => card.value !== null);

  return (
    <main className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-nexus-dark">Dashboard</h1>
          <p className="mt-1 text-sm text-nexus-navy">Overview of the admin areas assigned to your account.</p>
        </div>
        <button type="button" onClick={() => void loadDashboard(true)} disabled={loading} className="inline-flex items-center gap-2 rounded-lg border border-nexus-navy/15 bg-white px-3 py-2 text-sm font-semibold text-nexus-navy disabled:opacity-60">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          Refresh
        </button>
      </header>

      {error ? (
        <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          <p>{error}</p>
          <button type="button" onClick={() => void loadDashboard(true)} disabled={loading} className="mt-2 font-semibold underline">Try again</button>
        </div>
      ) : loading && cards.length === 0 ? (
        <div role="status" className="rounded-lg border border-nexus-navy/10 bg-white p-6 text-sm text-nexus-navy/70">Loading dashboard…</div>
      ) : (
        <>
          {cards.length === 0 ? (
            <p className="rounded-lg border border-nexus-navy/10 bg-white p-5 text-sm text-nexus-navy/70">No summary cards are available for your role.</p>
          ) : (
            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3" aria-label="Admin overview counts">
              {cards.map(({ label, value, href, icon: Icon, color }) => (
                <Link key={label} href={href} className="rounded-lg border border-nexus-cyan/20 bg-white p-5 transition hover:border-nexus-cyan hover:shadow-sm">
                  <div className="flex items-center justify-between gap-3">
                    <Icon className={`h-5 w-5 ${color}`} />
                    <span className="text-2xl font-bold text-nexus-dark">{value}</span>
                  </div>
                  <p className="mt-2 text-sm font-medium text-nexus-navy">{label}</p>
                </Link>
              ))}
            </section>
          )}
          {lastUpdated && <p className="text-xs text-nexus-navy/50">Updated {new Date(lastUpdated).toLocaleString()}</p>}
        </>
      )}

      <section className="rounded-lg border border-nexus-cyan/20 bg-white p-6">
        <h2 className="text-lg font-bold text-nexus-dark">Quick Actions</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["Manage blog posts", "/admin/content/blog"],
            ["Manage journey entries", "/admin/content/journey"],
            ["Manage Academy", "/admin/academy"],
            ["Review requests", "/admin/requests"],
          ].map(([label, href]) => (
            <Link key={href} href={href} className="rounded-md border border-nexus-cyan/20 p-4 text-sm font-medium text-nexus-dark transition hover:border-nexus-cyan">
              {label} <span aria-hidden="true" className="text-nexus-cyan">→</span>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
