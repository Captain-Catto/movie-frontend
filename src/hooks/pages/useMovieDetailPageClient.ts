"use client";

import { useEffect, useReducer, useRef } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { usePageDuration } from "@/hooks/usePageDuration";
import { analyticsService } from "@/services/analytics.service";
import { getMovieDetailPageDataByTmdbId } from "@/lib/detail-page-data";
import { getPageHookUiMessages } from "@/lib/ui-messages";
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
  const labels = getPageHookUiMessages(language);
  type PageState = { movieData: MovieDetail | null; loading: boolean; creditsLoading: boolean; error: string | null; contentType: "movie" | "tv" | null };
  const [pageState, dispatch] = useReducer(
    (s: PageState, p: Partial<PageState>): PageState => ({ ...s, ...p }),
    { movieData: initialMovieData, loading: !initialMovieData && !initialError, creditsLoading: false, error: initialError, contentType: initialContentType }
  );
  const { movieData, loading, creditsLoading, error, contentType } = pageState;
  const lastFetchKeyRef = useRef<string | null>(
    (initialMovieData || initialError) ? `${movieId}|${initialLanguage}` : null
  );

  const parsedTmdbId = Number(movieId);
  const isValidId = !!movieId && Number.isFinite(parsedTmdbId) && parsedTmdbId > 0;
  const prevMovieIdRef = useRef(movieId);
  if (movieId !== prevMovieIdRef.current) {
    prevMovieIdRef.current = movieId;
    if (!isValidId) {
      dispatch({ movieData: null, contentType: null, error: labels.invalidContentId, loading: false, creditsLoading: false });
    }
  }

  usePageDuration({
    contentId: movieId,
    contentType: contentType === "tv" ? "tv_series" : "movie",
    contentTitle: movieData?.title,
    enabled: !!movieData && !loading,
  });

  useEffect(() => {
    if (!movieId || !isValidId) return;
    const fetchKey = `${movieId}|${language}`;
    if (lastFetchKeyRef.current === fetchKey) return;
    lastFetchKeyRef.current = fetchKey;

    dispatch({ loading: true, creditsLoading: true, error: null });
    getMovieDetailPageDataByTmdbId(parsedTmdbId, language).then((result) => {
      dispatch({ movieData: result.movieData, contentType: result.contentType, error: result.error, loading: false, creditsLoading: false });
      if (result.movieData) {
        analyticsService.trackView(
          String(result.movieData.tmdbId),
          result.contentType === "tv" ? "tv_series" : "movie",
          result.movieData.title
        );
      }
    }).catch((err) => {
      dispatch({ error: err instanceof Error ? err.message : labels.anErrorOccurred, movieData: null, contentType: null, loading: false, creditsLoading: false });
    });
  }, [movieId, language, isValidId, parsedTmdbId, labels.anErrorOccurred]);

  return {
    movieData,
    loading,
    creditsLoading,
    error,
    contentType,
  };
}
