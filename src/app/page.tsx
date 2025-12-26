"use client";
import { useState, useEffect, useMemo } from "react";
import Layout from "@/components/layout/Layout";
import HeroSection from "@/components/movie/HeroSection";
import MovieGrid from "@/components/movie/MovieGrid";
import SectionHeader from "@/components/ui/SectionHeader";
import TVSeriesSections from "@/components/tv/TVSeriesSections";
import { apiService } from "@/services/api";
import { mapMoviesToFrontend } from "@/utils/movieMapper";
import { mapTrendingDataToFrontend } from "@/utils/trendingMapper";
import type { MovieCardData } from "@/types/movie";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";
import { useWindowWidth } from "@/hooks/useWindowWidth";
import {
  HERO_MINIMUM_LOADING_TIME,
  HERO_MAXIMUM_TIMEOUT,
} from "@/constants/app.constants";

export default function Home() {
  const [nowPlayingMovies, setNowPlayingMovies] = useState<MovieCardData[]>([]);
  const [popularMovies, setPopularMovies] = useState<MovieCardData[]>([]);
  const [topRatedMovies, setTopRatedMovies] = useState<MovieCardData[]>([]);
  const [upcomingMovies, setUpcomingMovies] = useState<MovieCardData[]>([]);
  const [heroMovies, setHeroMovies] = useState<MovieCardData[]>([]);
  const [heroLoading, setHeroLoading] = useState(true);

  // Individual loading states for progressive rendering
  const [loadingStates, setLoadingStates] = useState({
    nowPlaying: true,
    popular: true,
    topRated: true,
    upcoming: true,
  });

  // Track if each section has been fetched
  const [fetched, setFetched] = useState({
    nowPlaying: false,
    popular: false,
    topRated: false,
    upcoming: false,
  });
  const { breakpoint } = useWindowWidth();
  const responsiveLimit = useMemo(() => {
    if (breakpoint === "desktop") return 10;
    if (breakpoint === "tablet") return 8;
    return 4;
  }, [breakpoint]);

  // Intersection observers for lazy loading
  const [nowPlayingRef, nowPlayingVisible] = useIntersectionObserver();
  const [popularRef, popularVisible] = useIntersectionObserver();
  const [topRatedRef, topRatedVisible] = useIntersectionObserver();
  const [upcomingRef, upcomingVisible] = useIntersectionObserver();

  useEffect(() => {
    // Reset fetch flags when the responsive limit changes so we refetch with new counts
    setFetched({
      nowPlaying: false,
      popular: false,
      topRated: false,
      upcoming: false,
    });
  }, [responsiveLimit]);

  // Fetch hero section immediately (highest priority)
  useEffect(() => {
    const abortController = new AbortController();

    const fetchTrendingHero = async () => {
      try {
        // Promise for minimum delay
        const minDelayPromise = new Promise<void>((resolve) =>
          setTimeout(resolve, HERO_MINIMUM_LOADING_TIME)
        );

        // Promise for data fetch
        const dataPromise = apiService.getTrending();

        // Timeout promise for safety
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(
            () => reject(new Error("Hero data fetch timeout")),
            HERO_MAXIMUM_TIMEOUT
          )
        );

        // Wait for BOTH minimum delay AND data (or timeout)
        const [, trendingResponse] = await Promise.race([
          Promise.all([minDelayPromise, dataPromise]),
          timeoutPromise,
        ]);

        if (
          !abortController.signal.aborted &&
          trendingResponse.success &&
          trendingResponse.data
        ) {
          const heroTrendingMovies = mapTrendingDataToFrontend(
            trendingResponse.data.slice(0, responsiveLimit)
          );
          setHeroMovies(heroTrendingMovies);
        }
      } catch (error) {
        if (!abortController.signal.aborted) {
          console.error("Error fetching trending movies for hero:", error);
        }
        // Fallback data will be used automatically (heroMovies.length === 0)
      } finally {
        if (!abortController.signal.aborted) {
          // Always hide loader - either data is ready or we're showing fallback
          setHeroLoading(false);
        }
      }
    };

    fetchTrendingHero();

    return () => {
      abortController.abort();
    };
  }, [responsiveLimit]);

  // Fetch Now Playing when visible
  useEffect(() => {
    if (nowPlayingVisible && !fetched.nowPlaying) {
      setFetched((prev) => ({ ...prev, nowPlaying: true }));

      const fetchNowPlaying = async () => {
        try {
          const res = await apiService.getNowPlayingMovies({
            page: 1,
            limit: responsiveLimit,
            language: "en-US",
          });
          if (res.success && res.data) {
            setNowPlayingMovies(mapMoviesToFrontend(res.data));
          }
        } catch (error) {
          console.error("Error fetching now playing:", error);
        } finally {
          setLoadingStates((prev) => ({ ...prev, nowPlaying: false }));
        }
      };

      fetchNowPlaying();
    }
  }, [nowPlayingVisible, fetched.nowPlaying, responsiveLimit]);

  // Fetch Popular when visible
  useEffect(() => {
    if (popularVisible && !fetched.popular) {
      setFetched((prev) => ({ ...prev, popular: true }));

      const fetchPopular = async () => {
        try {
          const res = await apiService.getPopularMovies({
            page: 1,
            limit: responsiveLimit,
            language: "en-US",
          });
          if (res.success && res.data) {
            setPopularMovies(mapMoviesToFrontend(res.data));
          }
        } catch (error) {
          console.error("Error fetching popular:", error);
        } finally {
          setLoadingStates((prev) => ({ ...prev, popular: false }));
        }
      };

      fetchPopular();
    }
  }, [popularVisible, fetched.popular, responsiveLimit]);

  // Fetch Top Rated when visible
  useEffect(() => {
    if (topRatedVisible && !fetched.topRated) {
      setFetched((prev) => ({ ...prev, topRated: true }));

      const fetchTopRated = async () => {
        try {
          const res = await apiService.getTopRatedMovies({
            page: 1,
            limit: responsiveLimit,
            language: "en-US",
          });
          if (res.success && res.data) {
            setTopRatedMovies(mapMoviesToFrontend(res.data));
          }
        } catch (error) {
          console.error("Error fetching top rated:", error);
        } finally {
          setLoadingStates((prev) => ({ ...prev, topRated: false }));
        }
      };

      fetchTopRated();
    }
  }, [topRatedVisible, fetched.topRated, responsiveLimit]);

  // Fetch Upcoming when visible
  useEffect(() => {
    if (upcomingVisible && !fetched.upcoming) {
      setFetched((prev) => ({ ...prev, upcoming: true }));

      const fetchUpcoming = async () => {
        try {
          const res = await apiService.getUpcomingMovies({
            page: 1,
            limit: responsiveLimit,
            language: "en-US",
          });
          if (res.success && res.data) {
            setUpcomingMovies(mapMoviesToFrontend(res.data));
          }
        } catch (error) {
          console.error("Error fetching upcoming:", error);
        } finally {
          setLoadingStates((prev) => ({ ...prev, upcoming: false }));
        }
      };

      fetchUpcoming();
    }
  }, [upcomingVisible, fetched.upcoming, responsiveLimit]);

  // Use fetched movies (no fallback - show skeleton when loading)
  const nowPlayingToDisplay = nowPlayingMovies;
  const popularToDisplay = popularMovies;
  const topRatedToDisplay = topRatedMovies;
  const upcomingToDisplay = upcomingMovies;
  const heroMoviesToDisplay = heroMovies;

  return (
    <Layout>
      <HeroSection movies={heroMoviesToDisplay} isLoading={heroLoading} />

      {/* Now Playing Section */}
      <div ref={nowPlayingRef} className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader title="Now Playing" href="/movies/now-playing" />
          <MovieGrid
            movies={nowPlayingToDisplay}
            showFilters={false}
            maxRows={1}
            containerPadding={false}
            loading={loadingStates.nowPlaying}
          />
        </div>
      </div>

      {/* Popular Section */}
      <div ref={popularRef} className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader title="Popular" href="/movies/popular" />
          <MovieGrid
            movies={popularToDisplay}
            showFilters={false}
            maxRows={1}
            containerPadding={false}
            loading={loadingStates.popular}
          />
        </div>
      </div>

      {/* Top Rated Section */}
      <div ref={topRatedRef} className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader title="Top Rated" href="/movies/top-rated" />
          <MovieGrid
            movies={topRatedToDisplay}
            showFilters={false}
            maxRows={1}
            containerPadding={false}
            loading={loadingStates.topRated}
          />
        </div>
      </div>

      {/* Upcoming Section */}
      <div ref={upcomingRef} className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader title="Upcoming" href="/movies/upcoming" />
          <MovieGrid
            movies={upcomingToDisplay}
            showFilters={false}
            maxRows={1}
            containerPadding={false}
            loading={loadingStates.upcoming}
          />
        </div>
      </div>

      {/* TV Series Sections */}
      <TVSeriesSections />
    </Layout>
  );
}
