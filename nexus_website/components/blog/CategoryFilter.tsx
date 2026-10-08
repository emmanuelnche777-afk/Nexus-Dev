"use client";

import { useLanguage } from "@/lib/i18n/LanguageContext";
import TranslatedText from "@/components/TranslatedText";

type CategoryFilterProps = {
  categories: string[];
  active: string;
  onChange: (category: string) => void;
};

const CATEGORY_LABELS: Record<string, { en: string; fr: string }> = {
  All: { en: "All", fr: "Tous" },
  "Announcements & Updates": { en: "Announcements & Updates", fr: "Annonces & Mises à jour" },
  Opinion: { en: "Opinion", fr: "Opinion" },
  Tutorial: { en: "Tutorial", fr: "Tutoriel" },
  Event: { en: "Event", fr: "Événement" },
  Update: { en: "Update", fr: "Mise à jour" },
};

export default function CategoryFilter({
  categories,
  active,
  onChange,
}: CategoryFilterProps) {
  const { language } = useLanguage();

  const getLabel = (cat: string) => {
    const mapped = CATEGORY_LABELS[cat];
    if (mapped) return language === "fr" ? mapped.fr : mapped.en;
    return cat;
  };

  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((cat) => (
        <button
          key={cat}
          type="button"
          onClick={() => onChange(cat)}
          className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
            active === cat
              ? "bg-nexus-navy text-nexus-cyan-bright"
              : "border border-nexus-navy/20 text-nexus-navy/70 hover:border-nexus-cyan hover:text-nexus-cyan"
          }`}
        >
          {CATEGORY_LABELS[cat] ? getLabel(cat) : <TranslatedText>{getLabel(cat)}</TranslatedText>}
        </button>
      ))}
    </div>
  );
}
