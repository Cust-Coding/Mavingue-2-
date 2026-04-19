"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import ptTranslations from "./pt.json";
import enTranslations from "./en.json";

type Translations = typeof ptTranslations;

const translations: Record<string, Translations> = {
  pt: ptTranslations,
  en: enTranslations,
};

interface I18nContextType {
  locale: string;
  setLocale: (locale: string) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

const LOCALE_KEY = "mavingue_locale";
const DEFAULT_LOCALE = "pt";

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState(DEFAULT_LOCALE);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem(LOCALE_KEY);
    if (stored && (stored === "pt" || stored === "en")) {
      setLocaleState(stored);
    }
  }, []);

  const setLocale = (newLocale: string) => {
    if (newLocale === "pt" || newLocale === "en") {
      setLocaleState(newLocale);
      localStorage.setItem(LOCALE_KEY, newLocale);
    }
  };

  const t = (key: string, params?: Record<string, string | number>): string => {
    const keys = key.split(".");
    let value: unknown = translations[locale];
    
    for (const k of keys) {
      if (value && typeof value === "object" && k in value) {
        value = (value as Record<string, unknown>)[k];
      } else {
        return key;
      }
    }
    
    if (Array.isArray(value)) {
      return value as unknown as string;
    }
    
    let result = typeof value === "string" ? value : key;
    
    // Replace {{param}} placeholders
    if (params && typeof result === "string") {
      for (const [paramKey, paramValue] of Object.entries(params)) {
        result = result.replace(new RegExp(`{{${paramKey}}}`, "g"), String(paramValue));
      }
    }
    
    return result;
  };

  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used within an I18nProvider");
  }
  return context;
}