"use client";

import { useEffect, useCallback, useReducer, useRef, useState } from "react";
import type { ReadonlyURLSearchParams } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import { usePageDuration } from "@/hooks/usePageDuration";
import { apiService } from "@/services/api";
import { analyticsService } from "@/services/analytics.service";
import { getDsLanguageFromLanguage } from "@/constants/app.constants";
import {
  formatWatchDuration,
  type WatchContentData,
} from "@/utils/watchContentMapper";
import { getWatchPageDataByRouteId } from "@/lib/detail-page-data";
import { getPageHookUiMessages } from "@/lib/ui-messages";
import type {
  WatchPageCredits,
  WatchPageRecommendationItem,
} from "@/lib/page-data.types";

const STREAM_LOAD_TIMEOUT_MS = 15000;

export interface UseWatchPageOptions {
  movieId: string;
  initialLanguage: string;
  initialMovieData: WatchContentData | null;
  initialCredits: WatchPageCredits | null;
  initialRecommendations: WatchPageRecommendationItem[];
  initialStreamCandidates: string[];
  initialStreamError: string | null;
  initialError: string | null;
  initialSeason: number;
  initialEpisode: number;
  searchParams: ReadonlyURLSearchParams;
}

export interface UseWatchPageResult {
  movieData: WatchContentData | null;
  loading: boolean;
  error: string | null;
  isPlaying: boolean;
  credits: WatchPageCredits | null;
  recommendations: WatchPageRecommendationItem[];
  creditsLoading: boolean;
  recommendationsLoading: boolean;
  season: number;
  episode: number;
  streamCandidates: string[];
  activeStreamIndex: number;
  streamError: string | null;
  activeStreamUrl: string | undefined;
  formattedDuration: string;
  hasDuration: boolean;
  numericRating: number;
  hasRating: boolean;
  episodePickerSeasons: number;
  handlePlayMovie: () => void;
  handleStreamLoadError: () => void;
  handleStreamLoadSuccess: () => void;
}

const parsePositiveInt = (value: string | null): number | undefined => {
  if (!value) return undefined;
  const parsed = Number(value);
  if (Number.isInteger(parsed) && parsed > 0) {
    return parsed;
  }
  return undefined;
};

