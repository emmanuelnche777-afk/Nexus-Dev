"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Search,
  Briefcase,
  ChevronRight,
  Paperclip,
} from "lucide-react";
import LoadingState from "@/components/admin/LoadingState";
import EmptyState from "@/components/admin/EmptyState";

interface OwnerSummary {
  id: string;
  name: string;
  role: string;
}

interface SlaResult {
  state: string;
  ageHours: number | null;
  targetHours: number | null;
  overdue: boolean;
}

interface Application {
  id: string;
  opportunityId: string;
  fullName: string;
  email: string;
  phone: string | null;
  documentUrls: string[];
  status: string;
  createdAt: string;
  respondedAt: string | null;
  owner: OwnerSummary | null;
  sla: SlaResult;
  opportunity: {
    id: string;
    title: string;
    type: string;
    status: string;
  };
}

const SLA_STYLES: Record<string, string> = {
  overdue: "bg-red-100 text-red-700",
  due_soon: "bg-amber-100 text-amber-700",
  on_track: "bg-nexus-navy/5 text-nexus-navy/60",
  done: "bg-emerald-100 text-emerald-700",
  none: "bg-gray-100 text-gray-500",
};

const OWNER_FILTERS = [
  ["all", "All"],
  ["me", "Assigned to me"],
  ["unassigned", "Unassigned"],
] as const;

const STATUS_FILTERS = [
  ["all", "All"],
  ["NEW", "New"],
  ["UNDER_REVIEW", "Under Review"],
  ["MATCHED", "Matched"],
  ["NOT_A_FIT", "Not A Fit"],
] as const;

const STATUS_STYLES: Record<string, string> = {
  NEW: "bg-amber-100 text-amber-700",
  UNDER_REVIEW: "bg-blue-100 text-blue-700",
  MATCHED: "bg-emerald-100 text-emerald-700",
  NOT_A_FIT: "bg-red-100 text-red-700",
};

