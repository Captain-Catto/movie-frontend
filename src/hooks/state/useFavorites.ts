"use client";

import { useCallback, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  fetchFavorites,
  toggleFavoriteAsync,
  optimisticToggle,
  clearFavorites,
} from '@/store/favoritesSlice';

/**
 * Favorite item metadata
 */
export interface FavoriteItem {
  id: number;
  type: 'movie' | 'tv';
}

/**
 * Return type for useFavorites hook
 */
export interface UseFavoritesReturn {
  /** Array of favorite keys (type-id format) */
  favoriteKeys: string[];
  /** Loading state */
  isLoading: boolean;
  /** Error message */
  error: string | null;
  /** Check if item is favorited */
  isFavorite: (id: number | string, type?: 'movie' | 'tv') => boolean;
  /** Toggle favorite status */
  toggleFavorite: (id: number | string, type?: 'movie' | 'tv') => Promise<void>;
  /** Load all favorites from server */
  loadFavorites: () => Promise<void>;
  /** Clear all favorites (on logout) */
  clearAllFavorites: () => void;
  /** Get favorite count */
  count: number;
}

/**
 * Create favorite key from id and type
 */
const makeFavoriteKey = (id: string | number, type: 'movie' | 'tv' = 'movie'): string => {
  return `${type}-${id}`;
};

/**
 * Enhanced favorites hook - wrapper around Redux favorites state
 * Provides simplified API for managing user favorites
 *
 * @example
 * ```tsx
 * function MovieCard({ movie }) {
 *   const { isFavorite, toggleFavorite, isLoading } = useFavorites();
 *   const favorited = isFavorite(movie.id, movie.mediaType);
 *
 *   const handleFavoriteClick = async (e) => {
 *     e.stopPropagation();
 *     await toggleFavorite(movie.id, movie.mediaType);
 *   };
 *
 *   return (
 *     <div className="movie-card">
 *       <img src={movie.poster} alt={movie.title} />
 *       <button
 *         onClick={handleFavoriteClick}
 *         disabled={isLoading}
 *       >
 *         {favorited ? <HeartFilled /> : <HeartOutline />}
 *       </button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useFavorites(): UseFavoritesReturn {
  const dispatch = useAppDispatch();
  const { favoriteKeys, isLoading, error } = useAppSelector(
    (state) => state.favorites
  );

  // Check if item is favorited
  const isFavorite = useCallback(
    (id: number | string, type: 'movie' | 'tv' = 'movie'): boolean => {
      const key = makeFavoriteKey(id, type);
      return favoriteKeys.includes(key);
    },
    [favoriteKeys]
  );

  // Toggle favorite status with optimistic update
  const toggleFavorite = useCallback(
    async (id: number | string, type: 'movie' | 'tv' = 'movie'): Promise<void> => {
      const movieId = typeof id === 'string' ? parseInt(id, 10) : id;
      const movieKey = makeFavoriteKey(id, type);

      // Optimistic update
      dispatch(optimisticToggle(movieKey));

      try {
        // API call
        await dispatch(
          toggleFavoriteAsync({
            movieId,
            movieKey,
            movieData: { mediaType: type },
          })
        ).unwrap();
      } catch (error) {
        // Error is already handled by slice (reverts optimistic update)
        console.error('Failed to toggle favorite:', error);
        throw error;
      }
    },
    [dispatch]
  );

  // Load favorites from server
  const loadFavorites = useCallback(async (): Promise<void> => {
    try {
      await dispatch(fetchFavorites()).unwrap();
    } catch (error) {
      console.error('Failed to load favorites:', error);
      throw error;
    }
  }, [dispatch]);

  // Clear all favorites (on logout)
  const clearAllFavorites = useCallback(() => {
    dispatch(clearFavorites());
  }, [dispatch]);

  // Get favorite count
  const count = useMemo(() => favoriteKeys.length, [favoriteKeys]);

  return {
    favoriteKeys,
    isLoading,
    error,
    isFavorite,
    toggleFavorite,
    loadFavorites,
    clearAllFavorites,
    count,
  };
}
