"use client";

import { useState, useCallback, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export interface MovieFilters {
  countries: string[];
  genres: string[];
  years: string[];
  customYear: string;
  sortBy: string;
  movieType?: string; // 'movie' | 'tv' | 'trending' | ''
}

export interface UseMovieFiltersOptions {
  basePath?: string;
  initialFilters?: Partial<MovieFilters>;
  onFilterChange?: (filters: MovieFilters) => void;
}

export interface UseMovieFiltersResult {
  // Current filters state
  filters: MovieFilters;

  // Individual filter setters
  setCountries: (countries: string[]) => void;
  setGenres: (genres: string[]) => void;
  setYears: (years: string[]) => void;
  setCustomYear: (year: string) => void;
  setSortBy: (sortBy: string) => void;
  setMovieType: (type: string) => void;

  // Bulk operations
  updateFilters: (filters: Partial<MovieFilters>) => void;
  clearFilters: () => void;
  resetToDefaults: () => void;

  // URL operations
  syncFiltersFromUrl: () => MovieFilters;
  updateUrlWithFilters: (filters: MovieFilters, page?: number) => void;

  // Filter validation
  hasActiveFilters: boolean;
  activeFilterCount: number;

  // API query params generation
  toApiQueryParams: (page?: number, limit?: number) => Record<string, string | number>;
}

const DEFAULT_FILTERS: MovieFilters = {
  countries: [],
  genres: [],
  years: [],
  customYear: '',
  sortBy: 'popularity',
  movieType: '',
};

/**
 * useMovieFilters Hook
 *
 * Manages movie/TV filtering state and URL synchronization:
 * - Multi-dimensional filters (countries, genres, years, sort)
 * - URL query params parsing and updating
 * - Filter state management with individual setters
 * - API query params generation
 * - Active filter tracking
 *
 * @example
 * ```tsx
 * function BrowsePage() {
 *   const {
 *     filters,
 *     setGenres,
 *     setYears,
 *     clearFilters,
 *     hasActiveFilters,
 *     updateUrlWithFilters,
 *     toApiQueryParams,
 *   } = useMovieFilters({ basePath: '/browse' });
 *
 *   const handleGenreChange = (genres: string[]) => {
 *     setGenres(genres);
 *     updateUrlWithFilters({ ...filters, genres }, 1);
 *   };
 *
 *   const apiParams = toApiQueryParams(1, 24);
 *   // Use apiParams to fetch data
 *
 *   return (
 *     <>
 *       <FilterPanel filters={filters} onGenreChange={handleGenreChange} />
 *       {hasActiveFilters && <button onClick={clearFilters}>Clear</button>}
 *     </>
 *   );
 * }
 * ```
 */
export function useMovieFilters(options: UseMovieFiltersOptions = {}): UseMovieFiltersResult {
  const { basePath = '/browse', initialFilters = {}, onFilterChange } = options;

  const router = useRouter();
  const searchParams = useSearchParams();

  const [filters, setFilters] = useState<MovieFilters>({
    ...DEFAULT_FILTERS,
    ...initialFilters,
  });

  /**
   * Parse filters from current URL query params
   */
  const syncFiltersFromUrl = useCallback((): MovieFilters => {
    const countries = searchParams.get('countries')?.split(',').filter(Boolean) || [];
    const genres = searchParams.get('genres')?.split(',').filter(Boolean) || [];
    const years = searchParams.get('years')?.split(',').filter(Boolean) || [];
    const customYear = searchParams.get('customYear') || '';
    const sortBy = searchParams.get('sortBy') || 'popularity';
    const movieType = searchParams.get('type') || searchParams.get('movieType') || '';

    const parsedFilters: MovieFilters = {
      countries,
      genres,
      years,
      customYear,
      sortBy,
      movieType,
    };

    setFilters(parsedFilters);
    return parsedFilters;
  }, [searchParams]);

  /**
   * Update URL with current filters
   */
  const updateUrlWithFilters = useCallback(
    (newFilters: MovieFilters, page?: number) => {
      const params = new URLSearchParams();

      // Add filter params only if they have values
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
      if (newFilters.movieType) {
        params.set('type', newFilters.movieType);
      }
      if (page && page > 1) {
        params.set('page', page.toString());
      }

      const queryString = params.toString();
      const url = `${basePath}${queryString ? `?${queryString}` : ''}`;

      router.replace(url, { scroll: false });
    },
    [router, basePath]
  );

  /**
   * Update specific filter
   */
  const updateFilters = useCallback(
    (partialFilters: Partial<MovieFilters>) => {
      const newFilters = { ...filters, ...partialFilters };
      setFilters(newFilters);
      onFilterChange?.(newFilters);
      return newFilters;
    },
    [filters, onFilterChange]
  );

  /**
   * Individual filter setters
   */
  const setCountries = useCallback(
    (countries: string[]) => {
      updateFilters({ countries });
    },
    [updateFilters]
  );

  const setGenres = useCallback(
    (genres: string[]) => {
      updateFilters({ genres });
    },
    [updateFilters]
  );

  const setYears = useCallback(
    (years: string[]) => {
      updateFilters({ years });
    },
    [updateFilters]
  );

  const setCustomYear = useCallback(
    (customYear: string) => {
      updateFilters({ customYear });
    },
    [updateFilters]
  );

  const setSortBy = useCallback(
    (sortBy: string) => {
      updateFilters({ sortBy });
    },
    [updateFilters]
  );

  const setMovieType = useCallback(
    (movieType: string) => {
      updateFilters({ movieType });
    },
    [updateFilters]
  );

  /**
   * Clear all filters (reset to defaults)
   */
  const clearFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
    onFilterChange?.(DEFAULT_FILTERS);
    updateUrlWithFilters(DEFAULT_FILTERS, 1);
  }, [onFilterChange, updateUrlWithFilters]);

  /**
   * Reset to initial filters
   */
  const resetToDefaults = useCallback(() => {
    const defaultFilters = { ...DEFAULT_FILTERS, ...initialFilters };
    setFilters(defaultFilters);
    onFilterChange?.(defaultFilters);
  }, [initialFilters, onFilterChange]);

  /**
   * Check if any filters are active
   */
  const hasActiveFilters = useMemo(() => {
    return (
      filters.countries.length > 0 ||
      filters.genres.length > 0 ||
      filters.years.length > 0 ||
      !!filters.customYear ||
      !!(filters.sortBy && filters.sortBy !== 'popularity')
    );
  }, [filters]);

  /**
   * Count active filters
   */
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.countries.length > 0) count++;
    if (filters.genres.length > 0) count++;
    if (filters.years.length > 0 || filters.customYear) count++;
    if (filters.sortBy && filters.sortBy !== 'popularity') count++;
    return count;
  }, [filters]);

  /**
   * Convert filters to API query params
   */
  const toApiQueryParams = useCallback(
    (page: number = 1, limit: number = 24): Record<string, string | number> => {
      const params: Record<string, string | number> = {
        page,
        limit,
      };

      if (filters.countries?.length) {
        params.countries = filters.countries.join(',');
      }

      if (filters.genres?.length) {
        const normalizedGenres = filters.genres.map((g) => g.trim()).filter(Boolean);
        if (normalizedGenres.length) {
          params.genre = normalizedGenres.join(',');
        }
      }

      // Year priority: customYear > years array
      const targetYear = filters.customYear || (filters.years?.length ? filters.years[0] : undefined);
      if (targetYear) {
        const parsedYear = parseInt(targetYear, 10);
        if (!Number.isNaN(parsedYear)) {
          params.year = parsedYear;
        }
      }

      if (filters.sortBy) {
        params.sortBy = filters.sortBy;
      }

      return params;
    },
    [filters]
  );

  return {
    // Current state
    filters,

    // Individual setters
    setCountries,
    setGenres,
    setYears,
    setCustomYear,
    setSortBy,
    setMovieType,

    // Bulk operations
    updateFilters,
    clearFilters,
    resetToDefaults,

    // URL operations
    syncFiltersFromUrl,
    updateUrlWithFilters,

    // Filter validation
    hasActiveFilters,
    activeFilterCount,

    // API query params
    toApiQueryParams,
  };
}
