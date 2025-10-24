"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { useAuth } from "@/hooks/useAuth";
import { favoritesService } from "@/services/favorites.service";

interface FavoritesContextValue {
  favoriteIds: Set<number>;
  isLoading: boolean;
  isFavorite: (movieId: number) => boolean;
  toggleFavorite: (
    movieId: number,
    movieData: {
      title: string;
      overview?: string;
      releaseDate?: string;
      posterPath?: string;
      backdropPath?: string;
      voteAverage?: number;
      genres?: string[];
      mediaType?: "movie" | "tv";
    }
  ) => Promise<boolean>;
  refreshFavorites: () => Promise<void>;
}

const FavoritesContext = createContext<FavoritesContextValue | undefined>(
  undefined
);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favoriteIds, setFavoriteIds] = useState<Set<number>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const { isAuthenticated } = useAuth();

  /**
   * Fetch all favorite movie IDs from backend
   */
  const refreshFavorites = useCallback(async () => {
    if (!isAuthenticated) {
      setFavoriteIds(new Set());
      return;
    }

    try {
      setIsLoading(true);
      const response = await favoritesService.getUserFavorites({
        page: 1,
        limit: 1000,
      });
      const ids = new Set(response.favorites.map((fav) => fav.id));
      setFavoriteIds(ids);
    } catch (error) {
      console.error("Failed to fetch favorites:", error);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  /**
   * Load favorites on mount and when auth changes
   */
  useEffect(() => {
    if (isAuthenticated) {
      refreshFavorites();
    } else {
      setFavoriteIds(new Set());
    }
  }, [isAuthenticated, refreshFavorites]);

  /**
   * Check if a movie is favorited
   */
  const isFavorite = useCallback(
    (movieId: number): boolean => {
      return favoriteIds.has(movieId);
    },
    [favoriteIds]
  );

  /**
   * Toggle favorite status (optimistic update)
   */
  const toggleFavorite = useCallback(
    async (
      movieId: number,
      movieData: {
        title: string;
        overview?: string;
        releaseDate?: string;
      posterPath?: string;
      backdropPath?: string;
      voteAverage?: number;
      genres?: string[];
      mediaType?: "movie" | "tv";
    }
  ): Promise<boolean> => {
      if (!isAuthenticated) {
        throw new Error("Authentication required");
      }

      // Optimistic update
      const wasFavorite = favoriteIds.has(movieId);
      const newFavoriteIds = new Set(favoriteIds);

      if (wasFavorite) {
        newFavoriteIds.delete(movieId);
      } else {
        newFavoriteIds.add(movieId);
      }

      setFavoriteIds(newFavoriteIds);

      try {
        const result = await favoritesService.toggleFavorite({
          contentId: movieId.toString(),
          contentType: movieData.mediaType ?? "movie",
        });

        // Confirm with server response
        const finalFavoriteIds = new Set(favoriteIds);
        if (result.isFavorite) {
          finalFavoriteIds.add(movieId);
        } else {
          finalFavoriteIds.delete(movieId);
        }
        setFavoriteIds(finalFavoriteIds);

        return result.isFavorite;
      } catch (error) {
        // Revert on error
        setFavoriteIds(favoriteIds);
        throw error;
      }
    },
    [isAuthenticated, favoriteIds]
  );

  const value: FavoritesContextValue = {
    favoriteIds,
    isLoading,
    isFavorite,
    toggleFavorite,
    refreshFavorites,
  };

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
}

/**
 * useFavorites hook
 */
export function useFavorites(): FavoritesContextValue {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error("useFavorites must be used within FavoritesProvider");
  }
  return context;
}
