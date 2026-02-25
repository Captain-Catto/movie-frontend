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
const COOKIE_KEY = "preferred-language";
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365; // 1 year

function setLanguageCookie(lang: SupportedLanguageCode) {
  document.cookie = `${COOKIE_KEY}=${encodeURIComponent(
    lang
  )}; path=/; max-age=${COOKIE_MAX_AGE_SECONDS}; samesite=lax`;
}

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
    const normalizedStored =
      stored === "vi" ? "vi-VN" : stored;
    if (
      normalizedStored &&
      SUPPORTED_LANGUAGES.some((l) => l.code === normalizedStored)
    ) {
      setLanguageState(normalizedStored as SupportedLanguageCode);
      setLanguageCookie(normalizedStored as SupportedLanguageCode);
      if (stored === "vi") {
        localStorage.setItem(STORAGE_KEY, "vi-VN");
      }
      return;
    }

    setLanguageCookie(DEFAULT_LANGUAGE as SupportedLanguageCode);
  }, []);

  const setLanguage = useCallback((lang: SupportedLanguageCode) => {
    setLanguageState(lang);
    localStorage.setItem(STORAGE_KEY, lang);
    setLanguageCookie(lang);
  }, []);

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        isVietnamese: language.startsWith("vi"),
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
