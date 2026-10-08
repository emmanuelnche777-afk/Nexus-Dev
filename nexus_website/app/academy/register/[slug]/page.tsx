"use client";
import PageHeader from "@/components/PageHeader";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Check,
  ArrowRight,
  ShieldCheck,
  Phone,
  Mail,
  User,
  MapPin,
  Copy,
  CheckCircle,
  MessageCircle,
  Loader2,
} from "lucide-react";
import { useParams } from "next/navigation";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import TranslatedText from "@/components/TranslatedText";

interface Program {
  id: string;
  slug: string;
  title: string;
  durationWeeks: number;
  price: number;
  currency: string;
  curriculumModules?: Array<{
    title: string;
    weeks: number;
    topics: string[];
    project?: string;
  }>;
}

interface Cohort {
  id: string;
  name: string;
  period: string;
  status: string;
  applicationDeadline: string;
  maxStudents: number;
  currentStudents: number;
  price: number;
  currency: string;
}

function PrivateEnrollmentRequestForm({ program, language }: { program: Program; language: string }) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [requestId, setRequestId] = useState("");
  const [form, setForm] = useState({ fullName: "", email: "", phone: "", preferredFormat: "one_to_one", preferredSchedule: "", message: "" });
  const isFrench = language === "fr";

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const response = await fetch("/api/academy/private-enrollment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, programSlug: program.slug }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Unable to send your request.");
      setRequestId(result.requestId);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to send your request.");
    } finally {
      setSubmitting(false);
    }
  }

  if (requestId) return (
    <div className="rounded-2xl border border-green-200 bg-green-50 p-6" role="status">
      <h3 className="text-lg font-bold text-green-900">{isFrench ? "Demande envoyée" : "Request sent"}</h3>
      <p className="mt-2 text-sm text-green-800">{isFrench ? "L’équipe de l’Académie examinera votre demande et vous contactera pour confirmer les disponibilités, le calendrier et les frais. Vous n’êtes pas encore inscrit et aucun paiement n’a été demandé." : "The Academy team will review your request and contact you to confirm availability, schedule, and fees. You are not enrolled yet, and no payment has been requested."}</p>
      <p className="mt-3 text-xs text-green-800">{isFrench ? "Référence de demande" : "Request reference"}: <span className="font-mono font-semibold">{requestId}</span></p>
    </div>
  );

  const inputClass = "w-full rounded-lg border border-nexus-cyan/20 bg-white px-4 py-2.5 text-sm text-nexus-dark outline-none focus:border-nexus-cyan";
  return (
    <form onSubmit={submit} className="space-y-5 rounded-2xl border border-nexus-cyan/15 bg-white p-6">
      <div>
        <h3 className="text-lg font-bold text-nexus-dark">{isFrench ? "Demander un accompagnement privé" : "Request private training"}</h3>
        <p className="mt-1 text-sm text-nexus-navy/65">{isFrench ? "Aucune cohorte n’accepte actuellement les candidatures. Envoyez une demande pour une formation individuelle ou en petit groupe." : "There is no open cohort accepting applications right now. Send a request for one-to-one or private group training."}</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-medium text-nexus-dark">{isFrench ? "Nom complet *" : "Full name *"}<input className={`${inputClass} mt-1.5`} required maxLength={120} autoComplete="name" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} /></label>
        <label className="text-sm font-medium text-nexus-dark">Email *<input className={`${inputClass} mt-1.5`} required type="email" maxLength={254} autoComplete="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label>
        <label className="text-sm font-medium text-nexus-dark">{isFrench ? "Téléphone *" : "Phone *"}<input className={`${inputClass} mt-1.5`} required type="tel" maxLength={40} autoComplete="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></label>
        <label className="text-sm font-medium text-nexus-dark">{isFrench ? "Format souhaité *" : "Training format *"}<select className={`${inputClass} mt-1.5`} value={form.preferredFormat} onChange={(e) => setForm({ ...form, preferredFormat: e.target.value })}><option value="one_to_one">{isFrench ? "Individuel (1 à 1)" : "One-to-one"}</option><option value="private_group">{isFrench ? "Petit groupe privé" : "Private small group"}</option></select></label>
      </div>
      <label className="block text-sm font-medium text-nexus-dark">{isFrench ? "Disponibilités ou calendrier souhaité *" : "Preferred schedule or availability *"}<input className={`${inputClass} mt-1.5`} required maxLength={200} placeholder={isFrench ? "Ex. soirs en semaine, à partir de novembre" : "e.g. weekday evenings, starting in November"} value={form.preferredSchedule} onChange={(e) => setForm({ ...form, preferredSchedule: e.target.value })} /></label>
      <label className="block text-sm font-medium text-nexus-dark">{isFrench ? "Message (facultatif)" : "Message (optional)"}<textarea className={`${inputClass} mt-1.5`} rows={4} maxLength={2000} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} /></label>
      <p className="text-xs leading-relaxed text-nexus-navy/60">{isFrench ? "Ceci est une demande de renseignements, pas une inscription confirmée. L’équipe confirmera le calendrier et les frais avant toute inscription ou paiement." : "This is an inquiry, not a confirmed enrollment. The team will confirm the schedule and fees before any enrollment or payment."}</p>
      {error && <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
      <button type="submit" disabled={submitting} className="w-full rounded-lg bg-nexus-cyan px-6 py-3.5 text-sm font-bold text-nexus-dark transition hover:bg-nexus-cyan-bright disabled:opacity-50">{submitting ? (isFrench ? "Envoi…" : "Sending…") : (isFrench ? "Envoyer la demande" : "Send private training request")}</button>
    </form>
  );
}

