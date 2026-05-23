"use client";

import { useEffect, useReducer, useRef } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { usePageDuration } from "@/hooks/usePageDuration";
import { analyticsService } from "@/services/analytics.service";
import { getTVDetailPageDataByTmdbId } from "@/lib/detail-page-data";
import { getPageHookUiMessages } from "@/lib/ui-messages";
import type { TVDetail } from "@/types/content.types";

export interface UseTVDetailPageClientOptions {
  tvIdParam: string;
  initialLanguage: string;
  initialTVData: TVDetail | null;
  initialError: string | null;
}

export interface UseTVDetailPageClientResult {
  tvData: TVDetail | null;
  loading: boolean;
  creditsLoading: boolean;
  error: string | null;
  language: string;
}

export function useTVDetailPageClient({
  tvIdParam,
  initialLanguage,
  initialTVData,
  initialError,
}: UseTVDetailPageClientOptions): UseTVDetailPageClientResult {
  const numericTvId = Number(tvIdParam);
  const { language } = useLanguage();
  const labels = getPageHookUiMessages(language);
  type PageState = { tvData: TVDetail | null; loading: boolean; creditsLoading: boolean; error: string | null };
  const [pageState, dispatch] = useReducer(
    (s: PageState, p: Partial<PageState>): PageState => ({ ...s, ...p }),
    { tvData: initialTVData, loading: !initialTVData && !initialError, creditsLoading: false, error: initialError }
  );
  const { tvData, loading, creditsLoading, error } = pageState;
  const lastFetchKeyRef = useRef<string | null>(
    (initialTVData || initialError) ? `${tvIdParam}|${initialLanguage}` : null
  );

  usePageDuration({
    contentId: tvIdParam,
    contentType: "tv_series",
    contentTitle: tvData?.title,
    enabled: !!tvData && !loading,
  });

  useEffect(() => {
    if (!tvIdParam || Number.isNaN(numericTvId) || numericTvId <= 0) {
      dispatch({ error: labels.invalidTvSeriesId, tvData: null, loading: false, creditsLoading: false });
      return;
    }
    const fetchKey = `${tvIdParam}|${language}`;
    if (lastFetchKeyRef.current === fetchKey) return;
    lastFetchKeyRef.current = fetchKey;

    dispatch({ loading: true, creditsLoading: true, error: null });
    getTVDetailPageDataByTmdbId(numericTvId, language).then((result) => {
      dispatch({ tvData: result.tvData, error: result.error, loading: false, creditsLoading: false });
      if (result.tvData) {
        analyticsService.trackView(String(result.tvData.tmdbId), "tv_series", result.tvData.title);
      }
    }).catch((err) => {
      dispatch({ error: err instanceof Error ? err.message : labels.unknownError, tvData: null, loading: false, creditsLoading: false });
    });
  }, [numericTvId, tvIdParam, language, labels.invalidTvSeriesId, labels.unknownError]);

  return {
    tvData,
    loading,
    creditsLoading,
    error,
    language,
  };
}