export default function OpportunityApplicationsPage() {
  const [opportunities, setOpportunities] = useState<
    { id: string; title: string }[]
  >([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [total, setTotal] = useState(0);
  const [overdue, setOverdue] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [opportunityFilter, setOpportunityFilter] = useState<string>("all");
  const [ownerFilter, setOwnerFilter] = useState<string>("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadApplications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, opportunityFilter, ownerFilter]);

  async function loadApplications() {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        status: statusFilter,
        opportunityId: opportunityFilter,
        owner: ownerFilter,
      });
      if (search.trim()) query.set("search", search.trim());
      const res = await fetch(`/api/admin/opportunity-applications?${query.toString()}`);
      const data = await res.json();
      setApplications(data.applications || []);
      setTotal(data.total ?? (data.applications || []).length);
      setOverdue(data.overdue ?? 0);
      setHasMore(Boolean(data.hasMore));
    } catch (error) {
      console.error("Failed to load opportunity applications:", error);
    } finally {
      setLoading(false);
    }
  }

  async function loadMore() {
    setLoadingMore(true);
    try {
      const query = new URLSearchParams({
        status: statusFilter,
        opportunityId: opportunityFilter,
        owner: ownerFilter,
        limit: "50",
      });
      if (search.trim()) query.set("search", search.trim());
      const last = applications[applications.length - 1];
      if (last) query.set("cursor", last.id);
      const res = await fetch(`/api/admin/opportunity-applications?${query.toString()}`);
      const data = await res.json();
      setApplications((prev) => [...prev, ...(data.applications || [])]);
      setHasMore(Boolean(data.hasMore));
    } catch (error) {
      console.error("Failed to load more applications:", error);
    } finally {
      setLoadingMore(false);
    }
  }

  useEffect(() => {
    // Scoped options endpoint: this page previously fetched the listings API,
    // which requires the listings-write permission that intake roles do not hold,
    // so their filter dropdown rendered empty.
    fetch("/api/admin/opportunity-applications/options", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => setOpportunities(data.opportunities || []))
      .catch(() => setOpportunities([]));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/dashboard"
          className="rounded-md p-2 text-nexus-navy/60 hover:bg-nexus-navy/5"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-nexus-navy">
            Opportunity Applications
          </h1>
          <p className="mt-1 text-sm text-nexus-navy/70">
            Applications submitted against open opportunities from the public Join
            Us page
          </p>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-nexus-navy/40" />
        <input
          type="text"
          placeholder="Search by name, email or role..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") loadApplications();
          }}
          className="w-full rounded-lg border border-nexus-navy/10 bg-white py-2.5 pl-10 pr-4 text-sm text-nexus-navy placeholder:text-nexus-navy/40 focus:border-nexus-cyan focus:outline-none"
        />
      </div>

      <div className="space-y-3">
        {overdue > 0 && (
          <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {overdue} application{overdue !== 1 ? "s have" : " has"} passed the
            response target in the current stage.
          </p>
        )}
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Owner filter">
          {OWNER_FILTERS.map(([value, label]) => (
            <button
              key={value}
              role="tab"
              aria-selected={ownerFilter === value}
              onClick={() => setOwnerFilter(value)}
              className={`rounded-lg px-4 py-2 text-sm font-medium ${
                ownerFilter === value
                  ? "bg-nexus-cyan text-white"
                  : "border border-nexus-navy/10 bg-white text-nexus-navy hover:bg-nexus-navy/5"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Status filter">
          {STATUS_FILTERS.map(([value, label]) => (
            <button
              key={value}
              role="tab"
              aria-selected={statusFilter === value}
              onClick={() => setStatusFilter(value)}
              className={`rounded-lg px-4 py-2 text-sm font-medium ${
                statusFilter === value
                  ? "bg-nexus-cyan text-white"
                  : "border border-nexus-navy/10 bg-white text-nexus-navy hover:bg-nexus-navy/5"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Opportunity filter">
          <button
            role="tab"
            aria-selected={opportunityFilter === "all"}
            onClick={() => setOpportunityFilter("all")}
            className={`rounded-lg px-4 py-2 text-sm font-medium ${
              opportunityFilter === "all"
                ? "bg-nexus-navy text-white"
                : "border border-nexus-navy/10 bg-white text-nexus-navy hover:bg-nexus-navy/5"
            }`}
          >
            All Opportunities
          </button>
          {opportunities.map((opp) => (
            <button
              key={opp.id}
              role="tab"
              aria-selected={opportunityFilter === opp.id}
              onClick={() => setOpportunityFilter(opp.id)}
              className={`rounded-lg px-4 py-2 text-sm font-medium ${
                opportunityFilter === opp.id
                  ? "bg-nexus-navy text-white"
                  : "border border-nexus-navy/10 bg-white text-nexus-navy hover:bg-nexus-navy/5"
              }`}
            >
              {opp.title}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-nexus-navy/10 bg-white">
        {loading ? (
          <LoadingState label="Loading applications..." />
        ) : applications.length === 0 ? (
          <EmptyState
            icon={Briefcase}
            title="No applications found"
            description="Applications to open opportunities from the public Join Us page will appear here."
          />
        ) : (
          <div className="divide-y divide-nexus-navy/10">
            {applications.map((item) => (
              <Link
                key={item.id}
                href={`/admin/opportunity-applications/${item.id}`}
                className="flex items-center justify-between gap-4 px-6 py-4 transition hover:bg-nexus-gray/40"
              >
                <div className="flex min-w-0 flex-1 items-center gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-orange-600">
                    <Briefcase className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-medium text-nexus-navy">
                      {item.fullName}
                    </p>
                    <p className="truncate text-sm text-nexus-navy/70">
                      {item.email}
                      {item.phone ? ` • ${item.phone}` : ""}
                    </p>
                    <p className="truncate text-xs text-nexus-navy/50">
                      {item.opportunity.title} •{" "}
                      {new Date(item.createdAt).toLocaleDateString()}
                      {item.owner ? ` • ${item.owner.name}` : " • unassigned"}
                      {item.documentUrls.length > 0 && (
                        <span className="ml-2 inline-flex items-center gap-1">
                          <Paperclip className="h-3 w-3" />
                          {item.documentUrls.length}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {item.sla.state !== "done" && (
                    <span
                      title={`Time in current stage. Target ${item.sla.targetHours ?? "?"}h.`}
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        SLA_STYLES[item.sla.state] || SLA_STYLES.none
                      }`}
                    >
                      {item.sla.state === "overdue"
                        ? "Overdue"
                        : item.sla.state === "due_soon"
                          ? "Due soon"
                          : item.sla.ageHours != null
                            ? `${item.sla.ageHours}h`
                            : "—"}
                    </span>
                  )}
                  <span
                    className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      STATUS_STYLES[item.status] || "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {item.status}
                  </span>
                  <ChevronRight className="h-4 w-4 text-nexus-navy/40" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {!loading && (
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-nexus-navy/60">
          <span>
            Showing {applications.length} of {total}
            {total !== applications.length && hasMore
              ? " — load more for the rest"
              : ""}
          </span>
          {hasMore && (
            <button
              onClick={loadMore}
              disabled={loadingMore}
              className="rounded-lg border border-nexus-navy/10 bg-white px-4 py-2 text-sm font-medium text-nexus-navy transition hover:bg-nexus-navy/5 disabled:opacity-50"
            >
              {loadingMore ? "Loading..." : "Load more"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}