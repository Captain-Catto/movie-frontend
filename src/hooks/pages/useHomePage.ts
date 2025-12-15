"use client";

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useIntersectionObserver } from '../useIntersectionObserver';
import { useWindowWidth } from '../useWindowWidth';
import { useMoviesList } from '../data/useMoviesList';
import { apiService } from '@/services/api';
import { mapTrendingDataToFrontend } from '@/utils/trendingMapper';
import { MovieCardData } from '@/types/movie';

/**
 * Movie section data with ref for lazy loading
 */
export interface MovieSection {
  /** Section data */
  data: MovieCardData[];
  /** Loading state */
  loading: boolean;
  /** Ref for intersection observer */
  ref: React.RefObject<HTMLDivElement | null>;
  /** Whether section is visible */
  isVisible: boolean;
}

/**
 * All home page sections
 */
export interface HomePageSections {
  hero: MovieCardData[];
  nowPlaying: MovieSection;
  popular: MovieSection;
  topRated: MovieSection;
  upcoming: MovieSection;
}

/**
 * Return type for useHomePage hook
 */
export interface UseHomePageResult {
  /** All movie sections */
  sections: HomePageSections;
  /** Responsive limit based on screen size */
  responsiveLimit: number;
  /** Refetch all sections */
  refetchAll: () => void;
}

/**
 * Hook for managing home page data with progressive loading
 * Handles hero section + 4 lazy-loaded movie categories
 * Responsive limits based on screen size
 *
 * @example
 * ```tsx
 * function HomePage() {
 *   const { sections, responsiveLimit } = useHomePage();
 *
 *   return (
 *     <Layout>
 *       <HeroSection movies={sections.hero} />
 *
 *       <div ref={sections.nowPlaying.ref}>
 *         {sections.nowPlaying.loading ? (
 *           <Skeleton />
 *         ) : (
 *           <MovieGrid movies={sections.nowPlaying.data} />
 *         )}
 *       </div>
 *
 *       // Similar for other sections
 *     </Layout>
 *   );
 * }
 * ```
 */
export function useHomePage(): UseHomePageResult {
  const [heroMovies, setHeroMovies] = useState<MovieCardData[]>([]);
  const [fetchedSections, setFetchedSections] = useState({
    nowPlaying: false,
    popular: false,
    topRated: false,
    upcoming: false,
  });

  // Get window width for responsive limits
  const { breakpoint } = useWindowWidth();

  // Calculate responsive limit based on breakpoint
  const responsiveLimit = useMemo(() => {
    if (breakpoint === 'desktop') return 10;
    if (breakpoint === 'tablet') return 8;
    return 4;
  }, [breakpoint]);

  // Reset fetched flags when responsive limit changes
  useEffect(() => {
    setFetchedSections({
      nowPlaying: false,
      popular: false,
      topRated: false,
      upcoming: false,
    });
  }, [responsiveLimit]);

  // Intersection observers for lazy loading
  const [nowPlayingRef, nowPlayingVisible] = useIntersectionObserver();
  const [popularRef, popularVisible] = useIntersectionObserver();
  const [topRatedRef, topRatedVisible] = useIntersectionObserver();
  const [upcomingRef, upcomingVisible] = useIntersectionObserver();

  // Fetch hero section (trending) immediately
  useEffect(() => {
    const fetchHero = async () => {
      try {
        const response = await apiService.getTrending();
        if (response.success && response.data) {
          const heroData = mapTrendingDataToFrontend(
            response.data.slice(0, responsiveLimit)
          );
          setHeroMovies(heroData);
        }
      } catch (error) {
        console.error('Error fetching hero trending:', error);
      }
    };

    fetchHero();
  }, [responsiveLimit]);

  // Now Playing section - lazy loaded
  const nowPlaying = useMoviesList({
    category: 'now_playing',
    page: 1,
    limit: responsiveLimit,
    enabled: nowPlayingVisible && !fetchedSections.nowPlaying,
  });

  useEffect(() => {
    if (nowPlayingVisible && !fetchedSections.nowPlaying && nowPlaying.isFetched) {
      setFetchedSections((prev) => ({ ...prev, nowPlaying: true }));
    }
  }, [nowPlayingVisible, fetchedSections.nowPlaying, nowPlaying.isFetched]);

  // Popular section - lazy loaded
  const popular = useMoviesList({
    category: 'popular',
    page: 1,
    limit: responsiveLimit,
    enabled: popularVisible && !fetchedSections.popular,
  });

  useEffect(() => {
    if (popularVisible && !fetchedSections.popular && popular.isFetched) {
      setFetchedSections((prev) => ({ ...prev, popular: true }));
    }
  }, [popularVisible, fetchedSections.popular, popular.isFetched]);

  // Top Rated section - lazy loaded
  const topRated = useMoviesList({
    category: 'top_rated',
    page: 1,
    limit: responsiveLimit,
    enabled: topRatedVisible && !fetchedSections.topRated,
  });

  useEffect(() => {
    if (topRatedVisible && !fetchedSections.topRated && topRated.isFetched) {
      setFetchedSections((prev) => ({ ...prev, topRated: true }));
    }
  }, [topRatedVisible, fetchedSections.topRated, topRated.isFetched]);

  // Upcoming section - lazy loaded
  const upcoming = useMoviesList({
    category: 'upcoming',
    page: 1,
    limit: responsiveLimit,
    enabled: upcomingVisible && !fetchedSections.upcoming,
  });

  useEffect(() => {
    if (upcomingVisible && !fetchedSections.upcoming && upcoming.isFetched) {
      setFetchedSections((prev) => ({ ...prev, upcoming: true }));
    }
  }, [upcomingVisible, fetchedSections.upcoming, upcoming.isFetched]);

  // Refetch all sections
  const refetchAll = useCallback(() => {
    setFetchedSections({
      nowPlaying: false,
      popular: false,
      topRated: false,
      upcoming: false,
    });
    nowPlaying.refetch();
    popular.refetch();
    topRated.refetch();
    upcoming.refetch();
  }, [nowPlaying, popular, topRated, upcoming]);

  // Build sections object
  const sections: HomePageSections = {
    hero: heroMovies,
    nowPlaying: {
      data: nowPlaying.movies,
      loading: nowPlaying.loading,
      ref: nowPlayingRef,
      isVisible: nowPlayingVisible,
    },
    popular: {
      data: popular.movies,
      loading: popular.loading,
      ref: popularRef,
      isVisible: popularVisible,
    },
    topRated: {
      data: topRated.movies,
      loading: topRated.loading,
      ref: topRatedRef,
      isVisible: topRatedVisible,
    },
    upcoming: {
      data: upcoming.movies,
      loading: upcoming.loading,
      ref: upcomingRef,
      isVisible: upcomingVisible,
    },
  };

  return {
    sections,
    responsiveLimit,
    refetchAll,
  };
}
