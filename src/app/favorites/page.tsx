"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import {
  favoritesService,
  ProcessedFavorite,
  SimpleFavoriteQueryParams,
} from "@/services/favorites.service";
import { Heart } from "lucide-react";
import Layout from "@/components/layout/Layout";
import Container from "@/components/ui/Container";
import MovieCard from "@/components/movie/MovieCard";
import { favoriteToMovieCardData } from "./utils/favoriteHelpers";
import PageSkeleton from "@/components/ui/PageSkeleton";
import { SKELETON_COUNT_MOVIE } from "@/constants/app.constants";

const FavoritesPage = () => {
  const [favorites, setFavorites] = useState<ProcessedFavorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const { isAuthenticated } = useAuth();

  // Ref for intersection observer
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Fetch favorites
  const fetchFavorites = useCallback(
    async (pageNum: number = 1, append: boolean = false) => {
      if (!isAuthenticated) return;

      if (pageNum === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      setError(null);

      try {
        const queryParams: SimpleFavoriteQueryParams = {
          page: pageNum,
          limit: 20,
        };

        const response = await favoritesService.getUserFavorites(queryParams);
        console.log("Fetched favorites:", response);
        if (append && pageNum > 1) {
          setFavorites((prev) => [...prev, ...response.favorites]);
        } else {
          setFavorites(response.favorites);
        }

        setHasMore(response.hasMore);
        setPage(pageNum);
      } catch (err) {
        console.error("Error fetching favorites:", err);
        setError("Failed to load favorites. Please try again.");
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [isAuthenticated]
  );

  // Load more when reaching bottom
  const loadMore = useCallback(() => {
    if (!loadingMore && hasMore) {
      fetchFavorites(page + 1, true);
    }
  }, [fetchFavorites, page, loadingMore, hasMore]);

  // Intersection observer for infinite scroll
  useEffect(() => {
    if (!loadMoreRef.current || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(loadMoreRef.current);

    return () => observer.disconnect();
  }, [loadMore, hasMore]);

  // Initial load
  useEffect(() => {
    if (isAuthenticated) {
      // Only fetch local favorites data
      fetchFavorites(1, false);
    }
  }, [isAuthenticated, fetchFavorites]);

  // Sync with Redux state - filter out removed favorites
  // TEMPORARILY DISABLED - causing all favorites to disappear
  /* 
  useEffect(() => {
    // Don't filter if Redux state is not ready or if we have no local favorites
    if (favoriteIds.length === 0 || favorites.length === 0) {
      console.log(`🔍 Skipping filter: Redux IDs=${favoriteIds.length}, Local favorites=${favorites.length}`);
      return;
    }
    
    console.log(`🔍 Starting filter: Redux IDs=[${favoriteIds.join(',')}], Local favorites=[${favorites.map(f => f.id).join(',')}]`);
    
    setFavorites((prevFavorites) => {
      const filteredFavorites = prevFavorites.filter((favorite) => {
        const isIncluded = favoriteIds.includes(favorite.id);
        if (!isIncluded) {
          console.log(`🗑️ Removing favorite: ${favorite.id} (${favorite.title})`);
        }
        return isIncluded;
      });
      
      // Only update if there's actually a change to avoid unnecessary re-renders
      if (filteredFavorites.length !== prevFavorites.length) {
        console.log(`🔄 Filtered favorites: ${prevFavorites.length} → ${filteredFavorites.length}`);
        return filteredFavorites;
      }
      
      return prevFavorites;
    });
  }, [favoriteIds, favorites.length]); // Add favorites.length as dependency
  */

  if (!isAuthenticated) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
          <div className="text-center">
            <Heart className="mx-auto mb-4 text-red-500" size={64} />
            <h1 className="text-2xl font-bold mb-2">Your Favorites</h1>
            <p className="text-gray-400">
              Please login to view your favorite movies
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  if (loading) {
    return (
      <Layout>
        <PageSkeleton title="My Favorites" items={SKELETON_COUNT_MOVIE} />
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-500 mb-4">{error}</p>
            <button
              onClick={() => fetchFavorites(1, false)}
              className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded"
            >
              Retry
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-900 text-white">
        <Container withHeaderOffset className="py-8">
          <div className="flex items-center gap-3 mb-8">
            <Heart className="text-red-500 fill-current" size={32} />
            <h1 className="text-3xl font-bold">My Favorites</h1>
            <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm">
              {favorites.length} movie{favorites.length !== 1 ? "s" : ""}
            </span>
          </div>

          {favorites.length === 0 ? (
            <div className="text-center py-16">
              <Heart className="mx-auto mb-4 text-gray-600" size={64} />
              <h2 className="text-xl font-semibold mb-2 text-gray-400">
                No favorites yet
              </h2>
              <p className="text-gray-500">
                Start adding movies to your favorites!
              </p>
            </div>
          ) : (
            <>
              {/* Grid layout */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                {favorites.map((favorite) => {
                  const movieCardData = favoriteToMovieCardData(favorite);
                  return (
                    <MovieCard
                      key={`${favorite.id}-${favorite.media_type}`}
                      movie={movieCardData}
                    />
                  );
                })}
              </div>

              {/* Infinite scroll trigger */}
              {hasMore && (
                <div
                  ref={loadMoreRef}
                  className="flex justify-center mt-12 py-8"
                >
                  {loadingMore && (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-500"></div>
                      <span>Loading more...</span>
                    </div>
                  )}
                </div>
              )}

              {/* End message */}
              {!hasMore && favorites.length > 0 && (
                <div className="text-center py-8 text-gray-500">
                  You&apos;ve reached the end of your favorites!
                </div>
              )}
            </>
          )}
        </Container>
      </div>
    </Layout>
  );
};

export default FavoritesPage;
