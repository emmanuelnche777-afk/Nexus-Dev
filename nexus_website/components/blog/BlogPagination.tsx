"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

type BlogPaginationProps = {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

export default function BlogPagination({
  page,
  totalPages,
  onPageChange,
}: BlogPaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-2">
      <button
        type="button"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className="rounded-md border border-nexus-navy/20 p-2 text-nexus-navy/60 transition hover:border-nexus-cyan hover:text-nexus-cyan disabled:cursor-not-allowed disabled:opacity-30"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
        <button
          key={p}
          type="button"
          onClick={() => onPageChange(p)}
          className={`h-9 w-9 rounded-md text-sm font-semibold transition ${
            p === page
              ? "bg-nexus-navy text-nexus-cyan-bright"
              : "border border-nexus-navy/20 text-nexus-navy/60 hover:border-nexus-cyan hover:text-nexus-cyan"
          }`}
        >
          {p}
        </button>
      ))}
      <button
        type="button"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        className="rounded-md border border-nexus-navy/20 p-2 text-nexus-navy/60 transition hover:border-nexus-cyan hover:text-nexus-cyan disabled:cursor-not-allowed disabled:opacity-30"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}
