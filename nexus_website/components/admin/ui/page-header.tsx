import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  backHref?: string;
  backLabel?: string;
  className?: string;
}

export default function PageHeader({
  title,
  subtitle,
  action,
  backHref,
  className = "",
}: PageHeaderProps) {
  return (
    <div className={`flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between ${className}`}>
      <div className="flex items-center gap-3">
        {backHref && (
          <Link
            href={backHref}
            className="flex h-8 w-8 items-center justify-center rounded-md text-nexus-navy/50 hover:bg-nexus-navy/5 hover:text-nexus-navy"
          >
            <ChevronLeft className="h-5 w-5" />
          </Link>
        )}
        <div>
          <h1 className="text-2xl font-bold text-nexus-navy">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-nexus-navy/60">{subtitle}</p>}
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
