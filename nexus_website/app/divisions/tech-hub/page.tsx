"use client";

import React, { useState, useEffect, PointerEvent, useRef, type CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
  Brain,
  Brush,
  Building,
  Building2,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  Code2,
  Globe,
  Globe2,
  GraduationCap,
  HeartHandshake,
  Landmark,
  MessageSquare,
    Package,
    Palette,
    ShieldCheck,
    Sparkles,
    Server,
    Users,
    Wallet,
    Zap,
} from "lucide-react";
import Reveal from "@/components/divisions/tech-hub/Reveal";
import CountUp from "@/components/divisions/tech-hub/CountUp";
import TiltCard from "@/components/divisions/tech-hub/TiltCard";
import FlipCard from "@/components/divisions/tech-hub/FlipCard";
import TerminalCta from "@/components/divisions/tech-hub/TerminalCta";
import Preloader from "@/components/divisions/tech-hub/Preloader";
import ScrollProgress from "@/components/divisions/tech-hub/ScrollProgress";
import GradientText from "@/components/divisions/tech-hub/GradientText";
import LogoMarquee from "@/components/divisions/tech-hub/LogoMarquee";
import HairlineGrow from "@/components/divisions/tech-hub/HairlineGrow";
import WordReveal from "@/components/divisions/tech-hub/WordReveal";
import ServiceCard from "@/components/divisions/tech-hub/ServiceCard";
import TranslatedText from "@/components/TranslatedText";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { usePublicSettings } from "@/components/PublicSettingsProvider";
import { CONTACT } from "@/lib/site";

interface TechHubServiceResponse {
  iconKey: string;
  slug: string;
  title: string;
  tagline?: string | null;
  description: string;
}

interface TechHubFeaturedWorkResponse {
  enabled: boolean;
  projects: Array<{
    id: string;
    category: string;
    categoryFr?: string | null;
    title: string;
    titleFr?: string | null;
    description: string;
    descriptionFr?: string | null;
    features: string[];
    featuresFr?: string[];
    imageUrl: string;
    linkUrl: string;
    linkType: string;
    linkLabel: string | null;
    linkLabelFr?: string | null;
  }>;
}

const ICON_MAP: Record<string, React.ElementType> = {
  Code2: Code2,
  Palette: Palette,
  Brush: Brush,
  Brain: Brain,
  Globe: Globe,
  Globe2: Globe2,
  MessageSquare: MessageSquare,
  ShieldCheck: ShieldCheck,
  Zap: Zap,
  Users: Users,
  Building: Building,
  Building2: Building2,
  Landmark: Landmark,
  Wallet: Wallet,
  GraduationCap: GraduationCap,
  HeartHandshake: HeartHandshake,
  Package: Package,
  CheckCircle2: CheckCircle2,
  Sparkles: Sparkles,
  Server: Server,
};

