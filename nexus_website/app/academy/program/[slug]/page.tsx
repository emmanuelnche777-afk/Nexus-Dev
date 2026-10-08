"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Play,
  Award,
  Check,
  ArrowRight,
} from "lucide-react";
import { useParams, usePathname } from "next/navigation";
import PageHeader from "@/components/PageHeader";
import SectionHeading from "@/components/SectionHeading";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import TranslatedText from "@/components/TranslatedText";
import VideoPlayer from "@/components/video/VideoPlayer";
import { resolveVideoUrl } from "@/lib/video-url";

interface Program {
  id: string;
  slug: string;
  title: string;
  durationWeeks: number;
  price: number;
  currency: string;
  thumbnailUrl?: string;
  overviewVideoUrl?: string;
  curriculumModules?: Array<{
    title: string;
    weeks: number;
    topics: string[];
    project?: string;
  }>;
  requirements?: string[];
  instructors?: Array<{
    name: string;
    title: string;
    bio: string;
  }>;
  highlights?: string[];
  shortDescription?: string;
  fullDescription?: string;
  tools?: string[];
  certification?: string;
  awards?: string[];
}

function VideoBlock({ url }: { url: string }) {
  if (resolveVideoUrl(url)) {
    return (
      <div className="relative aspect-video rounded-xl overflow-hidden bg-nexus-navy border border-nexus-cyan/20">
        <VideoPlayer src={url} title="Program overview video" className="absolute inset-0 h-full w-full object-cover" />
      </div>
    );
  }

  // Invalid/unknown URL — show placeholder
  return (
    <div className="relative aspect-video rounded-xl overflow-hidden bg-nexus-navy border border-nexus-cyan/20 flex items-center justify-center">
      <Play className="h-12 w-12 text-nexus-cyan-bright opacity-80" />
      <p className="text-center text-sm text-nexus-gray/60">Invalid video URL</p>
    </div>
  );
}

