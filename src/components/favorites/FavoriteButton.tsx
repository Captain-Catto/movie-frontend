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
  iconOnly?: boolean;
}

const FavoriteButton: React.FC<FavoriteButtonProps> = ({
  movie,
  className = "",
  iconOnly = false,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { showSuccess, showError, showWarning } = useToast();
  const dispatch = useAppDispatch();

  // Get favorite status from Redux store
  const favoriteIds = useAppSelector((state) => state.favorites.favoriteIds);

  // Memoize movie ID to prevent unnecessary re-renders
  const movieId = useMemo(() => {
    // Prefer tmdbId, fallback to id if it's a number
    if (movie?.tmdbId) return movie.tmdbId;
    if (movie?.id && typeof movie.id === "number") return movie.id;
    return null;
  }, [movie?.tmdbId, movie?.id]);

  const isFavorite = useMemo(
    () => (movieId ? favoriteIds.includes(movieId) : false),
    [favoriteIds, movieId]
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

  const handleToggleFavorite = async () => {
    if (!isAuthenticated) {
      showWarning("Login required", "Please login to add favorites");
      return;
    }

    if (!movieId) {
      console.error("❌ Movie ID is missing");
      showError("Invalid movie data");
      return;
    }

    // Debug log
    console.log("💚 Toggling favorite for:", {
      id: movieId,
      title: movie.title,
      mediaType: movie.media_type,
    });

    // Optimistic update - toggle immediately for better UX
    dispatch(optimisticToggle(movieId));
    setIsProcessing(true);

    try {
      // Prepare movie data - only need mediaType for new API
      const movieData = {
        mediaType: movie.media_type || "movie",
      };

      console.log("📤 Sending to backend:", {
        movieId,
        movieData,
      });

      // Dispatch async action
      const result = await dispatch(
        toggleFavoriteAsync({ movieId, movieData })
      ).unwrap();

      // Show success message
      if (result.isFavorite) {
        showSuccess("Added to favorites!", movie.title);
      } else {
        showSuccess("Removed from favorites", movie.title);
      }
    } catch (error) {
      // Revert optimistic update on error
      dispatch(optimisticToggle(movieId));
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
          flex items-center justify-center ${
            iconOnly ? "p-3" : "gap-2 px-4 py-2"
          } rounded-lg bg-gray-200 text-gray-700 opacity-50 cursor-not-allowed
          ${className}
        `}
      >
        <i className="far fa-heart text-lg"></i>
        {!iconOnly && "Loading..."}
      </button>
    );
  }

  return (
    <button
      onClick={handleToggleFavorite}
      disabled={!isAuthenticated}
      className={`
        flex items-center justify-center ${
          iconOnly ? "p-3" : "gap-2 px-4 py-2"
        } transition-all duration-200
        ${
          // Only apply default styling if className doesn't override background
          className && (className.includes("bg-") || className.includes("!bg-"))
            ? ""
            : isFavorite
            ? "bg-red-500 text-white hover:bg-red-600"
            : iconOnly
            ? "bg-black bg-opacity-50 hover:bg-opacity-70 text-white"
            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
        }
        ${className && className.includes("rounded-") ? "" : "rounded-full"}
        ${isProcessing ? "opacity-70" : "opacity-100"}
        ${!isAuthenticated ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
        ${className}
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
        className={`${isFavorite ? "fas" : "far"} fa-heart text-lg ${
          isProcessing ? "animate-pulse" : ""
        }`}
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
