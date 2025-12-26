"use client";

import React, { useState, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { optimisticToggle, toggleFavoriteAsync } from "@/store/favoritesSlice";

interface FavoriteButtonProps {
  movie: {
    id?: number | string;
    tmdbId?: number;
    title: string;
    overview?: string;
    release_date?: string;
    poster_path?: string;
    backdrop_path?: string;
    vote_average?: number;
    genres?: Array<{ id: number; name: string }> | string[];
    media_type?: "movie" | "tv";
  };
  className?: string;
  // add active class to enforce style when favorited
  activeClassName?: string;
  iconOnly?: boolean;
  size?: "default" | "compact";
  stopPropagation?: boolean; // prevent click propagation to parent
  preventDefault?: boolean;
}

const FavoriteButton: React.FC<FavoriteButtonProps> = ({
  movie,
  className = "",
  activeClassName = "!bg-red-600 !hover:bg-red-700 !text-white",
  iconOnly = false,
  size = "default",
  stopPropagation = true,
  preventDefault = true,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastToggleAt, setLastToggleAt] = useState<number | null>(null);
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { showSuccess, showError, showWarning } = useToast();
  const dispatch = useAppDispatch();

  // Get favorite status from Redux store
  const favoriteKeys = useAppSelector((state) => state.favorites.favoriteKeys);

  // Memoize movie ID to prevent unnecessary re-renders
  const movieId = useMemo(() => {
    // Prefer tmdbId, fallback to id if it's a number
    if (movie?.tmdbId) return movie.tmdbId;
    if (movie?.id && typeof movie.id === "number") return movie.id;
    // Support numeric string ids
    if (movie?.id && typeof movie.id === "string") {
      const parsed = parseInt(movie.id, 10);
      return Number.isFinite(parsed) ? parsed : null;
    }
    return null;
  }, [movie?.tmdbId, movie?.id]);

  const movieType = movie?.media_type || "movie";
  const favoriteKey = useMemo(() => {
    if (movieId === null || movieId === undefined) return null;
    return `${movieType}-${movieId}`;
  }, [movieId, movieType]);

  const isFavorite = useMemo(
    () => (favoriteKey ? favoriteKeys.includes(favoriteKey) : false),
    [favoriteKeys, favoriteKey]
  );

  // Don't render if movie data is invalid - fail silently for better UX
  if (!movie || !movieId) {
    // Only warn in development mode
    if (process.env.NODE_ENV === "development") {
      console.warn("⚠️ FavoriteButton: Invalid movie data", {
        movie: movie
          ? { id: movie.id, tmdbId: movie.tmdbId, title: movie.title }
          : null,
        hasId: !!movie?.id,
        hasTmdbId: !!movie?.tmdbId,
        movieId,
        movieType: typeof movie,
        movieKeys: movie ? Object.keys(movie) : "undefined",
      });
    }
    return null;
  }

  const handleToggleFavorite = async (
    e?: React.MouseEvent<HTMLButtonElement>
  ) => {
    if (stopPropagation) e?.stopPropagation();
    if (preventDefault) e?.preventDefault();

    // Prevent rapid double-clicks/spam
    if (isProcessing) return;
    const now = Date.now();
    if (lastToggleAt && now - lastToggleAt < 400) {
      return;
    }
    setLastToggleAt(now);

    if (!isAuthenticated) {
      showWarning("Login required", "You have to login to use this feature");
      return;
    }

    if (!movieId) {
      console.error("❌ Movie ID is missing");
      showError("Invalid movie data");
      return;
    }

    // Optimistic update - toggle immediately for better UX
    if (favoriteKey) {
      dispatch(optimisticToggle(favoriteKey));
    }
    setIsProcessing(true);

    try {
      // Prepare movie data - only need mediaType for new API
      const movieData = {
        mediaType: movie.media_type || "movie",
      };

      // Dispatch async action
      const result = await dispatch(
        toggleFavoriteAsync({
          movieId,
          movieKey: favoriteKey || `${movieData.mediaType}-${movieId}`,
          movieData,
        })
      ).unwrap();

      // Show success message
      if (result.isFavorite) {
        showSuccess("Added to favorites!", movie.title);
      } else {
        showSuccess("Removed from favorites", movie.title);
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
      showError("Failed to update favorite status");
    } finally {
      setIsProcessing(false);
    }
  };

  // Don't render until auth is checked to avoid hydration issues
  if (authLoading) {
    return (
      <button
        disabled
        className={`
          ${iconOnly ? "p-3" : size === "compact" ? "px-3 py-2" : "px-8 py-4"}
          bg-gray-400 text-white font-semibold rounded-lg
          flex items-center ${iconOnly ? "justify-center" : ""} ${
          size === "compact" ? "gap-1.5 text-xs" : "gap-2"
        }
          opacity-50 cursor-not-allowed transition-colors
          ${className}
        `}
      >
        <i className="far fa-heart text-lg"></i>
        {!iconOnly && "Loading..."}
      </button>
    );
  }

  const sizeClasses = iconOnly
    ? size === "compact"
      ? "p-2 text-sm"
      : "p-3 text-base"
    : size === "compact"
    ? "px-3 py-2 text-xs gap-1.5"
    : "px-8 py-4 text-base gap-2";

  return (
    <button
      onClick={handleToggleFavorite}
      aria-pressed={isFavorite}
      data-state={isFavorite ? "on" : "off"}
      className={`
        font-semibold rounded-lg
        flex items-center ${
          iconOnly ? "justify-center" : ""
        } transition-colors cursor-pointer
        ${
          isFavorite
            ? "bg-red-500 hover:bg-red-600 text-white"
            : "bg-gray-600 hover:bg-gray-700 text-white"
        }
        ${isProcessing ? "opacity-70" : "opacity-100"}
        ${sizeClasses}
        ${className}
        ${isFavorite ? activeClassName : ""}
      `}
      title={
        !isAuthenticated
          ? "Login required"
          : isFavorite
          ? "Remove from favorites"
          : "Add to favorites"
      }
    >
      <i
        className={`${isFavorite ? "fas" : "far"} fa-heart ${
          size === "compact" ? "text-sm" : "text-lg"
        } ${isProcessing ? "animate-pulse" : ""}`}
      ></i>
      {!iconOnly &&
        (isProcessing
          ? "Processing..."
          : isFavorite
          ? "Favorited"
          : "Add to Favorites")}
    </button>
  );
};

export default FavoriteButton;