export default function ProgramDetailPage() {
  const params = useParams<{ slug: string }>();
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState<"modules" | "requirements">("modules");
  const [program, setProgram] = useState<Program | null>(null);
  const [loading, setLoading] = useState(true);
  const { language } = useLanguage();

  useEffect(() => {
    const slugFromParams = params.slug;
    const slugFromPath = pathname.split("/program/")[1]?.split("/")[0];
    const slug = slugFromParams || slugFromPath;

    if (!slug) return;
    fetch(`/api/programs/${slug}`, { cache: "no-store" })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        setProgram(data.program || null);
      })
      .catch((error) => {
        console.error("Failed to load program:", error);
      })
      .finally(() => setLoading(false));
  }, [params.slug, pathname]);

  if (loading) {
    return (
      <div className="bg-nexus-white min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-nexus-cyan border-t-transparent" />
      </div>
    );
  }

  if (!program) {
    return (
      <div className="bg-nexus-white min-h-screen">
        <PageHeader
          title={language === "fr" ? "Programme non trouvé" : "Program Not Found"}
          description={language === "fr"
            ? "Le programme que vous recherchez n'existe pas."
            : "The program you are looking for does not exist."}
        />
        <div className="py-16 text-center">
          <Link
            href="/academy/programs"
            className="inline-flex items-center gap-2 text-nexus-cyan hover:gap-3 transition"
          >
            <ArrowRight className="h-4 w-4" />
            {language === "fr" ? "Voir tous les programmes" : "Back to All Programs"}
          </Link>
        </div>
      </div>
    );
  }

  const formatPrice = (price: number) => {
    return `${price.toLocaleString()} ${program.currency}`;
  };

  return (
    <div className="bg-nexus-white">
      <PageHeader
        title={<TranslatedText>{program.title}</TranslatedText>}
        description={<TranslatedText>{program.shortDescription}</TranslatedText>}
        breadcrumb={[
          { label: "Home", href: "/" },
          { label: "Academy", href: "/academy" },
          { label: <TranslatedText>{program.title}</TranslatedText> },
        ]}
      />

      {/* Hero Section with Video */}
      <section className="py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-10 items-start">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-nexus-cyan bg-nexus-cyan/15 px-3 py-1 rounded-full">
                  {program.durationWeeks} {language === "fr" ? "semaines" : "weeks"}
                </span>
                <span className="text-sm font-semibold text-nexus-navy/60">
                  <TranslatedText>{program.certification || ""}</TranslatedText>
                </span>
              </div>

              <h2 className="text-3xl font-bold text-nexus-dark">
                {language === "fr"
                  ? "Ce que vous allez maîtriser"
                  : "What You'll Master"}
              </h2>

              <p className="text-base leading-relaxed text-nexus-navy/75">
                <TranslatedText as="span">{program.fullDescription}</TranslatedText>
              </p>

              <div className="flex items-center gap-4 pt-4">
                <span className="text-2xl font-bold text-nexus-cyan">
                  {formatPrice(program.price)}
                </span>
                <Link
                  href={`/academy/register/${program.slug}`}
                  className="inline-flex items-center justify-center gap-2 rounded-md bg-nexus-cyan px-6 py-3 text-sm font-semibold text-nexus-dark transition hover:bg-nexus-cyan-bright"
                >
                  {language === "fr" ? "S'inscrire maintenant" : "Enroll Now"}
                </Link>
              </div>
            </div>

            {/* Video Section */}
            {program.overviewVideoUrl ? (
              <VideoBlock url={program.overviewVideoUrl} />
            ) : (
              <div className="relative aspect-video rounded-xl overflow-hidden bg-nexus-navy border border-nexus-cyan/20 flex items-center justify-center">
                <div className="text-center p-8">
                  <Play className="mx-auto h-12 w-12 text-nexus-cyan-bright opacity-80" />
                  <p className="mt-4 text-sm text-nexus-gray/60">
                    {language === "fr"
                      ? "Vidéo de démonstration du programme"
                      : "Program Demo Video"}
                  </p>
                  <p className="mt-2 text-xs text-nexus-gray/50">
                    {language === "fr"
                      ? "Bientôt disponible"
                      : "Coming soon"}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Tabs Navigation */}
      <section className="border-y border-nexus-cyan/10 bg-nexus-gray">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex overflow-x-auto border-b border-nexus-cyan/20">
            <button
              onClick={() => setActiveTab("modules")}
              className={`flex-1 px-4 py-3 text-sm font-semibold border-b-2 transition ${
                activeTab === "modules"
                  ? "border-nexus-cyan text-nexus-cyan"
                  : "border-transparent text-nexus-navy/60 hover:text-nexus-navy"
              }`}
            >
              {language === "fr" ? "Modules" : "Curriculum"}
            </button>
            <button
              onClick={() => setActiveTab("requirements")}
              className={`flex-1 px-4 py-3 text-sm font-semibold border-b-2 transition ${
                activeTab === "requirements"
                  ? "border-nexus-cyan text-nexus-cyan"
                  : "border-transparent text-nexus-navy/60 hover:text-nexus-navy"
              }`}
            >
              {language === "fr" ? "Conditions" : "Requirements"}
            </button>

          </div>
        </div>
      </section>

      {/* Tab Content */}
      <section className="py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {activeTab === "modules" && (
            <div>
              <h3 className="text-2xl font-bold text-nexus-dark mb-8">
                {language === "fr" ? "Parcours du Programme" : "Program Curriculum"}
              </h3>
              <div className="space-y-6">
                {(program.curriculumModules ?? []).map((module, index) => (
                  <div
                    key={module.title}
                    className="border border-nexus-cyan/20 rounded-xl bg-nexus-white p-6"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-nexus-cyan/15 text-nexus-cyan font-bold">
                          {index + 1}
                        </div>
                        <h4 className="text-lg font-bold text-nexus-dark">
                          <TranslatedText>{module.title}</TranslatedText>
                        </h4>
                      </div>
                      <span className="text-sm text-nexus-navy/60">
                        {module.weeks} {language === "fr" ? "semaines" : "weeks"}
                      </span>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <h5 className="text-sm font-semibold text-nexus-navy mb-2">
                          {language === "fr" ? "Thèmes principaux" : "Main Topics"}:
                        </h5>
                        <ul className="space-y-1.5">
                          {module.topics.map((topic, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sm text-nexus-navy/70">
                              <Check className="h-4 w-4 mt-0.5 text-nexus-cyan flex-shrink-0" />
                              <span><TranslatedText>{topic}</TranslatedText></span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      {module.project && (
                        <div>
                          <h5 className="text-sm font-semibold text-nexus-navy mb-2">
                            {language === "fr" ? "Projet" : "Project"}:
                          </h5>
                          <p className="rounded-lg border border-nexus-cyan/10 bg-nexus-gray p-3 text-sm leading-relaxed text-nexus-navy/75">
                            <TranslatedText as="span">{module.project}</TranslatedText>
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "requirements" && (
            <div>
              <h3 className="text-2xl font-bold text-nexus-dark mb-8">
                {language === "fr" ? "Conditions pour postuler" : "Eligibility Requirements"}
              </h3>
              <div className="space-y-4">
                {(program.requirements ?? []).map((req, index) => (
                  <div
                    key={index}
                    className="group flex items-start gap-4 rounded-xl border border-nexus-cyan/20 bg-nexus-white p-5 shadow-sm transition hover:border-nexus-cyan/40 hover:shadow-md"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-nexus-cyan text-sm font-bold text-nexus-dark">
                      {index + 1}
                    </div>
                    <span className="text-sm leading-relaxed text-nexus-navy/80">
                      <TranslatedText>{req}</TranslatedText>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}


        </div>
      </section>

      {/* Awards & Recognition */}
      {(program.awards && program.awards.length > 0) && (
        <section className="py-16 lg:py-24 border-t border-nexus-navy/10 bg-nexus-gray">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeading
              eyebrow={language === "fr" ? "Récompenses" : "Recognition"}
              title={language === "fr" ? "Prix et distinctions" : "Awards & Recognition"}
              description={language === "fr"
                ? "Nos étudiants sont récompensés pour leur excellence."
                : "Our students are recognized for their excellence."}
            />
            <div className="mt-12 grid gap-4 sm:grid-cols-3">
              {program.awards.map((award, index) => (
                <div
                  key={index}
                  className="rounded-lg border border-nexus-cyan/20 bg-nexus-white p-4 text-center"
                >
                  <Award className="mx-auto h-8 w-8 text-nexus-cyan mb-2" />
                  <p className="text-sm font-semibold text-nexus-dark"><TranslatedText>{award}</TranslatedText></p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Contact CTA */}
      <section className="py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-nexus-cyan/20 bg-nexus-navy/30 p-8 lg:p-12">
            <h3 className="text-2xl font-bold text-nexus-dark mb-4">
              {language === "fr"
                ? "Prêt à rejoindre la prochaine cohorte ?"
                : "Ready to join the next cohort?"}
            </h3>
            <p className="mb-8 text-nexus-navy/75 max-w-2xl">
              {language === "fr"
                ? "Contactez-nous pour toute question ou pour obtenir plus d'informations sur ce programme."
                : "Contact us for any questions or to get more information about this program."}
            </p>
            <Link
              href="/contact?department=academy"
              className="inline-flex items-center gap-2 rounded-md bg-nexus-cyan px-6 py-3 text-sm font-semibold text-nexus-dark transition hover:bg-nexus-cyan-bright"
            >
              {language === "fr" ? "Nous contacter" : "Contact Us"} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