export default function TechHub() {
  const { settings: publicSettings, loading: settingsLoading } = usePublicSettings();
  const { t, language } = useLanguage();
  const th = t.techHubPage;
  const heroRef = useRef<HTMLElement>(null);

  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [featuredWork, setFeaturedWork] = useState<TechHubFeaturedWorkResponse>({ enabled: false, projects: [] });
  const hugeWordsRef = useRef<HTMLDivElement>(null);
  const hugeWordsInView = useInView(hugeWordsRef, { once: true, margin: "0px 0px -80px 0px" });

  const techTools = [
    "React",
    "Next.js",
    "TypeScript",
    "Node.js",
    "Python",
    "Flutter",
    "Figma",
    "PostgreSQL",
  ];

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

  const handleOpenAiAssistant = () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("open-nexus-ai"));
    }
  };
  
  const [dbServices, setDbServices] = useState<{
    icon: React.ReactNode;
    href: string;
    title: string;
    text: string;
  }[]>([]);
  const [loadingServices, setLoadingServices] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function loadServices() {
      try {
        const res = await fetch("/api/tech-hub/services?status=active");
        const data = await res.json() as { services?: TechHubServiceResponse[] };
        if (!cancelled && data.services) {
          setDbServices(
            data.services.map((s) => ({
              icon: ICON_MAP[s.iconKey]
                ? React.createElement(ICON_MAP[s.iconKey], { className: "h-5 w-5" })
                : React.createElement(Package, { className: "h-5 w-5" }),
              href: `/services/${s.slug}`,
              title: s.title,
              text: s.tagline || s.description,
            }))
          );
        }
      } catch (err) {
        console.error("Failed to load tech hub services:", err);
      } finally {
        if (!cancelled) setLoadingServices(false);
      }
    }
    loadServices();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/tech-hub/featured-work", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) throw new Error("Failed to load Featured Work");
        return response.json() as Promise<TechHubFeaturedWorkResponse>;
      })
      .then((data) => {
        if (!cancelled) {
          setFeaturedWork({
            enabled: data.enabled === true,
            projects: Array.isArray(data.projects) ? data.projects : [],
          });
          setCurrentSlide(0);
        }
      })
      .catch((error) => console.error("Failed to load Tech Hub Featured Work:", error));
    return () => { cancelled = true; };
  }, []);



  const services = dbServices.length > 0 ? dbServices : [
    { icon: <Code2 className="h-5 w-5" />, href: "/services/web-and-mobile-apps", title: th.s1Title, text: th.s1Text },
    { icon: <Palette className="h-5 w-5" />, href: "/services/cloud-and-infrastructure", title: th.s2Title, text: th.s2Text },
    { icon: <Brush className="h-5 w-5" />, href: "/services/digital-security-audits", title: th.s3Title, text: th.s3Text },
    { icon: <Brain className="h-5 w-5" />, href: "/services/technical-consulting", title: th.s4Title, text: th.s4Text },
  ];

  const approach = [
    {
      icon: <Globe2 className="h-5 w-5" />,
      title: th.a1Title,
      text: th.a1Text,
    },
    {
      icon: <GraduationCap className="h-5 w-5" />,
      title: th.a3Title,
      text: th.a3Text,
    },
    {
      icon: <HeartHandshake className="h-5 w-5" />,
      title: th.a2Title,
      text: th.a2Text,
    },
  ];

  const clients = [
    {
      id: "smes",
      icon: <Building2 className="h-5 w-5" />,
      label: th.targetSmes,
      sub: th.clientSmesSub,
      desc: th.clientSmesDesc,
      backTitle: th.clientSmesBackTitle,
      backDesc: th.clientSmesBack,
      image: "/images/tech-hub/smes.svg",
      bgColor: "bg-nexus-navy-deep",
    },
    {
      id: "ngos",
      icon: <Landmark className="h-5 w-5" />,
      label: th.targetNgos,
      sub: th.clientNgosSub,
      desc: th.clientNgosDesc,
      backTitle: th.clientNgosBackTitle,
      backDesc: th.clientNgosBack,
      image: "/images/tech-hub/ngos.svg",
      bgColor: "bg-nexus-navy",
    },
    {
      id: "fintechs",
      icon: <Wallet className="h-5 w-5" />,
      label: th.targetFintechs,
      sub: th.clientFintechsSub,
      desc: th.clientFintechsDesc,
      backTitle: th.clientFintechsBackTitle,
      backDesc: th.clientFintechsBack,
      image: "/images/tech-hub/fintechs.svg",
      bgColor: "bg-gradient-to-br from-nexus-dark to-nexus-navy-deep",
    },
    {
      id: "enterprise",
      icon: <Building className="h-5 w-5" />,
      label: th.targetEnterprise,
      sub: th.clientEnterpriseSub,
      desc: th.clientEnterpriseDesc,
      backTitle: th.clientEnterpriseBackTitle,
      backDesc: th.clientEnterpriseBack,
      image: "/images/tech-hub/enterprise.svg",
      bgColor: "bg-nexus-dark",
    },
  ];

  const stats = [
    { end: 40, suffix: "+", label: th.stat1Label, text: th.stat1Text },
    { end: 95, suffix: "%", label: th.stat2Label, text: th.stat2Text },
    { end: 6, suffix: "", label: th.stat3Label, text: th.stat3Text },
  ];

  const introPoints = [
    { title: th.introPoint1Title, text: th.introPoint1Text },
    { title: th.introPoint2Title, text: th.introPoint2Text },
    { title: th.introPoint3Title, text: th.introPoint3Text },
  ];

  const processSteps = [
    {
      title: th.process1Title,
      description: th.process1Desc,
      deliverables: [th.process1Del1, th.process1Del2, th.process1Del3],
    },
    {
      title: th.process2Title,
      description: th.process2Desc,
      deliverables: [th.process2Del1, th.process2Del2, th.process2Del3],
    },
    {
      title: th.process3Title,
      description: th.process3Desc,
      deliverables: [th.process3Del1, th.process3Del2, th.process3Del3],
    },
    {
      title: th.process4Title,
      description: th.process4Desc,
      deliverables: [th.process4Del1, th.process4Del2, th.process4Del3],
    },
    {
      title: th.process5Title,
      description: th.process5Desc,
      deliverables: [th.process5Del1, th.process5Del2, th.process5Del3],
    },
    {
      title: th.process6Title,
      description: th.process6Desc,
      deliverables: [th.process6Del1, th.process6Del2, th.process6Del3],
    },
  ];

  const engagementModels = [
    {
      icon: <Package className="h-6 w-6" />,
      title: th.engagement1Title,
      description: th.engagement1Desc,
      bestFor: [th.engagement1Best1, th.engagement1Best2, th.engagement1Best3],
      pricingNote: th.engagement1Pricing,
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: th.engagement2Title,
      description: th.engagement2Desc,
      bestFor: [th.engagement2Best1, th.engagement2Best2, th.engagement2Best3],
      pricingNote: th.engagement2Pricing,
    },
    {
      icon: <Clock className="h-6 w-6" />,
      title: th.engagement3Title,
      description: th.engagement3Desc,
      bestFor: [th.engagement3Best1, th.engagement3Best2, th.engagement3Best3],
      pricingNote: th.engagement3Pricing,
    },
  ];

  const techHubFaqs = [
    { question: th.faq1Q, answer: th.faq1A },
    { question: th.faq2Q, answer: th.faq2A },
    { question: th.faq3Q, answer: th.faq3A },
    { question: th.faq4Q, answer: th.faq4A },
    { question: th.faq5Q, answer: th.faq5A },
    { question: th.faq6Q, answer: th.faq6A },
    { question: th.faq7Q, answer: th.faq7A },
    { question: th.faq8Q, answer: th.faq8A },
  ];

  useEffect(() => {
    if (featuredWork.projects.length < 2) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % featuredWork.projects.length);
    }, 7000);

    return () => clearInterval(interval);
  }, [featuredWork.projects.length]);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % featuredWork.projects.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + featuredWork.projects.length) % featuredWork.projects.length);

  const heroWords = th.title.split(" ");

  return (
    <div className="bg-nexus-dark">
      <Preloader />
      <ScrollProgress />

      {/* S0 — HERO */}
      <section
        ref={heroRef}
        onPointerMove={handleHeroMove}
        className="relative flex min-h-screen flex-col justify-center overflow-hidden bg-nexus-dark py-24 lg:py-32"
      >
        <div className="th-layer" style={{ "--depth": "6" } as CSSProperties}>
          <Image
            src="/images/tech-hub/hero.jpg"
            alt=""
            fill
            priority
            unoptimized
            className="object-cover opacity-40"
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
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-nexus-dark/40 via-nexus-dark/60 to-nexus-dark" />
        <div className="th-layer" style={{ "--depth": "14" } as CSSProperties}>
          <div className="grid-overlay" />
        </div>

        <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <nav
            aria-label="Breadcrumb"
            className="th-enter font-mono text-xs tracking-widest text-nexus-gray/50"
            style={{ animationDelay: "0.05s" }}
          >
            <Link href="/" className="transition hover:text-nexus-cyan-bright">
              Home
            </Link>
            <span className="mx-2 text-nexus-cyan/50">/</span>
            <Link
              href="/divisions"
              className="transition hover:text-nexus-cyan-bright"
            >
              Divisions
            </Link>
            <span className="mx-2 text-nexus-cyan/50">/</span>
            <span className="text-nexus-cyan-bright">Tech Hub</span>
          </nav>

          <h1 className="mt-8 max-w-4xl text-4xl font-extrabold leading-[1.08] text-white sm:text-5xl lg:text-7xl">
            {heroWords.map((word, i) => (
              <span key={i} className="th-mask mr-[0.26em] last:mr-0">
                <span style={{ animationDelay: `${0.25 + i * 0.06}s` }}>
                  {word}
                </span>
              </span>
            ))}
          </h1>

          <p
            className="th-enter mt-7 max-w-2xl text-lg leading-relaxed text-nexus-gray/75"
            style={{ animationDelay: "0.85s" }}
          >
            {th.description}
          </p>

          <div
            className="th-enter mt-9 flex flex-wrap items-center gap-4"
            style={{ animationDelay: "1s" }}
          >
            <Link
              href="/contact?department=tech_hub"
              className="inline-flex items-center gap-2 rounded-md bg-nexus-cyan px-6 py-3 text-sm font-semibold text-nexus-dark transition hover:bg-nexus-cyan-bright"
            >
              {th.ctaPrimaryBtn} <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/partner"
              className="underline-link px-1 py-1 font-mono text-xs uppercase tracking-[0.2em] text-nexus-cyan-bright transition hover:text-white"
            >
              {t.home.partnerBtn}
            </Link>
          </div>
        </div>

        <div className="absolute bottom-6 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-3 md:flex">
          <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/40">
            {th.scrollCue}
          </span>
          <span className="th-cue block h-10 w-px bg-nexus-cyan-bright/70" />
        </div>
      </section>

      {/* S1 — KEY FIGURES (Compact Floating Bar) */}
      <div className="relative z-20 mx-auto -mt-12 max-w-5xl px-4 sm:px-6">
        <div className="rounded-2xl border border-nexus-cyan/30 bg-nexus-navy-deep/90 p-6 shadow-2xl backdrop-blur-md lg:p-8">
          <div className="grid gap-6 md:grid-cols-3 md:gap-0">
            {stats.map((s, i) => (
              <div
                key={s.label}
                className={`relative flex flex-col justify-center ${
                  i === 0 ? "md:pr-6" : "md:px-6"
                }`}
              >
                {i > 0 && (
                  <div className="absolute left-0 top-1/2 hidden -translate-y-1/2 md:block">
                    <div className="h-14 w-px bg-gradient-to-b from-transparent via-nexus-cyan/40 to-transparent" />
                  </div>
                )}
                <div className="flex items-baseline gap-2">
                  <CountUp
                    end={s.end}
                    suffix={s.suffix}
                    className="font-mono text-3xl font-bold text-nexus-cyan-bright lg:text-4xl"
                  />
                  <h3 className="font-semibold text-white text-sm">{s.label}</h3>
                </div>
                <p className="mt-1 text-xs leading-relaxed text-nexus-gray/65 line-clamp-2">
                  {s.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* S0.5 — INTRO & OPERATIONAL INFO */}
      <section className="bg-nexus-gray py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
            <div>
              <Reveal variant="left">
                <p className="font-mono text-xs uppercase tracking-[0.3em] text-nexus-cyan">
                  {th.introEyebrow}
                </p>
                <h2 className="mt-4 text-3xl font-extrabold leading-tight text-nexus-dark sm:text-4xl">
                  {th.introTitle}
                </h2>
                <p className="mt-5 leading-relaxed text-nexus-navy">
                  {th.introDesc}
                </p>
              </Reveal>

              <div className="mt-8 space-y-4">
                {introPoints.map((point, i) => (
                  <Reveal key={point.title} variant="up" delay={i * 100}>
                    <div className="flex items-start gap-3">
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-nexus-cyan/10 mt-0.5">
                        <CheckCircle2 className="h-4 w-4 text-nexus-cyan" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-nexus-dark">{point.title}</h3>
                        <p className="text-sm text-nexus-navy">{point.text}</p>
                      </div>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              <Reveal variant="right" delay={100}>
                <div className="rounded-xl border border-nexus-cyan/15 bg-white p-6 shadow-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-nexus-cyan/10">
                      <Clock className="h-5 w-5 text-nexus-cyan-bright" />
                    </div>
                    <h3 className="font-bold text-nexus-dark">{th.introHoursTitle}</h3>
                  </div>
                  <p className="text-sm text-nexus-navy mb-2">{th.introHoursText}</p>
                  <p className="font-mono text-xs font-semibold text-nexus-cyan">{th.introHoursTime}</p>
                </div>
              </Reveal>

              <Reveal variant="right" delay={150}>
                <div className="rounded-xl border border-nexus-cyan/15 bg-white p-6 shadow-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-nexus-cyan/10">
                      <Zap className="h-5 w-5 text-nexus-cyan-bright" />
                    </div>
                    <h3 className="font-bold text-nexus-dark">{th.introResponseTitle}</h3>
                  </div>
                  <p className="text-sm text-nexus-navy mb-2">{th.introResponseText}</p>
                  <p className="font-mono text-xs font-semibold text-nexus-cyan">{th.introResponseTime}</p>
                </div>
              </Reveal>

              <Reveal variant="right" delay={200} className="sm:col-span-2 lg:col-span-1">
                <div className="rounded-xl border border-nexus-cyan/15 bg-white p-6 shadow-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-nexus-cyan/10">
                      <Globe className="h-5 w-5 text-nexus-cyan-bright" />
                    </div>
                    <h3 className="font-bold text-nexus-dark">{th.introRemoteTitle}</h3>
                  </div>
                  <p className="text-sm leading-relaxed text-nexus-navy">{th.introRemoteText}</p>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* S1.7 — HUGE WORDS (scroll-scrubbed gradient sweep, N! style) */}
      <section ref={hugeWordsRef} className="relative overflow-hidden bg-nexus-dark py-20 lg:py-32">
        <div className="th-layer" style={{ "--depth": "4" } as CSSProperties}>
          <div className="grid-overlay opacity-30" />
        </div>
        <div className="relative z-10 mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={hugeWordsInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6, ease: [0.65, 0.05, 0.36, 1] }}
            className="font-mono text-xs uppercase tracking-[0.3em] text-nexus-cyan"
          >
            {th.hugeEyebrow}
          </motion.p>
          <div className="mt-10 space-y-1 font-extrabold leading-[0.95] tracking-tight sm:space-y-2">
            {[th.hugeWord1, th.hugeWord2, th.hugeWord3].map((word, i) => (
              <div key={word} className="overflow-hidden">
                <motion.div
                  initial={{ y: "115%" }}
                  animate={hugeWordsInView ? { y: "0%" } : { y: "115%" }}
                  transition={{
                    duration: 0.85,
                    delay: hugeWordsInView ? 0.15 + i * 0.14 : 0,
                    ease: [0.65, 0.05, 0.36, 1],
                  }}
                >
                  <GradientText className="text-[10.5vw] leading-none md:text-[9.5vw] lg:text-[7.5vw]">
                    {word}
                  </GradientText>
                </motion.div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* S2 — SERVICES INDEX ROWS (Dark with restored background image) */}
      <section className="relative overflow-hidden bg-nexus-dark">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <div className="grid items-end gap-6 lg:grid-cols-12">
            <Reveal variant="left" className="lg:col-span-7">
              <p className="font-mono text-xs uppercase tracking-[0.3em] text-nexus-cyan">
                {th.servicesEyebrow}
              </p>
              <h2 className="mt-4 text-3xl font-extrabold leading-tight text-white sm:text-4xl lg:text-5xl">
                {th.servicesTitle}
              </h2>
            </Reveal>
            <Reveal variant="right" delay={120} className="lg:col-span-5">
              <p className="leading-relaxed text-nexus-gray/70 lg:pb-1">
                {th.servicesDesc}
              </p>
            </Reveal>
          </div>

          <div className="mt-14 border-t border-nexus-cyan/15">
            {loadingServices ? (
              <div className="space-y-4 py-4">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="th-row group relative grid grid-cols-[auto_1fr_auto] items-center gap-x-5 gap-y-3 border-b border-nexus-cyan/15 px-2 py-7 sm:grid-cols-[auto_minmax(0,16rem)_1fr_auto] sm:gap-x-8 sm:px-4 sm:py-9"
                  >
                    <span className="font-mono text-sm text-nexus-cyan/70">{String(i).padStart(2, "0")}</span>
                    <div className="h-5 w-1/2 rounded bg-nexus-cyan/10" />
                    <div className="h-8 w-8 rounded-lg bg-nexus-cyan/10" />
                  </div>
                ))}
              </div>
            ) : (
              <>
                {services.map((s, i) => (
              <Reveal key={s.title} variant="up" delay={i * 90}>
                <Link
                  href={s.href}
                  aria-label={`${th.orderCta}: ${s.title}`}
                  className="th-row group relative grid grid-cols-[auto_1fr_auto] items-center gap-x-5 gap-y-3 border-b border-nexus-cyan/15 px-2 py-7 sm:grid-cols-[auto_minmax(0,16rem)_1fr_auto] sm:gap-x-8 sm:px-4 sm:py-9"
                >
                  {/* Restored Background Image on row 2 */}
                  {i === 1 && (
                    <span className="pointer-events-none absolute inset-0 -z-20 opacity-[0.14]">
                      <Image
                        src="/images/tech-hub/infra.jpg"
                        alt=""
                        fill
                        sizes="100vw"
                        unoptimized
                        className="object-cover"
                      />
                    </span>
                  )}

                  <span className="font-mono text-sm text-nexus-cyan/70 transition group-hover:text-nexus-cyan-bright">
                    {String(i + 1).padStart(2, "0")}
                  </span>

                  <h3 className="th-row-title text-lg font-bold leading-snug text-white sm:text-xl">
                    {dbServices.length > 0 ? <TranslatedText>{s.title}</TranslatedText> : s.title}
                  </h3>

                  <p className="col-span-full max-w-xl text-sm leading-relaxed text-nexus-gray/65 sm:col-span-1">
                    {dbServices.length > 0 ? <TranslatedText as="span">{s.text}</TranslatedText> : s.text}
                  </p>

                  <span className="col-start-3 row-start-1 flex items-center gap-4 sm:col-start-4">
                    <TiltCard
                      max={8}
                      className="rounded-md border border-nexus-cyan/20 bg-nexus-navy-deep/60 p-3 text-nexus-cyan-bright"
                    >
                      <span className="th-row-icon block">{s.icon}</span>
                    </TiltCard>
                    <span className="th-row-arrow hidden items-center gap-2 whitespace-nowrap font-mono text-xs uppercase tracking-widest text-nexus-cyan-bright md:inline-flex">
                      {th.orderCta} <ArrowUpRight className="h-4 w-4" />
                    </span>
                  </span>
                </Link>
              </Reveal>
            ))}
              </>
            )}
          </div>
        </div>
      </section>

      {/* S2.2 — TECH STACK MARQUEE */}
      <section className="border-y border-nexus-cyan/10 bg-nexus-navy-deep py-10 lg:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-center font-mono text-[11px] uppercase tracking-[0.3em] text-nexus-gray/50">
            {th.marqueeEyebrow}
          </p>
        </div>
        <div
          className="mt-8 [mask-image:linear-gradient(90deg,transparent,black_12%,black_88%,transparent)]"
          aria-hidden
        >
          <LogoMarquee speed={30}>
            {techTools.map((tool) => (
              <span
                key={tool}
                className="inline-flex items-center gap-3 rounded-md border border-nexus-cyan/20 bg-nexus-dark px-5 py-3 font-mono text-sm text-nexus-gray/85 transition hover:border-nexus-cyan hover:text-white"
              >
                <span className="h-1.5 w-1.5 rounded-sm bg-nexus-cyan-bright" />
                {tool}
              </span>
            ))}
          </LogoMarquee>
        </div>
      </section>

      {/* S2.5 — OUR PROCESS */}
      <section className="relative overflow-hidden bg-white py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal variant="up">
            <p className="text-center font-mono text-xs uppercase tracking-[0.3em] text-nexus-cyan">
              {th.processEyebrow}
            </p>
            <h2 className="mx-auto mt-4 max-w-3xl text-center text-3xl font-extrabold leading-tight text-nexus-dark sm:text-4xl lg:text-5xl">
              {th.processTitle}
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-center text-nexus-navy">
              {th.processDesc}
            </p>
          </Reveal>

          <HairlineGrow className="mx-auto mt-12 h-px w-40" delay={150} />

          <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {processSteps.map((step, i) => (
              <Reveal key={step.title} variant="up" delay={i * 90}>
                <div className="relative flex h-full flex-col rounded-xl border border-nexus-cyan/15 bg-nexus-gray p-6">
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-nexus-cyan text-nexus-dark font-bold text-lg">
                    {i + 1}
                  </div>

                  <h3 className="text-xl font-bold text-nexus-dark mb-3">
                    {step.title}
                  </h3>

                  <p className="text-sm text-nexus-navy mb-6 leading-relaxed flex-grow">
                    {step.description}
                  </p>

                  <div className="border-t border-nexus-cyan/10 pt-4 mt-auto">
                    <p className="mb-2 text-xs font-mono uppercase tracking-wider text-nexus-cyan font-semibold">
                      Deliverables
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {step.deliverables.map((deliverable) => (
                        <span key={deliverable} className="inline-flex items-center gap-1 rounded-md bg-white border border-nexus-cyan/20 px-2 py-1 text-xs text-nexus-dark">
                          <CheckCircle2 className="h-3 w-3 text-nexus-cyan" />
                          {deliverable}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* S2.7 — WHY CHOOSE NEXUS (N! Service Card Pattern) */}
      <section className="border-y border-nexus-cyan/10 bg-nexus-navy-deep py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal variant="up">
            <p className="text-center font-mono text-xs uppercase tracking-[0.3em] text-nexus-cyan">
              {th.whyEyebrow}
            </p>
            <WordReveal
              text={th.whyTitle}
              className="mx-auto mt-4 max-w-3xl text-center text-3xl font-extrabold leading-tight text-white sm:text-4xl lg:text-5xl"
            />
            <p className="mx-auto mt-4 max-w-2xl text-center text-nexus-gray/70">
              {th.whyDesc}
            </p>
          </Reveal>

          <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <ServiceCard
              title={th.why1Title}
              description={th.why1Desc}
              image="/images/tech-hub/why-1.jpg"
              imageAlt={th.why1Alt}
              bgColor="bg-nexus-dark"
              href="/academy/programs"
              ctaLabel={th.whyCta}
              delay={0}
            />
            <ServiceCard
              title={th.why2Title}
              description={th.why2Desc}
              image="/images/tech-hub/why-2.jpg"
              imageAlt={th.why2Alt}
              bgColor="bg-nexus-dark"
              href="/divisions/foundation"
              ctaLabel={th.whyCta}
              delay={90}
            />
            <ServiceCard
              title={th.why3Title}
              description={th.why3Desc}
              image="/images/tech-hub/why-3.jpg"
              imageAlt={th.why3Alt}
              bgColor="bg-gradient-to-br from-nexus-navy to-nexus-dark"
              href="/contact?department=tech_hub"
              ctaLabel={th.whyCta}
              delay={180}
            />
            <ServiceCard
              title={th.why4Title}
              description={th.why4Desc}
              image="/images/tech-hub/why-4.jpg"
              imageAlt={th.why4Alt}
              bgColor="bg-nexus-dark"
              href="/about"
              ctaLabel={th.whyCta}
              delay={270}
            />
            <ServiceCard
              title={th.why5Title}
              description={th.why5Desc}
              image="/images/tech-hub/why-5.jpg"
              imageAlt={th.why5Alt}
              bgColor="bg-nexus-dark"
              href="/journey"
              ctaLabel={th.whyCta}
              delay={360}
            />
            {(settingsLoading || publicSettings.blog) && <ServiceCard
              title={th.why6Title}
              description={th.why6Desc}
              image="/images/tech-hub/why-6.jpg"
              imageAlt={th.why6Alt}
              bgColor="bg-gradient-to-br from-nexus-navy to-nexus-dark"
              href="/blog"
              ctaLabel={th.whyCta}
              delay={450}
            />}
          </div>
        </div>
      </section>

      {/* S3 — APPROACH */}
      <section className="border-b border-nexus-cyan/10 bg-nexus-gray py-20 lg:py-28">
        <div className="mx-auto grid max-w-7xl gap-14 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div className="self-start lg:sticky lg:top-28">
            <Reveal variant="left">
              <p className="font-mono text-xs uppercase tracking-[0.3em] text-nexus-cyan">
                {th.approachEyebrow}
              </p>
              <h2 className="mt-4 text-3xl font-extrabold leading-tight text-nexus-dark sm:text-4xl lg:text-5xl">
                {th.approachTitle}
              </h2>
              <p className="mt-5 max-w-md leading-relaxed text-nexus-navy">
                {th.approachDesc}
              </p>
            </Reveal>
            <Reveal variant="up" delay={180}>
              <div className="mt-9 flex flex-wrap gap-3">
                {publicSettings.certificateVerification && <Link
                  href="/academy/verify"
                  className="inline-flex items-center gap-2 rounded-md border border-nexus-cyan/40 px-6 py-3 text-sm font-semibold text-nexus-cyan transition hover:bg-white"
                >
                  <ShieldCheck className="h-4 w-4" />
                  {t.footer.verifyRegistration}
                </Link>}
                <Link
                  href="/partner"
                  className="rounded-md bg-nexus-cyan px-6 py-3 text-sm font-semibold text-nexus-dark transition hover:bg-nexus-cyan-bright"
                >
                  {t.home.partnerBtn}
                </Link>
              </div>
            </Reveal>
          </div>

          <div className="space-y-6">
            {approach.map((a, i) => (
              <Reveal key={a.title} variant="flat" delay={i * 140}>
                <div className="rounded-xl border border-nexus-cyan/15 bg-white p-7 shadow-sm sm:p-8">
                  <div className="flex h-11 w-11 items-center justify-center rounded-md bg-nexus-cyan/10 text-nexus-cyan-bright">
                    {a.icon}
                  </div>
                  <h3 className="mt-4 text-lg font-bold text-nexus-dark">
                    {a.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-nexus-navy">
                    {a.text}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* S4 — TARGET CLIENTS (Multi-colored cards) */}
      <section className="relative overflow-hidden bg-white py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal variant="up">
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-nexus-cyan">
              {th.clientsEyebrow}
            </p>
            <h2 className="mt-4 max-w-3xl text-3xl font-extrabold leading-tight text-nexus-dark sm:text-4xl lg:text-5xl">
              {th.clientsTitle}
            </h2>
            <p className="mt-4 text-nexus-navy">{th.clientsDesc}</p>
          </Reveal>

          <Reveal variant="up" delay={140}>
            <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {clients.map((c, i) => (
                <FlipCard
                  key={c.id}
                  className="h-[420px] w-full"
                  front={
                    <div className={`group relative flex h-full flex-col justify-between overflow-hidden rounded-xl border border-nexus-cyan/30 ${c.bgColor} p-6 shadow-lg transition duration-300 hover:border-nexus-cyan/60`}>
                      {/* Full-card cover background image */}
                      <Image
                        src={c.image}
                        alt={c.label}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        className="object-cover opacity-50 transition duration-500 group-hover:scale-105 group-hover:opacity-60"
                        unoptimized
                      />
                      {/* Gradient overlay for high legibility */}
                      <div className="absolute inset-0 bg-gradient-to-t from-nexus-dark via-nexus-dark/75 to-nexus-dark/30" />

                      <div className="relative z-10">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-nexus-cyan/40 bg-nexus-navy/90 text-nexus-cyan-bright shadow-md backdrop-blur-md">
                          {c.icon}
                        </div>

                        <div className="mt-5">
                          <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-nexus-cyan-bright">
                            {c.sub}
                          </span>
                          <h3 className="mt-1.5 text-xl font-extrabold text-white">
                            {c.label}
                          </h3>
                          <p className="mt-2.5 line-clamp-4 text-xs leading-relaxed text-nexus-gray/85">
                            {c.desc}
                          </p>
                        </div>
                      </div>

                      <div className="relative z-10 mt-4 flex items-center justify-between border-t border-nexus-cyan/20 pt-3">
                        <span className="font-mono text-xs font-semibold text-nexus-cyan/80">
                          {String(i + 1).padStart(2, "0")} / 04
                        </span>
                        <span className="inline-flex items-center gap-1.5 font-mono text-xs text-nexus-cyan-bright">
                          <span>Tap to flip</span>
                          <span className="animate-pulse">↻</span>
                        </span>
                      </div>
                    </div>
                  }
                  back={
                    <div className="flex h-full flex-col justify-between overflow-hidden rounded-xl border border-nexus-cyan/50 bg-nexus-navy p-6 shadow-xl">
                      <div>
                        <div className="flex items-center gap-2 border-b border-nexus-cyan/20 pb-3">
                          <span className="text-nexus-cyan-bright">{c.icon}</span>
                          <h4 className="text-sm font-bold text-white">{c.backTitle}</h4>
                        </div>
                        <p className="mt-4 text-[11px] leading-relaxed text-nexus-gray/90">
                          {c.backDesc}
                        </p>
                      </div>

                      <div className="mt-4 border-t border-nexus-cyan/15 pt-3">
                        <Link
                          href="/contact?department=tech_hub"
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-nexus-cyan/40 bg-nexus-cyan/15 px-3 py-2 text-xs font-semibold text-nexus-cyan-bright transition hover:bg-nexus-cyan/25"
                        >
                          {th.clientsCta} <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                      </div>
                    </div>
                  }
                />
              ))}
            </div>
          </Reveal>

          <Reveal variant="up" delay={200}>
            <div className="mt-10 text-center">
              <Link
                href="/contact?department=tech_hub"
                className="inline-flex items-center gap-2 rounded-md border border-nexus-cyan/40 px-6 py-3 text-sm font-semibold text-nexus-cyan transition hover:bg-nexus-gray"
              >
                {th.clientsCta} <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* S4.5 — FEATURED PROJECTS SLIDESHOW (Deep Dark Navy) */}
      {featuredWork.enabled && featuredWork.projects.length > 0 && <>
      <section className="border-y border-nexus-cyan/10 bg-nexus-dark py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal variant="up">
            <p className="text-center font-mono text-xs uppercase tracking-[0.3em] text-nexus-cyan">
              {th.projectsEyebrow}
            </p>
            <h2 className="mx-auto mt-4 max-w-3xl text-center text-3xl font-extrabold leading-tight text-white sm:text-4xl lg:text-5xl">
              {th.projectsTitle}
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-center text-nexus-gray/70">
              {th.projectsDesc}
            </p>
          </Reveal>

          <HairlineGrow className="mx-auto mt-12 h-px w-40" delay={150} />

          <div className="relative mt-16">
            <div className="overflow-hidden rounded-2xl border border-nexus-cyan/30 bg-nexus-navy-deep shadow-2xl">
              <div
                className="flex transition-transform duration-700 ease-in-out"
                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
              >
                {featuredWork.projects.map((project) => {
                  const hasFrenchTitle = language === "fr" && Boolean(project.titleFr);
                  const hasFrenchCategory = language === "fr" && Boolean(project.categoryFr);
                  const hasFrenchDescription = language === "fr" && Boolean(project.descriptionFr);
                  const hasFrenchFeatures = language === "fr" && Boolean(project.featuresFr?.length);
                  const hasFrenchLinkLabel = language === "fr" && Boolean(project.linkLabelFr);
                  const title = hasFrenchTitle ? project.titleFr! : project.title;
                  const category = hasFrenchCategory ? project.categoryFr! : project.category;
                  const description = hasFrenchDescription ? project.descriptionFr! : project.description;
                  const features = hasFrenchFeatures ? project.featuresFr! : project.features;
                  const linkLabel = hasFrenchLinkLabel ? project.linkLabelFr : project.linkLabel;
                  return (
                  <div key={project.id} className="min-w-full">
                    <div className="grid gap-8 p-8 lg:grid-cols-2 lg:gap-12 lg:p-12">
                      <div className="flex flex-col justify-center">
                        <div className="inline-flex items-center gap-2 rounded-full border border-nexus-cyan/30 bg-nexus-cyan/10 px-3 py-1 text-xs font-mono uppercase tracking-wider text-nexus-cyan-bright w-fit">
                          <Sparkles className="h-3.5 w-3.5" />
                          {hasFrenchCategory ? category : <TranslatedText>{category}</TranslatedText>}
                        </div>

                        <h3 className="mt-4 text-3xl font-extrabold text-white lg:text-4xl">
                          {hasFrenchTitle ? title : <TranslatedText>{title}</TranslatedText>}
                        </h3>

                        <p className="mt-4 text-sm leading-relaxed text-nexus-gray/80">
                          {hasFrenchDescription ? description : <TranslatedText as="span">{description}</TranslatedText>}
                        </p>

                        <div className="mt-6 grid grid-cols-2 gap-3">
                          {features.map((feature) => (
                            <div key={feature} className="flex items-center gap-2">
                              <CheckCircle2 className="h-4 w-4 shrink-0 text-nexus-cyan-bright" />
                              <span className="text-xs font-medium text-white">{hasFrenchFeatures ? feature : <TranslatedText>{feature}</TranslatedText>}</span>
                            </div>
                          ))}
                        </div>
                        <a
                          href={project.linkUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`${linkLabel || (language === "fr" ? "Voir le projet" : "View project")}: ${title}`}
                          className="mt-8 inline-flex w-fit items-center gap-2 rounded-lg bg-nexus-cyan px-5 py-3 text-sm font-bold text-nexus-dark transition hover:bg-nexus-cyan-bright focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-nexus-cyan"
                        >
                          {hasFrenchLinkLabel ? linkLabel : <TranslatedText>{linkLabel || "View project"}</TranslatedText>}
                          <ArrowUpRight className="h-4 w-4" />
                        </a>
                      </div>

                      <div className="relative aspect-[4/3] overflow-hidden rounded-xl border border-nexus-cyan/30 bg-nexus-dark">
                        <Image src={project.imageUrl} alt={project.title} fill unoptimized className="object-cover" />
                      </div>
                    </div>
                  </div>
                  );
                })}
              </div>
            </div>

            {featuredWork.projects.length > 1 && <div className="mt-6 flex items-center justify-center gap-4">
              <button
                onClick={prevSlide}
                aria-label="Previous project"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-nexus-cyan/30 bg-nexus-navy-deep text-nexus-cyan-bright transition hover:bg-nexus-cyan hover:text-nexus-dark"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>

              <div className="flex gap-2">
                {featuredWork.projects.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentSlide(i)}
                    aria-label={`Go to slide ${i + 1}`}
                    className={`h-2 rounded-full transition-all ${
                      i === currentSlide
                        ? "w-8 bg-nexus-cyan-bright"
                        : "w-2 bg-nexus-cyan/30 hover:bg-nexus-cyan/60"
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={nextSlide}
                aria-label="Next project"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-nexus-cyan/30 bg-nexus-navy-deep text-nexus-cyan-bright transition hover:bg-nexus-cyan hover:text-nexus-dark"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>}
          </div>
        </div>
      </section>
      </>}

      {/* S4.7 — ENGAGEMENT MODELS */}
      <section className="relative overflow-hidden bg-nexus-gray py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal variant="up">
            <p className="text-center font-mono text-xs uppercase tracking-[0.3em] text-nexus-cyan">
              {th.engagementEyebrow}
            </p>
            <h2 className="mx-auto mt-4 max-w-3xl text-center text-3xl font-extrabold leading-tight text-nexus-dark sm:text-4xl lg:text-5xl">
              {th.engagementTitle}
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-center text-nexus-navy">
              {th.engagementDesc}
            </p>
          </Reveal>

          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {engagementModels.map((model, i) => (
              <Reveal key={model.title} variant="up" delay={i * 100}>
                <div className="flex h-full flex-col rounded-2xl border-2 border-nexus-cyan/20 bg-white p-8 hover:border-nexus-cyan transition-all hover:shadow-xl">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-nexus-cyan/10 text-nexus-cyan-bright">
                      {model.icon}
                    </div>
                    <h3 className="text-xl font-bold text-nexus-dark">
                      {model.title}
                    </h3>
                  </div>

                  <p className="text-sm text-nexus-navy mb-6 leading-relaxed">
                    {model.description}
                  </p>

                  <div className="mb-6 flex-grow border-t border-nexus-cyan/10 pt-4">
                    <p className="mb-3 text-xs font-mono uppercase tracking-wider text-nexus-cyan font-semibold">
                      Best for
                    </p>
                    <ul className="space-y-2">
                      {model.bestFor.map((item) => (
                        <li key={item} className="flex items-start gap-2 text-sm text-nexus-navy">
                          <CheckCircle2 className="h-4 w-4 shrink-0 text-nexus-cyan mt-0.5" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mb-6 border-t border-nexus-cyan/10 pt-4">
                    <p className="mb-2 text-xs font-mono uppercase tracking-wider text-nexus-cyan font-semibold">
                      Pricing approach
                    </p>
                    <p className="text-sm text-nexus-navy leading-relaxed">
                      {model.pricingNote}
                    </p>
                  </div>

                  <Link
                    href="/contact?department=tech_hub"
                    className="mt-auto block w-full rounded-md bg-nexus-cyan px-4 py-3 text-center text-sm font-semibold text-nexus-dark hover:bg-nexus-cyan-bright transition"
                  >
                    {th.engagementCta}
                  </Link>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal variant="up" delay={300}>
            <div className="mt-12 rounded-xl border border-nexus-cyan/20 bg-white p-6 text-center shadow-sm">
              <p className="text-sm text-nexus-navy">
                <strong className="text-nexus-dark">{th.engagementFooterBold}</strong> {th.engagementFooterText}
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* S4.9 — FAQ SECTION (with AI Assistant Link Banner) */}
      <section className="border-y border-nexus-cyan/10 bg-white py-20 lg:py-28">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <Reveal variant="up">
            <p className="text-center font-mono text-xs uppercase tracking-[0.3em] text-nexus-cyan">
              {th.faqEyebrow}
            </p>
            <h2 className="mx-auto mt-4 max-w-3xl text-center text-3xl font-extrabold leading-tight text-nexus-dark sm:text-4xl lg:text-5xl">
              {th.faqTitle}
            </h2>
          </Reveal>

          <div className="mt-12 space-y-4">
            {techHubFaqs.map((faq, i) => {
              const isOpen = openFaq === i;
              return (
                <div
                  key={faq.question}
                  className="overflow-hidden rounded-lg border border-nexus-cyan/20 bg-nexus-gray"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : i)}
                    className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left transition hover:bg-white"
                  >
                    <span className="font-semibold text-nexus-dark">
                      {faq.question}
                    </span>
                    <ChevronDown
                      className={`h-5 w-5 shrink-0 text-nexus-cyan transition-transform ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="border-t border-nexus-cyan/15 px-6 py-5">
                      <p className="text-sm leading-relaxed text-nexus-navy/75">
                        {faq.answer}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Live AI Assistant Interactive Banner */}
          <Reveal variant="up" delay={200}>
            <div className="mt-12 rounded-2xl border border-nexus-cyan/30 bg-gradient-to-r from-nexus-navy-deep via-nexus-navy to-nexus-dark p-8 shadow-xl">
              <div className="flex flex-col items-center justify-between gap-6 text-center md:flex-row md:text-left">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-nexus-cyan/40 bg-nexus-cyan/20 text-nexus-cyan-bright shadow-lg backdrop-blur-md">
                    <MessageSquare className="h-7 w-7" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Have a specific project question?</h3>
                    <p className="mt-1 text-xs leading-relaxed text-nexus-gray/80">
                      Our trained NEXUS AI Assistant can answer custom inquiries about services, tech stack &amp; process 24/7.
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={handleOpenAiAssistant}
                    className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-nexus-cyan px-6 py-3.5 text-sm font-semibold text-nexus-dark shadow-lg transition hover:bg-nexus-cyan-bright hover:scale-105"
                  >
                    <Sparkles className="h-4 w-4" />
                    Ask NEXUS AI Live
                  </button>
                  <Link
                    href={`https://wa.me/${CONTACT.whatsapp.replace("+", "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-nexus-cyan/40 px-6 py-3.5 text-sm font-semibold text-nexus-cyan-bright transition hover:bg-nexus-navy hover:text-white"
                  >
                    <MessageSquare className="h-4 w-4" />
                    Chat with us directly
                  </Link>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* S5 — TERMINAL CTA */}
      <section className="relative overflow-hidden bg-nexus-navy-deep py-20 lg:py-28">
        <div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <HairlineGrow className="mb-16 h-px w-full" delay={100} />
          <Reveal variant="up">
            <WordReveal
              text={th.ctaTitle}
              className="text-center text-3xl font-extrabold leading-tight text-white sm:text-4xl"
            />
            <p className="mx-auto mt-4 max-w-xl text-center leading-relaxed text-nexus-gray/70">
              {th.ctaDesc}
            </p>
          </Reveal>
          <Reveal variant="flat" delay={160}>
            <div className="mt-12">
              <TerminalCta
                command="init_project --with-nexus-tech-hub"
                outputLines={[
                  th.terminalOut1,
                  th.terminalOut2,
                  th.terminalOut3,
                ]}
                primaryLabel={th.ctaPrimaryBtn}
                primaryHref="/join-us?division=techhub"
                secondaryLabel={t.home.partnerBtn}
                secondaryHref="/partner"
                footnote={th.terminalFootnote}
              />
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
