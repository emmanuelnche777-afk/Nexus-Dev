"use client";

import Link from "next/link";
import {
  GraduationCap,
  Wrench,
  HeartHandshake,
  Users,
  ArrowRight,
  Check,
  ChevronDown,
  Search,
  MousePointerClick,
  Hammer,
  Sparkles,
} from "lucide-react";
import SectionHeading from "@/components/SectionHeading";
import CTA from "@/components/CTA";
import TiltCard from "@/components/divisions/TiltCard";
import EcosystemDiagram from "@/components/divisions/EcosystemDiagram";
import PathFinder from "@/components/divisions/PathFinder";
import CountUpStats from "@/components/divisions/CountUpStats";
import { useInView } from "@/components/divisions/useInView";
import { SITE_STATS } from "@/lib/site";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function Divisions() {
  const { t } = useLanguage();
  const { ref: journeyRef, inView: journeyIn } = useInView<HTMLDivElement>(0.3);

  const divisions = [
    {
      name: t.divisions.academy.name,
      href: "/academy",
      icon: <GraduationCap className="h-7 w-7" />,
      tagline: t.divisionsPage.academyTagline,
      description: t.divisionsPage.academyDesc,
      highlights: [
        t.divisionsPage.academyH1,
        t.divisionsPage.academyH2,
        t.divisionsPage.academyH3,
      ],
    },
    {
      name: t.divisions.techHub.name,
      href: "/divisions/tech-hub",
      icon: <Wrench className="h-7 w-7" />,
      tagline: t.divisionsPage.techHubTagline,
      description: t.divisionsPage.techHubDesc,
      highlights: [
        t.divisionsPage.techHubH1,
        t.divisionsPage.techHubH2,
        t.divisionsPage.techHubH3,
      ],
    },
    {
      name: t.divisions.foundation.name,
      href: "/divisions/foundation",
      icon: <HeartHandshake className="h-7 w-7" />,
      tagline: t.divisionsPage.foundationTagline,
      description: t.divisionsPage.foundationDesc,
      highlights: [
        t.divisionsPage.foundationH1,
        t.divisionsPage.foundationH2,
        t.divisionsPage.foundationH3,
      ],
    },
    {
      name: t.divisions.mentorship.name,
      href: "/divisions/mentorship",
      icon: <Users className="h-7 w-7" />,
      tagline: t.divisionsPage.mentorshipTagline,
      description: t.divisionsPage.mentorshipDesc,
      highlights: [
        t.divisionsPage.mentorshipH1,
        t.divisionsPage.mentorshipH2,
        t.divisionsPage.mentorshipH3,
      ],
    },
  ];

  const ecoNodes = [
    {
      icon: <GraduationCap className="h-5 w-5" />,
      name: t.divisions.academy.name,
      flow: t.divisionsPage.ecoAcademyFlow,
    },
    {
      icon: <Wrench className="h-5 w-5" />,
      name: t.divisions.techHub.name,
      flow: t.divisionsPage.ecoTechHubFlow,
    },
    {
      icon: <HeartHandshake className="h-5 w-5" />,
      name: t.divisions.foundation.name,
      flow: t.divisionsPage.ecoFoundationFlow,
    },
    {
      icon: <Users className="h-5 w-5" />,
      name: t.divisions.mentorship.name,
      flow: t.divisionsPage.ecoMentorshipFlow,
    },
  ];

  const stats = [
    { value: SITE_STATS.divisions, suffix: "", label: t.divisionsPage.statDivisionsLabel },
    { value: SITE_STATS.programs, suffix: "+", label: t.divisionsPage.statProgramsLabel },
    { value: SITE_STATS.trained, suffix: "+", label: t.divisionsPage.statTrainedLabel },
    { value: SITE_STATS.communities, suffix: "+", label: t.divisionsPage.statCommunitiesLabel },
  ];

  const journeySteps = [
    {
      icon: <Search className="h-6 w-6" />,
      title: t.divisionsPage.jStep1Title,
      text: t.divisionsPage.jStep1Text,
    },
    {
      icon: <MousePointerClick className="h-6 w-6" />,
      title: t.divisionsPage.jStep2Title,
      text: t.divisionsPage.jStep2Text,
    },
    {
      icon: <Hammer className="h-6 w-6" />,
      title: t.divisionsPage.jStep3Title,
      text: t.divisionsPage.jStep3Text,
    },
    {
      icon: <Sparkles className="h-6 w-6" />,
      title: t.divisionsPage.jStep4Title,
      text: t.divisionsPage.jStep4Text,
    },
  ];

  return (
    <div className="bg-nexus-white">
      <section className="relative overflow-hidden bg-nexus-dark">
        <div className="grid-overlay" />
        <div className="orb -left-32 top-10 h-96 w-96 bg-nexus-navy/50" />
        <div className="orb orb-delay-1 -right-24 top-1/3 h-80 w-80 bg-nexus-cyan/20" />
        <div className="orb orb-delay-2 bottom-0 left-1/3 h-72 w-72 bg-nexus-cyan-bright/10" />

        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
          <nav className="animate-reveal mb-8 flex items-center gap-2 text-sm text-nexus-gray/60">
            <Link href="/" className="transition hover:text-nexus-cyan-bright">
              Home
            </Link>
            <span className="text-nexus-cyan/40">›</span>
            <span className="text-nexus-gray/80">Divisions</span>
          </nav>

          <p className="animate-reveal animate-reveal-delay-1 mb-4 inline-block rounded-full border border-nexus-cyan/40 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-nexus-cyan-bright">
            {t.divisionsPage.eyebrow}
          </p>
          <h1 className="animate-reveal animate-reveal-delay-2 max-w-3xl text-4xl font-extrabold leading-tight text-nexus-white sm:text-5xl lg:text-6xl">
            {t.divisionsPage.title}
          </h1>
          <p className="animate-reveal animate-reveal-delay-3 mt-6 max-w-2xl text-lg leading-relaxed text-nexus-gray/80">
            {t.divisionsPage.description}
          </p>

          <div className="animate-reveal animate-reveal-delay-4 mt-10 flex flex-wrap gap-3">
            {divisions.map((d) => (
              <Link
                key={d.href}
                href={d.href}
                className="group flex items-center gap-2 rounded-full border border-nexus-cyan/25 bg-nexus-navy-deep/40 px-4 py-2 text-sm font-semibold text-nexus-white backdrop-blur transition hover:border-nexus-cyan-bright hover:bg-nexus-navy"
              >
                <span className="text-nexus-cyan-bright">{d.icon}</span>
                {d.name}
                <ArrowRight className="h-3.5 w-3.5 text-nexus-cyan-bright transition group-hover:translate-x-0.5" />
              </Link>
            ))}
          </div>

          <a
            href="#showcase"
            className="mt-16 inline-flex items-center gap-2 text-sm font-medium text-nexus-gray/60 transition hover:text-nexus-cyan-bright"
          >
            {t.divisionsPage.heroScroll}
            <ChevronDown className="h-4 w-4 animate-bounce" />
          </a>
        </div>
      </section>

      <section id="showcase" className="scroll-mt-20 py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow={t.divisionsPage.overviewEyebrow}
            title={t.divisionsPage.overviewTitle}
            description={t.divisionsPage.overviewDesc}
          />
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {divisions.map((d, i) => (
              <div key={d.href} className={`animate-reveal animate-reveal-delay-${i + 1}`}>
                <TiltCard className="group h-full rounded-xl border border-nexus-cyan/20 bg-nexus-gray p-7">
                  <div className="relative z-[2] flex h-full flex-col">
                    <div className="flex items-center gap-4">
                      <div className="icon-pop flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-nexus-navy to-nexus-navy-deep text-nexus-cyan-bright shadow-md">
                        {d.icon}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-nexus-dark">
                          {d.name}
                        </h3>
                        <p className="text-sm font-medium text-nexus-cyan">
                          {d.tagline}
                        </p>
                      </div>
                    </div>
                    <p className="mt-5 text-sm leading-relaxed text-nexus-navy/75">
                      {d.description}
                    </p>
                    <ul className="mt-5 space-y-2.5">
                      {d.highlights.map((h) => (
                        <li
                          key={h}
                          className="flex items-start gap-2.5 text-sm text-nexus-navy/85"
                        >
                          <span className="mt-0.5 flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full bg-nexus-cyan/15 text-nexus-cyan">
                            <Check className="h-3 w-3" />
                          </span>
                          {h}
                        </li>
                      ))}
                    </ul>
                    <span className="mt-auto inline-flex items-center gap-1 pt-6 text-sm font-semibold text-nexus-cyan transition group-hover:gap-2">
                      {t.divisionsPage.exploreBtn}
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  </div>
                  <Link href={d.href} className="absolute inset-0 z-[3] rounded-xl" aria-label={d.name}>
                    <span className="sr-only">{d.name}</span>
                  </Link>
                </TiltCard>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-nexus-dark py-16 lg:py-24">
        <div className="orb -left-24 bottom-0 h-72 w-72 bg-nexus-navy/40" />
        <div className="orb orb-delay-1 -right-20 top-0 h-64 w-64 bg-nexus-cyan/15" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="mb-3 inline-block rounded-full border border-nexus-cyan/40 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-nexus-cyan-bright">
              {t.divisionsPage.ecoEyebrow}
            </p>
            <h2 className="text-3xl font-bold text-nexus-white sm:text-4xl">
              {t.divisionsPage.ecoTitle}
            </h2>
            <p className="mt-4 leading-relaxed text-nexus-gray/75">
              {t.divisionsPage.ecoDesc}
            </p>
          </div>
          <div className="mt-14">
            <EcosystemDiagram
              hubLabel={t.divisionsPage.ecoHubLabel}
              nodes={ecoNodes}
            />
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-24">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow={t.divisionsPage.finderEyebrow}
            title={t.divisionsPage.finderTitle}
            description={t.divisionsPage.finderDesc}
          />
          <div className="mt-12">
            <PathFinder />
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-gradient-to-br from-nexus-navy via-nexus-navy-deep to-nexus-dark py-16 lg:py-20">
        <div className="grid-overlay" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="mb-3 inline-block rounded-full border border-nexus-cyan/40 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-nexus-cyan-bright">
              {t.divisionsPage.statsEyebrow}
            </p>
            <h2 className="text-3xl font-bold text-nexus-white sm:text-4xl">
              {t.divisionsPage.statsTitle}
            </h2>
          </div>
          <div className="mt-12 grid grid-cols-2 gap-8 lg:grid-cols-4">
            {stats.map((stat, i) => (
              <div
                key={stat.label}
                className={`animate-reveal animate-reveal-delay-${i + 1} text-center`}
              >
                <p className="text-4xl font-extrabold tracking-tight text-nexus-cyan-bright sm:text-5xl">
                  <CountUpStats value={stat.value} suffix={stat.suffix} />
                </p>
                <p className="mt-2 text-sm font-medium text-nexus-gray/80">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-nexus-gray py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow={t.divisionsPage.journeyEyebrow}
            title={t.divisionsPage.journeyTitle}
            description={t.divisionsPage.journeyDesc}
          />
          <div ref={journeyRef} className="relative mt-16">
            <div className="absolute left-0 right-0 top-7 hidden h-0.5 bg-nexus-navy/10 lg:block" />
            <div
              className={`absolute left-0 right-0 top-7 hidden h-0.5 origin-left bg-gradient-to-r from-nexus-cyan to-nexus-cyan-bright lg:block ${
                journeyIn ? "animate-line-grow" : "scale-x-0"
              }`}
            />
            <ol className="grid gap-10 lg:grid-cols-4 lg:gap-6">
              {journeySteps.map((step, i) => (
                <li
                  key={step.title}
                  className={`animate-reveal animate-reveal-delay-${i + 1} relative flex gap-4 lg:flex-col lg:gap-0`}
                >
                  <div className="relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-2 border-nexus-cyan bg-nexus-white text-nexus-navy shadow-md">
                    {step.icon}
                    <span className="absolute -right-1.5 -top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-nexus-navy text-xs font-bold text-nexus-white">
                      {i + 1}
                    </span>
                  </div>
                  <div className="lg:mt-5">
                    <h3 className="text-lg font-bold text-nexus-dark">
                      {step.title}
                    </h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-nexus-navy/70">
                      {step.text}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <CTA
        title={t.divisionsPage.ctaTitle}
        description={t.divisionsPage.ctaDesc}
        primaryLabel={t.home.seeJourney}
        primaryHref="/journey"
        secondaryLabel={t.home.joinBtn}
        secondaryHref="/join-us?division=general"
      />
    </div>
  );
}
