"use client";

import { useState } from "react";
import Link from "next/link";
import {
  GraduationCap,
  Briefcase,
  HeartHandshake,
  Award,
  ArrowRight,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

type Persona = {
  id: string;
  icon: React.ReactNode;
  label: string;
  reason: string;
  recommendations: { name: string; href: string }[];
};

export default function PathFinder() {
  const { t } = useLanguage();
  const [selected, setSelected] = useState<string | null>(null);

  const divisionNames = {
    academy: t.divisions.academy.name,
    techHub: t.divisions.techHub.name,
    foundation: t.divisions.foundation.name,
    mentorship: t.divisions.mentorship.name,
  };

  const personas: Persona[] = [
    {
      id: "student",
      icon: <GraduationCap className="h-6 w-6" />,
      label: t.divisionsPage.personaStudent,
      reason: t.divisionsPage.finderRecStudent,
      recommendations: [
        { name: divisionNames.academy, href: "/academy" },
        { name: divisionNames.mentorship, href: "/divisions/mentorship" },
      ],
    },
    {
      id: "business",
      icon: <Briefcase className="h-6 w-6" />,
      label: t.divisionsPage.personaBusiness,
      reason: t.divisionsPage.finderRecBusiness,
      recommendations: [
        { name: divisionNames.techHub, href: "/divisions/tech-hub" },
      ],
    },
    {
      id: "community",
      icon: <HeartHandshake className="h-6 w-6" />,
      label: t.divisionsPage.personaCommunity,
      reason: t.divisionsPage.finderRecCommunity,
      recommendations: [
        { name: divisionNames.foundation, href: "/divisions/foundation" },
      ],
    },
    {
      id: "professional",
      icon: <Award className="h-6 w-6" />,
      label: t.divisionsPage.personaProfessional,
      reason: t.divisionsPage.finderRecProfessional,
      recommendations: [
        { name: divisionNames.mentorship, href: "/divisions/mentorship" },
        { name: divisionNames.academy, href: "/academy" },
      ],
    },
  ];

  const active = personas.find((p) => p.id === selected) ?? null;

  return (
    <div>
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {personas.map((persona) => {
          const isActive = selected === persona.id;
          return (
            <button
              key={persona.id}
              type="button"
              onClick={() => setSelected(isActive ? null : persona.id)}
              aria-pressed={isActive}
              className={`group flex flex-col items-center gap-3 rounded-xl border-2 p-5 text-center transition-all duration-300 sm:p-6 ${
                isActive
                  ? "border-nexus-cyan bg-nexus-navy text-nexus-white shadow-lg shadow-nexus-cyan/20"
                  : "border-nexus-cyan/15 bg-nexus-white text-nexus-dark hover:border-nexus-cyan/50 hover:shadow-md"
              }`}
            >
              <span
                className={`flex h-12 w-12 items-center justify-center rounded-full transition-colors ${
                  isActive
                    ? "bg-nexus-cyan-bright text-nexus-dark"
                    : "bg-nexus-gray text-nexus-navy group-hover:bg-nexus-cyan/10"
                }`}
              >
                {persona.icon}
              </span>
              <span className="text-sm font-semibold sm:text-base">
                {persona.label}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-6 min-h-[7rem]">
        {!active ? (
          <p className="rounded-xl border border-dashed border-nexus-cyan/30 bg-nexus-gray/60 px-5 py-4 text-center text-sm font-medium text-nexus-navy/70">
            {t.divisionsPage.finderPickHint}
          </p>
        ) : (
          <div
            key={active.id}
            className="animate-panel-in rounded-xl border border-nexus-cyan/25 bg-gradient-to-br from-nexus-white to-nexus-gray p-5 shadow-md"
          >
            <p className="text-sm leading-relaxed text-nexus-navy/85 sm:text-base">
              {active.reason}
            </p>
            <div className="mt-4 flex flex-wrap gap-2.5">
              {active.recommendations.map((rec) => (
                <Link
                  key={rec.href}
                  href={rec.href}
                  className="inline-flex items-center gap-1.5 rounded-full bg-nexus-navy px-4 py-2 text-sm font-semibold text-nexus-white transition hover:bg-nexus-cyan hover:text-nexus-dark"
                >
                  {rec.name}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
