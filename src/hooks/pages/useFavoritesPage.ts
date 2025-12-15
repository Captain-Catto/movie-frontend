"use client";

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useFavorites } from '../state/useFavorites';
import { usePagination } from '../core/usePagination';
import { apiService } from '@/services/api';
import { mapMovieToFrontend } from '@/utils/movieMapper';
import { mapTVSeriesToFrontend } from '@/utils/tvMapper';
import type { MovieCardData } from '@/types/movie';

export interface UseFavoritesPageOptions {
  itemsPerPage?: number;
}

export type FavoritesContentType = 'all' | 'movie' | 'tv';

export interface UseFavoritesPageResult {
  // Data
  items: MovieCardData[];
  filteredItems: MovieCardData[];

  // Loading states
  loading: boolean;
  error: string | null;

  // Pagination
  page: number;
  totalPages: number;
  goToPage: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;

  // Filters
  contentType: FavoritesContentType;
  setContentType: (type: FavoritesContentType) => void;

  // Actions
  removeFavorite: (id: number | string, type: 'movie' | 'tv') => Promise<void>;
  clearAllFavorites: () => Promise<void>;
  refetch: () => Promise<void>;

  // Computed
  isEmpty: boolean;
  hasFiltered: boolean;
  totalCount: number;
  movieCount: number;
  tvCount: number;
}

/**
 * useFavoritesPage Hook
 *
 * Manages the favorites page state and logic:
 * - Fetches full details for all favorited content
 * - Handles client-side filtering by content type
 * - Manages pagination of favorites list
 * - Provides actions for removing favorites
 *
 * @example
 * ```tsx
 * function FavoritesPage() {
 *   const {
 *     filteredItems,
 *     loading,
 *     page,
 *     totalPages,
 *     goToPage,
 *     contentType,
 *     setContentType,
 *     removeFavorite,
 *     isEmpty
 *   } = useFavoritesPage({ itemsPerPage: 24 });
 *
 *   if (isEmpty) return <EmptyState />;
 *
 *   return (
 *     <>
 *       <FilterTabs type={contentType} onChange={setContentType} />
 *       <MovieGrid movies={filteredItems} onRemove={removeFavorite} />
 *       <Pagination page={page} total={totalPages} onPageChange={goToPage} />
 *     </>
 *   );
 * }
 * ```
 */
export function useFavoritesPage(options: UseFavoritesPageOptions = {}): UseFavoritesPageResult {
  const { itemsPerPage = 24 } = options;

  const { favoriteKeys, toggleFavorite, clearAllFavorites: clearAll, loadFavorites } = useFavorites();
  const { page, goToPage, nextPage, prevPage } = usePagination({ basePath: '/favorites', initialPage: 1 });

  const [items, setItems] = useState<MovieCardData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [contentType, setContentType] = useState<FavoritesContentType>('all');

  /**
   * Parse favorite keys into IDs and types
   * favoriteKey format: "movie_123" or "tv_456"
   */
  const parsedFavorites = useMemo(() => {
    return favoriteKeys.map(key => {
      const [type, id] = key.split('_');
      return {
        id: parseInt(id, 10),
        type: type as 'movie' | 'tv',
        key,
      };
    });
  }, [favoriteKeys]);

  /**
   * Fetch full details for all favorited items
   */
  const fetchFavoritesDetails = useCallback(async () => {
    if (parsedFavorites.length === 0) {
      setItems([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Fetch all favorites in parallel
      const promises = parsedFavorites.map(async ({ id, type }) => {
        try {
          if (type === 'movie') {
            const response = await apiService.getMovieById(id);
            if (response.success && response.data) {
              return mapMovieToFrontend(response.data as unknown as Record<string, unknown>);
            }
          } else if (type === 'tv') {
            const response = await apiService.getTVSeriesById(id);
            if (response.success && response.data) {
              return mapTVSeriesToFrontend(response.data as unknown as Record<string, unknown>);
            }
          }
          return null;
        } catch (err) {
          console.error(`Failed to fetch ${type} ${id}:`, err);
          return null;
        }
      });

      const results = await Promise.all(promises);
      const validItems = results.filter((item): item is NonNullable<typeof item> => item !== null) as MovieCardData[];

      setItems(validItems);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load favorites';
      setError(errorMessage);
      console.error('Error fetching favorites:', err);
    } finally {
      setLoading(false);
    }
  }, [parsedFavorites]);

  /**
   * Load favorites on mount and when favoriteKeys change
   */
  useEffect(() => {
    loadFavorites(); // Ensure favorites are loaded from Redux
  }, [loadFavorites]);

  useEffect(() => {
    fetchFavoritesDetails();
  }, [fetchFavoritesDetails]);

  /**
   * Filter items by content type
   */
  const filteredItems = useMemo(() => {
    if (contentType === 'all') return items;
    return items.filter(item => {
      const isTVSeries = item.href?.includes('/tv/');
      return contentType === 'tv' ? isTVSeries : !isTVSeries;
    });
  }, [items, contentType]);

  /**
   * Paginate filtered items
   */
  const paginatedItems = useMemo(() => {
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredItems.slice(startIndex, endIndex);
  }, [filteredItems, page, itemsPerPage]);

  /**
   * Calculate total pages
   */
  const totalPages = useMemo(() => {
    return Math.ceil(filteredItems.length / itemsPerPage);
  }, [filteredItems.length, itemsPerPage]);

  /**
   * Count items by type
   */
  const movieCount = useMemo(() => items.filter(item => !item.href?.includes('/tv/')).length, [items]);
  const tvCount = useMemo(() => items.filter(item => item.href?.includes('/tv/')).length, [items]);

  /**
   * Remove a single favorite
   */
  const removeFavorite = useCallback(async (id: number | string, type: 'movie' | 'tv') => {
    try {
      await toggleFavorite(id, type);
      // fetchFavoritesDetails will be triggered automatically via useEffect
    } catch (err) {
      console.error('Failed to remove favorite:', err);
      throw err;
    }
  }, [toggleFavorite]);

  /**
   * Clear all favorites
   */
  const handleClearAll = useCallback(async () => {
    try {
      await clearAll();
      setItems([]);
      goToPage(1);
    } catch (err) {
      console.error('Failed to clear favorites:', err);
      throw err;
    }
  }, [clearAll, goToPage]);

  /**
   * Handle content type change (reset to page 1)
   */
  const handleSetContentType = useCallback((type: FavoritesContentType) => {
    setContentType(type);
    goToPage(1);
  }, [goToPage]);

  /**
   * Refetch all favorites
   */
  const refetch = useCallback(async () => {
    await loadFavorites();
    await fetchFavoritesDetails();
  }, [loadFavorites, fetchFavoritesDetails]);

  return {
    // Data
    items,
    filteredItems: paginatedItems,

    // Loading states
    loading,
    error,

    // Pagination
    page,
    totalPages,
    goToPage,
    nextPage,
    prevPage,

    // Filters
    contentType,
    setContentType: handleSetContentType,

    // Actions
    removeFavorite,
    clearAllFavorites: handleClearAll,
    refetch,

    // Computed
    isEmpty: items.length === 0,
    hasFiltered: contentType !== 'all',
    totalCount: items.length,
    movieCount,
    tvCount,
  };
}
