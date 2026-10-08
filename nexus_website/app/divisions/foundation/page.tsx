"use client";

import Link from "next/link";
import Image from "next/image";
import {
  ArrowDown,
  ArrowRight,
  Globe,
  HandHeart,
  HeartHandshake,
  Landmark,
  Rocket,
  ScrollText,
  ShieldCheck,
  UsersRound,
} from "lucide-react";
import NewsletterForm from "@/components/foundation/NewsletterForm";
import TiltCard from "@/components/divisions/TiltCard";
import HairlineGrow from "@/components/divisions/tech-hub/HairlineGrow";
import Reveal from "@/components/divisions/tech-hub/Reveal";
import WordReveal from "@/components/divisions/tech-hub/WordReveal";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { usePublicSettings } from "@/components/PublicSettingsProvider";

export default function Foundation() {
  const { t } = useLanguage();
  const { settings: publicSettings, loading: publicSettingsLoading } = usePublicSettings();
  const f = t.foundationPage;

  const drives = [
    { num: f.d1Num, title: f.d1Title, text: f.d1Text, icon: <Globe className="h-6 w-6" /> },
    { num: f.d2Num, title: f.d2Title, text: f.d2Text, icon: <Rocket className="h-6 w-6" /> },
    { num: f.d3Num, title: f.d3Title, text: f.d3Text, icon: <HeartHandshake className="h-6 w-6" /> },
  ];

  const horizons = [
    {
      label: f.horizonNear,
      items: [
        { icon: <Landmark className="h-5 w-5" />, title: f.a3Title, text: f.a3Text },
        { icon: <ScrollText className="h-5 w-5" />, title: f.a1Title, text: f.a1Text },
      ],
    },
    {
      label: f.horizonMid,
      items: [
        { icon: <ShieldCheck className="h-5 w-5" />, title: f.a4Title, text: f.a4Text },
        { icon: <ShieldCheck className="h-5 w-5" />, title: f.a5Title, text: f.a5Text },
      ],
    },
    {
      label: f.horizonLong,
      items: [{ icon: <Rocket className="h-5 w-5" />, title: f.a2Title, text: f.a2Text }],
    },
  ];

  const supportPaths = [
    { icon: <UsersRound className="h-6 w-6" />, title: f.supportVolunteerTitle, text: f.supportVolunteerText, cta: f.supportVolunteerCta, href: "/join-us?division=foundation" },
    { icon: <HandHeart className="h-6 w-6" />, title: f.supportSkillsTitle, text: f.supportSkillsText, cta: f.supportSkillsCta, href: "/contact?department=foundation" },
    { icon: <ArrowDown className="h-6 w-6" />, title: f.supportUpdatesTitle, text: f.supportUpdatesText, cta: f.supportUpdatesCta, href: "#newsletter" },
  ];

  return (
    <div className="bg-nexus-white">
      <section className="relative flex min-h-[92vh] flex-col justify-center overflow-hidden bg-nexus-dark">
        <Image src="/images/foundation/hero-mesh.svg" alt="" fill priority unoptimized className="foundation-mesh object-cover" />
        <div className="grid-overlay opacity-70" />
        <div className="orb foundation-orb-left -left-24 top-20 h-80 w-80 bg-nexus-cyan/20" />
        <div className="orb foundation-orb-right -right-20 bottom-0 h-96 w-96 bg-nexus-navy/80" />
        <div className="absolute inset-0 bg-gradient-to-b from-nexus-dark/10 via-nexus-dark/20 to-nexus-dark/80" />

        <div className="relative mx-auto w-full max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
          <Reveal variant="fade" duration={0.8}>
            <nav className="mb-10 flex items-center gap-2 text-sm text-white/55">
              <Link href="/" className="transition hover:text-nexus-cyan-bright">{t.nav.home}</Link>
              <span className="text-nexus-cyan/40">›</span>
              <Link href="/divisions" className="transition hover:text-nexus-cyan-bright">{t.nav.divisions}</Link>
              <span className="text-nexus-cyan/40">›</span>
              <span className="text-white/85">Foundation</span>
            </nav>
          </Reveal>
          <Reveal variant="up" delay={120}>
            <p className="inline-flex rounded-full border border-nexus-cyan/45 bg-nexus-dark/25 px-4 py-2 font-mono text-xs font-semibold uppercase tracking-[0.28em] text-nexus-cyan-bright backdrop-blur-sm">
              {f.heroEyebrow}
            </p>
          </Reveal>
          <WordReveal text={f.heroTitle} className="mt-7 max-w-5xl font-serif text-5xl font-bold leading-[1.02] text-white sm:text-6xl lg:text-8xl" />
          <Reveal variant="up" delay={420}>
            <p className="mt-8 max-w-3xl text-lg leading-relaxed text-white/75 sm:text-xl">{f.heroSubtitle}</p>
          </Reveal>
          <Reveal variant="up" delay={560}>
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <a href="#support" className="inline-flex items-center gap-2 rounded-full bg-nexus-cyan px-7 py-3.5 text-sm font-bold text-nexus-dark shadow-xl shadow-nexus-cyan/15 transition hover:bg-nexus-cyan-bright">
                {f.heroCtaPrimary}<ArrowRight className="h-4 w-4" />
              </a>
              <Link href="/partner" className="inline-flex items-center gap-2 rounded-full border border-nexus-cyan/55 px-7 py-3.5 text-sm font-semibold text-nexus-cyan-bright transition hover:border-nexus-cyan hover:bg-nexus-cyan/10">
                {f.heroCtaSecondary}<ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </Reveal>
          <Reveal variant="fade" delay={780}>
            <a href="#who-we-are" className="mt-16 inline-flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.2em] text-white/60 transition hover:text-nexus-cyan-bright">
              <span className="foundation-scroll-line" /> Scroll to explore <ArrowDown className="h-4 w-4 foundation-scroll-icon" />
            </a>
          </Reveal>
        </div>
      </section>

      <section id="who-we-are" className="relative overflow-hidden py-24 lg:py-32">
        <div className="absolute -right-32 top-20 h-80 w-80 rounded-full bg-nexus-cyan/5 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal variant="left" className="max-w-3xl">
            <p className="foundation-label">{f.whoEyebrow}</p>
            <h2 className="mt-5 font-serif text-4xl font-bold leading-tight text-nexus-dark sm:text-5xl">{f.whoTitle}</h2>
            <HairlineGrow className="mt-6 h-px w-24" color="bg-nexus-cyan" />
            <p className="mt-7 text-lg leading-relaxed text-nexus-dark/72">{f.whoText1}</p>
            <p className="mt-5 leading-relaxed text-nexus-dark/60">{f.whoText2}</p>
          </Reveal>
          <div className="mt-16 grid gap-6 md:grid-cols-3">
            {[{ word: f.learnLabel, text: f.learnText }, { word: f.buildLabel, text: f.buildText }, { word: f.impactLabel, text: f.impactText }].map((item, index) => (
              <Reveal key={item.word} variant="flat" delay={index * 120}>
                <TiltCard className={`h-full rounded-3xl border p-8 ${index === 2 ? "border-nexus-cyan/60 bg-nexus-dark text-white" : "border-nexus-navy/10 bg-white"}`}>
                  <p className={`font-mono text-xs font-bold tracking-[0.22em] ${index === 2 ? "text-nexus-cyan" : "text-nexus-navy"}`}>0{index + 1}</p>
                  <h3 className={`mt-8 font-serif text-4xl font-bold italic ${index === 2 ? "text-nexus-cyan-bright" : "text-nexus-dark"}`}>{item.word}</h3>
                  <p className={`mt-4 leading-relaxed ${index === 2 ? "text-white/70" : "text-nexus-dark/60"}`}>{item.text}</p>
                </TiltCard>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-nexus-gray py-24 lg:py-32">
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal variant="left" className="max-w-2xl">
            <p className="foundation-label">{f.drivesEyebrow}</p>
            <h2 className="mt-5 font-serif text-4xl font-bold leading-tight text-nexus-dark sm:text-5xl">{f.drivesTitle}</h2>
            <p className="mt-5 text-lg leading-relaxed text-nexus-dark/60">{f.drivesDesc}</p>
          </Reveal>
          <div className="mt-20 space-y-16 lg:space-y-24">
            {drives.map((drive, index) => (
              <Reveal key={drive.num} variant={index % 2 === 0 ? "left" : "right"}>
                <div className={`flex flex-col gap-6 md:items-center md:gap-12 lg:flex-row ${index % 2 ? "lg:flex-row-reverse" : ""}`}>
                  <span className="foundation-number shrink-0">{drive.num}</span>
                  <div className={`flex-1 border-l-2 border-nexus-cyan pl-7 lg:pl-10 ${index % 2 ? "lg:border-l-0 lg:border-r-2 lg:pl-0 lg:pr-10 lg:text-right" : ""}`}>
                    <div className={`flex items-center gap-4 ${index % 2 ? "lg:justify-end" : ""}`}>
                      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-nexus-dark text-nexus-cyan">{drive.icon}</span>
                      <h3 className="font-serif text-3xl font-bold text-nexus-dark">{drive.title}</h3>
                    </div>
                    <p className="mt-5 max-w-xl leading-relaxed text-nexus-dark/65 lg:inline-block">{drive.text}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal variant="up" className="mt-16">
            <a href="#support" className="inline-flex items-center gap-2 text-sm font-bold text-nexus-navy transition hover:gap-3 hover:text-nexus-cyan">{f.heroCtaPrimary}<ArrowRight className="h-4 w-4" /></a>
          </Reveal>
        </div>
      </section>

      <section id="ambitions" className="relative overflow-hidden bg-nexus-dark py-24 lg:py-32">
        <div className="grid-overlay opacity-50" />
        <div className="orb -right-24 top-0 h-80 w-80 bg-nexus-cyan/15" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal variant="left" className="max-w-2xl">
            <p className="foundation-label text-nexus-cyan-bright">{f.ambitionsEyebrow}</p>
            <h2 className="mt-5 font-serif text-4xl font-bold leading-tight text-white sm:text-5xl">{f.ambitionsTitle}</h2>
            <p className="mt-5 text-lg leading-relaxed text-white/65">{f.ambitionsDesc}</p>
          </Reveal>
          <div className="relative mt-16 hidden lg:block"><HairlineGrow className="h-px w-full" color="bg-gradient-to-r from-nexus-cyan/10 via-nexus-cyan to-nexus-cyan/10" /></div>
          <div className="mt-12 grid gap-8 lg:grid-cols-3 lg:gap-6">
            {horizons.map((horizon, index) => (
              <Reveal key={horizon.label} variant="up" delay={index * 150}>
                <div>
                  <div className="mb-7 flex items-center gap-4">
                    <span className="hidden h-8 w-8 items-center justify-center rounded-full border border-nexus-cyan/60 bg-nexus-navy-deep lg:flex"><span className="foundation-node h-2 w-2 rounded-full bg-nexus-cyan" /></span>
                    <span className="font-mono text-xs font-bold uppercase tracking-[0.25em] text-nexus-cyan">{horizon.label}</span>
                  </div>
                  <div className="space-y-4">
                    {horizon.items.map((item) => (
                      <div key={item.title} className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-sm transition hover:border-nexus-cyan/45 hover:bg-white/[0.07]">
                        <div className="flex items-start gap-4"><span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-nexus-cyan/15 text-nexus-cyan">{item.icon}</span><div><h3 className="font-bold leading-snug text-white">{item.title}</h3><p className="mt-2 text-sm leading-relaxed text-white/55">{item.text}</p></div></div>
                      </div>
                    ))}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-nexus-navy py-24 lg:py-28">
        <div className="foundation-rings" />
        <div className="relative mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
          <WordReveal text={f.valueBandText} className="font-serif text-4xl font-bold italic leading-tight text-white sm:text-5xl lg:text-6xl" />
          <HairlineGrow className="mx-auto mt-9 h-px w-28" color="bg-nexus-cyan" />
        </div>
      </section>

      <section id="support" className="relative overflow-hidden py-24 lg:py-32">
        <div className="absolute -left-32 top-1/4 h-80 w-80 rounded-full bg-nexus-cyan/8 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal variant="left" className="max-w-3xl">
            <p className="foundation-label">{f.supportEyebrow}</p>
            <h2 className="mt-5 font-serif text-4xl font-bold leading-tight text-nexus-dark sm:text-5xl">{f.supportTitle}</h2>
            <p className="mt-6 text-lg leading-relaxed text-nexus-dark/70">{f.supportDesc}</p>
            <p className="mt-5 border-l-2 border-nexus-cyan pl-5 text-sm leading-relaxed text-nexus-dark/55">{f.supportTrustNote}</p>
          </Reveal>
          <div className="mt-16 grid gap-6 md:grid-cols-3">
            {supportPaths.map((path, index) => (
              <Reveal key={path.title} variant="flat" delay={index * 120}>
                <TiltCard className="h-full rounded-3xl border border-nexus-navy/10 bg-white p-7">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-nexus-cyan/15 text-nexus-navy">{path.icon}</span>
                  <h3 className="mt-6 font-serif text-2xl font-bold text-nexus-dark">{path.title}</h3>
                  <p className="mt-3 leading-relaxed text-nexus-dark/60">{path.text}</p>
                  <Link href={path.href} className="mt-7 inline-flex items-center gap-2 text-sm font-bold text-nexus-navy transition hover:gap-3 hover:text-nexus-cyan">{path.cta}<ArrowRight className="h-4 w-4" /></Link>
                </TiltCard>
              </Reveal>
            ))}
          </div>
          <Reveal variant="up" delay={300} className="mt-8">
            <div className="relative overflow-hidden rounded-3xl bg-nexus-dark p-8 lg:flex lg:items-center lg:justify-between lg:gap-10 lg:p-10">
              <div className="orb -right-20 -top-24 h-56 w-56 bg-nexus-cyan/20" />
              <div className="relative max-w-2xl"><p className="foundation-label text-nexus-cyan-bright">{f.supportPartnerTitle}</p><p className="mt-3 text-lg leading-relaxed text-white/70">{f.supportPartnerText}</p></div>
              <Link href="/partner" className="relative mt-6 inline-flex shrink-0 items-center gap-2 rounded-full bg-nexus-cyan px-7 py-3.5 text-sm font-bold text-nexus-dark transition hover:bg-nexus-cyan-bright lg:mt-0">{f.supportPartnerCta}<ArrowRight className="h-4 w-4" /></Link>
            </div>
          </Reveal>
        </div>
      </section>

      {!publicSettingsLoading && publicSettings.newsletter && <section id="newsletter" className="relative overflow-hidden bg-nexus-navy-deep py-24 lg:py-28">
        <Image src="/images/foundation/hero-mesh.svg" alt="" fill unoptimized className="object-cover opacity-25" />
        <div className="grid-overlay opacity-40" />
        <Reveal variant="up" className="relative mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <p className="foundation-label text-nexus-cyan-bright">{f.newsEyebrow}</p>
          <h2 className="mt-5 font-serif text-4xl font-bold text-white sm:text-5xl">{f.newsTitle}</h2>
          <p className="mx-auto mt-5 max-w-xl leading-relaxed text-white/65">{f.newsDesc}</p>
          <div className="mt-9 flex justify-center"><NewsletterForm placeholder={f.newsPlaceholder} buttonLabel={f.newsButton} successMessage={f.newsSuccess} invalidMessage={f.newsErrorInvalid} /></div>
        </Reveal>
      </section>}
    </div>
  );
}
