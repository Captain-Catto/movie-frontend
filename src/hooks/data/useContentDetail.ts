"use client";

import { useCallback } from 'react';
import { useAsyncQuery } from '../core/useAsyncQuery';
import { apiService } from '@/services/api';
import { mapMoviesToFrontend } from '@/utils/movieMapper';
import { mapTVSeriesToFrontendList } from '@/utils/tvMapper';
import { MovieCardData } from '@/types/movie';
import type { Movie, TVSeries } from '@/types/movie';
import type { CreditsData } from '@/types/api';

/**
 * Video data from TMDB
 */
export interface VideoData {
  id: string;
  key: string;
  name: string;
  site: string;
  type: string;
  official: boolean;
}

/**
 * Content detail data (movie or TV series)
 */
export interface ContentDetailData {
  /** Content data (movie or TV show) */
  content: Movie | TVSeries | null;
  /** Credits (cast and crew) */
  credits: CreditsData | null;
  /** Recommended content */
  recommendations: MovieCardData[];
  /** Videos (trailers, teasers, etc.) */
  videos: VideoData[];
}

/**
 * Options for useContentDetail hook
 */
export interface UseContentDetailOptions {
  /** Content ID */
  id: number;
  /** Content type */
  type: 'movie' | 'tv';
  /** Whether to fetch credits */
  fetchCredits?: boolean;
  /** Whether to fetch recommendations */
  fetchRecommendations?: boolean;
  /** Whether to fetch videos */
  fetchVideos?: boolean;
  /** Whether query is enabled */
  enabled?: boolean;
}

/**
 * Return type for useContentDetail hook
 */
export interface UseContentDetailResult {
  /** Content detail data */
  data: ContentDetailData | null;
  /** Loading state */
  loading: boolean;
  /** Error state */
  error: Error | null;
  /** Refetch all data */
  refetch: () => Promise<void>;
  /** Whether data has been fetched */
  isFetched: boolean;
}

/**
 * Hook for fetching content detail page data (content + credits + recommendations + videos)
 * Fetches all data in parallel for better performance
 *
 * @example
 * ```tsx
 * function MovieDetailPage({ params }: { params: { id: string } }) {
 *   const { data, loading, error } = useContentDetail({
 *     id: parseInt(params.id),
 *     type: 'movie',
 *   });
 *
 *   if (loading) return <DetailSkeleton />;
 *   if (error || !data) return <ErrorPage />;
 *
 *   const { content, credits, recommendations, videos } = data;
 *
 *   return (
 *     <>
 *       <HeroSection content={content} trailer={videos[0]} />
 *       <CastSection cast={credits?.cast} />
 *       <RecommendationsSection movies={recommendations} />
 *     </>
 *   );
 * }
 * ```
 */
export function useContentDetail(
  options: UseContentDetailOptions
): UseContentDetailResult {
  const {
    id,
    type,
    fetchCredits = true,
    fetchRecommendations = true,
    fetchVideos = true,
    enabled = true,
  } = options;

  // Fetch all data in parallel
  const fetchDetail = useCallback(async (): Promise<ContentDetailData> => {
    try {
      // Build promises array based on what to fetch
      const promises: Promise<unknown>[] = [];

      // 1. Always fetch content
      const contentPromise =
        type === 'movie'
          ? apiService.getMovieById(id)
          : apiService.getTVSeriesById(id);
      promises.push(contentPromise);

      // 2. Fetch credits if enabled
      const creditsPromise = fetchCredits
        ? type === 'movie'
          ? apiService.getMovieCredits(id)
          : apiService.getTVCredits(id)
        : Promise.resolve({ success: true, data: null });
      promises.push(creditsPromise);

      // 3. Fetch recommendations if enabled
      const recommendationsPromise = fetchRecommendations
        ? type === 'movie'
          ? apiService.getMovieRecommendations(id)
          : apiService.getTVRecommendations(id)
        : Promise.resolve({ success: true, data: { data: [] } });
      promises.push(recommendationsPromise);

      // 4. Fetch videos if enabled
      const videosPromise = fetchVideos
        ? type === 'movie'
          ? apiService.getMovieVideos(id)
          : apiService.getTVVideos(id)
        : Promise.resolve({ success: true, data: { results: [] } });
      promises.push(videosPromise);

      // Execute all requests in parallel
      const results = await Promise.all(promises);

      // Type-assert the results
      const contentRes = results[0] as { success: boolean; message?: string; data?: unknown };
      const creditsRes = results[1] as { success: boolean; data?: unknown };
      const recommendationsRes = results[2] as { success: boolean; data?: { data?: unknown[] } | unknown[] };
      const videosRes = results[3] as { success: boolean; data?: { results?: unknown[] } };

      // Validate responses
      if (!contentRes.success) {
        throw new Error(contentRes.message || 'Failed to fetch content');
      }

      // Extract and transform data
      const content = (contentRes.data as Movie | TVSeries) || null;
      const credits = (creditsRes.data as CreditsData) || null;

      // Map recommendations to frontend format
      let recommendationsData: unknown[] = [];
      if (recommendationsRes.success && recommendationsRes.data) {
        const recData = recommendationsRes.data as { data?: unknown[] } | unknown[];
        if (Array.isArray(recData)) {
          recommendationsData = recData;
        } else if (recData && typeof recData === 'object' && 'data' in recData && Array.isArray(recData.data)) {
          recommendationsData = recData.data;
        }
      }

      const recommendations =
        type === 'movie'
          ? mapMoviesToFrontend(recommendationsData as unknown as Movie[])
          : mapTVSeriesToFrontendList(recommendationsData as unknown as TVSeries[]);

      // Extract videos
      const videos: VideoData[] = videosRes.success
        ? ((videosRes.data?.results || []) as Array<Record<string, unknown>>).map((video) => ({
            id: String(video.id || ''),
            key: String(video.key || ''),
            name: String(video.name || ''),
            site: String(video.site || ''),
            type: String(video.type || ''),
            official: Boolean(video.official),
          }))
        : [];

      return {
        content,
        credits,
        recommendations,
        videos,
      };
    } catch (error) {
      console.error('Error fetching content detail:', error);
      throw error instanceof Error
        ? error
        : new Error('Failed to fetch content detail');
    }
  }, [id, type, fetchCredits, fetchRecommendations, fetchVideos]);

  // Use generic async query hook
  const { data, loading, error, refetch, isFetched } = useAsyncQuery({
    queryFn: fetchDetail,
    dependencies: [id, type, fetchCredits, fetchRecommendations, fetchVideos],
    enabled,
  });

  return {
    data,
    loading,
    error,
    refetch,
    isFetched,
  };
}
