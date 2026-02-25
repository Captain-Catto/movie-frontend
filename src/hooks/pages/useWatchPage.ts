"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import { usePageDuration } from "@/hooks/usePageDuration";
import { apiService } from "@/services/api";
import { analyticsService } from "@/services/analytics.service";
import { getDsLanguageFromLanguage } from "@/constants/app.constants";
import {
  formatWatchDuration,
  type WatchContentData,
} from "@/utils/watchContentMapper";
import {
  getWatchPageDataByRouteId,
  type WatchPageCredits,
  type WatchPageRecommendationItem,
} from "@/lib/detail-page-data";

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
}: UseWatchPageOptions): UseWatchPageResult {
  const searchParams = useSearchParams();
  const { language } = useLanguage();

  const [movieData, setMovieData] = useState<WatchContentData | null>(
    initialMovieData
  );
  const [loading, setLoading] = useState(() => !initialMovieData && !initialError);
  const [error, setError] = useState<string | null>(initialError);
  const [isPlaying, setIsPlaying] = useState(false);
  const [credits, setCredits] = useState<WatchPageCredits | null>(initialCredits);
  const [recommendations, setRecommendations] = useState<
    WatchPageRecommendationItem[]
  >(initialRecommendations);
  const [creditsLoading, setCreditsLoading] = useState(
    () => !initialCredits && !initialError
  );
  const [recommendationsLoading, setRecommendationsLoading] = useState(
    () => initialRecommendations.length === 0 && !initialError
  );
  const [hasTrackedPlay, setHasTrackedPlay] = useState(false);
  const [hasTrackedView, setHasTrackedView] = useState(false);
  const [streamCandidates, setStreamCandidates] = useState<string[]>(
    initialStreamCandidates
  );
  const [activeStreamIndex, setActiveStreamIndex] = useState(0);
  const [streamError, setStreamError] = useState<string | null>(initialStreamError);
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
      try {
        lastDataFetchKeyRef.current = dataFetchKey;
        setLoading(true);
        setCreditsLoading(true);
        setRecommendationsLoading(true);
        setStreamCandidates([]);
        setStreamError(null);
        setActiveStreamIndex(0);
        setError(null);

        const result = await getWatchPageDataByRouteId(
          movieId,
          language,
          season,
          episode
        );

        setMovieData(result.movieData);
        setCredits(result.credits);
        setRecommendations(result.recommendations);
        setStreamCandidates(result.streamCandidates);
        setStreamError(result.streamError);
        setError(result.error);
      } catch {
        setError("Unable to load content information");
        setMovieData(null);
        setCredits(null);
        setRecommendations([]);
        setStreamCandidates([]);
        setStreamError("Unable to fetch stream source.");
      } finally {
        setCreditsLoading(false);
        setRecommendationsLoading(false);
        setLoading(false);
      }
    };

    if (movieId) {
      fetchMovieData();
      setHasTrackedPlay(false);
      setHasTrackedView(false);
      setStreamCandidates([]);
      setStreamError(null);
      setActiveStreamIndex(0);
    }
  }, [movieId, language, initialLanguage, season, episode]);

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

      const streamResponse = await apiService.getStreamUrlByTmdbId(
        streamTmdbId,
        streamContentType === "tv" ? "tv" : "movie",
        streamOptions
      );

      if (cancelled) return;

      if (streamResponse.success && streamResponse.data?.url) {
        const candidates = [
          streamResponse.data.url,
          ...(streamResponse.data.fallbackUrls || []),
        ]
          .filter((url) => !!url)
          .filter((url, index, all) => all.indexOf(url) === index);

        setStreamCandidates(candidates);
        setStreamError(null);
        setActiveStreamIndex(0);
      } else {
        setStreamCandidates([]);
        setStreamError("No stream source available right now.");
      }
    };

    fetchStreamUrl().catch(() => {
      if (cancelled) return;
      setStreamCandidates([]);
      setStreamError("Unable to fetch stream source.");
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
  ]);

  useEffect(() => {
    if (!movieData || hasTrackedView) return;

    analyticsService.trackView(
      String(movieData.tmdbId),
      movieData.contentType === "tv" ? "tv_series" : "movie",
      movieData.title
    );
    setHasTrackedView(true);
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
    setActiveStreamIndex((prev) => {
      if (prev < streamCandidates.length - 1) {
        setStreamError(null);
        return prev + 1;
      }
      setStreamError("Unable to load stream from available providers.");
      return prev;
    });
  }, [clearStreamTimeout, streamCandidates.length]);

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
      setHasTrackedPlay(true);
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
