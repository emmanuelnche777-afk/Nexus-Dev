"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  Filter,
  ArrowRight,
  Code,
  Palette,
  Brain,
  BookOpen,
  Briefcase,
  Award,
  Users,
} from "lucide-react";
import ProgramCard from "@/components/academy/ProgramCard";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import TranslatedText from "@/components/TranslatedText";

interface Program {
  id: string;
  slug: string;
  title: string;
  durationWeeks: number;
  price: number;
  currency: string;
  thumbnailUrl?: string;
  shortDescription?: string;
  fullDescription?: string;
  targetAudience?: string;
  certification?: string;
  tools?: string[];
  highlights?: string[];
}

interface Cohort {
  id: string;
  programSlug: string;
  name: string;
  period: string;
  status: string;
  startDate: string;
  endDate: string;
  applicationDeadline: string;
  maxStudents: number;
  currentStudents: number;
  location: string;
  schedule: string;
  price: number;
  currency: string;
  description?: string;
  acceptingApplications?: boolean;
}

const CATEGORIES = [
  { id: "all", labelEn: "All", labelFr: "Tous", icon: <BookOpen className="h-3.5 w-3.5" /> },
  { id: "development", labelEn: "Development", labelFr: "Développement", icon: <Code className="h-3.5 w-3.5" /> },
  { id: "design", labelEn: "Design", labelFr: "Design", icon: <Palette className="h-3.5 w-3.5" /> },
  { id: "ai", labelEn: "AI & Automation", labelFr: "IA & Automatisation", icon: <Brain className="h-3.5 w-3.5" /> },
] as const;

type CategoryId = (typeof CATEGORIES)[number]["id"];

const CATEGORY_MAP: Record<string, CategoryId> = {
  "software-development": "development",
  "ui-ux-design": "design",
  "graphic-design": "design",
  "ai-automation": "ai",
};

const whyPoints = [
  { icon: <Briefcase className="h-5 w-5" />, titleEn: "Real Projects from Day One", titleFr: "Projets réels dès le premier jour", descEn: "Every program is project-based. You build portfolio-ready work, not just watch tutorials.", descFr: "Chaque programme est basé sur des projets. Vous construisez un portfolio prêt, pas seulement des tutoriels." },
  { icon: <Users className="h-5 w-5" />, titleEn: "One-on-One Mentorship", titleFr: "Mentorat individuel", descEn: "Weekly 1:1 sessions with industry experts who review your code and guide your growth.", descFr: "Sessions hebdomadaires individuelles avec des experts du secteur qui révisent votre code." },
  { icon: <Award className="h-5 w-5" />, titleEn: "Verifiable Certification", titleFr: "Certification vérifiable", descEn: "Your certificate has a public verification link employers can trust.", descFr: "Votre certificat possède un lien de vérification publique que les employeurs peuvent faire confiance." },
  { icon: <BookOpen className="h-5 w-5" />, titleEn: "Active Alumni Network", titleFr: "Réseau d'anciens élèves actif", descEn: "Join a growing community of NEXUS graduates working across Cameroon and beyond.", descFr: "Rejoignez une communauté grandissante de diplômés NEXUS au Cameroun et au-delà." },
];

