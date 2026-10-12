"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, BarChart3, RefreshCw, TrendingUp, Users, DollarSign } from "lucide-react";
import LoadingState from "@/components/admin/LoadingState";

interface AnalyticsMetrics {
  role?: string;
  students?: {
    totalStudents?: number;
    activeStudents?: number;
    newThisMonth?: number;
    completedThisMonth?: number;
    suspensionRate?: number;
  };
  payments?: { totalRevenue?: number; paid?: number; pending?: number; failed?: number; refunded?: number };
  programs?: Array<{
    programId: string;
    programName: string;
    enrolled: number;
    completed: number;
    revenue?: number;
    conversionRate?: number;
  }>;
  opportunities?: { open?: number; won?: number; lost?: number; expired?: number };
  lastUpdated?: string;
}

export default function AnalyticsPage() {
  const [metrics, setMetrics] = useState<AnalyticsMetrics>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadMetrics = useCallback(async (refresh = false) => {
    if (refresh) { setLoading(true); setError(""); }
    try {
      const res = await fetch("/api/admin/analytics", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not load analytics.");
      setMetrics(data.metrics || {});
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not load analytics.");
    } finally {
      setLoading(false);
    }
  }, []);

  const programs = metrics.programs ?? [];
  const showAcademy = metrics.role === "SUPER_ADMIN" || metrics.role === "ACADEMY_MANAGER";
  const showFinance = metrics.role === "SUPER_ADMIN" || metrics.role === "FINANCE";
  const showOpportunities = metrics.role === "SUPER_ADMIN" || metrics.role === "CONTENT_EDITOR";

  // Initial loading is already true; the loader only sets state after its network request.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadMetrics();
  }, [loadMetrics]);

  if (loading && !metrics.role) {
    return <LoadingState label="Loading analytics..." />;
  }

  if (error) {
    return <main className="space-y-4"><Link href="/admin/dashboard" className="inline-flex items-center gap-2 text-sm text-nexus-navy/70 hover:text-nexus-cyan"><ArrowLeft className="h-4 w-4" />Dashboard</Link><div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800"><p>{error}</p><button type="button" onClick={() => void loadMetrics(true)} disabled={loading} className="mt-2 inline-flex items-center gap-2 font-semibold underline"><RefreshCw className="h-4 w-4" />Try again</button></div></main>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/dashboard"
          className="rounded-md p-2 text-nexus-navy hover:bg-nexus-navy/5"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-nexus-navy">Analytics</h1>
          <p className="mt-1 text-sm text-nexus-navy/70">
            Business metrics and performance overview
          </p>
        </div>
        <button type="button" onClick={() => void loadMetrics(true)} disabled={loading} className="ml-auto inline-flex items-center gap-2 rounded-md border border-nexus-navy/15 px-3 py-2 text-sm disabled:opacity-60"><RefreshCw className="h-4 w-4" />Refresh</button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {showAcademy && <MetricCard
          label="Total Students"
          value={metrics.students?.totalStudents || 0}
          icon={Users}
          color="text-blue-600"
        />}
        {showAcademy && <MetricCard
          label="Active Students"
          value={metrics.students?.activeStudents || 0}
          icon={TrendingUp}
          color="text-emerald-600"
        />}
        {showFinance && <MetricCard
          label="Total Revenue"
          value={metrics.payments?.totalRevenue || 0}
          prefix="XAF "
          icon={DollarSign}
          color="text-green-600"
        />}
        {showFinance && <MetricCard
          label="Paid Payments"
          value={metrics.payments?.paid || 0}
          icon={BarChart3}
          color="text-nexus-cyan"
        />}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {showAcademy && <section className="rounded-xl border border-nexus-navy/10 bg-white p-6">
          <h2 className="text-lg font-bold text-nexus-navy">Program Performance</h2>
          <div className="mt-4 space-y-3">
            {programs.length === 0 ? (
              <p className="text-sm text-nexus-navy/60">No program data yet.</p>
            ) : (
              programs.map((program) => (
                <div
                  key={program.programId}
                  className="flex items-center justify-between rounded-lg border border-nexus-navy/10 p-3"
                >
                  <div>
                    <p className="font-medium text-nexus-navy">{program.programName}</p>
                    <p className="text-xs text-nexus-navy/60">
                      {program.enrolled} enrolled • {program.completed} completed
                    </p>
                  </div>
                  <div className="text-right">
                    {metrics.role === "SUPER_ADMIN" && <p className="text-sm font-semibold text-nexus-navy">
                      XAF {program.revenue?.toLocaleString() || 0}
                    </p>}
                    <p className="text-xs text-nexus-navy/60">
                      {program.conversionRate || 0}% conversion
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>}

        {showFinance && <section className="rounded-xl border border-nexus-navy/10 bg-white p-6">
          <h2 className="text-lg font-bold text-nexus-navy">Payments Overview</h2>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-nexus-navy/10 p-3">
              <p className="text-xs text-nexus-navy/60">Pending</p>
              <p className="text-xl font-bold text-amber-600">{metrics.payments?.pending || 0}</p>
            </div>
            <div className="rounded-lg border border-nexus-navy/10 p-3">
              <p className="text-xs text-nexus-navy/60">Paid</p>
              <p className="text-xl font-bold text-emerald-600">{metrics.payments?.paid || 0}</p>
            </div>
            <div className="rounded-lg border border-nexus-navy/10 p-3">
              <p className="text-xs text-nexus-navy/60">Failed</p>
              <p className="text-xl font-bold text-red-600">{metrics.payments?.failed || 0}</p>
            </div>
            <div className="rounded-lg border border-nexus-navy/10 p-3">
              <p className="text-xs text-nexus-navy/60">Refunded</p>
              <p className="text-xl font-bold text-gray-600">{metrics.payments?.refunded || 0}</p>
            </div>
          </div>
        </section>}

        {showOpportunities && <section className="rounded-xl border border-nexus-navy/10 bg-white p-6">
          <h2 className="text-lg font-bold text-nexus-navy">Opportunities</h2>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-nexus-navy/10 p-3">
              <p className="text-xs text-nexus-navy/60">Open</p>
              <p className="text-xl font-bold text-emerald-600">{metrics.opportunities?.open || 0}</p>
            </div>
            <div className="rounded-lg border border-nexus-navy/10 p-3">
              <p className="text-xs text-nexus-navy/60">Won</p>
              <p className="text-xl font-bold text-blue-600">{metrics.opportunities?.won || 0}</p>
            </div>
            <div className="rounded-lg border border-nexus-navy/10 p-3">
              <p className="text-xs text-nexus-navy/60">Lost</p>
              <p className="text-xl font-bold text-red-600">{metrics.opportunities?.lost || 0}</p>
            </div>
            <div className="rounded-lg border border-nexus-navy/10 p-3">
              <p className="text-xs text-nexus-navy/60">Expired</p>
              <p className="text-xl font-bold text-gray-600">{metrics.opportunities?.expired || 0}</p>
            </div>
          </div>
        </section>}

        {showAcademy && <section className="rounded-xl border border-nexus-navy/10 bg-white p-6">
          <h2 className="text-lg font-bold text-nexus-navy">This Month</h2>
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-nexus-navy">New Students</span>
              <span className="text-sm font-semibold text-nexus-navy">{metrics.students?.newThisMonth || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-nexus-navy">Completed</span>
              <span className="text-sm font-semibold text-nexus-navy">{metrics.students?.completedThisMonth || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-nexus-navy">Suspension Rate</span>
              <span className="text-sm font-semibold text-nexus-navy">{metrics.students?.suspensionRate || 0}%</span>
            </div>
          </div>
        </section>}
      </div>

      <p className="text-xs text-nexus-navy/50">
        Last updated: {metrics.lastUpdated ? new Date(metrics.lastUpdated).toLocaleString() : "Never"}
      </p>
    </div>
  );
}

function MetricCard({
  label,
  value,
  prefix,
  icon: Icon,
  color,
}: {
  label: string;
  value: number;
  prefix?: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}) {
  return (
    <div className="rounded-xl border border-nexus-navy/10 bg-white p-4">
      <div className="flex items-center justify-between">
        <div className={`rounded-lg bg-nexus-gray/50 p-2 ${color}`}>
          <Icon className="h-4 w-4" />
        </div>
        <span className="text-xs text-nexus-navy/60">{label}</span>
      </div>
      <p className={`mt-2 text-2xl font-bold ${color}`}>
        {prefix}{value.toLocaleString()}
      </p>
    </div>
  );
}
