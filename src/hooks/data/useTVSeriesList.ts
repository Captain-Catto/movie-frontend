"use client";

import { useCallback } from 'react';
import { useAsyncQuery } from '../core/useAsyncQuery';
import { apiService } from '@/services/api';
import { useLanguage } from '@/contexts/LanguageContext';
import { mapTVSeriesToFrontendList } from '@/utils/tvMapper';
import { MovieCardData } from "@/types/content.types";
import type { ContentQuery, TVSeries } from "@/types/content.types";
import type { PaginationMeta } from './useMoviesList';

/**
 * TV Series category types
 */
export type TVSeriesCategory = 'on_the_air' | 'popular' | 'top_rated' | 'all';

/**
 * Options for useTVSeriesList hook
 */
export interface UseTVSeriesListOptions {
  /** TV series category to fetch */
  category?: TVSeriesCategory;
  /** Page number */
  page?: number;
  /** Number of items per page */
  limit?: number;
  /** Genre filter */
  genre?: string;
  /** Year filter */
  year?: number;
  /** Sort by field */
  sortBy?: string;
  /** Language code */
  language?: string;
  /** Whether query is enabled */
  enabled?: boolean;
}

/**
 * Return type for useTVSeriesList hook
 */
export interface UseTVSeriesListResult {
  /** TV series list data */
  series: MovieCardData[];
  /** Loading state */
  loading: boolean;
  /** Error state */
  error: Error | null;
  /** Pagination metadata */
  pagination: PaginationMeta | null;
  /** Refetch data */
  refetch: () => Promise<void>;
  /** Whether data has been fetched */
  isFetched: boolean;
}

/**
 * Hook for fetching TV series list with filters and pagination
 * Automatically maps backend data to frontend format
 *
 * @example
 * ```tsx
 * function PopularTVShows() {
 *   const { series, loading, pagination, refetch } = useTVSeriesList({
 *     category: 'popular',
 *     page: 1,
 *     genre: '10765', // Sci-Fi & Fantasy
 *   });
 *
 *   if (loading) return <Skeleton />;
 *   if (!series.length) return <EmptyState />;
 *
 *   return (
 *     <>
 *       <MovieGrid movies={series} />
 *       <Pagination
 *         page={pagination?.page}
 *         totalPages={pagination?.totalPages}
 *       />
 *     </>
 *   );
 * }
 * ```
 */
export function useTVSeriesList(
  options: UseTVSeriesListOptions = {}
): UseTVSeriesListResult {
  const {
    category = 'all',
    page = 1,
    limit = 24,
    genre,
    year,
    sortBy,
    language: languageOption,
    enabled = true,
  } = options;

  const { language: contextLanguage } = useLanguage();
  const language = languageOption || contextLanguage;

  // Select API method based on category
  const fetchTVSeries = useCallback(async () => {
    // Build query object
    const query: ContentQuery = {
      page,
      limit,
      ...(genre && { genre }),
      ...(year && { year }),
      ...(sortBy && { sortBy }),
      ...(language && { language }),
    };

    let response;

    switch (category) {
      case 'on_the_air':
        response = await apiService.getOnTheAirTVSeries(query);
        break;
      case 'popular':
        response = await apiService.getPopularTVSeries(query);
        break;
      case 'top_rated':
        response = await apiService.getTopRatedTVSeries(query);
        break;
      case 'all':
      default:
        response = await apiService.getTVSeries(query);
        break;
    }

    if (!response.success) {
      throw new Error(response.message || 'Failed to fetch TV series');
    }

    // Extract TV series array from response
    const responseData = response.data as { data?: TVSeries[]; pagination?: { page?: number; totalPages?: number; total?: number } } | TVSeries[];
    const seriesData = Array.isArray(responseData)
      ? responseData
      : (responseData && typeof responseData === 'object' && 'data' in responseData && Array.isArray(responseData.data))
      ? responseData.data
      : [];

    // Map to frontend format (using TV series mapper)
    const series = mapTVSeriesToFrontendList(seriesData);

    // Extract pagination
    const paginationData = (!Array.isArray(responseData) && responseData && typeof responseData === 'object' && 'pagination' in responseData)
      ? responseData.pagination
      : undefined;

    const pagination: PaginationMeta = {
      page: paginationData?.page || page,
      totalPages: paginationData?.totalPages || 1,
      total: paginationData?.total || series.length,
      limit: limit,
    };

    return { series, pagination };
  }, [category, page, limit, genre, year, sortBy, language]);

  // Use generic async query hook
  const { data, loading, error, refetch, isFetched } = useAsyncQuery({
    queryFn: fetchTVSeries,
    dependencies: [category, page, limit, genre, year, sortBy, language],
    enabled,
  });

  return {
    series: data?.series || [],
    loading,
    error,
    pagination: data?.pagination || null,
    refetch,
    isFetched,
  };
}
