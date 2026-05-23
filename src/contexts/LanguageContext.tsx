"use client";

import {
  createContext,
  use,
  useState,
  useCallback,
  useMemo,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";
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

interface LanguageProviderProps {
  children: ReactNode;
  initialLanguage: SupportedLanguageCode;
}

const LanguageContext = createContext<LanguageContextValue | undefined>(
  undefined
);

export function LanguageProvider({ children, initialLanguage }: LanguageProviderProps) {
  const { refresh } = useRouter();
  // Fallback: when the server had no cookie (initialLanguage === default),
  // recover the stored preference from localStorage (e.g. after cookie was cleared).
  const [language, setLanguageState] = useState<SupportedLanguageCode>(() => {
    if (initialLanguage !== DEFAULT_LANGUAGE) return initialLanguage;
    if (typeof window === "undefined") return initialLanguage;
    const stored = localStorage.getItem(STORAGE_KEY);
    const normalized = stored === "vi" ? "vi-VN" : stored;
    if (normalized && SUPPORTED_LANGUAGES.some((l) => l.code === normalized)) {
      if (stored === "vi") localStorage.setItem(STORAGE_KEY, "vi-VN");
      setLanguageCookie(normalized as SupportedLanguageCode);
      return normalized as SupportedLanguageCode;
    }
    return initialLanguage;
  });

  const setLanguage = useCallback(
    (lang: SupportedLanguageCode) => {
      setLanguageState(lang);
      localStorage.setItem(STORAGE_KEY, lang);
      setLanguageCookie(lang);
      // Re-run server components so they fetch data in the new language.
      refresh();
    },
    [refresh]
  );

  const contextValue = useMemo(
    () => ({
      language,
      setLanguage,
      isVietnamese: language.startsWith("vi"),
    }),
    [language, setLanguage]
  );

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  const context = use(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return context;
}
