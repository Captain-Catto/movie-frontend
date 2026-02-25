"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import { SUPPORTED_LANGUAGES } from "@/constants/app.constants";

export default function LanguageSelector() {
  const { language, setLanguage } = useLanguage();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLang = SUPPORTED_LANGUAGES.find((l) => l.code === language);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} className="relative flex-shrink-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 text-white/80 hover:text-white transition-colors text-sm px-2 py-1.5 rounded hover:bg-white/10 cursor-pointer"
        aria-label="Select language"
      >
        <span className="text-base">{currentLang?.flag}</span>
        <span className="hidden sm:inline text-xs">
          {(currentLang?.code.split("-")[0] || "").toUpperCase()}
        </span>
        <svg
          className={`w-3 h-3 transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1 bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl overflow-hidden z-50 min-w-[140px]">
          {SUPPORTED_LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => {
                if (language === lang.code) {
                  setIsOpen(false);
                  return;
                }

                setLanguage(lang.code);
                setIsOpen(false);
                router.refresh();
              }}
              className={`w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors cursor-pointer ${
                language === lang.code
                  ? "bg-red-600/20 text-red-400"
                  : "text-white/80 hover:bg-white/10 hover:text-white"
              }`}
            >
              <span>{lang.flag}</span>
              <span>{lang.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
