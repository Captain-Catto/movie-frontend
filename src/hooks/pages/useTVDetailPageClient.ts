"use client";

import { useEffect, useRef, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { usePageDuration } from "@/hooks/usePageDuration";
import { analyticsService } from "@/services/analytics.service";
import { getTVDetailPageDataByTmdbId } from "@/lib/detail-page-data";
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
  const isVietnamese = language.toLowerCase().startsWith("vi");
  const [tvData, setTVData] = useState<TVDetail | null>(initialTVData);
  const [loading, setLoading] = useState(() => !initialTVData && !initialError);
  const [creditsLoading, setCreditsLoading] = useState(false);
  const [error, setError] = useState<string | null>(initialError);
  const skipInitialFetchRef = useRef(Boolean(initialTVData || initialError));

  usePageDuration({
    contentId: tvIdParam,
    contentType: "tv_series",
    contentTitle: tvData?.title,
    enabled: !!tvData && !loading,
  });

  useEffect(() => {
    if (skipInitialFetchRef.current && language === initialLanguage) {
      skipInitialFetchRef.current = false;
      return;
    }

    const fetchTVData = async () => {
      try {
        setLoading(true);
        setCreditsLoading(true);
        setError(null);

        if (!tvIdParam || Number.isNaN(numericTvId) || numericTvId <= 0) {
          throw new Error(
            isVietnamese ? "ID phim bộ không hợp lệ" : "Invalid TV series ID"
          );
        }

        const result = await getTVDetailPageDataByTmdbId(numericTvId, language);
        setTVData(result.tvData);
        setError(result.error);

        if (result.tvData) {
          analyticsService.trackView(
            String(result.tvData.tmdbId),
            "tv_series",
            result.tvData.title
          );
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : isVietnamese
            ? "Lỗi không xác định"
            : "Unknown error"
        );
        setTVData(null);
      } finally {
        setLoading(false);
        setCreditsLoading(false);
      }
    };

    fetchTVData();
  }, [numericTvId, tvIdParam, language, initialLanguage, isVietnamese]);

  return {
    tvData,
    loading,
    creditsLoading,
    error,
    language,
  };
}
