"use client";

import { useState, Suspense, type MouseEvent, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  GraduationCap,
  Building2,
  HeartHandshake,
  Users,
  Handshake,
  Landmark,
  MessageCircle,
 Mail,
  X,
} from "lucide-react";
import PageHeader from "@/components/PageHeader";
import SectionHeading from "@/components/SectionHeading";
import CTA from "@/components/CTA";
import { CONTACT } from "@/lib/site";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import TranslatedText from "@/components/TranslatedText";
import { Language } from "@/lib/i18n/translations";
import config from "@/data/join-us-config.json";
import { JoinUsConfig, FormFieldOption, PublicOpportunity } from "@/lib/join-us-types";

const tiltCard = (e: MouseEvent<HTMLElement>) => {
  const el = e.currentTarget;
  const rect = el.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  el.style.setProperty("--mx", `${x}px`);
  el.style.setProperty("--my", `${y}px`);
  const px = x / rect.width - 0.5;
  const py = y / rect.height - 0.5;
  el.style.setProperty("--tilt-y", `${px * 6}deg`);
  el.style.setProperty("--tilt-x", `${-py * 6}deg`);
};

const gridContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};

const gridItem = {
  hidden: { opacity: 0, y: 24, scale: 0.96 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring" as const, stiffness: 260, damping: 22 },
  },
};

