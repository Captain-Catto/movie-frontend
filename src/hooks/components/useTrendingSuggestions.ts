"use client";

import { useEffect, useState } from "react";
import { apiService } from "@/services/api";
import { mapMoviesToFrontend } from "@/utils/movieMapper";
import { mapTVSeriesToFrontend } from "@/utils/tvMapper";
import { mapTrendingDataToFrontend } from "@/utils/trendingMapper";
import { useLanguage } from "@/contexts/LanguageContext";
import type { MovieCardData } from "@/types/content.types";

type SuggestionType = "movie" | "tv" | "all";

interface UseTrendingSuggestionsOptions {
  type: SuggestionType;
  limit?: number;
}

interface UseTrendingSuggestionsResult {
  items: MovieCardData[];
  loading: boolean;
}

export function useTrendingSuggestions({
  type,
  limit = 6,
}: UseTrendingSuggestionsOptions): UseTrendingSuggestionsResult {
  const { language } = useLanguage();
  const [items, setItems] = useState<MovieCardData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchSuggestions = async () => {
      try {
        setLoading(true);
        let data: MovieCardData[] = [];

        if (type === "movie") {
          const res = await apiService.getPopularMovies({
            page: 1,
            limit,
            language,
          });
          if (res.success && Array.isArray(res.data)) {
            data = mapMoviesToFrontend(res.data);
          }
        } else if (type === "tv") {
          const res = await apiService.getPopularTVSeries({
            page: 1,
            limit,
            language,
          });
          if (res.success && res.data) {
            const rawData = Array.isArray(res.data)
              ? res.data
              : ((res.data as { data?: unknown[] }).data ?? []);
            data = rawData.map((tv) =>
              mapTVSeriesToFrontend(tv as Record<string, unknown>)
            );
          }
        } else {
          const res = await apiService.getTrending({ page: 1, limit, language });
          if (res.success && Array.isArray(res.data)) {
            data = mapTrendingDataToFrontend(res.data.slice(0, limit));
          }
        }

        if (!isMounted) return;
        setItems(data.slice(0, limit));
      } catch (error) {
        if (!isMounted) return;
        setItems([]);
        console.error("Error fetching suggestions:", error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchSuggestions();

    return () => {
      isMounted = false;
    };
  }, [type, language, limit]);

  return { items, loading };
}
