"use client";

import Link from "next/link";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { useEffect, useRef, useState } from "react";
import { X, Send, ArrowRight, CheckCircle, Users, Briefcase, GraduationCap, Rocket } from "lucide-react";

export default function Mentorship() {
  const { t } = useLanguage();
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ fullName: "", age: "", email: "", phone: "", location: "", status: "", fieldOfInterest: "", about: "" });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [visibleSections, setVisibleSections] = useState<Set<number>>(new Set());

  const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = Number(entry.target.getAttribute("data-section"));
            setVisibleSections((prev) => new Set([...prev, idx]));
          }
        });
      },
      { threshold: 0.15 }
    );

    sectionRefs.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const isVisible = (idx: number) => visibleSections.has(idx);

  const openModal = () => {
    setSubmitted(false);
    setError(null);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSubmitting(false);
    setError(null);
  };

  const cycleSteps = [
    { title: t.mentorshipPage.cycle1Title, text: t.mentorshipPage.cycle1Text },
    { title: t.mentorshipPage.cycle2Title, text: t.mentorshipPage.cycle2Text },
    { title: t.mentorshipPage.cycle3Title, text: t.mentorshipPage.cycle3Text },
    { title: t.mentorshipPage.cycle4Title, text: t.mentorshipPage.cycle4Text },
    { title: t.mentorshipPage.cycle5Title, text: t.mentorshipPage.cycle5Text },
    { title: t.mentorshipPage.cycle6Title, text: t.mentorshipPage.cycle6Text },
  ];

  const programmes = [
    { title: t.mentorshipPage.prog1Title, text: t.mentorshipPage.prog1Text, icon: <GraduationCap className="h-6 w-6" /> },
    { title: t.mentorshipPage.prog2Title, text: t.mentorshipPage.prog2Text, icon: <Briefcase className="h-6 w-6" /> },
    { title: t.mentorshipPage.prog3Title, text: t.mentorshipPage.prog3Text, icon: <Users className="h-6 w-6" /> },
    { title: t.mentorshipPage.prog4Title, text: t.mentorshipPage.prog4Text, icon: <Rocket className="h-6 w-6" /> },
  ];

  const audiences = [
    { title: t.mentorshipPage.whoServe1Title, text: t.mentorshipPage.whoServe1Text },
    { title: t.mentorshipPage.whoServe2Title, text: t.mentorshipPage.whoServe2Text },
    { title: t.mentorshipPage.whoServe3Title, text: t.mentorshipPage.whoServe3Text },
    { title: t.mentorshipPage.whoServe4Title, text: t.mentorshipPage.whoServe4Text },
  ];

  const steps = [
    { title: t.mentorshipPage.h1Title, text: t.mentorshipPage.h1Text },
    { title: t.mentorshipPage.h2Title, text: t.mentorshipPage.h2Text },
    { title: t.mentorshipPage.h3Title, text: t.mentorshipPage.h3Text },
  ];

  const benefits = [
    { title: t.mentorshipPage.benefit1Title, text: t.mentorshipPage.benefit1Text },
    { title: t.mentorshipPage.benefit2Title, text: t.mentorshipPage.benefit2Text },
    { title: t.mentorshipPage.benefit3Title, text: t.mentorshipPage.benefit3Text },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/mentorship/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const result = await response.json().catch(() => null);

      if (response.ok && result?.ok) {
        setSubmitted(true);
        setFormData({ fullName: "", age: "", email: "", phone: "", location: "", status: "", fieldOfInterest: "", about: "" });
      } else {
        setError(
          result?.error === "invalid_email"
            ? "Please enter a valid email address."
            : result?.error === "missing_fields"
            ? "Please fill in all required fields."
            : "Something went wrong submitting your application. Please try again or contact us directly."
        );
      }
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-nexus-white">
      {/* ===== SECTION 1: HERO ===== */}
      <section className="relative py-20 lg:py-32 bg-nexus-dark overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-10 right-10 w-[500px] h-[500px] bg-nexus-cyan/8 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-10 left-10 w-[400px] h-[400px] bg-nexus-navy/50 rounded-full blur-[100px]"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-nexus-cyan/5 rounded-full"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-nexus-cyan/5 rounded-full"></div>
        </div>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <nav className="mb-8 flex items-center gap-2 text-sm text-nexus-gray/60">
            <Link href="/" className="transition hover:text-nexus-cyan-bright">Home</Link>
            <span className="text-nexus-cyan/40">›</span>
            <Link href="/divisions" className="transition hover:text-nexus-cyan-bright">Divisions</Link>
            <span className="text-nexus-cyan/40">›</span>
            <span className="text-nexus-cyan-bright">Mentorship</span>
          </nav>

          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-widest text-nexus-cyan mb-4">
              NEXUS Mentorship
            </p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-nexus-white mb-4 leading-tight">
              {t.mentorshipPage.title}
            </h1>
            <p className="text-lg md:text-xl text-nexus-gray/70 leading-relaxed mb-8 max-w-2xl">
              {t.mentorshipPage.description}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={openModal}
                className="group rounded-md bg-nexus-cyan px-8 py-4 text-sm font-semibold text-nexus-dark transition-all duration-300 hover:bg-nexus-cyan-bright hover:shadow-lg hover:shadow-nexus-cyan/20 text-center inline-flex items-center justify-center gap-2"
              >
                Apply for Mentorship <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
              <Link
                href="/academy"
                className="rounded-md border border-nexus-cyan/40 px-8 py-4 text-sm font-semibold text-nexus-cyan-bright transition-all duration-300 hover:bg-nexus-navy hover:shadow-lg text-center inline-flex items-center justify-center gap-2"
              >
                Explore Academy <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-2xl border-t border-nexus-cyan/15 pt-8">
            {[
              { value: "4", label: "Programmes" },
              { value: "6", label: "Month Cycle" },
              { value: "1:1", label: "Mentorship" },
              { value: "100%", label: "Free to Apply" },
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
      <section className="py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div
            ref={(el) => { sectionRefs.current[0] = el; }}
            data-section="0"
            className={`grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 transition-all duration-700 ${isVisible(0) ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
          >
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-nexus-cyan mb-4">
                {t.mentorshipPage.introEyebrow}
              </p>
              <h2 className="text-3xl md:text-4xl font-bold text-nexus-dark mb-6 leading-tight">
                {t.mentorshipPage.introTitle}
              </h2>
              <p className="text-base text-nexus-navy leading-relaxed mb-4">
                {t.mentorshipPage.introText}
              </p>
              <p className="text-base text-nexus-navy leading-relaxed mb-6">
                Many talented graduates in Cameroon leave university with strong academic knowledge but limited industry exposure, professional networks, or career readiness. NEXUS Mentorship exists to change that, connecting talent to opportunity and building the next generation of technology leaders.
              </p>
              <div className="space-y-3">
                {[t.mentorshipPage.bullet1, t.mentorshipPage.bullet2, t.mentorshipPage.bullet3].map((b, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-nexus-cyan-bright mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-nexus-navy leading-relaxed">{b}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              {programmes.map((p, i) => (
                <div
                  key={p.title}
                  className="bg-nexus-navy rounded-xl p-6 text-white hover:bg-nexus-navy-deep transition-all duration-300 hover:translate-x-1 cursor-pointer group"
                  style={{ transitionDelay: `${i * 100}ms` }}
                >
                  <div className="flex items-center gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-nexus-cyan/15 flex items-center justify-center text-nexus-cyan-bright group-hover:bg-nexus-cyan/25 transition-colors">
                      {p.icon}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-nexus-cyan-bright uppercase tracking-wide">
                        {p.title}
                      </h3>
                      <p className="text-sm text-nexus-gray/60 leading-relaxed mt-1">
                        {p.text}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== SECTION 3: PROGRAMMES ===== */}
      <section id="programmes" className="py-20 lg:py-28 bg-nexus-gray">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div
            ref={(el) => { sectionRefs.current[1] = el; }}
            data-section="1"
            className={`text-center mb-16 transition-all duration-700 ${isVisible(1) ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
          >
            <p className="text-nexus-cyan font-semibold tracking-widest uppercase text-sm mb-4">
              {t.mentorshipPage.programmesEyebrow}
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-nexus-dark mb-6">
              {t.mentorshipPage.programmesTitle}
            </h2>
            <p className="text-base text-nexus-navy max-w-2xl mx-auto">
              {t.mentorshipPage.programmesDesc}
            </p>
          </div>

          <div className="grid max-w-5xl mx-auto grid-cols-1 sm:grid-cols-2 gap-6">
            {programmes.map((p, i) => (
              <div
                key={p.title}
                className="bg-nexus-white rounded-xl border-l-4 border-nexus-cyan p-6 hover:shadow-xl hover:scale-[1.02] hover:border-nexus-cyan-bright transition-all duration-300 cursor-pointer group"
                ref={(el) => { sectionRefs.current[2 + i] = el; }}
                data-section={String(2 + i)}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-nexus-cyan/10 flex items-center justify-center text-nexus-cyan group-hover:bg-nexus-cyan/20 transition-colors">
                    {p.icon}
                  </div>
                  <h3 className="text-lg font-bold text-nexus-dark group-hover:text-nexus-cyan transition-colors">
                    {p.title}
                  </h3>
                </div>
                <p className="text-sm text-nexus-navy leading-relaxed">
                  {p.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== SECTION 4: WHO IT'S FOR ===== */}
      <section id="who" className="py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div
            ref={(el) => { sectionRefs.current[6] = el; }}
            data-section="6"
            className={`text-center mb-16 transition-all duration-700 ${isVisible(6) ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
          >
            <p className="text-nexus-cyan font-semibold tracking-widest uppercase text-sm mb-4">
              {t.mentorshipPage.whoServeEyebrow}
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-nexus-dark mb-6">
              {t.mentorshipPage.whoServeTitle}
            </h2>
            <p className="text-base text-nexus-navy max-w-2xl mx-auto">
              {t.mentorshipPage.whoServeDesc}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {audiences.map((a, i) => (
              <div
                key={a.title}
                className="bg-nexus-white rounded-xl border-l-4 border-nexus-cyan p-6 hover:shadow-xl hover:scale-[1.03] hover:border-nexus-cyan-bright transition-all duration-300 cursor-pointer"
                ref={(el) => { sectionRefs.current[7 + i] = el; }}
                data-section={String(7 + i)}
              >
                <h3 className="text-base font-bold text-nexus-dark mb-3">
                  {a.title}
                </h3>
                <p className="text-sm text-nexus-navy leading-relaxed">
                  {a.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== SECTION 4B: FOR MENTEES / FOR MENTORS ===== */}
      <section className="py-20 lg:py-28 bg-nexus-gray">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div
            ref={(el) => { sectionRefs.current[11] = el; }}
            data-section="11"
            className={`text-center mb-16 transition-all duration-700 ${isVisible(11) ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
          >
            <p className="text-nexus-cyan font-semibold tracking-widest uppercase text-sm mb-4">
              {t.mentorshipPage.whoEyebrow}
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-nexus-dark mb-6">
              {t.mentorshipPage.whoTitle}
            </h2>
            <p className="text-base text-nexus-navy max-w-2xl mx-auto">
              {t.mentorshipPage.whoDesc}
            </p>
          </div>

          <div className="grid max-w-4xl mx-auto grid-cols-1 sm:grid-cols-2 gap-8">
            <div className="bg-nexus-white rounded-xl border-l-4 border-nexus-cyan p-8 hover:shadow-xl transition-all duration-300">
              <h3 className="text-xl font-bold text-nexus-dark mb-3">{t.mentorshipPage.w1Title}</h3>
              <p className="text-sm text-nexus-navy leading-relaxed mb-6">{t.mentorshipPage.w1Text}</p>
              <button
                onClick={openModal}
                className="inline-flex items-center gap-2 rounded-md bg-nexus-navy px-5 py-2.5 text-sm font-semibold text-nexus-white transition-all duration-300 hover:bg-nexus-navy-deep hover:shadow-lg"
              >
                Apply as Mentee <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            <div className="bg-nexus-white rounded-xl border-l-4 border-nexus-cyan p-8 hover:shadow-xl transition-all duration-300">
              <h3 className="text-xl font-bold text-nexus-dark mb-3">{t.mentorshipPage.w2Title}</h3>
              <p className="text-sm text-nexus-navy leading-relaxed mb-6">{t.mentorshipPage.w2Text}</p>
              <Link
                href="/join-us?pathway=mentor"
                className="inline-flex items-center gap-2 rounded-md bg-nexus-navy px-5 py-2.5 text-sm font-semibold text-nexus-white transition-all duration-300 hover:bg-nexus-navy-deep hover:shadow-lg"
              >
                Apply as Mentor <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ===== SECTION 5: HOW IT WORKS ===== */}
      <section className="py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div
            ref={(el) => { sectionRefs.current[12] = el; }}
            data-section="12"
            className={`text-center mb-16 transition-all duration-700 ${isVisible(12) ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
          >
            <p className="text-nexus-cyan font-semibold tracking-widest uppercase text-sm mb-4">
              {t.mentorshipPage.howEyebrow}
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-nexus-dark mb-6">
              {t.mentorshipPage.howTitle}
            </h2>
            <p className="text-base text-nexus-navy max-w-2xl mx-auto">
              {t.mentorshipPage.howDesc}
            </p>
          </div>

          <div className="grid max-w-4xl mx-auto grid-cols-1 sm:grid-cols-3 gap-6">
            {steps.map((s, i) => (
              <div
                key={s.title}
                className="relative bg-nexus-gray rounded-xl border-l-4 border-nexus-cyan p-6 hover:shadow-xl hover:scale-[1.03] transition-all duration-300"
                ref={(el) => { sectionRefs.current[13 + i] = el; }}
                data-section={String(13 + i)}
              >
                <span className="absolute -top-4 -left-4 w-10 h-10 rounded-full bg-nexus-cyan text-nexus-dark flex items-center justify-center text-sm font-bold shadow-lg">
                  {i + 1}
                </span>
                <h3 className="text-lg font-bold text-nexus-dark mb-2 mt-2">{s.title}</h3>
                <p className="text-sm text-nexus-navy leading-relaxed">{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== SECTION 6: CYCLE TIMELINE ===== */}
      <section className="py-20 lg:py-28 bg-nexus-gray overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div
            ref={(el) => { sectionRefs.current[16] = el; }}
            data-section="16"
            className={`text-center mb-16 transition-all duration-700 ${isVisible(16) ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
          >
            <p className="text-nexus-cyan font-semibold tracking-widest uppercase text-sm mb-4">
              {t.mentorshipPage.cycleEyebrow}
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-nexus-dark mb-6">
              {t.mentorshipPage.cycleTitle}
            </h2>
            <p className="text-base text-nexus-navy max-w-2xl mx-auto">
              {t.mentorshipPage.cycleDesc}
            </p>
          </div>

          <div className="relative max-w-5xl mx-auto">
            {/* Horizontal line */}
            <div className="hidden md:block absolute top-12 left-0 right-0 h-0.5 bg-nexus-cyan/20"></div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {cycleSteps.map((step, i) => (
                <div
                  key={step.title}
                  className="relative flex flex-col items-center text-center"
                  ref={(el) => { sectionRefs.current[17 + i] = el; }}
                  data-section={String(17 + i)}
                >
                  <div className="relative z-10 w-12 h-12 rounded-full bg-nexus-navy text-nexus-cyan-bright flex items-center justify-center font-bold text-sm shadow-lg mb-4 hover:scale-110 hover:bg-nexus-cyan hover:text-nexus-dark transition-all duration-300 cursor-pointer">
                    {i + 1}
                  </div>
                  <h4 className="text-sm font-bold text-nexus-dark mb-2 leading-tight">{step.title}</h4>
                  <p className="text-xs text-nexus-navy/50 leading-relaxed">{step.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== SECTION 7: BENEFITS ===== */}
      <section className="py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div
            ref={(el) => { sectionRefs.current[23] = el; }}
            data-section="23"
            className={`text-center mb-16 transition-all duration-700 ${isVisible(23) ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
          >
            <p className="text-nexus-cyan font-semibold tracking-widest uppercase text-sm mb-4">
              {t.mentorshipPage.benefitsEyebrow}
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-nexus-dark mb-6">
              {t.mentorshipPage.benefitsTitle}
            </h2>
          </div>

          <div className="grid max-w-4xl mx-auto grid-cols-1 sm:grid-cols-3 gap-6">
            {benefits.map((b, i) => (
              <div
                key={b.title}
                className="bg-nexus-gray rounded-xl border-l-4 border-nexus-cyan p-6 hover:shadow-xl hover:scale-[1.03] hover:border-nexus-cyan-bright transition-all duration-300 cursor-pointer"
                ref={(el) => { sectionRefs.current[24 + i] = el; }}
                data-section={String(24 + i)}
              >
                <h3 className="text-base font-bold text-nexus-dark mb-3">{b.title}</h3>
                <p className="text-sm text-nexus-navy leading-relaxed">{b.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== SECTION 8: EXPLORE NEXUS ===== */}
      <section className="py-20 lg:py-28 bg-nexus-dark">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div
            ref={(el) => { sectionRefs.current[27] = el; }}
            data-section="27"
            className={`text-center mb-16 transition-all duration-700 ${isVisible(27) ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
          >
            <p className="text-nexus-cyan font-semibold tracking-widest uppercase text-sm mb-4">
              {t.mentorshipPage.exploreNexusEyebrow}
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-nexus-white mb-6">
              {t.mentorshipPage.exploreNexusTitle}
            </h2>
            <p className="text-base text-nexus-gray/70 max-w-2xl mx-auto">
              {t.mentorshipPage.exploreNexusDesc}
            </p>
          </div>

          <div className="grid max-w-5xl mx-auto grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { name: "NEXUS Academy", desc: "Practical tech training, cohort-based.", href: "/academy" },
              { name: "NEXUS Tech Hub", desc: "Services, products & client work.", href: "/divisions/tech-hub" },
              { name: "NEXUS Foundation", desc: "Community impact & digital literacy.", href: "/divisions/foundation" },
            ].map((d) => (
              <Link
                key={d.name}
                href={d.href}
                className="group bg-white/5 backdrop-blur rounded-xl p-6 border border-nexus-cyan/10 hover:border-nexus-cyan/30 hover:bg-white/10 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl"
              >
                <h3 className="text-lg font-bold text-nexus-cyan-bright mb-2 group-hover:translate-x-1 transition-transform">
                  {d.name} →
                </h3>
                <p className="text-sm text-nexus-gray/60">{d.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ===== SECTION 9: CTA ===== */}
      <section className="py-20 lg:py-28 bg-gradient-to-br from-nexus-dark via-[#0d1040] to-nexus-dark relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-nexus-cyan/5 rounded-full blur-[120px]"></div>
        </div>
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div
            ref={(el) => { sectionRefs.current[30] = el; }}
            data-section="30"
            className={`max-w-2xl mx-auto text-center transition-all duration-700 ${isVisible(30) ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
          >
            <p className="text-sm font-semibold uppercase tracking-widest text-nexus-cyan mb-4">
              {t.mentorshipPage.ctaEyebrow}
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-nexus-cyan-bright mb-6">
              {t.mentorshipPage.ctaTitle}
            </h2>
            <p className="text-base text-nexus-gray/70 leading-relaxed mb-8">
              {t.mentorshipPage.ctaDesc}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={openModal}
              className="group rounded-md bg-nexus-cyan px-8 py-4 text-sm font-semibold text-nexus-dark transition-all duration-300 hover:bg-nexus-cyan-bright hover:shadow-lg hover:shadow-nexus-cyan/20 text-center inline-flex items-center justify-center gap-2"
            >
              Apply Now <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
            <Link
              href="/contact?department=mentorship"
              className="rounded-md border border-nexus-cyan/40 px-8 py-4 text-sm font-semibold text-nexus-cyan-bright transition-all duration-300 hover:bg-nexus-navy hover:shadow-lg text-center"
            >
              {t.nav.contact}
            </Link>
            <Link
              href="/about"
              className="rounded-md border border-nexus-cyan/25 px-8 py-4 text-sm font-semibold text-nexus-gray/80 transition-all duration-300 hover:border-nexus-cyan/50 hover:text-nexus-cyan-bright hover:shadow-lg text-center"
            >
              About NEXUS
            </Link>
          </div>
        </div>
      </section>

      {/* ===== MODAL ===== */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" onClick={closeModal}>
          <div className="bg-nexus-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-nexus-white border-b border-nexus-cyan/10 px-6 py-4 flex items-center justify-between z-10">
              <h3 className="text-lg font-bold text-nexus-dark">Join NEXUS Mentorship</h3>
              <button onClick={closeModal} className="text-nexus-navy/50 hover:text-nexus-navy transition p-1 hover:bg-nexus-gray rounded-lg">
                <X className="h-5 w-5" />
              </button>
            </div>

            {submitted ? (
              <div className="p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                  <Send className="h-8 w-8 text-green-600" />
                </div>
                <h4 className="text-xl font-bold text-nexus-dark mb-2">Application Sent!</h4>
                <p className="text-sm text-nexus-navy">We&apos;ll get back to you soon.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {error && (
                  <div role="alert" className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-nexus-dark mb-1">Full Name *</label>
                  <input type="text" required value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-nexus-cyan/20 text-sm focus:outline-none focus:border-nexus-cyan focus:ring-2 focus:ring-nexus-cyan/10 transition" placeholder="Enter your full name" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-nexus-dark mb-1">Age</label>
                    <input type="number" value={formData.age} onChange={(e) => setFormData({ ...formData, age: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-nexus-cyan/20 text-sm focus:outline-none focus:border-nexus-cyan focus:ring-2 focus:ring-nexus-cyan/10 transition" placeholder="Age" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-nexus-dark mb-1">Phone</label>
                    <input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-nexus-cyan/20 text-sm focus:outline-none focus:border-nexus-cyan focus:ring-2 focus:ring-nexus-cyan/10 transition" placeholder="+237 6XX XXX XXX" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-nexus-dark mb-1">Email *</label>
                  <input type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-nexus-cyan/20 text-sm focus:outline-none focus:border-nexus-cyan focus:ring-2 focus:ring-nexus-cyan/10 transition" placeholder="your@email.com" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-nexus-dark mb-1">Location</label>
                  <input type="text" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-nexus-cyan/20 text-sm focus:outline-none focus:border-nexus-cyan focus:ring-2 focus:ring-nexus-cyan/10 transition" placeholder="e.g. Buea, Bamenda" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-nexus-dark mb-1">Current Status *</label>
                    <select required value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-nexus-cyan/20 text-sm focus:outline-none focus:border-nexus-cyan focus:ring-2 focus:ring-nexus-cyan/10 transition bg-white">
                      <option value="">Select status</option>
                      <option value="student">Final-Year Student</option>
                      <option value="graduate">Recent Graduate</option>
                      <option value="professional">Early-Career Professional</option>
                      <option value="educator">Educator / Lecturer</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-nexus-dark mb-1">Field of Interest</label>
                    <select value={formData.fieldOfInterest} onChange={(e) => setFormData({ ...formData, fieldOfInterest: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-nexus-cyan/20 text-sm focus:outline-none focus:border-nexus-cyan focus:ring-2 focus:ring-nexus-cyan/10 transition bg-white">
                      <option value="">Select field</option>
                      <option value="cybersecurity">Cybersecurity</option>
                      <option value="software">Software Development</option>
                      <option value="design">Product Design</option>
                      <option value="data">Data Science / AI</option>
                      <option value="leadership">Tech Leadership</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-nexus-dark mb-1">Tell us about yourself *</label>
                  <textarea required rows={4} value={formData.about} onChange={(e) => setFormData({ ...formData, about: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-nexus-cyan/20 text-sm focus:outline-none focus:border-nexus-cyan focus:ring-2 focus:ring-nexus-cyan/10 transition resize-none" placeholder="Your goals, experience, and what you hope to gain..." />
                </div>
                <button type="submit" disabled={submitting} className="w-full bg-nexus-cyan text-nexus-dark py-3 rounded-lg font-semibold transition-all duration-300 hover:bg-nexus-cyan-bright hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed">
                  {submitting ? "Submitting..." : "Submit Application"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
