"use client";

import { useState } from "react";
import { Search, XCircle, Loader2, CheckCircle, Award } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import { useLanguage } from "@/lib/i18n/LanguageContext";

interface StudentResult {
  studentCode: string;
  fullName: string;
  programTitle: string;
  enrollmentValid: boolean;
}

type ResultState =
  | { status: "idle" }
  | { status: "checking" }
  | { status: "found"; data: StudentResult }
  | { status: "notfound" };

export default function AcademyVerify() {
  const [email, setEmail] = useState("");
  const [studentCode, setStudentCode] = useState("");
  const [result, setResult] = useState<ResultState>({ status: "idle" });
  const { language } = useLanguage();

  const t = {
    title: language === "fr" ? "Vérifier votre inscription" : "Verify Your Enrollment",
    description: language === "fr"
      ? "Entrez l'email ou le téléphone associé à votre code étudiant pour vérifier votre inscription."
      : "Enter the email or phone associated with your student code to verify your enrollment.",
    nameLabel: language === "fr" ? "Email ou téléphone" : "Email or Phone",
    studentCodeLabel: language === "fr" ? "Code étudiant (ex: NEXUS-SD-26-1234)" : "Student Code (e.g., NEXUS-SD-26-1234)",
    verifyBtn: language === "fr" ? "Vérifier" : "Verify",
    checking: language === "fr" ? "Vérification en cours..." : "Checking...",
    validResult: language === "fr" ? "Inscription vérifiée" : "Enrollment Verified",
    noResult: language === "fr" ? "Aucune inscription vérifiée" : "No Verified Enrollment Found",
    howTitle: language === "fr" ? "Comment ça marche" : "How It Works",
    howText: language === "fr"
      ? "Votre email ou téléphone sert uniquement à confirmer que le code étudiant vous appartient. Les informations de contact et de paiement ne sont pas affichées."
      : "Your email or phone is used only to confirm the student code matches your record. Contact and payment details are not shown.",
    studentName: language === "fr" ? "Nom de l'étudiant" : "Student Name",
    program: language === "fr" ? "Programme" : "Program",
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setResult({ status: "checking" });
    
    try {
      const res = await fetch(`/api/academy/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, studentCode }),
      });
      const data = await res.json();
      
      if (res.ok && data.student?.enrollmentValid === true) {
        setResult({ status: "found", data: data.student });
      } else {
        setResult({ status: "notfound" });
      }
    } catch {
      setResult({ status: "notfound" });
    }
  }

  return (
    <div className="bg-nexus-white">
      <PageHeader
        title={t.title}
        description={t.description}
        breadcrumb={[{ label: "Home", href: "/" }, { label: "Academy", href: "/academy" }, { label: language === "fr" ? "Vérifier" : "Verify" }]}
      />

      <section className="py-16 lg:py-24">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-lg border border-nexus-cyan/20 bg-nexus-gray p-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="vemail"
                  className="mb-1 block text-sm font-medium text-nexus-dark"
                >
                  {t.nameLabel} *
                </label>
                <input
                  id="vemail"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@example.com or +237..."
                  className="w-full rounded-md border border-nexus-navy/20 bg-nexus-white px-4 py-2.5 text-sm text-nexus-dark outline-none transition focus:border-nexus-cyan"
                />
              </div>
              <div>
                <label
                  htmlFor="vcode"
                  className="mb-1 block text-sm font-medium text-nexus-dark"
                >
                  {t.studentCodeLabel} *
                </label>
                <input
                  id="vcode"
                  required
                  value={studentCode}
                  onChange={(e) => setStudentCode(e.target.value.toUpperCase())}
                  placeholder="NEXUS-SD-26-1234"
                  className="w-full rounded-md border border-nexus-navy/20 bg-nexus-white px-4 py-2.5 text-sm text-nexus-dark outline-none transition focus:border-nexus-cyan"
                />
              </div>
              <button
                type="submit"
                disabled={result.status === "checking"}
                className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-nexus-navy px-6 py-3 text-sm font-semibold text-nexus-white transition hover:bg-nexus-navy-deep disabled:opacity-50"
              >
                {result.status === "checking" ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {t.checking}
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4" />
                    {t.verifyBtn}
                  </>
                )}
              </button>
            </form>

            {result.status === "checking" && (
              <p className="mt-6 text-center text-sm text-nexus-navy/70">
                {t.checking}
              </p>
            )}

            {result.status === "found" && (
              <div className="mt-6 rounded-lg border border-nexus-cyan/30 bg-nexus-white p-6 animate-fade-in">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-nexus-cyan/10 text-nexus-cyan">
                    <CheckCircle className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-nexus-dark">{t.validResult}</h3>
                    <p className="text-sm text-nexus-navy/70">{language === "fr" ? "Code étudiant" : "Student Code"}: <span className="font-mono font-bold">{result.data.studentCode}</span></p>
                  </div>
                </div>
                
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-lg bg-nexus-gray/50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-nexus-navy/50">{t.studentName}</p>
                    <p className="font-medium text-nexus-dark">{result.data.fullName}</p>
                  </div>
                  <div className="rounded-lg bg-nexus-gray/50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-nexus-navy/50">{t.program}</p>
                    <p className="font-medium text-nexus-dark">{result.data.programTitle}</p>
                  </div>
                </div>

                <div className="mt-6 p-4 rounded-lg bg-nexus-cyan/5 border border-nexus-cyan/20">
                  <p className="text-sm text-nexus-cyan-bright flex items-center gap-2">
                    <Award className="h-4 w-4" />
                    {language === "fr"
                      ? "Ce code correspond à un certificat étudiant valide. Pour toute question sur votre inscription ou votre paiement, contactez directement l'administration."
                      : "This code matches a valid student credential. For enrollment or payment questions, contact the NEXUS administration directly."}
                  </p>
                </div>
              </div>
            )}

            {result.status === "notfound" && (
              <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
                    <XCircle className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-red-800">{t.noResult}</h3>
                    <p className="mt-1 text-sm text-red-700">
                      {language === "fr"
                        ? "Aucune inscription ne correspond à ces informations. Vérifiez votre code ou contactez l'administration."
                        : "No enrollment matches these details. Check your code or contact administration."}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="mt-8 rounded-lg border border-nexus-cyan/20 bg-nexus-dark p-6 text-center">
            <h3 className="text-sm font-semibold text-nexus-white">{t.howTitle}</h3>
            <p className="mt-2 text-sm leading-relaxed text-nexus-gray/75">{t.howText}</p>
          </div>
        </div>
      </section>
    </div>
  );
}
