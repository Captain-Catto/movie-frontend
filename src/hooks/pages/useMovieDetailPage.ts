"use client";

import { useMemo } from 'react';
import { useContentDetail } from '../data/useContentDetail';
import { useFavorites } from '../state/useFavorites';
import type { MovieCardData } from '@/types/movie';
import type { Movie, TVSeries } from '@/types/movie';
import type { CastMember, CrewMember, CreditsData } from '@/types/api';

/**
 * Processed detail page data with derived fields
 */
export interface ProcessedDetailData {
  /** Movie or TV series data */
  content: Movie | TVSeries | null;
  /** Content type */
  type: 'movie' | 'tv';
  /** Credits data */
  credits: CreditsData | null;
  /** Director info */
  director: { id: number; name: string } | null;
  /** Country */
  country: string;
  /** Top cast (up to 10) */
  cast: CastMember[];
  /** Runtime formatted */
  runtime: string | null;
  /** Status */
  status: string;
  /** Trailer video */
  trailer: { id: string; key: string; name: string } | null;
  /** Recommended content */
  recommendations: MovieCardData[];
  /** Whether content is favorited */
  isFavorited: boolean;
}

/**
 * Options for useMovieDetailPage hook
 */
export interface UseMovieDetailPageOptions {
  /** Content ID */
  id: number;
  /** Content type */
  type: 'movie' | 'tv';
}

/**
 * Return type for useMovieDetailPage hook
 */
export interface UseMovieDetailPageResult {
  /** Processed detail data */
  data: ProcessedDetailData | null;
  /** Loading state */
  loading: boolean;
  /** Error state */
  error: Error | null;
  /** Refetch data */
  refetch: () => Promise<void>;
  /** Toggle favorite */
  toggleFavorite: () => Promise<void>;
}

/**
 * Hook for movie/TV detail page with processed data
 * Wraps useContentDetail and adds derived fields like director, country, etc.
 *
 * @example
 * ```tsx
 * function MovieDetailPage({ params }: { params: { id: string } }) {
 *   const { data, loading, error, toggleFavorite } = useMovieDetailPage({
 *     id: parseInt(params.id),
 *     type: 'movie',
 *   });
 *
 *   if (loading) return <DetailSkeleton />;
 *   if (error || !data) return <ErrorPage />;
 *
 *   return (
 *     <>
 *       <HeroSection content={data.content} trailer={data.trailer} />
 *       <FavoriteButton
 *         isFavorited={data.isFavorited}
 *         onClick={toggleFavorite}
 *       />
 *       <CastSection cast={data.cast} director={data.director} />
 *       <RecommendationsSection movies={data.recommendations} />
 *     </>
 *   );
 * }
 * ```
 */
export function useMovieDetailPage(
  options: UseMovieDetailPageOptions
): UseMovieDetailPageResult {
  const { id, type } = options;

  // Fetch all detail data
  const {
    data: rawData,
    loading,
    error,
    refetch,
  } = useContentDetail({
    id,
    type,
    fetchCredits: true,
    fetchRecommendations: true,
    fetchVideos: true,
  });

  // Favorites state
  const { isFavorite, toggleFavorite: toggleFav } = useFavorites();

  // Process data with derived fields
  const processedData = useMemo<ProcessedDetailData | null>(() => {
    if (!rawData || !rawData.content) return null;

    const { content, credits, recommendations, videos } = rawData;

    // Find director from crew
    const director =
      credits?.crew?.find(
        (person: CrewMember) =>
          person.job === 'Director' || person.job === 'director'
      ) || null;

    // Get country from production_countries
    const country = credits?.production_countries?.[0]?.name || 'Unknown';

    // Get top 10 cast
    const cast = credits?.cast?.slice(0, 10) || [];

    // Format runtime
    const runtime = credits?.runtime
      ? `${Math.floor(credits.runtime / 60)}h ${credits.runtime % 60}m`
      : null;

    // Get status
    const status = credits?.status || 'Unknown';

    // Find official trailer
    const trailer =
      videos?.find(
        (video) =>
          video.type === 'Trailer' && video.official && video.site === 'YouTube'
      ) ||
      videos?.find((video) => video.type === 'Trailer') ||
      videos?.[0] ||
      null;

    // Check if favorited
    const favorited = isFavorite(id, type);

    return {
      content,
      type,
      credits,
      director: director
        ? { id: director.id, name: director.name }
        : null,
      country,
      cast,
      runtime,
      status,
      trailer,
      recommendations,
      isFavorited: favorited,
    };
  }, [rawData, id, type, isFavorite]);

  // Toggle favorite handler
  const handleToggleFavorite = async () => {
    await toggleFav(id, type);
  };

  return {
    data: processedData,
    loading,
    error,
    refetch,
    toggleFavorite: handleToggleFavorite,
  };
}
