"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Clock,
  Award,
  Check,
  ArrowRight,
  Code,
  Palette,
  Brain,
  BookOpen,
} from "lucide-react";
import PageHeader from "@/components/PageHeader";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import TranslatedText from "@/components/TranslatedText";

interface Program {
  id: string;
  slug: string;
  title: string;
  durationWeeks: number;
  price: number;
  currency: string;
  certification?: string;
  shortDescription?: string;
  fullDescription?: string;
  curriculumModules?: Array<{
    title: string;
    weeks: number;
    topics: string[];
    project?: string;
  }>;
  tools?: string[];
  targetAudience?: string;
}

const programIcons: Record<string, React.ReactNode> = {
  "software-development": <Code className="h-6 w-6" />,
  "ui-ux-design": <BookOpen className="h-6 w-6" />,
  "graphic-design": <Palette className="h-6 w-6" />,
  "ai-automation": <Brain className="h-6 w-6" />,
};

export default function AcademyCurriculum() {
  const { language } = useLanguage();
  const [activeProgram, setActiveProgram] = useState<string | null>(null);
  const [activeModule, setActiveModule] = useState(0);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/programs")
      .then((res) => res.json())
      .then((data) => {
        setPrograms(data.programs || []);
        if (data.programs?.length > 0) {
          setActiveProgram((current) => current ?? data.programs[0].slug);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const program = activeProgram ? programs.find((p) => p.slug === activeProgram) : null;
  const modules = program?.curriculumModules ?? [];
  const active = modules[activeModule] ?? null;

  const selectProgram = (slug: string) => {
    setActiveProgram(slug);
    setActiveModule(0);
  };

  return (
    <div className="bg-nexus-white">
      <PageHeader
        title={language === "fr" ? "Curriculum de l'Académie" : "Academy Curriculum"}
        description={
          language === "fr"
            ? "Explorez en détail le curriculum de chaque programme offert par l'Académie NEXUS."
            : "Explore the detailed curriculum of each program offered by NEXUS Academy."
        }
        breadcrumb={[
          { label: "Home", href: "/" },
          { label: "Academy", href: "/academy" },
          { label: language === "fr" ? "Curriculum" : "Curriculum" },
        ]}
      />

      {/* ===== INTRO STATS ===== */}
      <section className="border-b border-nexus-cyan/10 bg-nexus-gray py-10 lg:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm font-medium text-nexus-navy mb-6">
            {language === "fr"
              ? "Chaque programme est structuré en modules pratiques avec des projets réels"
              : "Each program is structured into practical modules with real projects"}
          </p>
          <div className="flex flex-wrap justify-center gap-x-12 gap-y-4">
            {[
              { value: "4", label: language === "fr" ? "Programmes" : "Programs" },
              { value: "8–12", label: language === "fr" ? "Semaines" : "Weeks" },
              { value: "5", label: language === "fr" ? "Modules par programme" : "Modules per program" },
              { value: "3–5", label: language === "fr" ? "Projets par programme" : "Projects per program" },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-2xl font-extrabold text-nexus-cyan-bright">{s.value}</p>
                <p className="mt-0.5 text-xs font-semibold uppercase tracking-wider text-nexus-navy/55">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== PROGRAM SELECTOR ===== */}
      <section className="py-12 lg:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 text-center">
            <p className="text-nexus-cyan font-semibold tracking-widest uppercase text-sm mb-3">
              {language === "fr" ? "SÉLECTIONNEZ UN PROGRAMME" : "SELECT A PROGRAM"}
            </p>
            <h2 className="text-3xl font-bold text-nexus-dark">
              {language === "fr" ? "Choisissez votre parcours" : "Choose Your Path"}
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {loading ? (
              <p className="col-span-full py-8 text-center text-sm text-nexus-navy/55">
                {language === "fr" ? "Chargement des programmes..." : "Loading programs..."}
              </p>
            ) : programs.length === 0 ? (
              <p className="col-span-full py-8 text-center text-sm text-nexus-navy/55">
                {language === "fr" ? "Aucun programme disponible." : "No programs are available."}
              </p>
            ) : programs.map((p) => {
              const isActive = activeProgram === p.slug;
              return (
                <button
                  key={p.slug}
                  type="button"
                  onClick={() => selectProgram(p.slug)}
                  className={`group rounded-xl border p-5 text-left transition-all ${
                    isActive
                      ? "border-nexus-cyan bg-nexus-cyan/5 shadow-lg shadow-nexus-cyan/10"
                      : "border-nexus-cyan/15 bg-nexus-gray hover:border-nexus-cyan/40 hover:bg-nexus-white hover:shadow-md"
                  }`}
                >
                  <div
                    className={`mb-3 flex h-11 w-11 items-center justify-center rounded-lg transition-colors ${
                      isActive
                        ? "bg-nexus-cyan text-nexus-dark"
                        : "bg-nexus-navy text-nexus-cyan-bright group-hover:bg-nexus-cyan group-hover:text-nexus-dark"
                    }`}
                  >
                    {programIcons[p.slug]}
                  </div>
                  <h3 className={`font-bold transition-colors ${isActive ? "text-nexus-cyan" : "text-nexus-dark"}`}>
                    {p.title}
                  </h3>
                  <p className="mt-1 text-xs text-nexus-navy/55">
                    {p.durationWeeks} {language === "fr" ? "sem" : "wk"} · <TranslatedText>{(p.certification || "").replace("NEXUS ", "")}</TranslatedText>
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===== CURRICULUM VIEW ===== */}
      {program && active && (
        <section className="border-t border-nexus-cyan/10 bg-nexus-gray py-12 lg:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {/* Program header */}
            <div className="mb-10 rounded-2xl border border-nexus-cyan/15 bg-nexus-white p-6 lg:p-8">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-nexus-dark lg:text-3xl"><TranslatedText>{program.title}</TranslatedText>: {language === "fr" ? "Curriculum Complet" : "Full Curriculum"}</h2>
                  <p className="mt-3 max-w-3xl text-base leading-relaxed text-nexus-navy">
                    <TranslatedText as="span">{program.fullDescription || program.shortDescription || ""}</TranslatedText>
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-5 text-sm text-nexus-navy">
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4 text-nexus-cyan" />
                    {program.durationWeeks} {language === "fr" ? "semaines" : "weeks"}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Award className="h-4 w-4 text-nexus-cyan" />
                    {language === "fr" ? "Certificat" : "Certificate"}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <BookOpen className="h-4 w-4 text-nexus-cyan" />
                    {modules.length} {language === "fr" ? "modules" : "modules"}
                  </span>
                </div>
              </div>
            </div>

            {/* Timeline + Content */}
            <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
              {/* Left: Timeline sidebar */}
              <div className="relative">
                <div className="sticky top-24">
                  <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-nexus-navy/45">
                    {language === "fr" ? "Modules" : "Modules"}
                  </p>
                  <div className="relative pl-6">
                    {/* Vertical line */}
                    <div className="absolute bottom-0 left-[11px] top-0 w-0.5 bg-nexus-cyan/15" />
                    <div
                      className="absolute left-[11px] top-0 w-0.5 bg-nexus-cyan transition-all duration-500"
                      style={{ height: `${((activeModule + 1) / modules.length) * 100}%` }}
                    />

                    <div className="space-y-1">
                      {modules.map((m, i) => {
                        const isActive = i === activeModule;
                        const isPast = i < activeModule;
                        return (
                          <button
                            key={m.title}
                            type="button"
                            onClick={() => setActiveModule(i)}
                            className={`relative flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-all ${
                              isActive
                                ? "bg-nexus-cyan/10"
                                : isPast
                                  ? "hover:bg-nexus-cyan/5"
                                  : "hover:bg-nexus-cyan/5"
                            }`}
                          >
                            <span
                              className={`relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-all ${
                                isActive
                                  ? "bg-nexus-cyan text-nexus-dark timeline-active"
                                  : isPast
                                    ? "bg-nexus-cyan/25 text-nexus-cyan"
                                    : "bg-nexus-navy/10 text-nexus-navy/40"
                              }`}
                            >
                              {isPast ? <Check className="h-3.5 w-3.5" /> : i + 1}
                            </span>
                            <div className="min-w-0">
                              <p
                                className={`truncate text-sm font-semibold transition-colors ${
                                  isActive ? "text-nexus-dark" : isPast ? "text-nexus-navy" : "text-nexus-navy/50"
                                }`}
                              >
                                <TranslatedText>{m.title}</TranslatedText>
                              </p>
                              <p className="text-xs text-nexus-navy/40">
                                {m.weeks} {language === "fr" ? "sem" : "wk"}
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: Module detail */}
              <div key={`${program.slug}-${activeModule}`} className="module-fade-in">
                <div className="rounded-2xl border border-nexus-cyan/15 bg-nexus-white p-6 lg:p-8">
                  <div className="mb-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-nexus-cyan text-sm font-bold text-nexus-dark">
                        {activeModule + 1}
                      </span>
                      <div>
                        <h3 className="text-xl font-bold text-nexus-dark"><TranslatedText>{active.title}</TranslatedText></h3>
                        <p className="text-sm text-nexus-navy/55">
                          {active.weeks} {language === "fr" ? "semaines" : "weeks"}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setActiveModule(Math.max(0, activeModule - 1))}
                        disabled={activeModule === 0}
                        className="rounded-lg border border-nexus-cyan/20 px-3 py-1.5 text-sm font-medium text-nexus-navy transition hover:border-nexus-cyan/40 hover:text-nexus-dark disabled:opacity-30 disabled:hover:border-nexus-cyan/20"
                      >
                        ← {language === "fr" ? "Précédent" : "Prev"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveModule(Math.min(modules.length - 1, activeModule + 1))}
                        disabled={activeModule === modules.length - 1}
                        className="rounded-lg border border-nexus-cyan/20 px-3 py-1.5 text-sm font-medium text-nexus-navy transition hover:border-nexus-cyan/40 hover:text-nexus-dark disabled:opacity-30 disabled:hover:border-nexus-cyan/20"
                      >
                        {language === "fr" ? "Suivant" : "Next"} →
                      </button>
                    </div>
                  </div>

                  {/* Topics */}
                  <div className="mb-6">
                    <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-nexus-navy/50">
                      {language === "fr" ? "Thèmes principaux" : "Key Topics"}
                    </h4>
                    <ul className="grid gap-2.5 sm:grid-cols-2">
                      {active.topics.map((topic, idx) => (
                        <li key={idx} className="flex items-start gap-2.5 text-sm text-nexus-navy/75">
                          <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-nexus-cyan/10">
                            <Check className="h-3 w-3 text-nexus-cyan" />
                          </span>
                          <TranslatedText>{topic}</TranslatedText>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Project */}
                  {active.project && (
                    <div className="rounded-xl border border-nexus-cyan/15 bg-nexus-gray p-5">
                      <h4 className="mb-2 text-sm font-semibold uppercase tracking-wider text-nexus-navy/50">
                        {language === "fr" ? "Projet du module" : "Module Project"}
                      </h4>
                      <p className="text-sm leading-relaxed text-nexus-navy/80">
                        <TranslatedText as="span">{active.project}</TranslatedText>
                      </p>
                    </div>
                  )}

                  {/* Enroll CTA */}
                  <div className="mt-8 flex flex-col gap-3 border-t border-nexus-cyan/10 pt-6 sm:flex-row">
                    <Link
                      href={`/academy/register/${program.slug}`}
                      className="inline-flex items-center justify-center gap-2 rounded-lg bg-nexus-cyan px-6 py-3 text-sm font-semibold text-nexus-dark transition hover:bg-nexus-cyan-bright"
                    >
                      {language === "fr" ? "S'inscrire à ce programme" : "Enroll in this program"}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                    <Link
                      href={`/academy/program/${program.slug}`}
                      className="inline-flex items-center justify-center gap-2 rounded-lg border border-nexus-cyan/30 px-6 py-3 text-sm font-semibold text-nexus-cyan transition hover:bg-nexus-navy hover:text-nexus-cyan-bright"
                    >
                      {language === "fr" ? "Voir les détails du programme" : "View program details"}
                    </Link>
                  </div>
                </div>

                {/* Module navigation pills */}
                <div className="mt-6 flex flex-wrap items-center gap-2">
                  {modules.map((m, i) => (
                    <button
                      key={m.title}
                      type="button"
                      onClick={() => setActiveModule(i)}
                      className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${
                        i === activeModule
                          ? "bg-nexus-cyan text-nexus-dark"
                          : i < activeModule
                            ? "bg-nexus-cyan/15 text-nexus-cyan"
                            : "bg-nexus-navy/8 text-nexus-navy/45 hover:bg-nexus-navy/15 hover:text-nexus-navy"
                      }`}
                    >
                      {i + 1}. {m.title}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ===== EMPTY STATE ===== */}
      {!program && (
        <section className="py-16 text-center lg:py-24">
          <div className="mx-auto max-w-2xl px-4">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-nexus-cyan/10">
              <BookOpen className="h-8 w-8 text-nexus-cyan" />
            </div>
            <h3 className="text-xl font-bold text-nexus-dark">
              {language === "fr" ? "Sélectionnez un programme ci-dessus" : "Select a program above"}
            </h3>
            <p className="mt-2 text-sm text-nexus-navy">
              {language === "fr"
                ? "Cliquez sur un programme pour explorer son curriculum détaillé module par module."
                : "Click on a program to explore its detailed curriculum module by module."}
            </p>
          </div>
        </section>
      )}

      {/* ===== CTA FOOTER ===== */}
      <section className="border-t border-nexus-cyan/10 py-16 lg:py-20 bg-nexus-gray">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-nexus-dark mb-4">
            {language === "fr" ? "Prêt à commencer votre parcours ?" : "Ready to Start Your Journey?"}
          </h2>
          <p className="text-base text-nexus-navy mb-8 max-w-2xl mx-auto">
            {language === "fr"
              ? "Notre curriculum complet vous prépare aux défis réels du marché de l'emploi tech."
              : "Our comprehensive curriculum prepares you for real-world challenges in the tech job market."}
          </p>
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/academy"
              className="rounded-md bg-nexus-cyan px-6 py-3 text-sm font-semibold text-nexus-dark transition hover:bg-nexus-cyan-bright"
            >
              {language === "fr" ? "Explorer l'Académie" : "Explore Academy"}
            </Link>
            <Link
              href="/academy/programs"
              className="rounded-md border border-nexus-cyan/40 px-6 py-3 text-sm font-semibold text-nexus-cyan-bright transition hover:bg-nexus-navy"
            >
              {language === "fr" ? "Voir les programmes" : "View Programs"}
            </Link>
            <Link
              href="/academy/ask-question"
              className="rounded-md border border-nexus-cyan/25 px-6 py-3 text-sm font-semibold text-nexus-navy transition hover:border-nexus-cyan/50 hover:text-nexus-cyan-bright"
            >
              {language === "fr" ? "Poser une question" : "Ask a Question"}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
