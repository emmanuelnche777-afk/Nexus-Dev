"use client";

import Image from "next/image";
import {
  Target,
  Eye,
  ShieldCheck,
  Compass,
  Users,
  Lightbulb,
  Handshake,
  Ruler,
  GraduationCap,
  Code2,
  Building2,
  Landmark,
  HeartHandshake,
  UserPlus,
} from "lucide-react";
import PageHeader from "@/components/PageHeader";
import SectionHeading from "@/components/SectionHeading";
import CTA from "@/components/CTA";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function About() {
  const { t } = useLanguage();

  const values = [
    {
      icon: <ShieldCheck className="h-6 w-6" />,
      name: t.about.val1Name,
      text: t.about.val1Text,
    },
    {
      icon: <Lightbulb className="h-6 w-6" />,
      name: t.about.val2Name,
      text: t.about.val2Text,
    },
    {
      icon: <Users className="h-6 w-6" />,
      name: t.about.val3Name,
      text: t.about.val3Text,
    },
    {
      icon: <Handshake className="h-6 w-6" />,
      name: t.about.val4Name,
      text: t.about.val4Text,
    },
    {
      icon: <Ruler className="h-6 w-6" />,
      name: t.about.val5Name,
      text: t.about.val5Text,
    },
  ];

  const whatWeDo = [
    {
      icon: <GraduationCap className="h-6 w-6" />,
      title: t.about.wd1Title,
      text: t.about.wd1Text,
    },
    {
      icon: <Code2 className="h-6 w-6" />,
      title: t.about.wd2Title,
      text: t.about.wd2Text,
    },
    {
      icon: <Building2 className="h-6 w-6" />,
      title: t.about.wd3Title,
      text: t.about.wd3Text,
    },
    {
      icon: <Landmark className="h-6 w-6" />,
      title: t.about.wd4Title,
      text: t.about.wd4Text,
    },
    {
      icon: <HeartHandshake className="h-6 w-6" />,
      title: t.about.wd5Title,
      text: t.about.wd5Text,
    },
    {
      icon: <UserPlus className="h-6 w-6" />,
      title: t.about.wd6Title,
      text: t.about.wd6Text,
    },
  ];

  const facts = [
    { label: t.about.fact1Label, value: t.about.fact1Value },
    { label: t.about.fact2Label, value: t.about.fact2Value },
    { label: t.about.fact3Label, value: t.about.fact3Value },
    { label: t.about.fact4Label, value: t.about.fact4Value },
    { label: t.about.fact5Label, value: t.about.fact5Value },
  ];

  const teamRoles = [
    { title: t.about.role1Title, text: t.about.role1Text },
    { title: t.about.role2Title, text: t.about.role2Text },
    { title: t.about.role3Title, text: t.about.role3Text },
    { title: t.about.role4Title, text: t.about.role4Text },
    { title: t.about.role5Title, text: t.about.role5Text },
  ];

  return (
    <div className="bg-nexus-white">
      {/* Section 1: Hero */}
      <PageHeader
        title={t.about.title}
        subtitle={t.about.subtitle}
        description={t.about.description}
        breadcrumb={[
          { label: "Home", href: "/" },
          { label: "About" },
        ]}
      />

      {/* Section 2: Who We Are & How We Started */}
      <section className="py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2">
            <div>
              <SectionHeading
                eyebrow={t.about.storyEyebrow}
                title={t.about.storyTitle}
              />
              <div className="mt-6 space-y-4 text-base leading-relaxed text-nexus-navy/80">
                <p>{t.about.storyP1}</p>
                <p>{t.about.storyP2}</p>
                <p>{t.about.storyP3}</p>
                <p>{t.about.storyP4}</p>
              </div>
            </div>
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
          </div>
        </div>
      </section>

      {/* Section 3: Why We Exist & Where We're Going */}
      <section className="bg-nexus-gray py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow={t.about.purposeEyebrow}
            title={t.about.purposeTitle}
          />
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            <div className="rounded-lg border border-nexus-cyan/20 bg-nexus-white p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-md bg-nexus-navy text-nexus-cyan-bright">
                <Target className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-lg font-bold text-nexus-dark">
                {t.about.missionTitle}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-nexus-navy">
                {t.about.missionText}
              </p>
            </div>
            <div className="rounded-lg border border-nexus-cyan/20 bg-nexus-white p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-md bg-nexus-navy text-nexus-cyan-bright">
                <Eye className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-lg font-bold text-nexus-dark">
                {t.about.visionTitle}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-nexus-navy">
                {t.about.visionText}
              </p>
            </div>
            <div className="rounded-lg border border-nexus-cyan/20 bg-nexus-dark p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-md bg-nexus-cyan/20 text-nexus-cyan-bright">
                <Compass className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-lg font-bold text-nexus-white">
                {t.about.directionTitle}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-nexus-gray/75">
                {t.about.directionText}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 4: Company Identity & Status */}
      <section className="py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow={t.about.identityEyebrow}
            title={t.about.identityTitle}
            description={t.about.identityDesc}
          />
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {facts.map((fact) => (
              <div
                key={fact.label}
                className="group rounded-lg border border-nexus-cyan/20 bg-nexus-gray p-6 transition hover:border-nexus-cyan hover:bg-nexus-white"
              >
                <p className="text-xs font-semibold uppercase tracking-wider text-nexus-cyan">
                  {fact.label}
                </p>
                <p className="mt-2 text-2xl font-bold text-nexus-dark">
                  {fact.value}
                </p>
              </div>
            ))}
            <div className="flex flex-col justify-center rounded-lg border border-nexus-cyan/30 bg-nexus-dark p-6 transition hover:border-nexus-cyan">
              <p className="text-xs font-semibold uppercase tracking-wider text-nexus-cyan">
                {t.about.fact5Label}
              </p>
              <p className="mt-2 text-2xl font-bold text-nexus-cyan-bright">
                {t.about.fact5Value}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 5: What We Do */}
      <section className="bg-nexus-gray py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow={t.about.whatWeDoEyebrow}
            title={t.about.whatWeDoTitle}
            description={t.about.whatWeDoDesc}
          />
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {whatWeDo.map((item) => (
              <div
                key={item.title}
                className="rounded-lg border border-nexus-cyan/20 bg-nexus-white p-6 transition hover:border-nexus-cyan"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-md bg-nexus-navy text-nexus-cyan-bright">
                  {item.icon}
                </div>
                <h3 className="mt-4 text-lg font-bold text-nexus-dark">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-nexus-navy">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 6: Core Values */}
      <section className="py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow={t.about.valuesEyebrow}
            title={t.about.valuesTitle}
            description={t.about.valuesDesc}
          />
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {values.map((v) => (
              <div
                key={v.name}
                className="rounded-lg border border-nexus-cyan/20 bg-nexus-gray p-6"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-md bg-nexus-navy text-nexus-cyan-bright">
                  {v.icon}
                </div>
                <h3 className="mt-4 text-lg font-bold text-nexus-dark">
                  {v.name}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-nexus-navy">
                  {v.text}
                </p>
              </div>
            ))}
            <div className="flex flex-col justify-center rounded-lg border border-nexus-cyan/20 bg-nexus-dark p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-md bg-nexus-cyan/20 text-nexus-cyan-bright">
                <Compass className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-lg font-bold text-nexus-white">
                {t.about.govTitle}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-nexus-gray/75">
                {t.about.govText}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 7: The Team */}
      <section className="bg-nexus-gray py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow={t.about.teamEyebrow}
            title={t.about.teamTitle}
            description={t.about.teamDesc}
          />
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {teamRoles.map((role) => (
              <div
                key={role.title}
                className="rounded-lg border border-nexus-cyan/20 bg-nexus-white p-6"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-md bg-nexus-navy text-nexus-cyan-bright">
                  <Users className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-lg font-bold text-nexus-dark">
                  {role.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-nexus-navy">
                  {role.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 8: CTA */}
        <CTA
        title={t.about.ctaTitle}
        description={t.about.ctaDesc}
        primaryLabel={t.home.seeJourney}
        primaryHref="/journey"
        secondaryLabel={t.home.joinBtn}
        secondaryHref="/join-us?division=general"
      />
    </div>
  );
}
