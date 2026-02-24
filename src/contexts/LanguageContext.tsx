"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import {
  DEFAULT_LANGUAGE,
  SUPPORTED_LANGUAGES,
  SupportedLanguageCode,
} from "@/constants/app.constants";

const STORAGE_KEY = "preferred-language";

interface LanguageContextValue {
  language: SupportedLanguageCode;
  setLanguage: (lang: SupportedLanguageCode) => void;
  isVietnamese: boolean;
}

const LanguageContext = createContext<LanguageContextValue | undefined>(
  undefined
);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<SupportedLanguageCode>(
    DEFAULT_LANGUAGE as SupportedLanguageCode
  );

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (
      stored &&
      SUPPORTED_LANGUAGES.some((l) => l.code === stored)
    ) {
      setLanguageState(stored as SupportedLanguageCode);
    }
  }, []);

  const setLanguage = useCallback((lang: SupportedLanguageCode) => {
    setLanguageState(lang);
    localStorage.setItem(STORAGE_KEY, lang);
  }, []);

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        isVietnamese: language === "vi",
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return context;
}
