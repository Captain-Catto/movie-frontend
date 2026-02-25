"use client";

import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import { getLocalizedGenreNameById } from "@/utils/genreMapping";

interface GenreBadgeProps {
  /** Genre ID (contract source of truth) */
  genreId: number;
  /** Optional fallback label */
  genre?: string;
  /** Content type: movie or tv */
  contentType: "movie" | "tv";
  /** Style variant */
  variant?: "default" | "hero" | "detail";
  /** Custom className */
  className?: string;
}

/**
 * Unified genre badge component with proper browse links
 * Links to /browse?type={contentType}&genres={genreId}
 */
export default function GenreBadge({
  genre,
  genreId,
  contentType,
  variant = "default",
  className = "",
}: GenreBadgeProps) {
  const { language } = useLanguage();

  const localizedGenre =
    getLocalizedGenreNameById(genreId, language, contentType) ||
    genre ||
    `Genre ${genreId}`;

  const browseUrl = `/browse?type=${contentType}&genres=${genreId}`;

  // Variant: Hero (for HeroSection)
  if (variant === "hero") {
    return (
      <Link
        href={browseUrl}
        className={`tag-topic inline-block px-3 py-1 bg-gray-700/80 text-white text-sm rounded hover:bg-red-600 hover:text-white transition-colors cursor-pointer ${className}`}
      >
        {localizedGenre}
      </Link>
    );
  }

  // Variant: Detail (for detail pages)
  if (variant === "detail") {
    return (
      <Link
        href={browseUrl}
        className={`px-3 py-1 bg-gray-700 text-gray-300 rounded-full text-sm hover:bg-red-600 hover:text-white transition-colors cursor-pointer ${className}`}
      >
        {localizedGenre}
      </Link>
    );
  }

  // Variant: Default
  return (
    <Link
      href={browseUrl}
      className={`px-3 py-1 bg-gray-800/60 text-white text-sm rounded-full hover:bg-red-600 hover:text-white transition-colors cursor-pointer ${className}`}
    >
      {localizedGenre}
    </Link>
  );
}
