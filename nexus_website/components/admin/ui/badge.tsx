import type { ReactNode } from "react";

interface BadgeProps {
  variant?: "active" | "suspended" | "deleted" | "pending" | "info" | "success" | "warning" | "danger" | "neutral";
  size?: "sm" | "md";
  className?: string;
  children: ReactNode;
}

export default function Badge({ variant = "neutral", size = "md", className = "", children }: BadgeProps) {
  const variants = {
    active: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
    suspended: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
    deleted: "bg-red-50 text-red-700 ring-1 ring-red-200",
    pending: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
    info: "bg-nexus-cyan/10 text-nexus-navy ring-1 ring-nexus-cyan/20",
    success: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
    warning: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
    danger: "bg-red-50 text-red-700 ring-1 ring-red-200",
    neutral: "bg-nexus-navy/5 text-nexus-navy/70 ring-1 ring-nexus-navy/10",
  };

  const sizes = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-0.75 text-xs",
  };

  return (
    <span className={`inline-flex items-center rounded-full font-medium ${variants[variant]} ${sizes[size]} ${className}`}>
      {children}
    </span>
  );
}
