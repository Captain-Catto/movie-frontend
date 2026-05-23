"use client";

import {
  createContext,
  use,
  useReducer,
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

type FavoritesState = {
  favoriteIds: Set<number>;
  fetchingFavorites: boolean;
};

type FavoritesAction =
  | { type: "FETCH_START" }
  | { type: "FETCH_SUCCESS"; payload: Set<number> }
  | { type: "FETCH_FAILURE" }
  | { type: "TOGGLE_OPTIMISTIC"; payload: number }
  | { type: "TOGGLE_CONFIRM"; payload: { movieId: number; isFavorite: boolean } }
  | { type: "TOGGLE_REVERT"; payload: Set<number> }
  | { type: "CLEAR" };

function favoritesReducer(state: FavoritesState, action: FavoritesAction): FavoritesState {
  switch (action.type) {
    case "FETCH_START":
      return { ...state, fetchingFavorites: true };
    case "FETCH_SUCCESS":
      return { ...state, fetchingFavorites: false, favoriteIds: action.payload };
    case "FETCH_FAILURE":
      return { ...state, fetchingFavorites: false };
    case "TOGGLE_OPTIMISTIC": {
      const newFavoriteIds = new Set(state.favoriteIds);
      if (newFavoriteIds.has(action.payload)) {
        newFavoriteIds.delete(action.payload);
      } else {
        newFavoriteIds.add(action.payload);
      }
      return { ...state, favoriteIds: newFavoriteIds };
    }
    case "TOGGLE_CONFIRM": {
      const newFavoriteIds = new Set(state.favoriteIds);
      if (action.payload.isFavorite) {
        newFavoriteIds.add(action.payload.movieId);
      } else {
        newFavoriteIds.delete(action.payload.movieId);
      }
      return { ...state, favoriteIds: newFavoriteIds };
    }
    case "TOGGLE_REVERT":
      return { ...state, favoriteIds: action.payload };
    case "CLEAR":
      return { ...state, favoriteIds: new Set() };
    default:
      return state;
  }
}

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(favoritesReducer, {
    favoriteIds: new Set<number>(),
    fetchingFavorites: false,
  });
  const { isAuthenticated } = useAuth();

  /**
   * Fetch all favorite movie IDs from backend
   */
  const refreshFavorites = useCallback(async () => {
    if (!isAuthenticated) {
      dispatch({ type: "CLEAR" });
      return;
    }

    try {
      dispatch({ type: "FETCH_START" });
      const response = await favoritesService.getUserFavorites({
        page: 1,
        limit: 1000,
      });
      const ids = new Set(response.favorites.map((fav) => fav.id));
      dispatch({ type: "FETCH_SUCCESS", payload: ids });
    } catch (error) {
      console.error("Failed to fetch favorites:", error);
      dispatch({ type: "FETCH_FAILURE" });
    }
  }, [isAuthenticated]);

  /**
   * Load favorites on mount and when auth changes
   */
  useEffect(() => {
    refreshFavorites();
  }, [refreshFavorites]);

  /**
   * Check if a movie is favorited
   */
  const isFavorite = useCallback(
    (movieId: number): boolean => {
      return state.favoriteIds.has(movieId);
    },
    [state.favoriteIds]
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

      // Snapshot for revert
      const previousFavoriteIds = state.favoriteIds;

      // Optimistic update
      dispatch({ type: "TOGGLE_OPTIMISTIC", payload: movieId });

      try {
        const result = await favoritesService.toggleFavorite({
          contentId: movieId.toString(),
          contentType: movieData.mediaType ?? "movie",
        });

        // Confirm with server response
        dispatch({
          type: "TOGGLE_CONFIRM",
          payload: { movieId, isFavorite: result.isFavorite },
        });

        return result.isFavorite;
      } catch (error) {
        // Revert on error
        dispatch({ type: "TOGGLE_REVERT", payload: previousFavoriteIds });
        throw error;
      }
    },
    [isAuthenticated, state.favoriteIds]
  );

  const value: FavoritesContextValue = {
    favoriteIds: state.favoriteIds,
    isLoading: state.fetchingFavorites,
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
  const context = use(FavoritesContext);
  if (context === undefined) {
    throw new Error("useFavorites must be used within FavoritesProvider");
  }
  return context;
}
