"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Play,
  Clock,
  ArrowRight,
  X,
  Calendar,
  Mail,
  Code,
  Palette,
  Brain,
  GraduationCap,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import TranslatedText from "@/components/TranslatedText";
import { usePublicSettings } from "@/components/PublicSettingsProvider";
import VideoPlayer from "@/components/video/VideoPlayer";
import { resolveVideoUrl } from "@/lib/video-url";

interface Program {
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
  overviewVideoUrl?: string;
  thumbnailUrl?: string;
}

interface Cohort {
  id: string;
  name: string;
  period: string;
  status: "open" | "upcoming" | "closed";
  description?: string | null;
  programSlug: string;
  acceptingApplications?: boolean;
}

const programIcons: Record<string, React.ReactNode> = {
  "software-development": <Code className="h-6 w-6" />,
  "ui-ux-design": <Palette className="h-6 w-6" />,
  "graphic-design": <Palette className="h-6 w-6" />,
  "ai-automation": <Brain className="h-6 w-6" />,
};

function useScrollReveal(threshold = 0.15) {
  const [element, setElement] = useState<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);
  const ref = useCallback((node: HTMLElement | null) => setElement(node), []);

  useEffect(() => {
    if (!element) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(element);
    return () => obs.disconnect();
  }, [element, threshold]);

  return { ref, visible };
}

