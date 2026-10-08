"use client";

import { useEffect } from "react";
import { X } from "lucide-react";

interface AdminModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl";
}

const WIDTHS: Record<string, string> = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  "2xl": "max-w-2xl",
};

export default function AdminModal({
  open,
  onClose,
  title,
  description,
  children,
  maxWidth = "2xl",
}: AdminModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-nexus-dark/50 p-4"
      onClick={onClose}
    >
      <div
        className={`w-full ${WIDTHS[maxWidth]} max-h-[90vh] overflow-y-auto rounded-xl bg-white shadow-2xl`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-nexus-navy/10 bg-white px-6 py-4">
          <div>
            <h2 className="text-lg font-bold text-nexus-navy">{title}</h2>
            {description && (
              <p className="mt-0.5 text-sm text-nexus-navy/60">{description}</p>
            )}
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
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
