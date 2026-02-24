"use client";

import { useCallback } from 'react';
import { useAsyncQuery } from '../core/useAsyncQuery';
import { apiService } from '@/services/api';
import { useLanguage } from '@/contexts/LanguageContext';
import { mapMoviesToFrontend } from '@/utils/movieMapper';
import { MovieCardData } from "@/types/content.types";
import type { ContentQuery, Movie } from "@/types/content.types";
import type { Pagination } from "@/types/api";

/**
 * Movie category types
 */
export type MovieCategory =
  | 'now_playing'
  | 'popular'
  | 'top_rated'
  | 'upcoming'
  | 'all';

/**
 * Options for useMoviesList hook
 */
export interface UseMoviesListOptions {
  /** Movie category to fetch */
  category?: MovieCategory;
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

export type PaginationMeta = Pagination;

/**
 * Return type for useMoviesList hook
 */
export interface UseMoviesListResult {
  /** Movie list data */
  movies: MovieCardData[];
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
 * Hook for fetching movies list with filters and pagination
 * Automatically maps backend data to frontend format
 *
 * @example
 * ```tsx
 * function PopularMovies() {
 *   const { movies, loading, pagination, refetch } = useMoviesList({
 *     category: 'popular',
 *     page: 1,
 *     genre: '28', // Action
 *   });
 *
 *   if (loading) return <Skeleton />;
 *   if (!movies.length) return <EmptyState />;
 *
 *   return (
 *     <>
 *       <MovieGrid movies={movies} />
 *       <Pagination
 *         page={pagination?.page}
 *         totalPages={pagination?.totalPages}
 *       />
 *     </>
 *   );
 * }
 * ```
 */
export function useMoviesList(
  options: UseMoviesListOptions = {}
): UseMoviesListResult {
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
  const fetchMovies = useCallback(async () => {
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
      case 'now_playing':
        response = await apiService.getNowPlayingMovies(query);
        break;
      case 'popular':
        response = await apiService.getPopularMovies(query);
        break;
      case 'top_rated':
        response = await apiService.getTopRatedMovies(query);
        break;
      case 'upcoming':
        response = await apiService.getUpcomingMovies(query);
        break;
      case 'all':
      default:
        response = await apiService.getMovies(query);
        break;
    }

    if (!response.success) {
      throw new Error(response.message || 'Failed to fetch movies');
    }

    // Extract movies array from response
    const responseData = response.data as { data?: Movie[]; pagination?: { page?: number; totalPages?: number; total?: number } } | Movie[];
    const moviesData = Array.isArray(responseData)
      ? responseData
      : (responseData && typeof responseData === 'object' && 'data' in responseData && Array.isArray(responseData.data))
      ? responseData.data
      : [];

    // Map to frontend format
    const movies = mapMoviesToFrontend(moviesData);

    // Extract pagination
    const paginationData = (!Array.isArray(responseData) && responseData && typeof responseData === 'object' && 'pagination' in responseData)
      ? responseData.pagination
      : undefined;

    const pagination: PaginationMeta = {
      page: paginationData?.page || page,
      totalPages: paginationData?.totalPages || 1,
      total: paginationData?.total || movies.length,
      limit: limit,
    };

    return { movies, pagination };
  }, [category, page, limit, genre, year, sortBy, language]);

  // Use generic async query hook
  const { data, loading, error, refetch, isFetched } = useAsyncQuery({
    queryFn: fetchMovies,
    dependencies: [category, page, limit, genre, year, sortBy, language],
    enabled,
  });

  return {
    movies: data?.movies || [],
    loading,
    error,
    pagination: data?.pagination || null,
    refetch,
    isFetched,
  };
}
