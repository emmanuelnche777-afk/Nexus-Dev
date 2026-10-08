"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Search, UserPlus, ChevronRight } from "lucide-react";
import LoadingState from "@/components/admin/LoadingState";
import EmptyState from "@/components/admin/EmptyState";
import {
  PATHWAY_LABELS,
  PATHWAY_IDS,
  type PathwayId,
} from "@/lib/join-us-pathways";

interface OwnerSummary {
  id: string;
  name: string;
  role: string;
}

interface SlaResult {
  state: "on_track" | "due_soon" | "overdue" | "done" | "none";
  ageHours: number | null;
  targetHours: number | null;
  overdue: boolean;
}

interface Inquiry {
  id: string;
  pathway: string;
  fullName: string;
  email: string;
  phone: string | null;
  status: string;
  createdAt: string;
  respondedAt: string | null;
  owner: OwnerSummary | null;
  sla: SlaResult;
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
  ["REVIEWED", "Reviewed"],
  ["RESPONDED", "Responded"],
] as const;

const STATUS_STYLES: Record<string, string> = {
  NEW: "bg-amber-100 text-amber-700",
  REVIEWED: "bg-blue-100 text-blue-700",
  RESPONDED: "bg-emerald-100 text-emerald-700",
};

export default function JoinersPage() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [total, setTotal] = useState(0);
  const [overdue, setOverdue] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [pathwayFilter, setPathwayFilter] = useState<string>("all");
  const [ownerFilter, setOwnerFilter] = useState<string>("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadInquiries();
    // Filter changes refetch the corresponding collection view.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, pathwayFilter, ownerFilter]);

  async function loadInquiries() {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        status: statusFilter,
        pathway: pathwayFilter,
        owner: ownerFilter,
      });
      if (search.trim()) query.set("search", search.trim());
      const res = await fetch(`/api/admin/joiners?${query.toString()}`);
      const data = await res.json();
      setInquiries(data.inquiries || []);
      // Previously the endpoint returned a bare array capped at 200 rows, so a
      // long queue looked complete while silently hiding entries.
      setTotal(data.total ?? (data.inquiries || []).length);
      setOverdue(data.overdue ?? 0);
      setHasMore(Boolean(data.hasMore));
    } catch (error) {
      console.error("Failed to load joiners:", error);
    } finally {
      setLoading(false);
    }
  }

  async function loadMore() {
    setLoadingMore(true);
    try {
      const query = new URLSearchParams({
        status: statusFilter,
        pathway: pathwayFilter,
        owner: ownerFilter,
        limit: "50",
      });
      if (search.trim()) query.set("search", search.trim());
      const last = inquiries[inquiries.length - 1];
      if (last) query.set("cursor", last.id);
      const res = await fetch(`/api/admin/joiners?${query.toString()}`);
      const data = await res.json();
      setInquiries((prev) => [...prev, ...(data.inquiries || [])]);
      setHasMore(Boolean(data.hasMore));
    } catch (error) {
      console.error("Failed to load more joiners:", error);
    } finally {
      setLoadingMore(false);
    }
  }

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
          <h1 className="text-2xl font-bold text-nexus-navy">Joiners</h1>
          <p className="mt-1 text-sm text-nexus-navy/70">
            Public &quot;Join Us&quot; pathway submissions — students, clients, volunteers,
            mentors, partners and investors
          </p>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-nexus-navy/40" />
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") loadInquiries();
          }}
          className="w-full rounded-lg border border-nexus-navy/10 bg-white py-2.5 pl-10 pr-4 text-sm text-nexus-navy placeholder:text-nexus-navy/40 focus:border-nexus-cyan focus:outline-none"
        />
      </div>

      <div className="space-y-3">
        {overdue > 0 && (
          <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {overdue} inquir{overdue !== 1 ? "ies have" : "y has"} passed the
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

        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Pathway filter">
          <button
            role="tab"
            aria-selected={pathwayFilter === "all"}
            onClick={() => setPathwayFilter("all")}
            className={`rounded-lg px-4 py-2 text-sm font-medium ${
              pathwayFilter === "all"
                ? "bg-nexus-navy text-white"
                : "border border-nexus-navy/10 bg-white text-nexus-navy hover:bg-nexus-navy/5"
            }`}
          >
            All Pathways
          </button>
          {PATHWAY_IDS.map((id: PathwayId) => (
            <button
              key={id}
              role="tab"
              aria-selected={pathwayFilter === id}
              onClick={() => setPathwayFilter(id)}
              className={`rounded-lg px-4 py-2 text-sm font-medium ${
                pathwayFilter === id
                  ? "bg-nexus-navy text-white"
                  : "border border-nexus-navy/10 bg-white text-nexus-navy hover:bg-nexus-navy/5"
              }`}
            >
              {PATHWAY_LABELS[id]}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-nexus-navy/10 bg-white">
        {loading ? (
          <LoadingState label="Loading joiners..." />
        ) : inquiries.length === 0 ? (
          <EmptyState
            icon={UserPlus}
            title="No pathway inquiries found"
            description="Submissions from the public Join Us page will appear here."
          />
        ) : (
          <div className="divide-y divide-nexus-navy/10">
            {inquiries.map((item) => (
              <Link
                key={item.id}
                href={`/admin/joiners/${item.id}`}
                className="flex items-center justify-between gap-4 px-6 py-4 transition hover:bg-nexus-gray/40"
              >
                <div className="flex min-w-0 flex-1 items-center gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-nexus-cyan/10 text-nexus-cyan">
                    <UserPlus className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-medium text-nexus-navy">
                      {item.fullName}
                    </p>
                    <p className="truncate text-sm text-nexus-navy/70">
                      {item.email}
                      {item.phone ? ` • ${item.phone}` : ""}
                    </p>
                    <p className="text-xs text-nexus-navy/50">
                      {PATHWAY_LABELS[item.pathway as PathwayId] || item.pathway} •{" "}
                      {new Date(item.createdAt).toLocaleDateString()}
                      {item.owner ? ` • ${item.owner.name}` : " • unassigned"}
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
            Showing {inquiries.length} of {total}
            {total !== inquiries.length && hasMore ? " — load more for the rest" : ""}
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