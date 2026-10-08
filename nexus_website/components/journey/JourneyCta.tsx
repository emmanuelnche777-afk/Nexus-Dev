"use client";

import Link from "next/link";
import { ArrowRight, GraduationCap, Handshake, BookOpen } from "lucide-react";
import Reveal from "@/components/divisions/tech-hub/Reveal";
import TiltCard from "@/components/divisions/tech-hub/TiltCard";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function JourneyCta() {
  const { t } = useLanguage();
  const jp = t.journeyPage;

  const ctas = [
    {
      icon: <GraduationCap className="h-6 w-6" />,
      title: jp.ctaPrograms,
      description: "Explore our training tracks in Software Development, UI/UX Design, Graphic Design, and AI Automation.",
      href: "/academy",
      color: "text-nexus-cyan-bright",
      bg: "bg-nexus-cyan/10",
    },
    {
      icon: <Handshake className="h-6 w-6" />,
      title: jp.ctaPartner,
      description: "Collaborate with NEXUS to build impactful technology solutions and community programs.",
      href: "/partner",
      color: "text-green-400",
      bg: "bg-green-500/10",
    },
    {
      icon: <BookOpen className="h-6 w-6" />,
      title: jp.ctaBlog,
      description: "Read insights from our team about technology, education, and digital trust in Cameroon.",
      href: "/blog",
      color: "text-amber-400",
      bg: "bg-amber-500/10",
    },
  ];

  return (
    <section className="relative overflow-hidden bg-nexus-dark py-20 lg:py-28">
      {/* Gradient accents */}
      <div className="pointer-events-none absolute -left-24 -top-24 h-80 w-80 rounded-full bg-nexus-cyan/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-24 h-80 w-80 rounded-full bg-nexus-navy/40 blur-3xl" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal variant="up">
          <p className="text-center font-mono text-xs uppercase tracking-[0.3em] text-nexus-cyan">
            {jp.ctaEyebrow}
          </p>
          <h2 className="mx-auto mt-4 max-w-3xl text-center text-3xl font-extrabold leading-tight text-white sm:text-4xl lg:text-5xl">
            {jp.ctaTitle}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-nexus-gray/70">
            {jp.ctaDesc}
          </p>
        </Reveal>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {ctas.map((cta, i) => (
            <Reveal key={cta.title} variant="up" delay={i * 100}>
              <TiltCard className="h-full">
                <Link
                  href={cta.href}
                  className="group flex h-full flex-col rounded-xl border border-nexus-cyan/15 bg-nexus-navy-deep/60 p-8 transition-all duration-300 hover:border-nexus-cyan/30 hover:bg-nexus-navy-deep hover:shadow-xl hover:shadow-nexus-cyan/5"
                >
                  <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${cta.bg} ${cta.color}`}>
                    {cta.icon}
                  </div>
                  <h3 className="mt-5 text-lg font-bold text-white transition group-hover:text-nexus-cyan-bright">
                    {cta.title}
                  </h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-nexus-gray/60">
                    {cta.description}
                  </p>
                  <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-nexus-cyan-bright transition group-hover:gap-3">
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </Link>
              </TiltCard>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
