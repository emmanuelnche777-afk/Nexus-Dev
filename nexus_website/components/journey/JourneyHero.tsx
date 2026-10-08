"use client";

import { useRef, type PointerEvent } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import WordReveal from "@/components/divisions/tech-hub/WordReveal";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function JourneyHero() {
  const { t } = useLanguage();
  const jp = t.journeyPage;
  const heroRef = useRef<HTMLElement>(null);

  const handleHeroMove = (e: PointerEvent<HTMLElement>) => {
    const el = heroRef.current;
    if (!el) return;
    if (
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      !window.matchMedia("(pointer: fine)").matches
    )
      return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty(
      "--px",
      String(((e.clientX - rect.left) / rect.width - 0.5) * 2)
    );
    el.style.setProperty(
      "--py",
      String(((e.clientY - rect.top) / rect.height - 0.5) * 2)
    );
  };

  return (
    <section
      ref={heroRef}
      onPointerMove={handleHeroMove}
      className="relative flex min-h-[85vh] flex-col justify-center overflow-hidden bg-nexus-dark py-24 lg:py-32"
    >
      {/* Gradient orbs */}
      <div className="orb absolute -left-40 top-1/4 h-96 w-96 rounded-full bg-nexus-cyan/15" />
      <div className="orb orb-delay-1 absolute -right-32 bottom-1/4 h-80 w-80 rounded-full bg-nexus-navy/40" />
      <div className="orb orb-delay-2 absolute left-1/2 top-10 h-64 w-64 rounded-full bg-nexus-cyan-bright/10" />

      {/* Grid overlay */}
      <div className="th-layer" style={{ "--depth": "8" } as React.CSSProperties}>
        <div className="grid-overlay opacity-40" />
      </div>

      {/* Floating particles */}
      <div className="th-layer" style={{ "--depth": "12" } as React.CSSProperties}>
        <div className="absolute left-[15%] top-[20%] h-1.5 w-1.5 rounded-full bg-nexus-cyan-bright/60 journey-float-slow" />
        <div className="absolute left-[75%] top-[30%] h-1 w-1 rounded-full bg-nexus-cyan/50 journey-float-medium" />
        <div className="absolute left-[40%] top-[70%] h-2 w-2 rounded-full bg-nexus-cyan-bright/40 journey-float-fast" />
        <div className="absolute left-[85%] top-[60%] h-1.5 w-1.5 rounded-full bg-nexus-cyan/30 journey-float-slow" style={{ animationDelay: "-3s" }} />
        <div className="absolute left-[25%] top-[80%] h-1 w-1 rounded-full bg-nexus-cyan-bright/50 journey-float-medium" style={{ animationDelay: "-5s" }} />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav
          aria-label="Breadcrumb"
          className="th-enter font-mono text-xs tracking-widest text-nexus-gray/50"
          style={{ animationDelay: "0.05s" }}
        >
          <Link href="/" className="transition hover:text-nexus-cyan-bright">
            Home
          </Link>
          <span className="mx-2 text-nexus-cyan/50">/</span>
          <span className="text-nexus-cyan-bright">Journey</span>
        </nav>

        {/* Eyebrow */}
        <p
          className="th-enter mt-8 rounded-full border border-nexus-cyan/30 bg-nexus-cyan/10 px-4 py-1.5 font-mono text-xs uppercase tracking-[0.3em] text-nexus-cyan-bright w-fit"
          style={{ animationDelay: "0.2s" }}
        >
          {jp.eyebrow}
        </p>

        {/* Title */}
        <div className="mt-6">
          <WordReveal
            text={jp.title}
            className="max-w-4xl text-4xl font-extrabold leading-[1.1] text-white sm:text-5xl lg:text-7xl"
          />
        </div>

        {/* Description */}
        <p
          className="th-enter mt-7 max-w-2xl text-lg leading-relaxed text-nexus-gray/75"
          style={{ animationDelay: "0.9s" }}
        >
          {jp.description}
        </p>

        {/* CTAs */}
        <div
          className="th-enter mt-9 flex flex-wrap items-center gap-4"
          style={{ animationDelay: "1.1s" }}
        >
          <a
            href="#timeline"
            className="inline-flex items-center gap-2 rounded-md bg-nexus-cyan px-6 py-3 text-sm font-semibold text-nexus-dark transition hover:bg-nexus-cyan-bright"
          >
            {jp.heroCtaPrimary} <ArrowRight className="h-4 w-4" />
          </a>
          <Link
            href="/partner"
            className="underline-link px-1 py-1 font-mono text-xs uppercase tracking-[0.2em] text-nexus-cyan-bright transition hover:text-white"
          >
            {jp.heroCtaSecondary}
          </Link>
        </div>
      </div>

      {/* Scroll cue */}
      <div className="absolute bottom-8 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-3 md:flex">
        <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/40">
          Scroll
        </span>
        <span className="th-cue block h-10 w-px bg-nexus-cyan-bright/70" />
      </div>
    </section>
  );
}
