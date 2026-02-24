"use client";

import { useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { usePagination } from '../core/usePagination';
import { useMoviesList } from '../data/useMoviesList';
import { useTVSeriesList } from '../data/useTVSeriesList';
import { MovieCardData } from "@/types/content.types";
import type { MovieCategory } from '../data/useMoviesList';
import type { TVSeriesCategory } from '../data/useTVSeriesList';

/**
 * Content type for browse page
 */
export type BrowseContentType = 'movie' | 'tv';

/**
 * Filter options for browse page
 */
export interface BrowseFilters {
  /** Country codes */
  countries?: string[];
  /** Genre IDs */
  genres?: string[];
  /** Years */
  years?: number[];
  /** Custom year */
  customYear?: string;
  /** Sort by field */
  sortBy?: string;
}

/**
 * Return type for useBrowsePage hook
 */
export interface UseBrowsePageResult {
  /** Content data (movies or TV series) */
  content: MovieCardData[];
  /** Loading state */
  loading: boolean;
  /** Error state */
  error: Error | null;
  /** Current page */
  page: number;
  /** Total pages */
  totalPages: number;
  /** Total items */
  totalItems: number;
  /** Current filters */
  filters: BrowseFilters;
  /** Content type (movie or tv) */
  contentType: BrowseContentType;
  /** Update single filter */
  updateFilter: (key: keyof BrowseFilters, value: string[] | number[] | string | undefined) => void;
  /** Update multiple filters at once */
  updateFilters: (filters: Partial<BrowseFilters>) => void;
  /** Clear all filters */
  clearFilters: () => void;
  /** Go to specific page */
  goToPage: (page: number) => void;
  /** Set content type */
  setContentType: (type: BrowseContentType) => void;
}

/**
 * Hook for managing browse page with complex filters and pagination
 * Syncs filters with URL params and handles both movies and TV series
 *
 * @example
 * ```tsx
 * function BrowsePage() {
 *   const {
 *     content,
 *     loading,
 *     filters,
 *     updateFilter,
 *     clearFilters,
 *     page,
 *     totalPages,
 *     goToPage,
 *   } = useBrowsePage();
 *
 *   return (
 *     <>
 *       <MovieFilters
 *         filters={filters}
 *         onFilterChange={updateFilter}
 *         onClear={clearFilters}
 *       />
 *       {loading ? <Skeleton /> : <MovieGrid movies={content} />}
 *       <Pagination page={page} totalPages={totalPages} onPageChange={goToPage} />
 *     </>
 *   );
 * }
 * ```
 */
export function useBrowsePage(): UseBrowsePageResult {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Parse initial filters from URL
  const initialFilters: BrowseFilters = {
    countries: searchParams.get('countries')?.split(',').filter(Boolean) || [],
    genres: searchParams.get('genres')?.split(',').filter(Boolean) || [],
    years: searchParams
      .get('years')
      ?.split(',')
      .map(Number)
      .filter((n) => !isNaN(n)) || [],
    customYear: searchParams.get('customYear') || '',
    sortBy: searchParams.get('sortBy') || 'popularity',
  };

  const initialType =
    (searchParams.get('type') as BrowseContentType) || 'movie';

  const [filters, setFilters] = useState<BrowseFilters>(initialFilters);
  const [contentType, setContentType] =
    useState<BrowseContentType>(initialType);

  // Pagination
  const { page, goToPage: paginationGoToPage } = usePagination({
    basePath: '/browse',
  });

  // Fetch movies or TV series based on content type
  const movieQuery = useMoviesList({
    category: 'all' as MovieCategory,
    page,
    limit: 24,
    genre: filters.genres?.join(','),
    year: filters.years?.[0],
    sortBy: filters.sortBy,
    enabled: contentType === 'movie',
  });

  const tvQuery = useTVSeriesList({
    category: 'all' as TVSeriesCategory,
    page,
    limit: 24,
    genre: filters.genres?.join(','),
    year: filters.years?.[0],
    sortBy: filters.sortBy,
    enabled: contentType === 'tv',
  });

  // Select data based on content type
  const content = contentType === 'movie' ? movieQuery.movies : tvQuery.series;
  const loading = contentType === 'movie' ? movieQuery.loading : tvQuery.loading;
  const error = contentType === 'movie' ? movieQuery.error : tvQuery.error;
  const pagination =
    contentType === 'movie' ? movieQuery.pagination : tvQuery.pagination;

  // Update URL when filters or content type changes
  const updateURL = useCallback(
    (newFilters: BrowseFilters, newPage: number, newType: BrowseContentType) => {
      const params = new URLSearchParams();

      if (newFilters.countries?.length) {
        params.set('countries', newFilters.countries.join(','));
      }
      if (newFilters.genres?.length) {
        params.set('genres', newFilters.genres.join(','));
      }
      if (newFilters.years?.length) {
        params.set('years', newFilters.years.join(','));
      }
      if (newFilters.customYear) {
        params.set('customYear', newFilters.customYear);
      }
      if (newFilters.sortBy && newFilters.sortBy !== 'popularity') {
        params.set('sortBy', newFilters.sortBy);
      }
      if (newType !== 'movie') {
        params.set('type', newType);
      }
      if (newPage > 1) {
        params.set('page', newPage.toString());
      }

      const queryString = params.toString();
      router.replace(`/browse${queryString ? `?${queryString}` : ''}`, {
        scroll: false,
      });
    },
    [router]
  );

  // Go to page
  const goToPage = useCallback(
    (newPage: number) => {
      paginationGoToPage(newPage);
      updateURL(filters, newPage, contentType);
    },
    [paginationGoToPage, filters, contentType, updateURL]
  );

  // Update single filter
  const updateFilter = useCallback(
    (key: keyof BrowseFilters, value: string[] | number[] | string | undefined) => {
      const newFilters = { ...filters, [key]: value };
      setFilters(newFilters);
      updateURL(newFilters, 1, contentType); // Reset to page 1
      goToPage(1);
    },
    [filters, contentType, updateURL, goToPage]
  );

  // Update multiple filters
  const updateFilters = useCallback(
    (newFilters: Partial<BrowseFilters>) => {
      const mergedFilters = { ...filters, ...newFilters };
      setFilters(mergedFilters);
      updateURL(mergedFilters, 1, contentType); // Reset to page 1
      goToPage(1);
    },
    [filters, contentType, updateURL, goToPage]
  );

  // Clear all filters
  const clearFilters = useCallback(() => {
    const emptyFilters: BrowseFilters = {
      countries: [],
      genres: [],
      years: [],
      customYear: '',
      sortBy: 'popularity',
    };
    setFilters(emptyFilters);
    updateURL(emptyFilters, 1, contentType);
    goToPage(1);
  }, [contentType, updateURL, goToPage]);

  // Update content type
  const handleSetContentType = useCallback(
    (type: BrowseContentType) => {
      setContentType(type);
      updateURL(filters, 1, type); // Reset to page 1
      goToPage(1);
    },
    [filters, updateURL, goToPage]
  );

  return {
    content,
    loading,
    error,
    page,
    totalPages: pagination?.totalPages || 1,
    totalItems: pagination?.total || 0,
    filters,
    contentType,
    updateFilter,
    updateFilters,
    clearFilters,
    goToPage,
    setContentType: handleSetContentType,
  };
}
