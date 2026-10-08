"use client";

import { useLanguage } from "@/lib/i18n/LanguageContext";
import type { JourneyCategory } from "@/lib/journey";

type FilterBarProps = {
  activeFilter: JourneyCategory | "all";
  onFilterChange: (filter: JourneyCategory | "all") => void;
};

const FILTER_KEYS: { key: JourneyCategory | "all"; translationKey: string }[] = [
  { key: "all", translationKey: "filterAll" },
  { key: "company", translationKey: "filterCompany" },
  { key: "academy", translationKey: "filterAcademy" },
  { key: "tech-hub", translationKey: "filterTechHub" },
  { key: "foundation", translationKey: "filterFoundation" },
];

export default function JourneyFilterBar({
  activeFilter,
  onFilterChange,
}: FilterBarProps) {
  const { t } = useLanguage();
  const jp = t.journeyPage;

  const getLabel = (key: string) => {
    switch (key) {
      case "filterAll": return jp.filterAll;
      case "filterCompany": return jp.filterCompany;
      case "filterAcademy": return jp.filterAcademy;
      case "filterTechHub": return jp.filterTechHub;
      case "filterFoundation": return jp.filterFoundation;
      default: return key;
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {FILTER_KEYS.map(({ key, translationKey }) => {
        const isActive = activeFilter === key;
        return (
          <button
            key={key}
            type="button"
            onClick={() => onFilterChange(key)}
            className={`relative rounded-full px-5 py-2 text-sm font-medium transition-all duration-300 ${
              isActive
                ? "bg-nexus-cyan text-nexus-dark shadow-lg shadow-nexus-cyan/20"
                : "border border-nexus-cyan/20 bg-nexus-navy-deep/60 text-nexus-gray/70 hover:border-nexus-cyan/40 hover:text-white"
            }`}
          >
            {getLabel(translationKey)}
            {isActive && (
              <span className="absolute inset-0 rounded-full bg-nexus-cyan/20 journey-filter-glow" />
            )}
          </button>
        );
      })}
    </div>
  );
}
