"use client";

import { useEffect, useRef, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { usePageDuration } from "@/hooks/usePageDuration";
import { analyticsService } from "@/services/analytics.service";
import { getMovieDetailPageDataByTmdbId } from "@/lib/detail-page-data";
import type { MovieDetail } from "@/types/content.types";

export interface UseMovieDetailPageClientOptions {
  movieId: string;
  initialLanguage: string;
  initialMovieData: MovieDetail | null;
  initialContentType: "movie" | "tv" | null;
  initialError: string | null;
}

export interface UseMovieDetailPageClientResult {
  movieData: MovieDetail | null;
  loading: boolean;
  creditsLoading: boolean;
  error: string | null;
  contentType: "movie" | "tv" | null;
}

export function useMovieDetailPageClient({
  movieId,
  initialLanguage,
  initialMovieData,
  initialContentType,
  initialError,
}: UseMovieDetailPageClientOptions): UseMovieDetailPageClientResult {
  const { language } = useLanguage();
  const [movieData, setMovieData] = useState<MovieDetail | null>(initialMovieData);
  const [loading, setLoading] = useState(() => !initialMovieData && !initialError);
  const [creditsLoading, setCreditsLoading] = useState(false);
  const [error, setError] = useState<string | null>(initialError);
  const [contentType, setContentType] = useState<"movie" | "tv" | null>(
    initialContentType
  );
  const skipInitialFetchRef = useRef(Boolean(initialMovieData || initialError));

  usePageDuration({
    contentId: movieId,
    contentType: contentType === "tv" ? "tv_series" : "movie",
    contentTitle: movieData?.title,
    enabled: !!movieData && !loading,
  });

  useEffect(() => {
    if (skipInitialFetchRef.current && language === initialLanguage) {
      skipInitialFetchRef.current = false;
      return;
    }

    const fetchMovieData = async () => {
      try {
        setLoading(true);
        setCreditsLoading(true);
        setError(null);
        const parsedTmdbId = Number(movieId);
        if (!Number.isFinite(parsedTmdbId) || parsedTmdbId <= 0) {
          setMovieData(null);
          setContentType(null);
          setError("Invalid content ID");
          return;
        }

        const result = await getMovieDetailPageDataByTmdbId(parsedTmdbId, language);
        setMovieData(result.movieData);
        setContentType(result.contentType);
        setError(result.error);

        if (result.movieData) {
          analyticsService.trackView(
            String(result.movieData.tmdbId),
            result.contentType === "tv" ? "tv_series" : "movie",
            result.movieData.title
          );
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
        setMovieData(null);
        setContentType(null);
      } finally {
        setLoading(false);
        setCreditsLoading(false);
      }
    };

    if (movieId) {
      fetchMovieData();
    }
  }, [movieId, language, initialLanguage]);

  return {
    movieData,
    loading,
    creditsLoading,
    error,
    contentType,
  };
}
