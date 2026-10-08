"use client";

import { useRef, type PointerEvent, type CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  GraduationCap,
  Wrench,
  HeartHandshake,
  Users,
  Globe2,
  ArrowRight,
  Lightbulb,
  Rocket,
} from "lucide-react";
import SectionHeading from "@/components/SectionHeading";
import CTA from "@/components/CTA";
import Reveal from "@/components/divisions/tech-hub/Reveal";
import CountUp from "@/components/divisions/tech-hub/CountUp";
import TiltCard from "@/components/divisions/tech-hub/TiltCard";
import ScrollProgress from "@/components/divisions/tech-hub/ScrollProgress";
import { DIVISIONS } from "@/lib/site";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import LiveUpdates from "@/components/home/LiveUpdates";

export default function Home() {
  const { t } = useLanguage();
  const heroRef = useRef<HTMLElement>(null);

  const handleHeroMove = (e: PointerEvent<HTMLElement>) => {
    const el = heroRef.current;
    if (!el) return;
    if (
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      !window.matchMedia("(pointer: fine)").matches
    ) {
      return;
    }
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

  const divisionIcons = [
    <GraduationCap key="academy" className="h-6 w-6" />,
    <Wrench key="hub" className="h-6 w-6" />,
    <HeartHandshake key="foundation" className="h-6 w-6" />,
    <Users key="mentorship" className="h-6 w-6" />,
  ];

  const whyPoints = [
    {
      icon: <Globe2 className="h-6 w-6" />,
      title: t.home.whyPoint1Title,
      text: t.home.whyPoint1Text,
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: t.home.whyPoint2Title,
      text: t.home.whyPoint2Text,
    },
    {
      icon: <GraduationCap className="h-6 w-6" />,
      title: t.home.whyPoint3Title,
      text: t.home.whyPoint3Text,
    },
    {
      icon: <Lightbulb className="h-6 w-6" />,
      title: t.home.whyPoint4Title,
      text: t.home.whyPoint4Text,
    },
    {
      icon: <Rocket className="h-6 w-6" />,
      title: t.home.whyPoint5Title,
      text: t.home.whyPoint5Text,
    },
  ];

  const getDivisionData = (name: string, tagline: string) => {
    if (name.includes("Academy")) return { name: t.divisions.academy.name, tagline: t.divisions.academy.tagline };
    if (name.includes("Tech Hub")) return { name: t.divisions.techHub.name, tagline: t.divisions.techHub.tagline };
    if (name.includes("Foundation")) return { name: t.divisions.foundation.name, tagline: t.divisions.foundation.tagline };
    if (name.includes("Mentorship")) return { name: t.divisions.mentorship.name, tagline: t.divisions.mentorship.tagline };
    return { name, tagline };
  };

  return (
    <div className="bg-nexus-white">
      <ScrollProgress />

      {/* Hero */}
      <section
        ref={heroRef}
        onPointerMove={handleHeroMove}
        className="relative overflow-hidden bg-nexus-dark"
        style={
          {
            "--px": "0",
            "--py": "0",
          } as CSSProperties
        }
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
          <video
            className="absolute inset-0 h-full w-full object-cover opacity-40"
            src="/images/tech-hub/hero-video.mp4"
            poster="/images/tech-hub/hero.jpg"
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-nexus-dark/70 via-nexus-dark/85 to-nexus-dark" />
          <div className="grid-overlay" />
        </div>
        <motion.div
          className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-nexus-cyan/10 blur-3xl"
          style={{
            x: "var(--px, 0)",
            y: "var(--py, 0)",
            transform: "translate(calc(var(--px, 0) * 18px), calc(var(--py, 0) * 18px))",
          }}
        />
        <motion.div
          className="absolute -bottom-32 -left-24 h-72 w-72 rounded-full bg-nexus-navy/40 blur-3xl"
          style={{
            x: "var(--px, 0)",
            y: "var(--py, 0)",
            transform: "translate(calc(var(--px, 0) * -12px), calc(var(--py, 0) * -12px))",
          }}
        />
        <div className="relative mx-auto flex max-w-7xl flex-col items-start px-4 py-28 sm:px-6 lg:px-8 lg:py-40">
          <Reveal>
            <p className="mb-4 rounded-full border border-nexus-cyan/40 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-nexus-cyan-bright">
              {t.home.badge}
            </p>
          </Reveal>
          <Reveal delay={100}>
            <h1 className="max-w-3xl text-4xl font-extrabold leading-tight text-nexus-white sm:text-5xl lg:text-6xl">
              {t.home.heroTitle}{" "}
              <span className="text-nexus-cyan-bright">{t.home.heroCountry}</span>.
            </h1>
          </Reveal>
          <Reveal delay={200}>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-nexus-gray/80">
              {t.home.heroSubtitle}
            </p>
          </Reveal>
          <Reveal delay={300}>
            <p className="mt-4 text-sm font-semibold uppercase tracking-[0.25em] text-nexus-cyan">
              Learn · Build · Impact
            </p>
          </Reveal>
          <Reveal delay={400}>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/partner"
                className="rounded-md bg-nexus-cyan px-6 py-3 text-sm font-semibold text-nexus-dark transition hover:bg-nexus-cyan-bright"
              >
                {t.home.partnerBtn}
              </Link>
              <Link
                href="/join-us"
                className="rounded-md border border-nexus-cyan/40 px-6 py-3 text-sm font-semibold text-nexus-cyan-bright transition hover:bg-nexus-navy"
              >
                {t.home.joinBtn}
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Gap / Stats */}
      <section className="relative overflow-hidden border-b border-nexus-navy/10 bg-nexus-gray py-16 lg:py-20">
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-nexus-cyan/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-24 h-72 w-72 rounded-full bg-nexus-navy/10 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow={t.home.gapEyebrow}
            title={t.home.gapTitle}
            description={t.home.gapDesc}
          />
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            <Reveal>
              <div className="rounded-lg border border-nexus-cyan/20 bg-nexus-white p-6">
                <p className="text-4xl font-extrabold text-nexus-cyan">
                  <CountUp end={1} suffix="" />
                </p>
                <h3 className="mt-3 text-lg font-bold text-nexus-dark">
                  {t.home.gapPoint1Title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-nexus-navy/70">
                  {t.home.gapPoint1Text}
                </p>
              </div>
            </Reveal>
            <Reveal delay={120}>
              <div className="rounded-lg border border-nexus-cyan/20 bg-nexus-white p-6">
                <p className="text-4xl font-extrabold text-nexus-cyan">
                  <CountUp end={4} suffix="M+" />
                </p>
                <h3 className="mt-3 text-lg font-bold text-nexus-dark">
                  {t.home.gapPoint2Title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-nexus-navy/70">
                  {t.home.gapPoint2Text}
                </p>
              </div>
            </Reveal>
            <Reveal delay={240}>
              <div className="rounded-lg border border-nexus-cyan/20 bg-nexus-white p-6">
                <p className="text-4xl font-extrabold text-nexus-cyan">
                  <CountUp end={0} suffix="" />
                </p>
                <h3 className="mt-3 text-lg font-bold text-nexus-dark">
                  {t.home.gapPoint3Title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-nexus-navy/70">
                  {t.home.gapPoint3Text}
                </p>
              </div>
            </Reveal>
          </div>
          <Reveal>
            <p className="mx-auto mt-10 max-w-2xl text-center text-base leading-relaxed text-nexus-navy/70">
              {t.home.gapClosing}
            </p>
          </Reveal>
        </div>
      </section>

      {/* Ecosystem / Divisions */}
      <section className="relative overflow-hidden py-16 lg:py-24">
        <div className="pointer-events-none absolute -right-24 top-0 h-72 w-72 rounded-full bg-nexus-cyan/10 blur-3xl" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow={t.home.ecosystemEyebrow}
            title={t.home.ecosystemTitle}
            description={t.home.ecosystemDesc}
          />
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {DIVISIONS.map((d, i) => {
              const info = getDivisionData(d.name, d.tagline);
              return (
                <Reveal key={d.href} delay={i * 80}>
                  <TiltCard className="h-full">
                    <Link
                      href={d.href}
                      className="group flex h-full flex-col rounded-lg border border-nexus-cyan/20 bg-nexus-gray p-6 transition hover:border-nexus-cyan hover:bg-nexus-white"
                    >
                      <div className="flex h-12 w-12 items-center justify-center rounded-md bg-nexus-navy text-nexus-cyan-bright">
                        {divisionIcons[i]}
                      </div>
                      <h3 className="mt-4 text-lg font-bold text-nexus-dark">
                        {info.name}
                      </h3>
                      <p className="mt-2 flex-1 text-sm leading-relaxed text-nexus-navy/70">
                        {info.tagline}
                      </p>
                      <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-nexus-cyan transition group-hover:gap-2">
                        {t.home.learnMore} <ArrowRight className="h-4 w-4" />
                      </span>
                    </Link>
                  </TiltCard>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* Why NEXUS */}
      <section className="relative overflow-hidden bg-nexus-dark py-16 lg:py-24">
        <div className="pointer-events-none absolute -left-24 top-0 h-72 w-72 rounded-full bg-nexus-navy/60 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            dark
            eyebrow={t.home.whyEyebrow}
            title={t.home.whyTitle}
            description={t.home.whyDesc}
          />
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {whyPoints.slice(0, 3).map((point, i) => (
              <Reveal key={point.title} delay={i * 100}>
                <TiltCard className="h-full">
                  <div className="h-full rounded-lg border border-nexus-cyan/20 bg-nexus-navy/40 p-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-md bg-nexus-cyan/20 text-nexus-cyan-bright">
                      {point.icon}
                    </div>
                    <h3 className="mt-4 text-lg font-bold text-nexus-white">
                      {point.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-nexus-gray/75">
                      {point.text}
                    </p>
                  </div>
                </TiltCard>
              </Reveal>
            ))}
          </div>
          <div className="mt-6 grid gap-6 md:grid-cols-2 md:max-w-3xl md:mx-auto">
            {whyPoints.slice(3, 5).map((point, i) => (
              <Reveal key={point.title} delay={i * 100}>
                <TiltCard className="h-full">
                  <div className="h-full rounded-lg border border-nexus-cyan/20 bg-nexus-navy/40 p-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-md bg-nexus-cyan/20 text-nexus-cyan-bright">
                      {point.icon}
                    </div>
                    <h3 className="mt-4 text-lg font-bold text-nexus-white">
                      {point.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-nexus-gray/75">
                      {point.text}
                    </p>
                  </div>
                </TiltCard>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* People / About */}
      <section className="relative overflow-hidden py-16 lg:py-24">
        <div className="pointer-events-none absolute -right-24 bottom-0 h-72 w-72 rounded-full bg-nexus-cyan/10 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <Reveal>
              <div className="relative overflow-hidden rounded-lg border border-nexus-cyan/20">
                <Image
                  src="/images/logo/nexus-front.jpg"
                  alt="NEXUS team"
                  width={1200}
                  height={800}
                  className="h-full w-full object-cover"
                  unoptimized
                />
              </div>
            </Reveal>
            <Reveal delay={120}>
              <div>
                <SectionHeading
                  eyebrow={t.home.peopleEyebrow}
                  title={t.home.peopleTitle}
                  description={t.home.peopleDesc}
                />
                <div className="mt-8 flex flex-wrap gap-3">
                  <Link
                    href="/about"
                    className="rounded-md bg-nexus-navy px-6 py-3 text-sm font-semibold text-nexus-white transition hover:bg-nexus-navy-deep"
                  >
                    {t.home.meetFounders}
                  </Link>
                  <Link
                    href="/journey"
                    className="rounded-md border border-nexus-navy/30 px-6 py-3 text-sm font-semibold text-nexus-navy transition hover:bg-nexus-gray"
                  >
                    {t.home.seeJourney}
                  </Link>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <LiveUpdates />

      <CTA
        title={t.home.ctaTitle}
        description={t.home.ctaDesc}
        primaryLabel={t.home.seeJourney}
        primaryHref="/journey"
        secondaryLabel={t.home.joinBtn}
        secondaryHref="/join-us?division=general"
      />
    </div>
  );
}
