"use client";

import { useState, useRef, useCallback, useMemo } from 'react';
import type { Swiper as SwiperType } from 'swiper';
import { useWindowWidth } from '../useWindowWidth';
import { FALLBACK_POSTER } from '@/constants/app.constants';
import type { MovieCardData } from "@/types/content.types";

export interface UseHeroSectionOptions {
  movies: MovieCardData[];
  thumbnailCounts?: {
    desktop: number;
    tablet: number;
    mobile: number;
  };
}

export interface ProcessedSlideData {
  backgroundImage: string;
  posterImage: string;
  rating: number | null;
  hasRating: boolean;
  displayRating: number;
  year: number;
  contentType: 'movie' | 'tv';
  watchHref: string;
}

export interface UseHeroSectionResult {
  // Swiper controls
  swiperRef: React.MutableRefObject<SwiperType | null>;
  activeIndex: number;
  handleSlideChange: (swiper: SwiperType) => void;
  handleSwiperInit: (swiper: SwiperType) => void;

  // Thumbnail navigation
  thumbnailCount: number;
  handleThumbnailClick: (index: number) => void;

  // Data processing
  processSlideData: (movie: MovieCardData) => ProcessedSlideData;
  getThumbnailImage: (movie: MovieCardData) => string;

  // Computed
  hasMultipleSlides: boolean;
}

/**
 * Normalize rating from various sources
 * Handles multiple rating field names and formats
 */
function normalizeRating(movie: MovieCardData): number | null {
  const movieRecord = movie as unknown as Record<string, unknown>;
  const rawRatingCandidates: Array<number | string | null | undefined> = [
    typeof movie.rating === 'number' || typeof movie.rating === 'string' ? movie.rating : null,
    typeof movieRecord.voteAverage === 'number' || typeof movieRecord.voteAverage === 'string' ? movieRecord.voteAverage : undefined,
    typeof movieRecord.vote_average === 'number' || typeof movieRecord.vote_average === 'string' ? movieRecord.vote_average : undefined,
    typeof movieRecord.score === 'number' || typeof movieRecord.score === 'string' ? movieRecord.score : undefined,
    typeof movieRecord.voteScore === 'number' || typeof movieRecord.voteScore === 'string' ? movieRecord.voteScore : undefined,
  ];

  const normalized = rawRatingCandidates.reduce<number | null>((acc, current) => {
    if (acc !== null) return acc;
    if (current === null || current === undefined) return null;

    let value: number;
    if (typeof current === 'string') {
      const parsed = parseFloat(current.replace(',', '.'));
      if (Number.isNaN(parsed)) return acc;
      value = parsed;
    } else {
      value = current;
    }

    if (!Number.isFinite(value) || value < 0) return acc;
    return Math.round(value * 10) / 10;
  }, null);

  return normalized;
}

/**
 * useHeroSection Hook
 *
 * Manages hero carousel/slider logic:
 * - Swiper instance control and slide navigation
 * - Active slide tracking
 * - Thumbnail navigation with responsive counts
 * - Rating normalization from multiple sources
 * - Image fallback handling (background and poster)
 * - Content type detection and URL generation
 *
 * @example
 * ```tsx
 * function HeroSection({ movies }: { movies: MovieCardData[] }) {
 *   const {
 *     swiperRef,
 *     activeIndex,
 *     handleSlideChange,
 *     handleSwiperInit,
 *     thumbnailCount,
 *     handleThumbnailClick,
 *     processSlideData,
 *     getThumbnailImage,
 *   } = useHeroSection({ movies });
 *
 *   return (
 *     <Swiper
 *       onSwiper={handleSwiperInit}
 *       onSlideChange={handleSlideChange}
 *     >
 *       {movies.map((movie) => {
 *         const data = processSlideData(movie);
 *         return (
 *           <SwiperSlide key={movie.id}>
 *             <Image src={data.backgroundImage} />
 *             <h1>{movie.title}</h1>
 *             <Rating value={data.displayRating} />
 *             <Link href={data.watchHref}>Watch</Link>
 *           </SwiperSlide>
 *         );
 *       })}
 *     </Swiper>
 *   );
 * }
 * ```
 */
export function useHeroSection(options: UseHeroSectionOptions): UseHeroSectionResult {
  const {
    movies,
    thumbnailCounts = {
      desktop: 10,
      tablet: 8,
      mobile: 5,
    },
  } = options;

  const swiperRef = useRef<SwiperType | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const { breakpoint } = useWindowWidth();

  /**
   * Calculate thumbnail count based on current breakpoint
   */
  const thumbnailCount = useMemo(() => {
    if (breakpoint === 'desktop') return thumbnailCounts.desktop;
    if (breakpoint === 'tablet') return thumbnailCounts.tablet;
    return thumbnailCounts.mobile;
  }, [breakpoint, thumbnailCounts]);

  /**
   * Handle Swiper initialization
   */
  const handleSwiperInit = useCallback((swiper: SwiperType) => {
    swiperRef.current = swiper;
  }, []);

  /**
   * Handle slide change and update active index
   */
  const handleSlideChange = useCallback((swiper: SwiperType) => {
    setActiveIndex(swiper.realIndex);
  }, []);

  /**
   * Handle thumbnail click - navigate to specific slide
   */
  const handleThumbnailClick = useCallback((index: number) => {
    if (swiperRef.current) {
      swiperRef.current.slideToLoop(index);
    }
  }, []);

  /**
   * Process slide data for a single movie
   * Extracts and computes all necessary fields for rendering
   */
  const processSlideData = useCallback((movie: MovieCardData): ProcessedSlideData => {
    // Image fallbacks
    const backgroundImage = movie.backgroundImage || movie.poster || FALLBACK_POSTER;
    const posterImage = movie.posterImage || movie.poster || backgroundImage || FALLBACK_POSTER;

    // Rating normalization
    const rating = normalizeRating(movie);
    const hasRating = rating !== null;
    const displayRating = rating ?? 0;

    // Year with fallback to current year
    const year = movie.year ?? new Date().getFullYear();

    // Content type detection
    const contentType: 'movie' | 'tv' = movie.href?.includes('/tv/') ? 'tv' : 'movie';

    // Watch URL generation
    const watchTargetId = movie.tmdbId || parseInt(movie.id, 10) || movie.id;
    const watchHref = watchTargetId ? `/watch/${contentType}-${watchTargetId}` : movie.href;

    return {
      backgroundImage,
      posterImage,
      rating,
      hasRating,
      displayRating,
      year,
      contentType,
      watchHref,
    };
  }, []);

  /**
   * Get thumbnail image for a movie
   * Prioritizes background image over poster
   */
  const getThumbnailImage = useCallback((movie: MovieCardData): string => {
    const backgroundImage = movie.backgroundImage || movie.poster || FALLBACK_POSTER;
    const posterImage = movie.posterImage || movie.poster || backgroundImage;
    return backgroundImage || posterImage;
  }, []);

  /**
   * Check if there are multiple slides
   */
  const hasMultipleSlides = movies.length > 1;

  return {
    // Swiper controls
    swiperRef,
    activeIndex,
    handleSlideChange,
    handleSwiperInit,

    // Thumbnail navigation
    thumbnailCount,
    handleThumbnailClick,

    // Data processing
    processSlideData,
    getThumbnailImage,

    // Computed
    hasMultipleSlides,
  };
}
