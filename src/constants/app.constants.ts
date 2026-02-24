// Centralized application constants
export const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p";
export const TMDB_POSTER_SIZE = "w500";
export const TMDB_BACKDROP_SIZE = "w1280";
export const TMDB_ORIGINAL_SIZE = "original";

export const FALLBACK_POSTER = "/images/no-poster.svg";
export const FALLBACK_BACKDROP = FALLBACK_POSTER;
export const FALLBACK_PROFILE = "/images/no-avatar.svg";

export const DEFAULT_LANGUAGE = "en-US";

export const SUPPORTED_LANGUAGES = [
  { code: "en-US", label: "English", flag: "🇺🇸" },
  { code: "vi-VN", label: "Tiếng Việt", flag: "🇻🇳" },
] as const;

export type SupportedLanguageCode = (typeof SUPPORTED_LANGUAGES)[number]["code"];

const isVietnameseLanguage = (language: string): boolean =>
  language.toLowerCase().startsWith("vi");

export const getLocaleFromLanguage = (language: string): string =>
  isVietnameseLanguage(language) ? "vi-VN" : "en-US";

export const getTmdbLanguageFromLanguage = (language: string): string =>
  isVietnameseLanguage(language) ? "vi-VN" : "en-US";

export const getDsLanguageFromLanguage = (language: string): string =>
  isVietnameseLanguage(language) ? "vi" : "en";

// Page sizes
export const DEFAULT_MOVIE_PAGE_SIZE = 20;
export const DEFAULT_TV_PAGE_SIZE = 24;
export const DEFAULT_BROWSE_PAGE_SIZE = 24;

// Skeleton counts (should match page sizes for consistency)
export const SKELETON_COUNT_MOVIE = DEFAULT_MOVIE_PAGE_SIZE;
export const SKELETON_COUNT_TV = DEFAULT_TV_PAGE_SIZE;
export const SKELETON_COUNT_BROWSE = DEFAULT_BROWSE_PAGE_SIZE;

// Hero loader timings (in milliseconds)
export const HERO_MINIMUM_LOADING_TIME = 1200; // Minimum display time to prevent flash
export const HERO_MAXIMUM_TIMEOUT = 10000; // Maximum wait time before showing fallback
