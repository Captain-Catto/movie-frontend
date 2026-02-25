"use client";

import { useEffect, useState } from "react";
import { apiService } from "@/services/api";
import { mapTVSeriesToFrontend } from "@/utils/tvMapper";
import type { MovieCardData } from "@/types/content.types";
import { useLanguage } from "@/contexts/LanguageContext";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";

interface LoadingStates {
  onTheAir: boolean;
  popular: boolean;
  topRated: boolean;
}

interface FetchedStates {
  onTheAir: boolean;
  popular: boolean;
  topRated: boolean;
}

interface UseTVSeriesSectionsResult {
  onTheAirRef: React.RefObject<HTMLDivElement | null>;
  popularRef: React.RefObject<HTMLDivElement | null>;
  topRatedRef: React.RefObject<HTMLDivElement | null>;
  onTheAirTVSeries: MovieCardData[];
  popularTVSeries: MovieCardData[];
  topRatedTVSeries: MovieCardData[];
  loadingStates: LoadingStates;
}

const initialLoadingStates: LoadingStates = {
  onTheAir: true,
  popular: true,
  topRated: true,
};

const initialFetchedStates: FetchedStates = {
  onTheAir: false,
  popular: false,
  topRated: false,
};

const toRecordArray = (data: unknown): Array<Record<string, unknown>> => {
  if (Array.isArray(data)) {
    return data as Array<Record<string, unknown>>;
  }
  if (data && typeof data === "object" && "data" in data) {
    const nested = (data as Record<string, unknown>).data;
    return Array.isArray(nested) ? (nested as Array<Record<string, unknown>>) : [];
  }
  return [];
};

export function useTVSeriesSections(): UseTVSeriesSectionsResult {
  const { language } = useLanguage();
  const [onTheAirTVSeries, setOnTheAirTVSeries] = useState<MovieCardData[]>([]);
  const [popularTVSeries, setPopularTVSeries] = useState<MovieCardData[]>([]);
  const [topRatedTVSeries, setTopRatedTVSeries] = useState<MovieCardData[]>([]);

  const [loadingStates, setLoadingStates] =
    useState<LoadingStates>(initialLoadingStates);
  const [fetched, setFetched] = useState<FetchedStates>(initialFetchedStates);

  const [onTheAirRef, onTheAirVisible] = useIntersectionObserver();
  const [popularRef, popularVisible] = useIntersectionObserver();
  const [topRatedRef, topRatedVisible] = useIntersectionObserver();

  useEffect(() => {
    setFetched(initialFetchedStates);
    setLoadingStates(initialLoadingStates);
    setOnTheAirTVSeries([]);
    setPopularTVSeries([]);
    setTopRatedTVSeries([]);
  }, [language]);

  useEffect(() => {
    if (!onTheAirVisible || fetched.onTheAir) return;

    setFetched((prev) => ({ ...prev, onTheAir: true }));

    const fetchOnTheAir = async () => {
      try {
        const res = await apiService.getOnTheAirTVSeries({
          page: 1,
          limit: 6,
          language,
        });
        if (res.success && res.data) {
          const mapped = toRecordArray(res.data).map((tv) =>
            mapTVSeriesToFrontend(tv)
          );
          setOnTheAirTVSeries(mapped);
        }
      } catch (error) {
        console.error("Error fetching on the air TV:", error);
      } finally {
        setLoadingStates((prev) => ({ ...prev, onTheAir: false }));
      }
    };

    fetchOnTheAir();
  }, [onTheAirVisible, fetched.onTheAir, language]);

  useEffect(() => {
    if (!popularVisible || fetched.popular) return;

    setFetched((prev) => ({ ...prev, popular: true }));

    const fetchPopular = async () => {
      try {
        const res = await apiService.getPopularTVSeries({
          page: 1,
          limit: 6,
          language,
        });
        if (res.success && res.data) {
          const mapped = toRecordArray(res.data).map((tv) =>
            mapTVSeriesToFrontend(tv)
          );
          setPopularTVSeries(mapped);
        }
      } catch (error) {
        console.error("Error fetching popular TV:", error);
      } finally {
        setLoadingStates((prev) => ({ ...prev, popular: false }));
      }
    };

    fetchPopular();
  }, [popularVisible, fetched.popular, language]);

  useEffect(() => {
    if (!topRatedVisible || fetched.topRated) return;

    setFetched((prev) => ({ ...prev, topRated: true }));

    const fetchTopRated = async () => {
      try {
        const res = await apiService.getTopRatedTVSeries({
          page: 1,
          limit: 6,
          language,
        });
        if (res.success && res.data) {
          const mapped = toRecordArray(res.data).map((tv) =>
            mapTVSeriesToFrontend(tv)
          );
          setTopRatedTVSeries(mapped);
        }
      } catch (error) {
        console.error("Error fetching top rated TV:", error);
      } finally {
        setLoadingStates((prev) => ({ ...prev, topRated: false }));
      }
    };

    fetchTopRated();
  }, [topRatedVisible, fetched.topRated, language]);

  return {
    onTheAirRef,
    popularRef,
    topRatedRef,
    onTheAirTVSeries,
    popularTVSeries,
    topRatedTVSeries,
    loadingStates,
  };
}
