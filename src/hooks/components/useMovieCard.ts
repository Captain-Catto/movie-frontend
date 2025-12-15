"use client";

import { useState, useCallback, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useWindowWidth } from '../useWindowWidth';
import { FALLBACK_POSTER } from '@/constants/app.constants';
import type { MovieCardData } from '@/types/movie';

export interface UseMovieCardOptions {
  movie: MovieCardData;
  hoverCardWidth?: number;
  edgeMargin?: number;
}

export type HoverPosition = 'center' | 'left' | 'right';

export interface UseMovieCardResult {
  // Refs
  cardRef: React.RefObject<HTMLDivElement | null>;

  // Computed values
  contentType: 'movie' | 'tv';
  detailHref: string;
  watchHref: string;
  posterUrl: string;

  // Hover positioning
  hoverPosition: HoverPosition;
  handleHoverPosition: () => void;

  // Actions
  handleWatchClick: (e: React.MouseEvent) => void;
  handleDetailClick: () => void;

  // Favorite button data
  favoriteButtonData: {
    id: number;
    tmdbId: number;
    title: string;
    poster_path: string;
    vote_average?: number;
    media_type: 'movie' | 'tv';
    overview?: string;
    genres: Array<{ id: number; name: string }>;
  };
}

/**
 * useMovieCard Hook
 *
 * Handles all business logic for MovieCard component:
 * - Content type detection (movie vs TV series)
 * - URL generation (detail page and watch page)
 * - Hover card positioning based on viewport
 * - Navigation actions
 * - Poster fallback handling
 * - Favorite button data formatting
 *
 * @example
 * ```tsx
 * function MovieCard({ movie }: { movie: MovieCardData }) {
 *   const {
 *     cardRef,
 *     posterUrl,
 *     detailHref,
 *     watchHref,
 *     hoverPosition,
 *     handleHoverPosition,
 *     handleWatchClick,
 *     favoriteButtonData
 *   } = useMovieCard({ movie });
 *
 *   return (
 *     <div ref={cardRef} onMouseEnter={handleHoverPosition}>
 *       <Link href={detailHref}>
 *         <Image src={posterUrl} alt={movie.title} />
 *       </Link>
 *       <button onClick={handleWatchClick}>Watch</button>
 *       <FavoriteButton movie={favoriteButtonData} />
 *     </div>
 *   );
 * }
 * ```
 */
export function useMovieCard(options: UseMovieCardOptions): UseMovieCardResult {
  const { movie, hoverCardWidth = 384, edgeMargin = 20 } = options;

  const router = useRouter();
  const cardRef = useRef<HTMLDivElement>(null);
  const [hoverPosition, setHoverPosition] = useState<HoverPosition>('center');
  const { width: viewportWidth } = useWindowWidth();

  /**
   * Detect content type from href or fallback to movie
   */
  const contentType: 'movie' | 'tv' = movie.href?.includes('/tv/') ? 'tv' : 'movie';

  /**
   * Generate detail page URL
   * Priority: movie.href > generated URL from tmdbId
   */
  const detailHref = movie.href || `/${contentType}/${movie.tmdbId}`;

  /**
   * Generate watch page URL
   * Format: /watch/{type}-{tmdbId}
   */
  const watchHref = `/watch/${contentType}-${movie.tmdbId}`;

  /**
   * Get poster URL with fallback handling
   * Priority: movie.poster > movie.posterUrl > FALLBACK_POSTER
   */
  const posterUrl =
    movie.poster ||
    ('posterUrl' in movie
      ? (movie as Record<string, string | undefined>).posterUrl
      : undefined) ||
    FALLBACK_POSTER;

  /**
   * Calculate hover card position to prevent overflow
   * Determines if the hover card should be positioned center/left/right
   * based on available viewport space
   */
  const handleHoverPosition = useCallback(() => {
    if (!cardRef.current || viewportWidth === 0) return;

    const cardRect = cardRef.current.getBoundingClientRect();

    // Calculate where the center of hover card would be
    const cardCenterX = cardRect.left + cardRect.width / 2;
    const hoverCardLeft = cardCenterX - hoverCardWidth / 2;
    const hoverCardRight = cardCenterX + hoverCardWidth / 2;

    // Check if hover card would overflow viewport
    if (hoverCardLeft < edgeMargin) {
      setHoverPosition('left');
    } else if (hoverCardRight > viewportWidth - edgeMargin) {
      setHoverPosition('right');
    } else {
      setHoverPosition('center');
    }
  }, [viewportWidth, hoverCardWidth, edgeMargin]);

  /**
   * Handle watch button click
   * Prevents default link behavior and navigates to watch page
   */
  const handleWatchClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      router.push(watchHref);
    },
    [router, watchHref]
  );

  /**
   * Handle detail page navigation
   */
  const handleDetailClick = useCallback(() => {
    router.push(detailHref);
  }, [router, detailHref]);

  /**
   * Format data for FavoriteButton component
   */
  const favoriteButtonData = {
    id: movie.tmdbId,
    tmdbId: movie.tmdbId,
    title: movie.title,
    poster_path: posterUrl,
    vote_average: movie.rating,
    media_type: contentType,
    overview: movie.description,
    genres: movie.genres?.map((genre) => ({ id: 0, name: genre })) || [],
  };

  /**
   * Recalculate hover position when viewport width changes
   */
  useEffect(() => {
    if (viewportWidth > 0) {
      handleHoverPosition();
    }
  }, [viewportWidth, handleHoverPosition]);

  return {
    // Refs
    cardRef,

    // Computed values
    contentType,
    detailHref,
    watchHref,
    posterUrl,

    // Hover positioning
    hoverPosition,
    handleHoverPosition,

    // Actions
    handleWatchClick,
    handleDetailClick,

    // Favorite button data
    favoriteButtonData,
  };
}
