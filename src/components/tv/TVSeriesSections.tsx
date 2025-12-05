"use client";
import { useState, useEffect } from "react";
import MovieGrid from "@/components/movie/MovieGrid";
import SectionHeader from "@/components/ui/SectionHeader";
import { apiService } from "@/services/api";
import { mapTVSeriesToFrontend } from "@/utils/tvMapper";
import { MovieCardData } from "@/components/movie/MovieCard";
import { DEFAULT_LANGUAGE } from "@/constants/app.constants";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";

export default function TVSeriesSections() {
  const [onTheAirTVSeries, setOnTheAirTVSeries] = useState<MovieCardData[]>([]);
  const [popularTVSeries, setPopularTVSeries] = useState<MovieCardData[]>([]);
  const [topRatedTVSeries, setTopRatedTVSeries] = useState<MovieCardData[]>([]);

  // Individual loading states for progressive rendering
  const [loadingStates, setLoadingStates] = useState({
    onTheAir: true,
    popular: true,
    topRated: true,
  });

  // Track if each section has been fetched
  const [fetched, setFetched] = useState({
    onTheAir: false,
    popular: false,
    topRated: false,
  });

  // Intersection observers for lazy loading
  const [onTheAirRef, onTheAirVisible] = useIntersectionObserver();
  const [popularRef, popularVisible] = useIntersectionObserver();
  const [topRatedRef, topRatedVisible] = useIntersectionObserver();

  // Helper function to convert API response to array
  const toRecordArray = (data: unknown): Array<Record<string, unknown>> => {
    if (Array.isArray(data)) {
      return data as Array<Record<string, unknown>>;
    }
    if (data && typeof data === "object" && "data" in data) {
      const nested = (data as Record<string, unknown>).data;
      return Array.isArray(nested)
        ? (nested as Array<Record<string, unknown>>)
        : [];
    }
    return [];
  };

  // Fetch On The Air when visible
  useEffect(() => {
    if (onTheAirVisible && !fetched.onTheAir) {
      setFetched(prev => ({ ...prev, onTheAir: true }));

      const fetchOnTheAir = async () => {
        try {
          const res = await apiService.getOnTheAirTVSeries({
            page: 1,
            limit: 6,
            language: DEFAULT_LANGUAGE,
          });
          console.log("📦 On The Air Response:", res);
          if (res.success && res.data) {
            const mappedTVSeries = toRecordArray(res.data).map((tv) =>
              mapTVSeriesToFrontend(tv)
            );
            setOnTheAirTVSeries(mappedTVSeries);
          }
        } catch (error) {
          console.error("❌ Error fetching on the air TV:", error);
        } finally {
          setLoadingStates(prev => ({ ...prev, onTheAir: false }));
        }
      };

      fetchOnTheAir();
    }
  }, [onTheAirVisible, fetched.onTheAir]);

  // Fetch Popular when visible
  useEffect(() => {
    if (popularVisible && !fetched.popular) {
      setFetched(prev => ({ ...prev, popular: true }));

      const fetchPopular = async () => {
        try {
          const res = await apiService.getPopularTVSeries({
            page: 1,
            limit: 6,
            language: DEFAULT_LANGUAGE,
          });
          console.log("📦 Popular TV Response:", res);
          if (res.success && res.data) {
            const mappedTVSeries = toRecordArray(res.data).map((tv) =>
              mapTVSeriesToFrontend(tv)
            );
            setPopularTVSeries(mappedTVSeries);
          }
        } catch (error) {
          console.error("❌ Error fetching popular TV:", error);
        } finally {
          setLoadingStates(prev => ({ ...prev, popular: false }));
        }
      };

      fetchPopular();
    }
  }, [popularVisible, fetched.popular]);

  // Fetch Top Rated when visible
  useEffect(() => {
    if (topRatedVisible && !fetched.topRated) {
      setFetched(prev => ({ ...prev, topRated: true }));

      const fetchTopRated = async () => {
        try {
          const res = await apiService.getTopRatedTVSeries({
            page: 1,
            limit: 6,
            language: DEFAULT_LANGUAGE,
          });
          console.log("📦 Top Rated TV Response:", res);
          if (res.success && res.data) {
            const mappedTVSeries = toRecordArray(res.data).map((tv) =>
              mapTVSeriesToFrontend(tv)
            );
            setTopRatedTVSeries(mappedTVSeries);
          }
        } catch (error) {
          console.error("❌ Error fetching top rated TV:", error);
        } finally {
          setLoadingStates(prev => ({ ...prev, topRated: false }));
        }
      };

      fetchTopRated();
    }
  }, [topRatedVisible, fetched.topRated]);

  // Use API data (show skeleton when loading)
  const onTheAirToDisplay = onTheAirTVSeries;
  const popularToDisplay = popularTVSeries;
  const topRatedToDisplay = topRatedTVSeries;

  return (
    <div className="space-y-8">
      {/* On The Air Section */}
      <div ref={onTheAirRef} className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader title="On The Air" href="/tv/on-the-air" />
          <MovieGrid
            movies={onTheAirToDisplay}
            showFilters={false}
            maxRows={1}
            containerPadding={false}
            loading={loadingStates.onTheAir}
          />
        </div>
      </div>

      {/* Popular TV Series Section */}
      <div ref={popularRef} className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader title="Popular TV Series" href="/tv/popular" />
          <MovieGrid
            movies={popularToDisplay}
            showFilters={false}
            maxRows={1}
            containerPadding={false}
            loading={loadingStates.popular}
          />
        </div>
      </div>

      {/* Top Rated TV Series Section */}
      <div ref={topRatedRef} className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader title="Top Rated TV Series" href="/tv/top-rated" />
          <MovieGrid
            movies={topRatedToDisplay}
            showFilters={false}
            maxRows={1}
            containerPadding={false}
            loading={loadingStates.topRated}
          />
        </div>
      </div>
    </div>
  );
}