function JoinUsContent() {
  const [submitted, setSubmitted] = useState(false);
  const [selectedPathway, setSelectedPathway] = useState<string | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [roleFormData, setRoleFormData] = useState<Record<string, string>>({});
  const [roleSubmitted, setRoleSubmitted] = useState(false);
  const [roleSubmitting, setRoleSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [roleError, setRoleError] = useState<string | null>(null);

  const [opportunities, setOpportunities] = useState<PublicOpportunity[]>([]);
  const [opportunitiesSectionEnabled, setOpportunitiesSectionEnabled] = useState<boolean | null>(null);
  const [opportunitiesLoading, setOpportunitiesLoading] = useState(true);
  const [opportunitiesFailed, setOpportunitiesFailed] = useState(false);
  const [selectedOpportunityId, setSelectedOpportunityId] = useState<string | null>(null);
  const [documents, setDocuments] = useState<File[]>([]);

  const searchParams = useSearchParams();
  const division = searchParams.get("division");
  const requestedPathway = searchParams.get("pathway");

  const { t, language } = useLanguage();
  const lang = language as Language;
  const joinConfig = config as unknown as JoinUsConfig;

  const manifesto = joinConfig.manifesto[lang];
  const pathways = joinConfig.pathways[lang];
  const pathwayFields = joinConfig.pathways.fields;

  // Admin-managed Opportunities are the authoritative source for the public
  // "Open Opportunities" listing. The config roles are used only as a fallback
  // while the database returns nothing, so the two can never both render.
  const usesDatabaseOpportunities = opportunities.length > 0;
  const listings: PublicOpportunity[] = opportunities;
  const fallbackRoles = joinConfig.rolePortal.roles;

  const selectedOpportunity = opportunities.find((o) => o.id === selectedOpportunityId) || null;
  const selectedConfigRole = usesDatabaseOpportunities
    ? null
    : fallbackRoles.find((r) => r.id === selectedRole) || null;
  const selectedListingTitle = selectedOpportunity
    ? selectedOpportunity.title
    : selectedConfigRole
    ? selectedConfigRole.title[lang]
    : "";

  const formatDeadline = (iso: string) =>
    new Date(iso).toLocaleDateString(lang === "fr" ? "fr-FR" : "en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  const handlePathwaySelect = (id: string) => {
    setSelectedPathway(id);
    setFormData({});
    setSubmitted(false);
    setError(null);
  };

  const handlePathwayClose = () => {
    setSelectedPathway(null);
    setFormData({});
    setSubmitted(false);
  };

  const handleFieldChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRoleSelect = (id: string) => {
    setSelectedRole(id);
    setSelectedOpportunityId(null);
    setRoleFormData({});
    setRoleSubmitted(false);
    setRoleError(null);
    setDocuments([]);
  };

  const handleRoleClose = () => {
    setSelectedRole(null);
    setSelectedOpportunityId(null);
    setRoleFormData({});
    setRoleSubmitted(false);
    setRoleError(null);
    setDocuments([]);
  };

  const handleOpportunitySelect = (id: string) => {
    setSelectedOpportunityId(id);
    setSelectedRole(null);
    setRoleFormData({});
    setRoleSubmitted(false);
    setRoleError(null);
    setDocuments([]);
  };

  const handleRoleFieldChange = (name: string, value: string) => {
    setRoleFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDocumentsChange = (files: FileList | null) => {
    setDocuments(files ? Array.from(files) : []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPathway) return;
    setSubmitting(true);
    setError(null);
    try {
      const response = await fetch("/api/join-us/pathway", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pathway: selectedPathway, division, ...formData }),
      });
      const result = await response.json().catch(() => null);
      if (response.ok && result?.ok) {
        setSubmitted(true);
      } else {
        setError(
          result?.message ||
            result?.error ||
            "We couldn't save your submission. Please try again."
        );
      }
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRoleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const opportunityId = selectedOpportunityId ?? selectedRole;
    if (!opportunityId) return;
    setRoleSubmitting(true);
    setRoleError(null);
    try {
      const body = new FormData();
      body.append("opportunityId", opportunityId);
      body.append("fullName", roleFormData.fullName || "");
      body.append("email", roleFormData.email || "");
      body.append("phone", roleFormData.phone || "");
      body.append("message", roleFormData.message || "");
      documents.forEach((file) => body.append("documents", file));

      const response = await fetch("/api/join-us/opportunity", {
        method: "POST",
        body,
      });
      const result = await response.json().catch(() => null);
      if (response.ok && result?.ok) {
        setRoleSubmitted(true);
        setDocuments([]);
      } else {
        setRoleError(
          result?.message ||
            result?.error ||
            "We couldn't save your application. Please try again."
        );
      }
    } catch {
      setRoleError("Network error. Please check your connection and try again.");
    } finally {
      setRoleSubmitting(false);
    }
  };

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const response = await fetch("/api/opportunities");
        const result = await response.json().catch(() => null);
        if (cancelled) return;
        setOpportunities(Array.isArray(result?.opportunities) ? result.opportunities : []);
        setOpportunitiesSectionEnabled(result?.enabled !== false);
      } catch {
        if (!cancelled) {
          setOpportunitiesFailed(true);
          setOpportunitiesSectionEnabled(true);
        }
      } finally {
        if (!cancelled) setOpportunitiesLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!requestedPathway || !["student", "client", "volunteer", "mentor", "partner", "investor"].includes(requestedPathway)) return;
    const timer = window.setTimeout(() => {
      setSelectedPathway(requestedPathway);
      setFormData({});
    }, 0);
    return () => window.clearTimeout(timer);
  }, [requestedPathway]);

  const fields = selectedPathway ? pathwayFields[selectedPathway] || [] : [];

  const divisionLabels: Record<string, string> = {
    academy: "Academy",
    techHub: "Tech Hub",
    foundation: "Foundation",
    mentorship: "Mentorship",
  };

  return (
    <div className="bg-nexus-white">
      <PageHeader
        title={t.joinUsPage.title}
        description={t.joinUsPage.description}
        breadcrumb={[{ label: "Home", href: "/" }, { label: "Join Us" }]}
      />

      {/* Section 1: Why Join NEXUS — Institutional Manifesto */}
      <section className="py-16 lg:py-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-nexus-cyan">
            {manifesto.title}
          </p>
          <div className="mt-12 space-y-12">
            {manifesto.paragraphs.map((para, i) => (
              <div key={i}>
                <h3 className="text-xl font-bold text-nexus-dark mb-4">
                  {para.heading}
                </h3>
                <p className="text-base leading-relaxed text-nexus-navy/75">
                  {para.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 2: Your Pathway — Identification & Application Form */}
      <section className="relative overflow-hidden bg-nexus-gray py-16 lg:py-24">
        <span
          className="orb absolute -right-24 -top-24 h-72 w-72 rounded-full"
          style={{ background: "rgba(69,175,225,0.12)" }}
        />
        <span
          className="orb orb-delay-1 absolute -left-24 -bottom-24 h-72 w-72 rounded-full"
          style={{ background: "rgba(46,49,146,0.15)" }}
        />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow={pathways.title}
            title={pathways.subtitle}
          />

          <div className="mt-12 grid gap-8 lg:grid-cols-5">
            {/* Left: pathway selector */}
            <div className="lg:col-span-3">
              <motion.div
                className="grid gap-4 sm:grid-cols-2"
                variants={gridContainer}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "-80px" }}
              >
              {pathways.roles.map((role) => {
                const iconMap: Record<string, React.ReactNode> = {
                  student: <GraduationCap className="h-6 w-6" />,
                  client: <Building2 className="h-6 w-6" />,
                  volunteer: <HeartHandshake className="h-6 w-6" />,
                  mentor: <Users className="h-6 w-6" />,
                  partner: <Handshake className="h-6 w-6" />,
                  investor: <Landmark className="h-6 w-6" />,
                };
                const isSelected = selectedPathway === role.id;
                return (
                  <motion.button
                    key={role.id}
                    onClick={() => handlePathwaySelect(role.id)}
                    onMouseMove={tiltCard}
                    variants={gridItem}
                    className={`tilt-card rounded-lg border p-6 text-left ${
                      isSelected
                        ? "border-nexus-cyan bg-white shadow-md"
                        : "border-nexus-cyan/20 bg-white hover:border-nexus-cyan/50 hover:shadow-sm"
                    }`}
                  >
                  <div className={`flex h-12 w-12 items-center justify-center rounded-md ${isSelected ? "bg-nexus-cyan text-nexus-dark" : "bg-nexus-navy text-nexus-cyan-bright"}`}>
                    {iconMap[role.id]}
                  </div>
                  <p className={`mt-4 text-base font-bold ${isSelected ? "text-nexus-cyan" : "text-nexus-dark"}`}>
                    {role.label}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-nexus-navy">
                    {role.description}
                  </p>
                </motion.button>
              );
              })}
              </motion.div>
            </div>

            {/* Right: application form */}
            <div className="lg:col-span-2">
              <div className="sticky top-24 rounded-lg border border-nexus-cyan/20 bg-white p-8">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-bold text-nexus-dark">
                      {pathways.title}
                    </h3>
                    <p className="mt-1 text-sm text-nexus-navy">
                      {selectedPathway
                        ? pathways.roles.find((r) => r.id === selectedPathway)?.label
                        : t.joinUsPage.pathwayPrompt}
                      {division && divisionLabels[division] && selectedPathway && (
                        <> &middot; {divisionLabels[division]}</>
                      )}
                    </p>
                  </div>
                  {selectedPathway && (
                    <button
                      type="button"
                      onClick={handlePathwayClose}
                      aria-label={t.joinUsPage.closeForm}
                      className="shrink-0 rounded-md p-1.5 text-nexus-navy/50 transition hover:bg-nexus-gray hover:text-nexus-navy"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  )}
                </div>

                {!selectedPathway ? (
                  <div className="mt-8 rounded-lg border border-dashed border-nexus-navy/15 bg-nexus-gray p-8 text-center">
                    <p className="text-sm text-nexus-navy/50">
                      {lang === "fr" ? "Choisissez un parcours à gauche pour commencer." : "Choose a pathway on the left to get started."}
                    </p>
                  </div>
                ) : submitted ? (
                  <div className="mt-8 rounded-lg border border-nexus-cyan/20 bg-nexus-gray p-8 text-center">
                    <CheckCircle2 className="mx-auto h-10 w-10 text-nexus-cyan" />
                    <h4 className="mt-4 text-lg font-bold text-nexus-dark">
                      {t.joinUsPage.successTitle}
                    </h4>
                    <p className="mt-2 text-sm text-nexus-navy">
                      {t.joinUsPage.successDesc}
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="mt-6 space-y-5">
                    {error && (
                      <div className="rounded-md border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {error}
                      </div>
                    )}
                    {fields.map((field: FormFieldOption) => (
                      <div key={field.name}>
                        <label
                          htmlFor={field.name}
                          className="mb-1 block text-sm font-medium text-nexus-dark"
                        >
                          {field.label[lang]} {field.required && "*"}
                        </label>
                        {field.type === "textarea" ? (
                          <textarea
                            id={field.name}
                            required={field.required}
                            rows={4}
                            value={formData[field.name] || ""}
                            onChange={(e) => handleFieldChange(field.name, e.target.value)}
                            className="w-full rounded-md border border-nexus-navy/20 bg-nexus-gray px-4 py-2.5 text-sm text-nexus-dark outline-none transition focus:border-nexus-cyan"
                          />
                        ) : field.type === "select" ? (
                          <select
                            id={field.name}
                            required={field.required}
                            value={formData[field.name] || ""}
                            onChange={(e) => handleFieldChange(field.name, e.target.value)}
                            className="w-full rounded-md border border-nexus-navy/20 bg-nexus-gray px-4 py-2.5 text-sm text-nexus-dark outline-none transition focus:border-nexus-cyan"
                          >
                            <option value="">--</option>
                            {(lang === "fr" && field.optionsFr ? field.optionsFr : field.options)?.map((opt, i) => (
                              <option key={i} value={field.options?.[i] || opt}>
                                {opt}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <input
                            id={field.name}
                            type={field.type}
                            required={field.required}
                            value={formData[field.name] || ""}
                            onChange={(e) => handleFieldChange(field.name, e.target.value)}
                            className="w-full rounded-md border border-nexus-navy/20 bg-nexus-gray px-4 py-2.5 text-sm text-nexus-dark outline-none transition focus:border-nexus-cyan"
                          />
                        )}
                      </div>
                    ))}
                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full rounded-md bg-nexus-navy px-6 py-3 text-sm font-semibold text-nexus-white transition hover:bg-nexus-navy-deep disabled:opacity-50"
                    >
                      {submitting ? "..." : t.joinUsPage.submitBtn}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Open Opportunities — Admin-Controlled Portal */}
      {opportunitiesSectionEnabled === true && joinConfig.rolePortal.isActive && (
        <section className="relative overflow-hidden bg-nexus-gray py-16 lg:py-24">
          <span
            className="orb absolute -right-24 -top-24 h-72 w-72 rounded-full"
            style={{ background: "rgba(69,175,225,0.12)" }}
          />
          <span
            className="orb orb-delay-2 absolute -left-24 -bottom-24 h-72 w-72 rounded-full"
            style={{ background: "rgba(46,49,146,0.15)" }}
          />
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeading
              eyebrow={joinConfig.rolePortal.eyebrow[lang]}
              title={joinConfig.rolePortal.title[lang]}
              description={joinConfig.rolePortal.description[lang]}
            />

            <div className="mt-12 grid gap-8 lg:grid-cols-2">
              {/* Left: Opportunities */}
              <motion.div
                className="space-y-4"
                variants={gridContainer}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "-80px" }}
              >
                {opportunitiesLoading ? (
                  <div className="rounded-lg border border-dashed border-nexus-navy/15 bg-white p-8 text-center">
                    <p className="text-sm text-nexus-navy/50">
                      {lang === "fr" ? "Chargement des opportunités…" : "Loading opportunities…"}
                    </p>
                  </div>
                ) : usesDatabaseOpportunities ? (
                  listings.map((opp) => {
                    const isSelected = selectedOpportunityId === opp.id;
                    return (
                      <motion.button
                        key={opp.id}
                        onClick={() => handleOpportunitySelect(opp.id)}
                        onMouseMove={tiltCard}
                        variants={gridItem}
                        className={`tilt-card w-full rounded-lg border p-6 text-left ${
                          isSelected
                            ? "border-nexus-cyan bg-white shadow-md"
                            : "border-nexus-cyan/20 bg-white hover:border-nexus-cyan/50 hover:shadow-sm"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <h3 className={`text-lg font-bold ${isSelected ? "text-nexus-cyan" : "text-nexus-dark"}`}>
                            <TranslatedText>{opp.title}</TranslatedText>
                          </h3>
                          <span className="shrink-0 rounded-full bg-nexus-cyan/15 px-3 py-1 text-xs font-semibold text-nexus-cyan">
                            <TranslatedText>{opp.type.toUpperCase()}</TranslatedText>
                          </span>
                        </div>
                        <p className="mt-2 text-sm leading-relaxed text-nexus-navy">
                          <TranslatedText as="span">{opp.description}</TranslatedText>
                        </p>
                        {(opp.location || opp.deadline) && (
                          <p className="mt-3 text-xs text-nexus-navy/60">
                            {[
                              opp.location,
                              opp.deadline
                                ? `${
                                    lang === "fr" ? "Date limite" : "Deadline"
                                  }: ${formatDeadline(opp.deadline)}`
                                : null,
                            ]
                              .filter(Boolean)
                              .join(" • ")}
                          </p>
                        )}
                      </motion.button>
                    );
                  })
                ) : fallbackRoles.length > 0 ? (
                  /* Fallback only while the database returns no opportunities.
                     Never renders alongside them, so listings cannot duplicate. */
                  fallbackRoles.map((role) => {
                    const isSelected = selectedRole === role.id;
                    return (
                      <motion.button
                        key={role.id}
                        onClick={() => handleRoleSelect(role.id)}
                        onMouseMove={tiltCard}
                        variants={gridItem}
                        className={`tilt-card w-full rounded-lg border p-6 text-left ${
                          isSelected
                            ? "border-nexus-cyan bg-white shadow-md"
                            : "border-nexus-cyan/20 bg-white hover:border-nexus-cyan/50 hover:shadow-sm"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <h3 className={`text-lg font-bold ${isSelected ? "text-nexus-cyan" : "text-nexus-dark"}`}>
                            {role.title[lang]}
                          </h3>
                          <span className="shrink-0 rounded-full bg-nexus-cyan/15 px-3 py-1 text-xs font-semibold text-nexus-cyan">
                            {role.division.toUpperCase()}
                          </span>
                        </div>
                        <p className="mt-2 text-sm leading-relaxed text-nexus-navy">
                          {role.description[lang]}
                        </p>
                      </motion.button>
                    );
                  })
                ) : (
                  <div className="rounded-lg border border-dashed border-nexus-navy/15 bg-white p-8 text-center">
                    <p className="text-sm text-nexus-navy/60">
                      {lang === "fr"
                        ? "Aucune opportunité n'est ouverte pour le moment."
                        : "There are no open opportunities right now."}
                    </p>
                    <p className="mt-2 text-sm text-nexus-navy/50">
                      {opportunitiesFailed
                        ? lang === "fr"
                          ? "Nous n'avons pas pu charger les opportunités. Réessayez plus tard ou contactez-nous directement."
                          : "We couldn't load opportunities. Please try again later or contact us directly."
                        : lang === "fr"
                        ? "Consultez nos divisions pour les programmes et les façons de participer."
                        : "Check our divisions for current programmes and ways to get involved."}
                    </p>
                  </div>
                )}
              </motion.div>

              {/* Right: Application form */}
              <div className="rounded-lg border border-nexus-cyan/20 bg-white p-8">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-bold text-nexus-dark">
                      {joinConfig.rolePortal.formTitle[lang]}
                    </h3>
                    <p className="mt-1 text-sm text-nexus-navy">{selectedOpportunity ? <TranslatedText>{selectedListingTitle}</TranslatedText> : selectedListingTitle}</p>
                  </div>
                  {(selectedRole || selectedOpportunityId) && (
                    <button
                      type="button"
                      onClick={handleRoleClose}
                      aria-label={t.joinUsPage.closeForm}
                      className="shrink-0 rounded-md p-1.5 text-nexus-navy/50 transition hover:bg-nexus-gray hover:text-nexus-navy"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  )}
                </div>

                {!selectedRole && !selectedOpportunityId ? (
                  <div className="mt-8 rounded-lg border border-dashed border-nexus-navy/15 bg-nexus-gray p-8 text-center">
                    <p className="text-sm text-nexus-navy/50">
                      {lang === "fr"
                        ? "Sélectionnez un rôle à gauche pour postuler."
                        : "Select a role on the left to apply."}
                    </p>
                  </div>
                ) : roleSubmitted ? (
                  <div className="mt-8 rounded-lg border border-nexus-cyan/20 bg-nexus-gray p-8 text-center">
                    <CheckCircle2 className="mx-auto h-10 w-10 text-nexus-cyan" />
                    <h4 className="mt-4 text-lg font-bold text-nexus-dark">
                      {joinConfig.rolePortal.formSuccess[lang]}
                    </h4>
                  </div>
                ) : (
                  <form onSubmit={handleRoleSubmit} className="mt-6 space-y-4">
                    {roleError && (
                      <div className="rounded-md border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {roleError}
                      </div>
                    )}
                    <div>
                      <label htmlFor="role-name" className="mb-1 block text-sm font-medium text-nexus-dark">
                        {lang === "fr" ? "Nom Complet" : "Full Name"} *
                      </label>
                      <input
                        id="role-name"
                        required
                        value={roleFormData.fullName || ""}
                        onChange={(e) => handleRoleFieldChange("fullName", e.target.value)}
                        className="w-full rounded-md border border-nexus-navy/20 bg-nexus-gray px-4 py-2.5 text-sm text-nexus-dark outline-none transition focus:border-nexus-cyan"
                      />
                    </div>
                    <div>
                      <label htmlFor="role-email" className="mb-1 block text-sm font-medium text-nexus-dark">
                        {lang === "fr" ? "Adresse Email" : "Email Address"} *
                      </label>
                      <input
                        id="role-email"
                        type="email"
                        required
                        value={roleFormData.email || ""}
                        onChange={(e) => handleRoleFieldChange("email", e.target.value)}
                        className="w-full rounded-md border border-nexus-navy/20 bg-nexus-gray px-4 py-2.5 text-sm text-nexus-dark outline-none transition focus:border-nexus-cyan"
                      />
                    </div>
                    <div>
                      <label htmlFor="role-phone" className="mb-1 block text-sm font-medium text-nexus-dark">
                        {lang === "fr" ? "Numéro de Téléphone" : "Phone Number"}
                      </label>
                      <input
                        id="role-phone"
                        type="tel"
                        value={roleFormData.phone || ""}
                        onChange={(e) => handleRoleFieldChange("phone", e.target.value)}
                        className="w-full rounded-md border border-nexus-navy/20 bg-nexus-gray px-4 py-2.5 text-sm text-nexus-dark outline-none transition focus:border-nexus-cyan"
                      />
                    </div>
                    <div>
                      <label htmlFor="role-message" className="mb-1 block text-sm font-medium text-nexus-dark">
                        {lang === "fr" ? "Pourquoi souhaitez-vous ce rôle ?" : "Why are you interested in this role?"} *
                      </label>
                      <textarea
                        id="role-message"
                        required
                        rows={4}
                        value={roleFormData.message || ""}
                        onChange={(e) => handleRoleFieldChange("message", e.target.value)}
                        className="w-full rounded-md border border-nexus-navy/20 bg-nexus-gray px-4 py-2.5 text-sm text-nexus-dark outline-none transition focus:border-nexus-cyan"
                      />
                    </div>
                    <div>
                      <label htmlFor="role-documents" className="mb-1 block text-sm font-medium text-nexus-dark">
                        {lang === "fr"
                          ? "Certificats / justificatifs (PDF ou image, 10 Mo max)"
                          : "Certificates / supporting documents (PDF or image, 10MB max)"}
                      </label>
                      <input
                        id="role-documents"
                        type="file"
                        multiple
                        accept=".pdf,image/jpeg,image/png,image/webp"
                        onChange={(e) => handleDocumentsChange(e.target.files)}
                        className="w-full rounded-md border border-nexus-navy/20 bg-nexus-gray px-3 py-2 text-sm text-nexus-dark file:mr-3 file:rounded file:border-0 file:bg-nexus-cyan file:px-3 file:py-1 file:text-sm file:font-medium file:text-nexus-dark outline-none transition focus:border-nexus-cyan"
                      />
                      {documents.length > 0 && (
                        <ul className="mt-2 space-y-1 text-xs text-nexus-navy/70">
                          {documents.map((file, i) => (
                            <li key={`${file.name}-${i}`}>{file.name}</li>
                          ))}
                        </ul>
                      )}
                      <p className="mt-1 text-xs text-nexus-navy/50">
                        {lang === "fr" ? "Facultatif." : "Optional."}
                      </p>
                    </div>
                    <button
                      type="submit"
                      disabled={roleSubmitting}
                      className="w-full rounded-md bg-nexus-navy px-6 py-3 text-sm font-semibold text-nexus-white transition hover:bg-nexus-navy-deep disabled:opacity-50"
                    >
                      {roleSubmitting ? "..." : lang === "fr" ? "Postuler à cette offre" : "Apply for this role"}
                    </button>
                  </form>
                )}
              </div>

              {/* What happens next — below */}
              <div className="mx-auto mt-8 max-w-3xl">
                <div className="rounded-lg border border-nexus-cyan/20 bg-nexus-dark p-6 text-nexus-white">
                  <h3 className="text-lg font-bold">{t.joinUsPage.sideTitle}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-nexus-gray/80">
                    {t.joinUsPage.sideText}
                  </p>
                  <div className="mt-6 space-y-3 border-t border-nexus-cyan/10 pt-6">
                    <a
                      href={`https://wa.me/${CONTACT.whatsapp.replace(/\D/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm font-medium text-nexus-cyan-bright transition hover:text-nexus-cyan"
                    >
                      <MessageCircle className="h-4 w-4" />
                      {t.joinUsPage.whatsappAlt}
                    </a>
                    <p className="flex items-center gap-2 text-sm text-nexus-gray/80">
                      <Mail className="h-4 w-4 text-nexus-cyan-bright" />
                      {t.joinUsPage.emailAlt}{" "}
                      <a
                        href={`mailto:${CONTACT.email}`}
                        className="font-medium text-nexus-cyan-bright hover:text-nexus-cyan"
                      >
                        {CONTACT.email}
                      </a>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      <CTA
        title={t.home.ctaTitle}
        description={t.home.ctaDesc}
        primaryLabel={t.home.partnerBtn}
        primaryHref="/partner"
        secondaryLabel={t.nav.about}
        secondaryHref="/about"
        tertiaryLabel={t.home.explorePrograms}
        tertiaryHref="/academy"
      />
    </div>
  );
}

export default function JoinUsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <JoinUsContent />
    </Suspense>
  );
}
