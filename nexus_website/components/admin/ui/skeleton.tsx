import { X } from "lucide-react";
import type { ReactNode } from "react";

interface SkeletonProps {
  className?: string;
  count?: number;
}

export function Skeleton({ className = "", count = 1 }: SkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`animate-pulse rounded-lg bg-nexus-navy/5 ${className}`}
        />
      ))}
    </>
  );
}

export function SkeletonText({ lines = 3, className = "" }: { lines?: number; className?: string }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="animate-pulse rounded bg-nexus-navy/5"
          style={{
            width: i === lines - 1 ? "60%" : "100%",
            height: "14px",
          }}
        />
      ))}
    </div>
  );
}

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  width?: "sm" | "md" | "lg" | "xl";
}

const WIDTHS: Record<string, string> = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
};

export function Drawer({ open, onClose, title, description, children, width = "lg" }: DrawerProps) {
  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-nexus-dark/50"
        onClick={onClose}
      />
      <div
        className={`fixed inset-y-0 right-0 z-50 w-full ${WIDTHS[width]} border-l border-nexus-navy/10 bg-white shadow-2xl transition-transform duration-300`}
      >
        <div className="flex items-center justify-between border-b border-nexus-navy/10 px-6 py-4">
          <div>
            <h2 className="text-lg font-bold text-nexus-navy">{title}</h2>
            {description && <p className="mt-0.5 text-sm text-nexus-navy/60">{description}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1.5 text-nexus-navy/60 hover:bg-nexus-navy/5 hover:text-nexus-navy"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="overflow-y-auto p-6" style={{ maxHeight: "calc(100vh - 60px)" }}>
          {children}
        </div>
      </div>
    </>
  );
}