export default function AcademyPrograms() {
  const { language } = useLanguage();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState<CategoryId>("all");
  const [programs, setPrograms] = useState<Program[]>([]);
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [cohortsSectionEnabled, setCohortsSectionEnabled] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      fetch("/api/programs").then((r) => r.json()).catch(() => ({ programs: [] })),
      fetch("/api/academy/cohorts").then((r) => r.json()).catch(() => ({ cohorts: [] })),
    ]).then(([progData, cohortData]) => {
      if (cancelled) return;
      setPrograms(progData.programs || []);
      setCohorts(cohortData.cohorts || []);
      setCohortsSectionEnabled(cohortData.sectionEnabled !== false);
    }).finally(() => {
      if (!cancelled) setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const openCohort = cohorts.find((c) => c.acceptingApplications);
  const registerHref = openCohort
    ? `/academy/register/${openCohort.programSlug}?cohort=${encodeURIComponent(openCohort.id)}`
    : "/academy";

  const filtered = programs.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.shortDescription || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.targetAudience || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.tools || []).some((t) => t.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory =
      activeCategory === "all" || CATEGORY_MAP[p.slug] === activeCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="bg-nexus-white">
      {/* HERO BAND */}
      <section className="relative overflow-hidden bg-nexus-dark">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-nexus-navy/50 via-nexus-dark to-nexus-dark" />
        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <nav className="mb-6 flex items-center gap-2 text-sm text-nexus-gray/55">
            <Link href="/" className="transition hover:text-nexus-cyan-bright">
              {language === "fr" ? "Accueil" : "Home"}
            </Link>
            <span className="text-nexus-cyan/35">›</span>
            <span className="text-nexus-gray/80">
              {language === "fr" ? "Académie" : "Academy"}
            </span>
            <span className="text-nexus-cyan/35">›</span>
            <span className="text-nexus-gray/80">
              {language === "fr" ? "Programmes" : "Programs"}
            </span>
          </nav>
          <p className="mb-4 rounded-full border border-nexus-cyan/40 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-nexus-cyan-bright">
            NEXUS Academy
          </p>
          <h1 className="max-w-3xl text-4xl font-extrabold leading-tight text-nexus-white sm:text-5xl">
            {language === "fr" ? "Programmes de Formation" : "Training Programs"}
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-nexus-gray/80">
            {language === "fr"
              ? "Choisissez un programme et rejoignez notre prochaine cohorte. Chaque parcours est conçu pour des résultats concrets."
              : "Choose a program and join our next cohort. Every path is designed for concrete outcomes."}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <span className="rounded-full border border-nexus-cyan/30 bg-nexus-cyan/10 px-4 py-1.5 text-xs font-semibold text-nexus-cyan-bright">
              {programs.length} {language === "fr" ? "Programmes" : "Programs"}
            </span>
            <span className="rounded-full border border-nexus-cyan/20 px-4 py-1.5 text-xs font-semibold text-nexus-gray/60">
              {language === "fr" ? "Basés sur cohortes" : "Cohort-based"}
            </span>
            <span className="rounded-full border border-nexus-cyan/20 px-4 py-1.5 text-xs font-semibold text-nexus-gray/60">
              {language === "fr" ? "Certifiés" : "Certified"}
            </span>
          </div>
        </div>
      </section>

      {/* FILTER TOOLBAR */}
      <section className="sticky top-0 z-30 border-b border-nexus-cyan/10 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-nexus-navy/40" />
            <input
              type="text"
              placeholder={language === "fr" ? "Rechercher un programme..." : "Search programs..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-nexus-navy/15 bg-nexus-gray pl-9 pr-4 py-2.5 text-sm text-nexus-dark outline-none transition focus:border-nexus-cyan focus:ring-1 focus:ring-nexus-cyan/30"
            />
          </div>
          {/* Category chips */}
          <div className="flex flex-wrap items-center gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-all ${
                  activeCategory === cat.id
                    ? "border-nexus-cyan bg-nexus-cyan/10 text-nexus-cyan"
                    : "border-nexus-navy/15 bg-white text-nexus-navy/55 hover:border-nexus-cyan/40 hover:text-nexus-navy"
                }`}
              >
                {cat.icon}
                {language === "fr" ? cat.labelFr : cat.labelEn}
              </button>
            ))}
            <span className="ml-2 text-xs text-nexus-navy/45">
              <Filter className="mr-1 inline h-3 w-3" />
              {filtered.length} {language === "fr" ? "trouvé(s)" : "found"}
            </span>
          </div>
        </div>
      </section>

      {/* PROGRAM CARDS GRID */}
      <section className="py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {loading ? (
            <p className="py-20 text-center text-nexus-navy/50">
              {language === "fr" ? "Chargement des programmes..." : "Loading programs..."}
            </p>
          ) : filtered.length === 0 ? (
            <div className="py-20 text-center">
              <p className="text-nexus-navy/50">
                {language === "fr"
                  ? "Aucun programme ne correspond à votre recherche."
                  : "No programs match your search."}
              </p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filtered.map((program) => (
                <ProgramCard
                  key={program.slug}
                  slug={program.slug}
                  title={program.title}
                  description={program.shortDescription || ""}
                  durationWeeks={program.durationWeeks}
                  targetAudience={program.targetAudience || ""}
                  certification={program.certification || ""}
                  tools={program.tools || []}
                  thumbnailUrl={program.thumbnailUrl}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* WHY TRAIN WITH NEXUS */}
      <section className="border-y border-nexus-cyan/10 bg-nexus-gray py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.3em] text-nexus-cyan">
              {language === "fr" ? "POURQUOI NEXUS" : "WHY NEXUS"}
            </p>
            <h2 className="mt-4 text-3xl font-extrabold text-nexus-dark sm:text-4xl">
              {language === "fr" ? "Ce qui rend nos programmes différents" : "What makes our programs different"}
            </h2>
          </div>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {whyPoints.map((wp, i) => (
              <div
                key={i}
                className="rounded-xl border border-nexus-cyan/10 bg-white p-6 transition-all hover:border-nexus-cyan/25 hover:shadow-lg"
              >
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-nexus-cyan/10 text-nexus-cyan">
                  {wp.icon}
                </div>
                <h3 className="font-bold text-nexus-dark">
                  {language === "fr" ? wp.titleFr : wp.titleEn}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-nexus-navy">
                  {language === "fr" ? wp.descFr : wp.descEn}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* COHORT CTA BAND */}
      <section className="bg-gradient-to-br from-nexus-dark via-nexus-navy-deep to-nexus-dark py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className={`grid gap-10 lg:gap-16 ${cohortsSectionEnabled === true ? "lg:grid-cols-2" : "lg:grid-cols-1"}`}>
            {/* Cohorts */}
            {cohortsSectionEnabled === true && <div>
              <p className="font-mono text-xs font-semibold uppercase tracking-[0.3em] text-nexus-cyan-bright">
                {language === "fr" ? "PROCHAINES COHORTES" : "UPCOMING COHORTS"}
              </p>
              <h2 className="mt-4 text-3xl font-extrabold text-white sm:text-4xl">
                {language === "fr" ? "Rejoignez la prochaine cohorte" : "Join the Next Cohort"}
              </h2>
              <p className="mt-4 max-w-lg text-nexus-gray/70">
                {language === "fr"
                  ? "Nos programmes sont offerts par cohortes avec des dates de début spécifiques."
                  : "Our programs run in cohorts with specific start dates."}
              </p>
              <div className="mt-8 space-y-3">
                {cohorts.length === 0 ? (
                  <p className="rounded-lg border border-nexus-cyan/15 bg-white/5 p-4 text-sm text-nexus-gray/55">
                    {language === "fr"
                      ? "Aucune cohorte ouverte pour le moment. Inscrivez-vous pour être notifié."
                      : "No cohorts are open right now. Subscribe to be notified."}
                  </p>
                ) : (
                  cohorts.slice(0, 4).map((cohort) => {
                    const program = programs.find((p) => p.slug === cohort.programSlug);
                    const cohortDescription = cohort.description?.trim() || program?.shortDescription ||
                      (language === "fr" ? "Les détails de cette cohorte seront annoncés prochainement." : "More details about this cohort will be announced soon.");
                    const registerHref = program
                      ? `/academy/register/${program.slug}?cohort=${encodeURIComponent(cohort.id)}`
                      : "/academy";
                    return (
                      <div
                        key={cohort.id}
                        className={`rounded-xl border p-5 backdrop-blur-sm ${
                          cohort.acceptingApplications
                            ? "border-nexus-cyan/50 bg-white/5"
                            : "border-nexus-cyan/15 bg-white/[0.02]"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-lg font-bold text-white"><TranslatedText>{cohort.name}</TranslatedText></h3>
                            <p className="mt-1 text-sm text-nexus-gray/50">
                              {program ? <TranslatedText>{program.title}</TranslatedText> : cohort.programSlug} • <TranslatedText>{cohort.period}</TranslatedText>
                            </p>
                          </div>
                          {cohort.acceptingApplications ? (
                            <Link
                              href={registerHref}
                              className="rounded-lg bg-nexus-cyan px-4 py-2 text-sm font-semibold text-nexus-dark transition hover:bg-nexus-cyan-bright"
                            >
                              {language === "fr" ? "Postuler" : "Apply Now"}
                            </Link>
                          ) : (
                            <span className="text-xs font-semibold uppercase tracking-wider text-nexus-gray/35">
                              {cohort.status === "upcoming"
                                ? language === "fr"
                                  ? "Bientôt"
                                  : "Upcoming"
                                : language === "fr"
                                  ? "Fermé"
                                  : "Closed"}
                            </span>
                          )}
                        </div>
                        <p className="mt-2 text-xs text-nexus-gray/45">
                          <TranslatedText>{cohort.location}</TranslatedText> • <TranslatedText>{cohort.schedule}</TranslatedText> •{" "}
                          {cohort.currentStudents}/{cohort.maxStudents}{" "}
                          {language === "fr" ? "étudiants" : "students"}
                        </p>
                        <p className="mt-3 text-sm leading-relaxed text-nexus-gray/65">
                          <TranslatedText>{cohortDescription}</TranslatedText>
                        </p>
                      </div>
                    );
                  })
                )}
              </div>
            </div>}
            {/* Quick CTA */}
            <div className="flex flex-col justify-center">
              <div className="rounded-2xl border border-nexus-cyan/20 bg-white/[0.04] p-8 backdrop-blur-sm">
                <h3 className="text-2xl font-extrabold text-white">
                  {language === "fr" ? "Prêt à transformer votre carrière ?" : "Ready to Transform Your Career?"}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-nexus-gray/65">
                  {language === "fr"
                    ? "Que vous vouliez devenir développeur, designer ou spécialiste en IA, nous avons le programme qu'il vous faut."
                    : "Whether you want to become a developer, designer, or AI specialist, we have the program for you."}
                </p>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <Link
                    href={registerHref}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-nexus-cyan px-6 py-3 text-sm font-semibold text-nexus-dark transition hover:bg-nexus-cyan-bright"
                  >
                    {language === "fr" ? "Postuler maintenant" : "Apply Now"}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    href="/academy/ask-question"
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-nexus-cyan/30 px-6 py-3 text-sm font-semibold text-nexus-cyan-bright transition hover:bg-nexus-navy hover:border-nexus-cyan"
                  >
                    {language === "fr" ? "Poser une question" : "Ask a Question"}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
