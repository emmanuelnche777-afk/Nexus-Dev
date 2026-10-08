import { Loader2 } from "lucide-react";

interface LoadingStateProps {
  label?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
  fullScreen?: boolean;
}

export default function LoadingState({
  label,
  size = "md",
  className = "",
  fullScreen = false,
}: LoadingStateProps) {
  const sizeMap = {
    sm: "h-4 w-4 border-2",
    md: "h-8 w-8 border-2",
    lg: "h-12 w-12 border-[3px]",
  };
  const wrap = fullScreen
    ? "flex min-h-[60vh] flex-col items-center justify-center gap-3"
    : `flex flex-col items-center justify-center gap-3 py-12 ${className}`;

  return (
    <div className={wrap} role="status" aria-live="polite">
      <Loader2
        className={`${sizeMap[size]} animate-spin rounded-full border-nexus-cyan border-t-transparent text-nexus-cyan`}
      />
      {label && (
        <p className="text-sm text-nexus-navy/70">{label}</p>
      )}
    </div>
  );
}