export default function RegisterProgramPage() {
  const params = useParams<{ slug: string }>();
  const { language } = useLanguage();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [registrationCode, setRegistrationCode] = useState<string | null>(null);
  const [enrollmentAmount, setEnrollmentAmount] = useState<number | null>(null);
  const [enrollmentCurrency, setEnrollmentCurrency] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"MTN" | "ORANGE">("MTN");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    city: "",
  });
  const [settings, setSettings] = useState({
    mtnNumber: "+237673746047",
    orangeNumber: "",
    phone: "+237653137081",
  });
  const [program, setProgram] = useState<Program | null>(null);
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [cohortsLoading, setCohortsLoading] = useState(true);
  const [cohortsLoadFailed, setCohortsLoadFailed] = useState(false);
  const [selectedCohortId, setSelectedCohortId] = useState("");
  const [loading, setLoading] = useState(true);

   useEffect(() => {
     if (!params.slug) return;
     fetch(`/api/programs/${params.slug}`)
       .then((res) => res.json())
       .then((data) => setProgram(data.program || null))
       .catch(() => {})
       .finally(() => setLoading(false));
     fetch("/api/settings")
       .then((res) => res.json())
       .then((data) => {
         setSettings({
           mtnNumber: data.settings?.paymentInfo?.mtnNumber || "+237673746047",
           orangeNumber: data.settings?.paymentInfo?.orangeNumber || "",
           phone: data.settings?.phone || "+237653137081",
         });
       })
       .catch(() => {});
     fetch(`/api/academy/cohorts?status=open&program=${encodeURIComponent(params.slug)}`)
       .then((res) => {
         if (!res.ok) throw new Error("Failed to load cohorts");
         return res.json();
       })
       .then((data) => {
         const now = new Date();
         const available = (data.cohorts || []).filter((cohort: Cohort) => {
           const deadline = new Date(cohort.applicationDeadline);
           deadline.setUTCHours(23, 59, 59, 999);
           return deadline >= now && cohort.currentStudents < cohort.maxStudents;
         });
         setCohorts(available);
         setCohortsLoadFailed(false);
         const requestedId = new URLSearchParams(window.location.search).get("cohort");
         setSelectedCohortId(available.some((cohort: Cohort) => cohort.id === requestedId)
           ? requestedId!
           : available.length === 1 ? available[0].id : "");
       })
       .catch(() => {
         setCohorts([]);
         setCohortsLoadFailed(true);
       })
       .finally(() => setCohortsLoading(false));
   }, [params.slug]);

   if (!program && loading) {
    return (
      <div className="bg-nexus-white min-h-screen">
        <PageHeader title="Loading..." description="Loading program details..." />
        <div className="py-16 text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-nexus-cyan" />
        </div>
      </div>
    );
  }

   if (!program) {
    return (
      <div className="bg-nexus-white min-h-screen">
        <PageHeader
          title={language === "fr" ? "Programme non trouvé" : "Program Not Found"}
          description={language === "fr" ? "Le programme que vous recherchez n'existe pas." : "The program you are looking for does not exist."}
          breadcrumb={[{ label: "Home", href: "/" }, { label: "Academy", href: "/academy" }]}
        />
        <div className="py-16 text-center">
          <Link href="/academy/programs" className="inline-flex items-center gap-2 text-nexus-cyan hover:gap-3 transition">
            <ArrowRight className="h-4 w-4" />
            {language === "fr" ? "Voir tous les programmes" : "Back to All Programs"}
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const response = await fetch("/api/join/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
       body: JSON.stringify({
           fullName: formData.name,
           email: formData.email,
           phone: formData.phone,
           city: formData.city,
           programSlug: program.slug,
           pathway: program.slug,
           cohortId: selectedCohortId,
           paymentProvider: paymentMethod,
         }),
      });
      const result = await response.json();

      if (!response.ok || !result.ok) {
        throw new Error(result.error || "Unable to submit registration");
      }

      setRegistrationCode(result.applicationID);
      setEnrollmentAmount(result.amount);
      setEnrollmentCurrency(result.currency || program.currency);
      setShowSuccess(true);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Unable to submit registration");
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyCode = () => {
    if (registrationCode) {
      navigator.clipboard.writeText(registrationCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
};

  const selectedCohort = cohorts.find((cohort) => cohort.id === selectedCohortId) || null;

  const includedItems = [
    language === "fr" ? "Sessions en direct 3×/semaine" : "Live sessions 3×/week",
    language === "fr" ? "Mentorat individuel" : "One-on-one mentorship",
    `${(program?.curriculumModules ?? []).length} ${language === "fr" ? "modules pratiques" : "practical modules"}`,
    language === "fr" ? "Projets portfolio réels" : "Real portfolio projects",
    language === "fr" ? "Certificat vérifiable" : "Verifiable certificate",
    language === "fr" ? "Soutien pour l'emploi" : "Job placement support",
  ];

  if (showSuccess && registrationCode) {
    return (
      <div className="bg-nexus-white">
        <PageHeader
          title={language === "fr" ? "Inscription enregistrée" : "Registration Received"}
          description={language === "fr" ? "Veuillez effectuer le paiement pour confirmer." : "Please complete payment to confirm."}
          breadcrumb={[{ label: "Home", href: "/" }, { label: "Academy", href: "/academy" }, { label: <TranslatedText>{program?.title || ""}</TranslatedText>, href: `/academy/programs/${params.slug}` }]}
        />
        <section className="py-12 lg:py-20">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="rounded-2xl border border-nexus-cyan/20 bg-nexus-cyan/5 p-8 text-center mb-8">
              <CheckCircle className="mx-auto h-12 w-12 text-nexus-cyan mb-4" />
              <h2 className="text-2xl font-bold text-nexus-dark mb-2">
                {language === "fr" ? "Votre inscription a été enregistrée !" : "Your registration has been recorded!"}
              </h2>
              <p className="text-nexus-navy/70">
                {language === "fr"
                  ? "Veuillez effectuer le paiement ci-dessous pour confirmer votre place."
                  : "Please complete the payment below to confirm your spot."}
              </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-2xl border border-nexus-cyan/15 bg-nexus-white p-6">
                <h3 className="text-lg font-bold text-nexus-dark mb-4">
                  {language === "fr" ? "Instructions de paiement" : "Payment Instructions"}
                </h3>

                <div className="rounded-xl bg-nexus-gray p-4 mb-4">
                  <p className="text-sm font-medium text-nexus-navy/60 mb-1">
                    {language === "fr" ? "Montant à payer" : "Amount to pay"}
                  </p>
                  <p className="text-3xl font-extrabold text-nexus-dark">
                    {(enrollmentAmount ?? program?.price).toLocaleString()} <span className="text-lg text-nexus-navy/50">{enrollmentCurrency ?? program?.currency}</span>
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-semibold text-nexus-dark mb-2">
                      {language === "fr" ? "Envoyer le paiement à :" : "Send payment to:"}
                    </p>
                     {paymentMethod === "MTN" ? (
                      <div className="flex items-center gap-3 rounded-lg border border-nexus-cyan/15 bg-nexus-gray p-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-yellow-400/20 text-yellow-600 font-bold text-sm">MTN</div>
                        <div>
                          <p className="font-bold text-nexus-dark">MTN Mobile Money</p>
                          <p className="text-sm text-nexus-navy/60">{settings.mtnNumber}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3 rounded-lg border border-nexus-cyan/15 bg-nexus-gray p-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-500/20 text-orange-600 font-bold text-sm">OM</div>
                        <div>
                          <p className="font-bold text-nexus-dark">Orange Money</p>
                          <p className="text-sm text-nexus-navy/60">{settings.orangeNumber}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="rounded-lg border border-nexus-cyan/15 bg-nexus-gray p-4">
                    <p className="text-sm font-semibold text-nexus-dark mb-2">
                      {language === "fr" ? "Référence de paiement" : "Payment reference"}
                    </p>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 rounded bg-white px-3 py-2 text-sm font-mono font-bold text-nexus-cyan border border-nexus-cyan/15">
                        {registrationCode}
                      </code>
                      <button
                        type="button"
                        onClick={copyCode}
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-nexus-cyan/20 text-nexus-cyan transition hover:bg-nexus-cyan/10"
                      >
                        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </button>
                    </div>
                    <p className="mt-2 text-xs text-nexus-navy/50">
                      {language === "fr"
                        ? "Incluez ce code dans la référence du paiement"
                        : "Include this code in the payment reference"}
                    </p>
                  </div>

                  <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                    <h4 className="text-sm font-semibold text-amber-900 mb-1">
                      {language === "fr" ? "Paiement en attente de vérification" : "Payment awaiting verification"}
                    </h4>
                    <p className="text-sm text-amber-800">
                      {language === "fr"
                        ? "Votre inscription est enregistrée. Après avoir payé et envoyé votre preuve avec la référence ci-dessus, notre équipe vérifiera le paiement manuellement."
                        : "Your application is recorded. After paying and sending your proof with the reference above, our team will verify the payment manually."}
                    </p>
                  </div>

                  <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3">
                    <p className="text-xs text-amber-800 leading-relaxed">
                      {language === "fr"
                        ? "Important : Sans référence valide, nous ne pourrons pas associer votre paiement à votre inscription."
                        : "Important: Without a valid reference, we cannot link your payment to your registration."}
                    </p>
                  </div>
                </div>

                <a
                  href={`https://wa.me/${settings.phone?.replace(/[^0-9]/g, "") || "237653137081"}?text=${encodeURIComponent(
                    `${language === "fr" ? "Bonjour, voici la preuve de paiement pour l'inscription" : "Hello, here is the payment proof for registration"}: ${registrationCode} - ${program?.title || ""}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-green-700"
                >
                  <MessageCircle className="h-4 w-4" />
                  {language === "fr" ? "Envoyer la preuve via WhatsApp" : "Send proof via WhatsApp"}
                </a>
              </div>

              <div className="rounded-2xl border border-nexus-cyan/15 bg-nexus-white p-6">
                <h3 className="text-lg font-bold text-nexus-dark mb-4">
                  {language === "fr" ? "Détails de l'inscription" : "Registration Details"}
                </h3>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-between py-2 border-b border-nexus-cyan/10">
                    <span className="text-sm text-nexus-navy/60">{language === "fr" ? "Code d'inscription" : "Registration Code"}</span>
                    <span className="font-mono font-bold text-nexus-cyan">{registrationCode}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-nexus-cyan/10">
                    <span className="text-sm text-nexus-navy/60">{language === "fr" ? "Programme" : "Program"}</span>
                    <span className="font-semibold text-nexus-dark"><TranslatedText>{program?.title || ""}</TranslatedText></span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-nexus-cyan/10">
                    <span className="text-sm text-nexus-navy/60">{language === "fr" ? "Cohorte" : "Cohort"}</span>
                    <span className="font-semibold text-nexus-dark">{selectedCohort?.name || "—"}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-nexus-cyan/10">
                    <span className="text-sm text-nexus-navy/60">{language === "fr" ? "Durée" : "Duration"}</span>
                    <span className="font-semibold text-nexus-dark">{program?.durationWeeks} {language === "fr" ? "semaines" : "weeks"}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-nexus-cyan/10">
                    <span className="text-sm text-nexus-navy/60">{language === "fr" ? "Nom" : "Name"}</span>
                    <span className="font-semibold text-nexus-dark">{formData.name}</span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm text-nexus-navy/60">{language === "fr" ? "Email" : "Email"}</span>
                    <span className="font-semibold text-nexus-dark">{formData.email}</span>
                  </div>
                </div>

                <div className="rounded-xl bg-nexus-gray p-4">
                  <h4 className="text-sm font-semibold text-nexus-dark mb-2">
                    {language === "fr" ? "Prochaines étapes" : "Next steps"}
                  </h4>
                  <ol className="space-y-2 text-sm text-nexus-navy/70">
                    <li className="flex gap-2">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-nexus-cyan/20 text-[10px] font-bold text-nexus-cyan">1</span>
                      {language === "fr" ? "Effectuez le paiement via Mobile Money" : "Make payment via Mobile Money"}
                    </li>
                    <li className="flex gap-2">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-nexus-cyan/20 text-[10px] font-bold text-nexus-cyan">2</span>
                      {language === "fr" ? "Envoyez la preuve de paiement par WhatsApp" : "Send payment proof via WhatsApp"}
                    </li>
                    <li className="flex gap-2">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-nexus-cyan/20 text-[10px] font-bold text-nexus-cyan">3</span>
                      {language === "fr" ? "Vous recevrez une confirmation par email" : "You'll receive confirmation by email"}
                    </li>
                  </ol>
                </div>
              </div>
            </div>

            <div className="mt-8 text-center">
              <Link href="/academy" className="text-sm text-nexus-cyan hover:underline">
                {language === "fr" ? "Retour à l'Académie" : "Back to Academy"}
              </Link>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="bg-nexus-white">
      <PageHeader
        title={<>{language === "fr" ? "S'inscrire à " : "Enroll in "}<TranslatedText>{program?.title || ""}</TranslatedText></>}
        description={language === "fr" ? `Complétez le formulaire ci-dessous pour vous inscrire.` : `Complete the form below to enroll in this program.`}
        breadcrumb={[{ label: "Home", href: "/" }, { label: "Academy", href: "/academy" }, { label: <TranslatedText>{program?.title || ""}</TranslatedText>, href: `/academy/programs/${params.slug}` }]}
      />

      <section className="py-12 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[1fr_380px] items-start">
            {cohortsLoading ? (
              <div className="rounded-2xl border border-nexus-cyan/15 p-6 text-sm text-nexus-navy/65" role="status">{language === "fr" ? "Vérification des cohortes disponibles…" : "Checking available cohorts…"}</div>
            ) : cohortsLoadFailed ? (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6" role="alert">
                <h3 className="font-semibold text-amber-900">{language === "fr" ? "Impossible de vérifier les cohortes" : "Could not check available cohorts"}</h3>
                <p className="mt-1 text-sm text-amber-800">{language === "fr" ? "Veuillez actualiser la page avant d’envoyer une demande." : "Please refresh the page before sending a request."}</p>
                <button type="button" onClick={() => window.location.reload()} className="mt-3 rounded-lg border border-amber-300 px-4 py-2 text-sm font-semibold text-amber-900">{language === "fr" ? "Actualiser" : "Refresh page"}</button>
              </div>
            ) : cohorts.length === 0 ? (
              <PrivateEnrollmentRequestForm program={program} language={language} />
            ) : <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-nexus-dark mb-1">
                  {language === "fr" ? "Informations personnelles" : "Personal Information"}
                </h3>
                <p className="text-sm text-nexus-navy/60">
                  {language === "fr" ? "Tous les champs marqués d'un * sont obligatoires." : "Fields marked with * are required."}
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-nexus-dark">
                    {language === "fr" ? "Nom complet *" : "Full Name *"}
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-nexus-navy/40" />
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full rounded-lg border border-nexus-cyan/20 bg-nexus-white pl-10 pr-4 py-2.5 text-sm text-nexus-dark outline-none transition focus:border-nexus-cyan"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-nexus-dark">
                    {language === "fr" ? "Adresse email *" : "Email Address *"}
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-nexus-navy/40" />
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full rounded-lg border border-nexus-cyan/20 bg-nexus-white pl-10 pr-4 py-2.5 text-sm text-nexus-dark outline-none transition focus:border-nexus-cyan"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-nexus-dark">
                  {language === "fr" ? "Cohorte *" : "Cohort *"}
                </label>
                {cohorts.length > 0 ? (
                  <select required value={selectedCohortId} onChange={(event) => setSelectedCohortId(event.target.value)}
                    className="w-full rounded-lg border border-nexus-cyan/20 bg-nexus-white px-4 py-2.5 text-sm text-nexus-dark outline-none focus:border-nexus-cyan">
                    <option value="">{language === "fr" ? "Choisissez une cohorte" : "Choose a cohort"}</option>
                    {cohorts.map((cohort) => <option key={cohort.id} value={cohort.id} data-browser-translate="true">{cohort.name} · {cohort.period}</option>)}
                  </select>
                ) : (
                  <p className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                    {language === "fr" ? "Aucune cohorte n'accepte actuellement les candidatures." : "No cohort is currently accepting applications."}
                  </p>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-nexus-dark">
                    {language === "fr" ? "Numéro de téléphone *" : "Phone Number *"}
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-nexus-navy/40" />
                    <input
                      type="tel"
                      required
                      placeholder="6XX XXX XXX"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full rounded-lg border border-nexus-cyan/20 bg-nexus-white pl-10 pr-4 py-2.5 text-sm text-nexus-dark outline-none transition focus:border-nexus-cyan"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-nexus-dark">
                    {language === "fr" ? "Ville *" : "City *"}
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-nexus-navy/40" />
                    <input
                      type="text"
                      required
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full rounded-lg border border-nexus-cyan/20 bg-nexus-white pl-10 pr-4 py-2.5 text-sm text-nexus-dark outline-none transition focus:border-nexus-cyan"
                    />
                  </div>
                </div>
              </div>

              <div className="border-t border-nexus-cyan/15 pt-6">
                <div className="flex items-center gap-2 mb-4">
                  <ShieldCheck className="h-5 w-5 text-nexus-cyan" />
                  <h4 className="font-bold text-nexus-dark">
                    {language === "fr" ? "Mode de paiement" : "Payment Method"}
                  </h4>
                </div>

                <div className="grid grid-cols-2 gap-3">
                   {[
                     { id: "MTN" as const, label: "MTN Mobile Money", color: "yellow" },
                     { id: "ORANGE" as const, label: "Orange Money", color: "orange" },
                   ].map((method) => (
                    <label
                      key={method.id}
                      className={`flex cursor-pointer items-center gap-3 rounded-lg border p-4 transition-all ${
                        paymentMethod === method.id
                          ? "border-nexus-cyan bg-nexus-cyan/5"
                          : "border-nexus-cyan/15 bg-nexus-white hover:border-nexus-cyan/40"
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={method.id}
                        checked={paymentMethod === method.id}
                        onChange={() => setPaymentMethod(method.id)}
                        className="sr-only"
                      />
                      <span
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                          paymentMethod === method.id ? "border-nexus-cyan bg-nexus-cyan" : "border-nexus-navy/30"
                        }`}
                      >
                        {paymentMethod === method.id && <span className="h-2 w-2 rounded-full bg-white" />}
                      </span>
                      <span className={`flex h-8 w-8 items-center justify-center rounded font-bold text-xs ${
                        method.color === "yellow" ? "bg-yellow-400/20 text-yellow-600" : "bg-orange-500/20 text-orange-600"
                      }`}>
                        {method.id === "MTN" ? "MTN" : "OM"}
                      </span>
                      <span className="text-sm font-medium text-nexus-dark">{method.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="border-t border-nexus-cyan/15 pt-6">
                <label className="flex cursor-pointer items-start gap-3">
                  <input type="checkbox" required className="mt-0.5 h-4 w-4 rounded border-nexus-navy/30 text-nexus-cyan accent-nexus-cyan" />
                  <span className="text-sm text-nexus-navy/70 leading-relaxed">
                    {language === "fr"
                      ? "J'ai lu et accepté les termes et conditions de l'Académie NEXUS."
                      : "I have read and agree to the NEXUS Academy Terms and Conditions."}
                  </span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !selectedCohortId}
                className="w-full rounded-lg bg-nexus-cyan px-6 py-3.5 text-sm font-bold text-nexus-dark transition hover:bg-nexus-cyan-bright disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting
                  ? language === "fr" ? "Traitement..." : "Processing..."
                  : language === "fr" ? "Continuer vers les instructions de paiement" : "Proceed to Payment Instructions"}
              </button>

              <p className="text-center text-xs text-nexus-navy/45">
                {language === "fr"
                  ? "Vous recevrez les instructions de paiement après soumission"
                  : "You'll receive payment instructions after submission"}
              </p>

              {submitError && (
                <div className="rounded-lg bg-red-50 px-4 py-3 text-center text-sm text-red-700" role="alert">
                  {submitError}
                </div>
              )}
            </form>}

            <div className="sticky top-24">
              <div className="rounded-2xl border border-nexus-cyan/15 bg-nexus-gray overflow-hidden">
                <div className="bg-gradient-to-br from-nexus-navy to-nexus-dark p-6 text-center">
                  <h3 className="text-xl font-bold text-white"><TranslatedText>{program?.title || ""}</TranslatedText></h3>
                  <p className="mt-1 text-sm text-nexus-gray/70">
                    {program?.durationWeeks} {language === "fr" ? "semaines" : "weeks"} · {language === "fr" ? "Certificate" : "Certificate"}
                  </p>
                </div>

                <div className="p-6">
                  <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-nexus-navy/50">
                    {language === "fr" ? "Ce qui est inclus" : "What's Included"}
                  </h4>
                  <ul className="space-y-2.5 mb-6">
                    {includedItems.map((item) => (
                      <li key={item} className="flex items-start gap-2.5 text-sm text-nexus-navy/75">
                        <Check className="h-4 w-4 mt-0.5 shrink-0 text-nexus-cyan" />
                        {item}
                      </li>
                    ))}
                  </ul>

                  <div className="border-t border-nexus-cyan/10 pt-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-nexus-navy/60">
                        {cohorts.length > 0
                          ? language === "fr" ? "Frais de scolarité" : "Tuition Fee"
                          : language === "fr" ? "Tarif" : "Price"}
                      </span>
                      {cohorts.length > 0 ? (
                        <span className="text-2xl font-extrabold text-nexus-dark">
                          {(selectedCohort?.price ?? program?.price ?? 0).toLocaleString()} <span className="text-sm font-medium text-nexus-navy/50">{selectedCohort?.currency ?? program?.currency}</span>
                        </span>
                      ) : <span className="text-right text-sm font-semibold text-nexus-dark">{language === "fr" ? "À confirmer" : "To be confirmed"}</span>}
                    </div>
                  </div>

                  {cohorts.length > 0 ? <div className="mt-5 rounded-lg bg-nexus-cyan/5 px-4 py-3">
                    <p className="text-xs text-center text-nexus-navy/55">{language === "fr" ? "Paiement par Mobile Money (MTN ou Orange)" : "Payment via Mobile Money (MTN or Orange)"}</p>
                  </div> : <p className="mt-4 text-center text-xs leading-relaxed text-nexus-navy/55">{language === "fr" ? "Le tarif et les modalités seront confirmés par l’équipe après examen de votre demande." : "The Academy team will confirm pricing and arrangements after reviewing your request."}</p>}
                </div>
              </div>

              <div className="mt-4 text-center">
                <Link href="/academy/ask-question" className="text-xs text-nexus-cyan hover:underline">
                  {language === "fr" ? "Une question ? Contactez-nous" : "Have a question? Contact us"}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