export function useWatchPage({
  movieId,
  initialLanguage,
  initialMovieData,
  initialCredits,
  initialRecommendations,
  initialStreamCandidates,
  initialStreamError,
  initialError,
  initialSeason,
  initialEpisode,
  searchParams,
}: UseWatchPageOptions): UseWatchPageResult {
  const { language } = useLanguage();
  const labels = getPageHookUiMessages(language);

  const [isPlaying, setIsPlaying] = useState(false);

  type WatchState = {
    movieData: WatchContentData | null;
    loading: boolean;
    error: string | null;
    credits: WatchPageCredits | null;
    recommendations: WatchPageRecommendationItem[];
    creditsLoading: boolean;
    recommendationsLoading: boolean;
    streamCandidates: string[];
    activeStreamIndex: number;
    streamError: string | null;
    hasTrackedPlay: boolean;
    hasTrackedView: boolean;
  };
  const [watchState, dispatch] = useReducer(
    (s: WatchState, p: Partial<WatchState>): WatchState => ({ ...s, ...p }),
    {
      movieData: initialMovieData,
      loading: !initialMovieData && !initialError,
      error: initialError,
      credits: initialCredits,
      recommendations: initialRecommendations,
      creditsLoading: !initialCredits && !initialError,
      recommendationsLoading: initialRecommendations.length === 0 && !initialError,
      streamCandidates: initialStreamCandidates,
      activeStreamIndex: 0,
      streamError: initialStreamError,
      hasTrackedPlay: false,
      hasTrackedView: false,
    }
  );
  const { movieData, loading, error, credits, recommendations, creditsLoading, recommendationsLoading, streamCandidates, activeStreamIndex, streamError, hasTrackedPlay, hasTrackedView } = watchState;
  const streamLoadingRef = useRef(false);
  const streamTimeoutRef = useRef<number | null>(null);
  const skipInitialFetchRef = useRef(Boolean(initialMovieData || initialError));
  const lastDataFetchKeyRef = useRef<string | null>(
    initialMovieData || initialError ? `${movieId}|${initialLanguage}` : null
  );
  const skipInitialStreamFetchRef = useRef(
    Boolean(initialStreamCandidates.length > 0 || initialStreamError)
  );

  usePageDuration({
    contentId: movieId,
    contentType: movieData?.contentType === "tv" ? "tv_series" : "movie",
    contentTitle: movieData?.title,
    enabled: !!movieData && !loading,
  });

  const seasonParam = parsePositiveInt(searchParams.get("season"));
  const episodeParam = parsePositiveInt(searchParams.get("episode"));
  const season = seasonParam ?? initialSeason;
  const episode = episodeParam ?? initialEpisode;
  const dsLang = getDsLanguageFromLanguage(language);
  const streamTmdbId = movieData?.tmdbId;
  const streamContentType = movieData?.contentType;

  useEffect(() => {
    if (skipInitialFetchRef.current && language === initialLanguage) {
      skipInitialFetchRef.current = false;
      return;
    }

    const dataFetchKey = `${movieId}|${language}`;
    if (lastDataFetchKeyRef.current === dataFetchKey) {
      return;
    }

    const fetchMovieData = async () => {
      lastDataFetchKeyRef.current = dataFetchKey;
      dispatch({ loading: true, creditsLoading: true, recommendationsLoading: true, streamCandidates: [], streamError: null, activeStreamIndex: 0, error: null });

      try {
        const result = await getWatchPageDataByRouteId(
          movieId,
          language,
          season,
          episode
        );

        dispatch({
          movieData: result.movieData,
          credits: result.credits,
          recommendations: result.recommendations,
          streamCandidates: result.streamCandidates,
          streamError: result.streamError,
          error: result.error,
          creditsLoading: false,
          recommendationsLoading: false,
          loading: false,
        });
      } catch {
        dispatch({
          error: labels.loadContentFailed,
          movieData: null,
          credits: null,
          recommendations: [],
          streamCandidates: [],
          streamError: labels.fetchStreamFailed,
          creditsLoading: false,
          recommendationsLoading: false,
          loading: false,
        });
      }
    };

    if (movieId) {
      fetchMovieData();
      dispatch({ hasTrackedPlay: false, hasTrackedView: false });
    }
  }, [movieId, language, initialLanguage, season, episode, labels.fetchStreamFailed, labels.loadContentFailed]);

  useEffect(() => {
    if (!streamTmdbId || !streamContentType) return;
    if (
      skipInitialStreamFetchRef.current &&
      language === initialLanguage &&
      season === initialSeason &&
      episode === initialEpisode
    ) {
      skipInitialStreamFetchRef.current = false;
      return;
    }
    skipInitialStreamFetchRef.current = false;

    let cancelled = false;
    const fetchStreamUrl = async () => {
      const streamOptions =
        streamContentType === "tv"
          ? { season, episode, dsLang, autoplay: true, autoNext: true }
          : { dsLang, autoplay: true };

      if (cancelled) return;

      const streamResponse = await apiService.getStreamUrlByTmdbId(
        streamTmdbId,
        streamContentType === "tv" ? "tv" : "movie",
        streamOptions
      );

      if (streamResponse.success && streamResponse.data?.url) {
        const candidates = [
          ...new Set(
            [streamResponse.data.url, ...(streamResponse.data.fallbackUrls || [])].filter(
              (url): url is string => !!url
            )
          ),
        ];

        dispatch({ streamCandidates: candidates, streamError: null, activeStreamIndex: 0 });
      } else {
        dispatch({ streamCandidates: [], streamError: labels.noStreamAvailable });
      }
    };

    fetchStreamUrl().catch(() => {
      if (cancelled) return;
      dispatch({ streamCandidates: [], streamError: labels.fetchStreamFailed });
    });

    return () => {
      cancelled = true;
    };
  }, [
    streamTmdbId,
    streamContentType,
    season,
    episode,
    dsLang,
    initialLanguage,
    initialSeason,
    initialEpisode,
    language,
    labels.fetchStreamFailed,
    labels.noStreamAvailable,
  ]);

  useEffect(() => {
    if (!movieData || hasTrackedView) return;

    analyticsService.trackView(
      String(movieData.tmdbId),
      movieData.contentType === "tv" ? "tv_series" : "movie",
      movieData.title
    );
    dispatch({ hasTrackedView: true });
  }, [movieData, hasTrackedView]);

  const clearStreamTimeout = useCallback(() => {
    if (streamTimeoutRef.current !== null) {
      window.clearTimeout(streamTimeoutRef.current);
      streamTimeoutRef.current = null;
    }
  }, []);

  const handleStreamLoadError = useCallback(() => {
    clearStreamTimeout();
    streamLoadingRef.current = false;
    if (activeStreamIndex < streamCandidates.length - 1) {
      dispatch({ activeStreamIndex: activeStreamIndex + 1, streamError: null });
    } else {
      dispatch({ streamError: labels.loadStreamFailed });
    }
  }, [clearStreamTimeout, activeStreamIndex, streamCandidates.length, labels.loadStreamFailed]);

  const handleStreamLoadSuccess = useCallback(() => {
    clearStreamTimeout();
    streamLoadingRef.current = false;
  }, [clearStreamTimeout]);

  useEffect(() => {
    const activeStreamUrl = streamCandidates[activeStreamIndex];
    if (!isPlaying || !activeStreamUrl) {
      clearStreamTimeout();
      streamLoadingRef.current = false;
      return;
    }

    streamLoadingRef.current = true;
    clearStreamTimeout();
    streamTimeoutRef.current = window.setTimeout(() => {
      if (streamLoadingRef.current) {
        handleStreamLoadError();
      }
    }, STREAM_LOAD_TIMEOUT_MS);

    return () => {
      clearStreamTimeout();
    };
  }, [
    streamCandidates,
    activeStreamIndex,
    isPlaying,
    clearStreamTimeout,
    handleStreamLoadError,
  ]);

  const handlePlayMovie = useCallback(() => {
    if (!hasTrackedPlay && movieData) {
      analyticsService.trackPlay(
        String(movieData.tmdbId),
        movieData.contentType === "tv" ? "tv_series" : "movie",
        movieData.title,
        { source: "watch_page_play_button", context: "watch_page" }
      );
      dispatch({ hasTrackedPlay: true });
    }
    setIsPlaying(true);
  }, [hasTrackedPlay, movieData]);

  const activeStreamUrl = streamCandidates[activeStreamIndex];
  const durationNumber = Number(movieData?.duration);
  const hasDuration =
    Number.isFinite(durationNumber) && durationNumber > 0 && !!movieData?.duration;
  const numericRating = Number(movieData?.rating);
  const hasRating = Number.isFinite(numericRating) && numericRating >= 0;
  const formattedDuration =
    hasDuration && movieData
      ? formatWatchDuration(durationNumber, movieData.contentType)
      : "";
  const episodePickerSeasons =
    movieData?.contentType === "tv"
      ? Math.max(movieData.numberOfSeasons || 0, season, 1)
      : 0;

  return {
    movieData,
    loading,
    error,
    isPlaying,
    credits,
    recommendations,
    creditsLoading,
    recommendationsLoading,
    season,
    episode,
    streamCandidates,
    activeStreamIndex,
    streamError,
    activeStreamUrl,
    formattedDuration,
    hasDuration,
    numericRating,
    hasRating,
    episodePickerSeasons,
    handlePlayMovie,
    handleStreamLoadError,
    handleStreamLoadSuccess,
  };
}