function CodeRain() {
  const columns = useMemo(() => {
    const chars = "01アイウエオ{}[]<>/=;:";
    const rand = (n: number) => {
      const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
      return x - Math.floor(x);
    };
    return Array.from({ length: 18 }, (_, i) => ({
      left: `${(i / 18) * 100}%`,
      text: Array.from({ length: 12 }, (_, j) => chars[Math.floor(rand(i * 31 + j * 7) * chars.length)]).join("\n"),
      duration: Math.round((6 + rand(i * 13 + 5) * 8) * 1000) / 1000,
      delay: Math.round((rand(i * 17 + 9) * 6) * 1000) / 1000,
    }));
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {columns.map((col, i) => (
        <span
          key={i}
          className="code-rain-col"
          style={{ left: col.left, animationDuration: `${col.duration}s`, animationDelay: `${col.delay}s` }}
        >
          {col.text}
        </span>
      ))}
    </div>
  );
}

function StepLine({ visible }: { visible: boolean }) {
  return (
    <svg className="hidden md:block absolute left-0 top-1/2 -translate-y-1/2 w-full h-2" viewBox="0 0 1000 8" fill="none" preserveAspectRatio="none">
      <line x1="0" y1="4" x2="1000" y2="4" stroke="rgba(69,175,225,0.2)" strokeWidth="2" />
      <line
        x1="0" y1="4" x2="1000" y2="4"
        stroke="var(--nexus-cyan)"
        strokeWidth="2"
        strokeDasharray="1000"
        strokeDashoffset={visible ? 0 : 1000}
        style={{ transition: "stroke-dashoffset 1.5s cubic-bezier(0.22, 1, 0.36, 1)" }}
      />
    </svg>
  );
}

export default function AcademyPage() {
  const { language } = useLanguage();
  const { settings: publicSettings, loading: publicSettingsLoading } = usePublicSettings();
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterStatus, setNewsletterStatus] = useState<"idle" | "loading" | "success">("idle");
  const [newsletterError, setNewsletterError] = useState<string | null>(null);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const [playingVideoUrl, setPlayingVideoUrl] = useState<string | null>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const [overviewVideoUrl, setOverviewVideoUrl] = useState("");
  const [overviewVideoPoster, setOverviewVideoPoster] = useState("/images/logo/nexus-front-md.jpg");
  const [failedVideoUrl, setFailedVideoUrl] = useState<string | null>(null);
  const videoPlaying = playingVideoUrl === overviewVideoUrl;
  const videoFailed = failedVideoUrl === overviewVideoUrl;
  const resolvedOverviewVideo = resolveVideoUrl(overviewVideoUrl);
  const overviewIsEmbed = resolvedOverviewVideo?.kind === "embed";

  useEffect(() => {
    fetch("/api/settings", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : Promise.resolve({ settings: {} })))
      .then((data) => {
        const url = data?.settings?.academyOverviewVideoUrl;
        const nextUrl = url && typeof url === "string" ? url : "";
        setOverviewVideoUrl(nextUrl);
        setPlayingVideoUrl(null);
        setFailedVideoUrl(null);
        if (data?.settings?.academyOverviewVideoPoster) {
          setOverviewVideoPoster(data.settings.academyOverviewVideoPoster);
        }
      })
      .catch(() => {});
  }, []);

  const [programs, setPrograms] = useState<Program[]>([]);
  const [programsLoading, setProgramsLoading] = useState(true);
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [cohortsSectionEnabled, setCohortsSectionEnabled] = useState<boolean | null>(null);

  useEffect(() => {
    fetch("/api/programs", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        setPrograms(data.programs || []);
      })
      .catch(() => {})
      .finally(() => setProgramsLoading(false));
  }, []);

  useEffect(() => {
    fetch("/api/academy/cohorts", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        setCohorts(data.cohorts || []);
        setCohortsSectionEnabled(data.sectionEnabled !== false);
      })
      .catch(() => setCohortsSectionEnabled(true));
  }, []);

  const { ref: whatRef, visible: whatVisible } = useScrollReveal(0.2);
  const { ref: programsRef, visible: programsVisible } = useScrollReveal(0.1);
  const { ref: stepsRef, visible: stepsVisible } = useScrollReveal(0.2);
  const { ref: whyRef, visible: whyVisible } = useScrollReveal(0.15);
  const { ref: cohortsRef, visible: cohortsVisible } = useScrollReveal(0.15);
  const { ref: toolsRef, visible: toolsVisible } = useScrollReveal(0.15);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (heroRef.current) {
      const rect = heroRef.current.getBoundingClientRect();
      setCursorPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    }
  }, []);

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail || newsletterStatus === "loading") return;

    setNewsletterStatus("loading");
    setNewsletterError(null);

    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: newsletterEmail }),
      });
      const data = await res.json().catch(() => null);

      if (res.ok && data?.ok) {
        setNewsletterStatus("success");
        setTimeout(() => setNewsletterStatus("idle"), 4000);
        setNewsletterEmail("");
      } else if (data?.error === "invalid_email") {
        setNewsletterStatus("idle");
        setNewsletterError(
          language === "fr"
            ? "Veuillez saisir une adresse email valide."
            : "Please enter a valid email address."
        );
      } else {
        setNewsletterStatus("idle");
        setNewsletterError(
          language === "fr"
            ? "L'inscription a échoué. Veuillez réessayer ou nous contacter directement."
            : "Subscription failed. Please try again or contact us directly."
        );
      }
    } catch {
      setNewsletterStatus("idle");
      setNewsletterError(
        language === "fr"
          ? "Erreur réseau. Veuillez vérifier votre connexion et réessayer."
          : "Network error. Please check your connection and try again."
      );
    }
  };

  const whatFacts = [
    { num: "8–12", label: language === "fr" ? "semaines d'immersion" : "weeks of immersion" },
    { num: "3×", label: language === "fr" ? "sessions en direct par semaine" : "live sessions per week" },
    { num: "1:1", label: language === "fr" ? "mentorat individuel" : "one-on-one mentorship" },
    { num: "3–5", label: language === "fr" ? "projets réels par programme" : "real projects per program" },
  ];

  const steps = [
    { num: "01", title: language === "fr" ? "Candidater" : "Apply", desc: language === "fr" ? "Remplissez le formulaire en ligne en quelques minutes. Notre équipe examine votre profil." : "Fill out the online form in minutes. Our team reviews your profile." },
    { num: "02", title: language === "fr" ? "Intégrer" : "Join", desc: language === "fr" ? "Rejoignez votre cohorte et accédez à toutes les ressources du programme." : "Join your cohort and access all program resources." },
    { num: "03", title: language === "fr" ? "Construire" : "Build", desc: language === "fr" ? "Apprenez en construisant de vrais projets avec l'accompagnement de vos mentors." : "Learn by building real projects with mentor guidance." },
    { num: "04", title: language === "fr" ? "Obtenir" : "Earn", desc: language === "fr" ? "Obtenez votre certificat vérifiable et accédez à notre réseau d'employeurs." : "Earn your verifiable certificate and access our employer network." },
  ];

  const comparison = {
    nexus: [
      language === "fr" ? "Projets réels du premier jour" : "Real projects from day one",
      language === "fr" ? "Mentorat individuel hebdomadaire" : "Weekly one-on-one mentorship",
      language === "fr" ? "Certificats vérifiables en ligne" : "Online verifiable certificates",
      language === "fr" ? "Sessions en direct interactives" : "Interactive live sessions",
      language === "fr" ? "Soutien à l'emploi et placement" : "Job support and placement",
      language === "fr" ? "Communauté d'anciens élèves active" : "Active alumni community",
    ],
    others: [
      language === "fr" ? "Cours enregistrés sans interaction" : "Pre-recorded, no interaction",
      language === "fr" ? "Pas de mentorat personnalisé" : "No personalized mentorship",
      language === "fr" ? "Certificats non reconnus" : "Unrecognized certificates",
      language === "fr" ? "Pas de sessions en direct" : "No live sessions",
      language === "fr" ? "Pas de réseau d'emploi" : "No job network",
      language === "fr" ? "Pas de communauté" : "No community",
    ],
  };

  const showUpcomingCohorts = cohortsSectionEnabled === true;
  const showNewsletterSection = !publicSettingsLoading && publicSettings.newsletter;
  const showAcademyCohortsArea = showUpcomingCohorts || showNewsletterSection;

  return (
    <div className="bg-nexus-white">
      {/* Cursor glow */}
      <div className="cursor-glow hidden lg:block" style={{ left: cursorPos.x, top: cursorPos.y }} />

      {/* ===== SECTION 1: HERO ===== */}
      <section
        ref={heroRef}
        onMouseMove={handleMouseMove}
        className="relative overflow-hidden bg-nexus-dark"
      >
        <div className="pointer-events-none absolute inset-0">
          <Image
            src="/images/logo/nexus-front-md.jpg"
            alt=""
            fill
            priority
            className="object-cover opacity-20"
            unoptimized
          />
          <div className="absolute inset-0 bg-gradient-to-b from-nexus-dark/75 via-nexus-dark/90 to-nexus-dark" />
        </div>
        <CodeRain />
        <div className="relative mx-auto flex max-w-7xl flex-col items-start px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
          <nav className="mb-8 flex items-center gap-2 text-sm text-nexus-gray/55">
            <Link href="/" className="transition hover:text-nexus-cyan-bright">{language === "fr" ? "Accueil" : "Home"}</Link>
            <span className="text-nexus-cyan/35">›</span>
            <span className="text-nexus-gray/80">Academy</span>
          </nav>

          <p className="mb-4 rounded-full border border-nexus-cyan/40 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-nexus-cyan-bright">
            NEXUS Academy
          </p>
          <h1 className="max-w-4xl text-4xl font-extrabold leading-tight text-nexus-white sm:text-5xl lg:text-6xl">
            {language === "fr" ? (
              <>
                Formation tech pratique pour ceux qui veulent <span className="text-nexus-cyan-bright">construire</span>, pas seulement apprendre.
              </>
            ) : (
              <>
                Practical tech training for people who want to <span className="text-nexus-cyan-bright">build</span>, not just learn.
              </>
            )}
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-nexus-gray/80">
            {language === "fr"
              ? "NEXUS Academy forme les étudiants à travers des cohortes structurées, des sessions en direct, des projets réels, du mentorat individuel et une certification vérifiable. Vous repartez avec des compétences visibles, un portfolio, et un chemin plus clair vers l'industrie."
              : "NEXUS Academy trains students through structured cohorts, live sessions, real projects, one-on-one mentorship, and verifiable certification. You leave with visible skills, a portfolio, and a clearer path into the industry."}
          </p>
          <p className="mt-4 text-sm font-semibold uppercase tracking-[0.25em] text-nexus-cyan">
            {language === "fr" ? "Apprendre · Construire · Prouver" : "Learn · Build · Prove"}
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="#programs" className="group rounded-md bg-nexus-cyan px-6 py-3 text-sm font-semibold text-nexus-dark transition hover:bg-nexus-cyan-bright">
              {language === "fr" ? "Explorer les programmes" : "Explore Programs"}
            </Link>
            <Link href="/academy/curriculum" className="rounded-md border border-nexus-cyan/40 px-6 py-3 text-sm font-semibold text-nexus-cyan-bright transition hover:bg-nexus-navy">
              {language === "fr" ? "Voir le curriculum" : "View Curriculum"}
            </Link>
            <Link href="/academy/ask-question" className="rounded-md border border-nexus-cyan/25 px-6 py-3 text-sm font-semibold text-nexus-gray/80 transition hover:border-nexus-cyan/50 hover:text-nexus-cyan-bright">
              {language === "fr" ? "Poser une question" : "Ask a Question"}
            </Link>
          </div>

          <div className="mt-10 grid w-full max-w-2xl grid-cols-2 gap-4 border-t border-nexus-cyan/15 pt-6 sm:grid-cols-4">
            {[
              { value: programsLoading ? "…" : programs.length || 4, label: language === "fr" ? "Programmes" : "Programs" },
              { value: "8–12", label: language === "fr" ? "Semaines" : "Weeks" },
              { value: "1:1", label: language === "fr" ? "Mentorat" : "Mentorship" },
              { value: "3–5", label: language === "fr" ? "Projets" : "Projects" },
            ].map((s) => (
              <div key={s.label}>
                <p className="text-2xl font-extrabold text-nexus-cyan-bright">{s.value}</p>
                <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-nexus-gray/55">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== SECTION 2: WHAT WE DO ===== */}
      <section ref={whatRef} className="py-20 lg:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-5 gap-16 items-start">
            <div className={`lg:col-span-3 transition-all duration-700 ${whatVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
              <p className="text-nexus-cyan font-semibold tracking-widest uppercase text-sm mb-4">
                {language === "fr" ? "QUI NOUS SOMMES" : "WHO WE ARE"}
              </p>
              <h2 className="text-4xl md:text-5xl font-bold text-nexus-dark leading-tight mb-8">
                {language === "fr"
                  ? "Une école de technologie pratique, pas une plateforme en ligne"
                  : "A practical tech school, not an online platform"}
              </h2>
              <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
                {whatFacts.map((fact) => (
                  <div key={fact.label} className="border-l-2 border-nexus-cyan/40 pl-3">
                    <div className="text-xl font-bold text-nexus-cyan-bright">{fact.num}</div>
                    <div className="mt-1 text-xs font-medium uppercase tracking-wide text-nexus-navy/55">{fact.label}</div>
                  </div>
                ))}
              </div>
              <div className="space-y-6 text-lg text-nexus-navy/70 leading-relaxed">
                <p>
                  {language === "fr"
                    ? "NEXUS Academy est l'école de formation de NEXUS Group, une entreprise technologique intégrée opérant à travers quatre divisions spécialisées. L'Académie est le point d'entrée, là où les talents sont formés avant de rejoindre nos autres divisions ou le marché de l'emploi."
                    : "NEXUS Academy is the training arm of NEXUS Group, an integrated technology company operating through four specialist divisions. The Academy is the entry point, where talent is trained before joining our other divisions or the job market."}
                </p>
                <p>
                  {language === "fr"
                    ? "Nous ne vendons pas des cours enregistrés. Nous offrons une immersion pratique de 8 à 12 semaines qui combine sessions en direct avec des experts du secteur, projets réels et mentorat individuel. Chaque étudiant construit un portfolio professionnel prouvant ses compétences aux employeurs."
                    : "We don't sell pre-recorded courses. We offer an 8- to 12-week practical immersion that combines live sessions with industry experts, real-world projects, and one-on-one mentorship. Every student builds a professional portfolio proving their skills to employers."}
                </p>
                <p>
                  {language === "fr"
                    ? "Nos programmes couvrent le développement web full-stack, le design UI/UX, le graphisme et l'automatisation par l'IA, des compétences directement demandées par les entreprises technologiques et les projets numériques modernes."
                    : "Our programs cover full-stack web development, UI/UX design, graphic design, and AI automation, skills directly demanded by technology companies and modern digital projects."}
                </p>
              </div>
            </div>

            <div className={`lg:col-span-2 transition-all duration-700 delay-200 ${whatVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
              <div className="overflow-hidden rounded-2xl border border-nexus-cyan/15 bg-nexus-dark shadow-2xl shadow-nexus-navy/20">
                <div className="relative aspect-video bg-gradient-to-br from-nexus-navy to-nexus-dark">
                  {overviewIsEmbed ? (
                    <>
                      {!videoPlaying && (
                        <button
                          type="button"
                          onClick={() => setPlayingVideoUrl(overviewVideoUrl)}
                          className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 text-center transition hover:bg-nexus-dark/20"
                          aria-label={
                            language === "fr"
                              ? "Lire la vidéo de présentation"
                              : "Play academy overview video"
                          }
                        >
                          <span className="cohort-open flex h-20 w-20 items-center justify-center rounded-full border border-nexus-cyan/50 bg-nexus-cyan/20 text-nexus-cyan-bright backdrop-blur">
                            <Play className="h-9 w-9 fill-current" />
                          </span>
                          <span className="px-6 text-sm font-semibold uppercase tracking-widest text-nexus-cyan-bright">
                            {language === "fr"
                              ? "Vidéo de présentation"
                              : "Academy Overview Video"}
                          </span>
                          <span className="max-w-xs px-6 text-sm leading-relaxed text-nexus-gray/65">
                            {language === "fr"
                              ? "Cliquez pour comprendre comment fonctionne l'Académie NEXUS."
                              : "Click to understand how NEXUS Academy works."}
                          </span>
                        </button>
                      )}
                      {videoPlaying && (
                        <VideoPlayer
                          src={overviewVideoUrl}
                          title="Academy overview video"
                          className="absolute inset-0 h-full w-full"
                        />
                      )}
                    </>
                  ) : overviewVideoUrl && resolvedOverviewVideo && !videoFailed ? (
                    <VideoPlayer
                      key={overviewVideoUrl}
                      src={overviewVideoUrl}
                      title="Academy overview video"
                      className="h-full w-full object-cover"
                      controls
                      autoPlay
                      muted
                      loop
                      poster={overviewVideoPoster}
                      onError={() => setFailedVideoUrl(overviewVideoUrl)}
                    />
                  ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center gap-3 px-6 text-center">
                      <Play className="h-9 w-9 text-nexus-cyan/60" />
                      <span className="text-sm font-semibold uppercase tracking-widest text-nexus-cyan-bright">
                        {language === "fr" ? "Vidéo de présentation" : "Academy Overview Video"}
                      </span>
                      <span className="max-w-xs text-sm leading-relaxed text-nexus-gray/65">
                        {language === "fr"
                          ? "La vidéo apparaîtra ici une fois configurée."
                          : "The video will appear here once configured."}
                      </span>
                    </div>
                  )}
                </div>
                <div className="bg-nexus-dark px-6 py-5">
                  <h3 className="text-lg font-bold text-nexus-white">
                    {language === "fr" ? "Comprendre l'expérience Academy" : "Understand the Academy Experience"}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-nexus-gray/65">
                    {language === "fr"
                      ? "Cette vidéo servira de guide visuel pour expliquer nos cohortes, nos projets et notre méthode d'accompagnement."
                      : "This video will serve as a visual guide explaining our cohorts, projects, and mentorship approach."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== SECTION 3: PROGRAMS (Alternating Rows) ===== */}
      <section id="programs" className="py-20 lg:py-32 bg-nexus-gray scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-nexus-cyan font-semibold tracking-widest uppercase text-sm mb-4">
              {language === "fr" ? "NOS PROGRAMMES" : "OUR PROGRAMS"}
            </p>
            <h2 className="text-4xl md:text-5xl font-bold text-nexus-dark mb-6">
              {language === "fr" ? "Choisissez votre parcours" : "Choose Your Path"}
            </h2>
            <p className="text-xl text-nexus-navy/70 max-w-3xl mx-auto">
              {language === "fr"
                ? "Chaque programme est conçu pour des résultats concrets. Pas de théorie sans pratique — chaque semaine construit vers un objectif professionnel."
                : "Each program is designed for concrete outcomes. No theory without practice — every week builds toward a professional goal."}
            </p>
          </div>

          <div ref={programsRef} className="space-y-6">
            {programsLoading ? (
              <p className="py-12 text-center text-nexus-navy/55">
                {language === "fr" ? "Chargement des programmes..." : "Loading programs..."}
              </p>
            ) : programs.length === 0 ? (
              <p className="py-12 text-center text-nexus-navy/55">
                {language === "fr" ? "Aucun programme disponible pour le moment." : "No programs are available right now."}
              </p>
            ) : programs.map((program, i) => {
              const isVisible = programsVisible;
              const delay = i * 150;
              return (
                <div
                  key={program.slug}
                  className={`program-row ${i % 2 === 0 ? "slide-left" : "slide-right"} ${isVisible ? "" : ""}`}
                  style={{ animationDelay: `${delay}ms`, animationPlayState: isVisible ? "running" : "paused", opacity: isVisible ? undefined : 0 }}
                >
                  <div className="bg-white rounded-2xl border border-nexus-cyan/10 overflow-hidden hover:border-nexus-cyan/30 transition-all hover:shadow-lg group">
                    <div className={`flex flex-col md:flex-row ${i % 2 === 1 ? "md:flex-row-reverse" : ""}`}>
                      <div className="md:w-2/5 relative overflow-hidden">
                        {program.thumbnailUrl ? (
                          <div className="absolute inset-0">
                            <Image
                              src={program.thumbnailUrl}
                              alt={program.title}
                              fill
                              className="object-cover"
                              sizes="(max-width: 768px) 100vw, 40vw"
                            />
                            <div className="absolute inset-0 bg-gradient-to-br from-nexus-navy/90 to-nexus-dark/70" />
                          </div>
                        ) : (
                          <div className="absolute inset-0 bg-gradient-to-br from-nexus-navy to-nexus-dark" />
                        )}
                        <div className="relative z-10 p-8 flex flex-col justify-center items-center text-center h-full">
                          {!program.thumbnailUrl && (
                            <div className="row-icon relative z-10 w-16 h-16 rounded-full bg-nexus-cyan/20 flex items-center justify-center text-nexus-cyan-bright mb-4">
                              {programIcons[program.slug]}
                            </div>
                          )}
                          <h3 className="relative z-10 text-2xl font-bold text-white mb-2"><TranslatedText>{program.title}</TranslatedText></h3>
                          <span className="relative z-10 text-sm text-nexus-gray/60 flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {program.durationWeeks} {language === "fr" ? "semaines" : "weeks"}
                          </span>
                        </div>
                      </div>
                      <div className="md:w-3/5 p-8">
                        <p className="text-nexus-navy/70 leading-relaxed mb-5 text-lg">
                          <TranslatedText as="span">{program.fullDescription}</TranslatedText>
                        </p>
                        <div className="flex flex-wrap gap-2 mb-6">
                          {(program.tools || []).map((tool, ti) => (
                            <span key={tool} className="badge-stagger px-3 py-1.5 text-xs font-semibold bg-nexus-cyan/10 text-nexus-cyan rounded-full" style={{ animationDelay: `${delay + ti * 60}ms` }}>
                              <TranslatedText>{tool}</TranslatedText>
                            </span>
                          ))}
                        </div>
                        <div className="flex gap-3">
                          <Link href={`/academy/program/${program.slug}`} className="flex items-center gap-2 bg-nexus-cyan text-nexus-dark px-5 py-2.5 rounded-lg font-semibold text-sm transition hover:bg-nexus-cyan-bright">
                            {language === "fr" ? "Voir les détails" : "View Details"}
                            <ArrowRight className="h-4 w-4" />
                          </Link>
                          <Link href={`/academy/register/${program.slug}`} className="flex items-center gap-2 border border-nexus-cyan/30 text-nexus-cyan px-5 py-2.5 rounded-lg font-semibold text-sm transition hover:bg-nexus-navy hover:border-nexus-cyan">
                            {language === "fr" ? "S'inscrire" : "Enroll"}
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="text-center mt-10">
            <Link href="/academy/programs" className="inline-flex items-center gap-2 text-nexus-cyan font-semibold hover:gap-3 transition-all">
              {language === "fr" ? "Comparer tous les programmes" : "Compare all programs"}
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ===== SECTION 4: HOW IT WORKS (Step Flow) ===== */}
      <section ref={stepsRef} className="py-20 lg:py-32 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-nexus-cyan font-semibold tracking-widest uppercase text-sm mb-4">
              {language === "fr" ? "COMMENT ÇA MARCHE" : "HOW IT WORKS"}
            </p>
            <h2 className="text-4xl md:text-5xl font-bold text-nexus-dark mb-6">
              {language === "fr" ? "De la candidature au certificat" : "From Application to Certificate"}
            </h2>
            <p className="text-xl text-nexus-navy/70 max-w-3xl mx-auto">
              {language === "fr"
                ? "Un parcours clair et structuré en quatre étapes."
                : "A clear, structured four-step journey."}
            </p>
          </div>

          <div className="relative">
            <StepLine visible={stepsVisible} />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-6">
              {steps.map((step, i) => (
                <div key={step.num} className="relative flex flex-col items-center text-center">
                  <div
                    className={`step-circle z-10 w-16 h-16 rounded-full bg-gradient-to-br from-nexus-cyan to-nexus-navy text-white flex items-center justify-center font-bold text-xl shadow-lg mb-6 ${stepsVisible ? "pop" : ""}`}
                    style={{ animationDelay: `${300 + i * 200}ms` }}
                  >
                    {step.num}
                  </div>
                  <h3 className="text-lg font-bold text-nexus-dark mb-2">{step.title}</h3>
                  <p className="text-sm text-nexus-navy/60 leading-relaxed md:max-w-[200px]">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== SECTION 5: WHY NEXUS ACADEMY (Comparison) ===== */}
      <section ref={whyRef} className="py-20 lg:py-32 bg-nexus-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-nexus-cyan font-semibold tracking-widest uppercase text-sm mb-4">
              {language === "fr" ? "POURQUOI NEXUS" : "WHY NEXUS"}
            </p>
            <h2 className="text-4xl md:text-5xl font-bold text-nexus-dark mb-6">
              {language === "fr" ? "Ce qui nous rend différents" : "What Makes Us Different"}
            </h2>
          </div>

          <div className={`bg-white rounded-2xl overflow-hidden border border-nexus-cyan/10 transition-all duration-700 ${whyVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <div className="grid md:grid-cols-2">
              <div className="p-8 lg:p-10">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 rounded-lg bg-nexus-cyan/20 flex items-center justify-center">
                    <GraduationCap className="h-5 w-5 text-nexus-cyan" />
                  </div>
                  <h3 className="text-xl font-bold text-nexus-dark">NEXUS Academy</h3>
                </div>
                <ul className="space-y-5">
                  {comparison.nexus.map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <svg className="h-5 w-5 text-nexus-cyan mt-0.5 shrink-0" viewBox="0 0 20 20" fill="none">
                        <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="1.5" />
                        <path className={`svg-check ${whyVisible ? "drawn" : ""}`} d="M6 10.5l2.5 2.5L14 7.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ animationDelay: `${i * 150}ms` }} />
                      </svg>
                      <span className="text-nexus-navy/80">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="p-8 lg:p-10 bg-nexus-navy/5 border-t md:border-t-0 md:border-l border-nexus-cyan/10">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 rounded-lg bg-nexus-navy/10 flex items-center justify-center">
                    <span className="text-lg">🎓</span>
                  </div>
                  <h3 className="text-xl font-bold text-nexus-dark/60">
                    {language === "fr" ? "Autres formations" : "Other Courses"}
                  </h3>
                </div>
                <ul className="space-y-5">
                  {comparison.others.map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <X className={`h-5 w-5 text-nexus-navy/30 mt-0.5 shrink-0 cross-fade ${whyVisible ? "shown" : ""}`} style={{ animationDelay: `${i * 150}ms` }} />
                      <span className="text-nexus-navy/50">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== SECTION 6: UPCOMING COHORTS + NEWSLETTER ===== */}
      {showAcademyCohortsArea && <section ref={cohortsRef} className="py-20 lg:py-32 bg-gradient-to-br from-nexus-dark via-[#0d1040] to-nexus-dark relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
          <div className="absolute top-0 right-0 w-96 h-96 bg-nexus-cyan/10 rounded-full blur-3xl float-shape-slow" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-nexus-navy/40 rounded-full blur-3xl float-shape" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`grid ${showUpcomingCohorts && showNewsletterSection ? "lg:grid-cols-2" : "lg:grid-cols-1"} gap-16 transition-all duration-700 ${cohortsVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            {showUpcomingCohorts && <div>
              <p className="text-nexus-cyan-bright font-semibold tracking-widest uppercase text-sm mb-4">
                {language === "fr" ? "PROCHAINES COHORTES" : "UPCOMING COHORTS"}
              </p>
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                {language === "fr" ? "Rejoignez la prochaine cohorte" : "Join the Next Cohort"}
              </h2>
              <p className="text-xl text-nexus-gray/70 mb-10">
                {language === "fr"
                  ? "Nos programmes sont offerts par cohortes avec des dates de début spécifiques."
                  : "Our programs run in cohorts with specific start dates."}
              </p>

              <div className="space-y-4">
                {cohorts.length === 0 ? (
                  <p className="rounded-xl border border-nexus-cyan/15 bg-white/5 p-5 text-sm leading-relaxed text-nexus-gray/70">
                    {language === "fr"
                      ? "Aucune cohorte n’est annoncée pour le moment. Revenez bientôt pour découvrir les prochaines dates."
                      : "No cohorts have been announced yet. Check back soon for upcoming dates."}
                  </p>
                ) : cohorts.map((cohort) => {
                  const program = programs.find((p) => p.slug === cohort.programSlug);
                  const publicDescription = cohort.description?.trim() || program?.shortDescription ||
                    (language === "fr" ? "Les détails de cette cohorte seront annoncés prochainement." : "More details about this cohort will be announced soon.");
                  return (
                    <div key={cohort.id} className={`bg-white/5 backdrop-blur rounded-xl p-6 border transition-all ${cohort.acceptingApplications ? "border-nexus-cyan/60 cohort-open" : "border-nexus-cyan/15"}`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-xl font-bold text-white"><TranslatedText>{cohort.name}</TranslatedText></h3>
                          <p className="text-nexus-gray/60 flex items-center gap-2 mt-1">
                            <Calendar className="h-4 w-4" /> <TranslatedText>{cohort.period}</TranslatedText>
                          </p>
                        </div>
                        {cohort.acceptingApplications ? (
                          <Link
                            href={program ? `/academy/register/${program.slug}?cohort=${encodeURIComponent(cohort.id)}` : "/academy/programs"}
                            className="bg-nexus-cyan text-nexus-dark px-5 py-2 rounded-lg font-semibold text-sm transition hover:bg-nexus-cyan-bright"
                          >
                            {language === "fr" ? "Postuler" : "Apply Now"}
                          </Link>
                        ) : (
                          <span className="text-nexus-gray/40 text-sm">{language === "fr" ? "Bientôt" : "Coming Soon"}</span>
                        )}
                      </div>
                      <p className="text-nexus-gray/70 text-sm mt-3 leading-relaxed"><TranslatedText as="span">{publicDescription}</TranslatedText></p>
                    </div>
                  );
                })}
              </div>
            </div>}

            {showNewsletterSection && <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 lg:p-10 border border-nexus-cyan/15">
              <div className="w-14 h-14 rounded-xl bg-nexus-cyan/20 flex items-center justify-center text-nexus-cyan-bright mb-6">
                <Mail className="h-7 w-7" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">
                {language === "fr" ? "Restez informé" : "Stay Updated"}
              </h3>
              <p className="text-nexus-gray/60 mb-6">
                {language === "fr"
                  ? "Recevez une notification par email lorsque les applications ouvrent."
                  : "Get an email notification when applications open."}
              </p>

              {newsletterStatus === "success" ? (
                <div className="flex items-center gap-3 text-nexus-cyan-bright bg-nexus-cyan/10 rounded-lg p-4">
                  <svg className="h-6 w-6 shrink-0" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                    <path className="success-check drawn" d="M7 12.5l3.5 3.5L17 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span className="font-medium">{language === "fr" ? "Merci ! Vous serez notifié(e)." : "Thank you! You'll be notified."}</span>
                </div>
              ) : (
                <form onSubmit={handleNewsletterSubmit} className="space-y-4">
                  {newsletterError && (
                    <div role="alert" className="rounded-lg border border-red-400/40 bg-red-500/15 px-4 py-3 text-sm text-red-200">
                      {newsletterError}
                    </div>
                  )}
                  <input
                    type="email"
                    value={newsletterEmail}
                    onChange={(e) => {
                      setNewsletterEmail(e.target.value);
                      if (newsletterError) setNewsletterError(null);
                    }}
                    placeholder={language === "fr" ? "Votre adresse email" : "Your email address"}
                    required
                    className="newsletter-input w-full bg-white/10 border border-nexus-cyan/25 rounded-lg px-4 py-3 text-white placeholder-nexus-gray/40 focus:outline-none focus:border-nexus-cyan transition"
                  />
                  <button type="submit" disabled={newsletterStatus === "loading"} className="w-full bg-nexus-cyan text-nexus-dark py-3 rounded-lg font-semibold transition hover:bg-nexus-cyan-bright disabled:opacity-60 disabled:cursor-not-allowed">
                    {newsletterStatus === "loading"
                      ? language === "fr" ? "Inscription..." : "Subscribing..."
                      : language === "fr" ? "M'inscrire" : "Subscribe"}
                  </button>
                </form>
              )}

              <p className="text-nexus-gray/40 text-xs mt-4">
                {language === "fr" ? "Actualités par e-mail, désabonnement à tout moment." : "Email updates. Unsubscribe at any time."}
              </p>
            </div>}
          </div>
        </div>
      </section>}

      {/* ===== SECTION 7: TOOLS (Accordion) ===== */}
      <section ref={toolsRef} className="py-20 lg:py-32 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-nexus-cyan font-semibold tracking-widest uppercase text-sm mb-4">
              {language === "fr" ? "TECHNOLOGIES" : "TECHNOLOGIES"}
            </p>
            <h2 className="text-4xl md:text-5xl font-bold text-nexus-dark mb-6">
              {language === "fr" ? "Les outils que vous maîtriserez" : "The Tools You'll Master"}
            </h2>
            <p className="text-xl text-nexus-navy/70">
              {language === "fr"
                ? "Chaque programme vous forme aux outils utilisés par les professionnels du secteur."
                : "Each program trains you on the tools used by industry professionals."}
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {programs.map((program, i) => (
              <div
                key={program.slug}
                className={`program-row ${i % 2 === 0 ? "slide-left" : "slide-right"} rounded-2xl border border-nexus-cyan/10 bg-nexus-gray p-6 transition-all hover:-translate-y-1 hover:border-nexus-cyan/30 hover:bg-nexus-white hover:shadow-xl ${toolsVisible ? "" : ""}`}
                style={{ animationDelay: `${i * 140}ms`, animationPlayState: toolsVisible ? "running" : "paused", opacity: toolsVisible ? undefined : 0 }}
              >
                <div className="mb-5 flex items-center gap-4">
                  {program.thumbnailUrl ? (
                    <Image
                      src={program.thumbnailUrl}
                      alt={program.title}
                      width={48}
                      height={48}
                      className="rounded-xl object-cover"
                    />
                  ) : (
                    <div className="row-icon flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-nexus-cyan/20 to-nexus-navy/10 text-nexus-cyan">
                      {programIcons[program.slug]}
                    </div>
                  )}
                  <div>
                    <h3 className="text-xl font-bold text-nexus-dark"><TranslatedText>{program.title}</TranslatedText></h3>
                    <p className="text-sm text-nexus-navy/55">
                      {(program.tools || []).length} {language === "fr" ? "outils et technologies" : "tools and technologies"}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(program.tools || []).map((tool, ti) => (
                    <span
                      key={tool}
                      className="badge-stagger tool-badge rounded-full bg-nexus-cyan/10 px-3 py-1.5 text-sm font-medium text-nexus-cyan"
                      style={{ animationDelay: `${i * 120 + ti * 45}ms`, animationPlayState: toolsVisible ? "running" : "paused" }}
                    >
                      <TranslatedText>{tool}</TranslatedText>
                    </span>
                  ))}
                </div>
                <div className="mt-6 flex gap-4 border-t border-nexus-cyan/10 pt-4">
                  <Link href={`/academy/program/${program.slug}`} className="text-sm font-semibold text-nexus-cyan hover:underline">
                    {language === "fr" ? "Voir les détails" : "View Details"} →
                  </Link>
                  <Link href={`/academy/register/${program.slug}`} className="text-sm font-semibold text-nexus-dark hover:underline">
                    {language === "fr" ? "S'inscrire" : "Enroll"} →
                  </Link>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link href="/ai/videos" className="inline-flex items-center gap-2 rounded-lg border border-nexus-cyan/30 px-6 py-3 font-semibold text-nexus-cyan transition hover:bg-nexus-cyan/10">
              {language === "fr" ? "Voir la bibliothèque vidéo IA" : "Explore the AI Video Library"}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ===== SECTION 8: CTA ===== */}
      <section className="py-20 lg:py-24 bg-gradient-to-r from-nexus-dark via-[#0d1040] to-nexus-dark relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-nexus-cyan/5 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            {language === "fr" ? "Prêt à transformer votre carrière ?" : "Ready to Transform Your Career?"}
          </h2>
          <p className="text-xl text-nexus-gray/70 mb-10 max-w-2xl mx-auto">
            {language === "fr"
              ? "Que vous vouliez devenir développeur, designer ou spécialiste en IA, nous avons le programme qu'il vous faut."
              : "Whether you want to become a developer, designer, or AI specialist, we have the program for you."}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/academy/programs" className="group flex items-center justify-center gap-2 bg-nexus-cyan text-nexus-dark px-8 py-4 rounded-lg font-semibold text-lg transition hover:bg-nexus-cyan-bright">
              {language === "fr" ? "Postuler maintenant" : "Apply Now"}
              <ArrowRight className="h-5 w-5 transition group-hover:translate-x-1" />
            </Link>
            <Link href="/academy/ask-question" className="flex items-center justify-center gap-2 border border-nexus-cyan/30 text-nexus-cyan-bright px-8 py-4 rounded-lg font-semibold text-lg transition hover:bg-nexus-navy hover:border-nexus-cyan">
              {language === "fr" ? "Poser une question" : "Ask a Question"}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
