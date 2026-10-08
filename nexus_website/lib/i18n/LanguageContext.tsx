"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { Language, translations, TranslationKeys } from "./translations";
import { prepareBrowserTranslator } from "@/lib/browser-translator";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: TranslationKeys;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("nexus-lang") as Language;
      if (saved === "en" || saved === "fr") return saved;
      if (navigator.language?.toLowerCase().startsWith("fr")) return "fr";
    }
    return "en";
  });

  const setLanguage = (lang: Language) => {
    if (lang === "fr") void prepareBrowserTranslator().catch(() => {});
    setLanguageState(lang);
    if (typeof window !== "undefined") {
      localStorage.setItem("nexus-lang", lang);
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "fr" : "en");
  };

  const t = translations[language] || translations.en;

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
