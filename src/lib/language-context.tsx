"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Language, translations, languageNames } from "./translations";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (section: string, key: string) => string;
  languageNames: typeof languageNames;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");

  useEffect(() => {
    // Load saved language preference
    const savedLang = localStorage.getItem("preferred-language") as Language;
    if (savedLang && ["en", "hi", "mr"].includes(savedLang)) {
      setLanguageState(savedLang);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("preferred-language", lang);
  };

  const t = (section: string, key: string): string => {
    try {
      const sectionData = translations[section as keyof typeof translations];
      if (sectionData && typeof sectionData === "object") {
        const keyData = sectionData[key as keyof typeof sectionData];
        if (keyData && typeof keyData === "object" && language in keyData) {
          return (keyData as Record<Language, string>)[language];
        }
      }
      return key; // Fallback to key if translation not found
    } catch {
      return key;
    }
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, languageNames }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
