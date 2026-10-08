"use client";

import { Search, X } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

type BlogSearchProps = {
  value: string;
  onChange: (value: string) => void;
};

export default function BlogSearch({ value, onChange }: BlogSearchProps) {
  const { t } = useLanguage();

  return (
    <div className="relative w-full max-w-sm">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-nexus-navy/40" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={t.blogPage.searchPlaceholder}
        className="w-full rounded-lg border border-nexus-navy/20 bg-white py-2.5 pl-10 pr-10 text-sm text-nexus-dark placeholder-nexus-navy/40 transition focus:border-nexus-cyan focus:outline-none focus:ring-1 focus:ring-nexus-cyan"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-nexus-navy/40 hover:text-nexus-dark"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
