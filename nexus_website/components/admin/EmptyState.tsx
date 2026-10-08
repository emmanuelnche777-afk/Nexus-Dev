import { Inbox } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export default function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center px-6 py-12 text-center ${className}`}
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-nexus-cyan/10">
        <Icon className="h-7 w-7 text-nexus-cyan" />
      </div>
      <p className="mt-4 text-sm font-semibold text-nexus-navy">{title}</p>
      {description && (
        <p className="mt-1 max-w-md text-sm text-nexus-navy/60">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
