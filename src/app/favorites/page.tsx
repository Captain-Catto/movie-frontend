"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { favoritesService } from "@/services/favorites.service";
import type { ProcessedFavorite, FavoriteQueryParams } from "@/types/favorites.types";
import { Heart } from "lucide-react";
import Layout from "@/components/layout/Layout";
import Container from "@/components/ui/Container";
import MovieCard from "@/components/movie/MovieCard";
import { favoriteToMovieCardData } from "./utils/favoriteHelpers";
import PageSkeleton from "@/components/ui/PageSkeleton";
import { SKELETON_COUNT_MOVIE } from "@/constants/app.constants";
import { Pagination } from "@/components/ui/Pagination";
import { useLanguage } from "@/contexts/LanguageContext";

const FavoritesPage = () => {
  const [favorites, setFavorites] = useState<ProcessedFavorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [, setTotal] = useState(0);
  const [, setHasMore] = useState(true);
  const { isAuthenticated } = useAuth();
  const { language } = useLanguage();
  const isVietnamese = language.toLowerCase().startsWith("vi");

  // Fetch favorites
  const fetchFavorites = useCallback(
    async (pageNum: number = 1) => {
      if (!isAuthenticated) return;



      if (pageNum === 1) {
        setLoading(true);
      }
      setError(null);

      try {
        const queryParams: FavoriteQueryParams = {
          page: pageNum,
          limit: 20,
        };

        const favData = await favoritesService.getUserFavorites(queryParams);
        setFavorites(favData.favorites);

        setHasMore(favData.hasMore);
        setPage(pageNum);
        setTotalPages(favData.totalPages);
        setTotal(favData.total);
      } catch (err) {
        console.error("Error fetching favorites:", err);
        setError(
          isVietnamese
            ? "Không thể tải danh sách yêu thích. Vui lòng thử lại."
            : "Failed to load favorites. Please try again."
        );
      } finally {
        setLoading(false);
      }
    },
    [isAuthenticated, isVietnamese]
  );

  // Initial load
  useEffect(() => {
    if (isAuthenticated) {
      // Only fetch local favorites data

      fetchFavorites(1);
    } else {

    }
  }, [isAuthenticated, fetchFavorites]);

  if (!isAuthenticated) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
          <div className="text-center">
            <Heart className="mx-auto mb-4 text-red-500" size={64} />
            <h1 className="text-2xl font-bold mb-2">
              {isVietnamese ? "Danh sách yêu thích" : "Your Favorites"}
            </h1>
            <p className="text-gray-400">
              {isVietnamese
                ? "Vui lòng đăng nhập để xem phim yêu thích"
                : "Please login to view your favorite movies"}
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  if (loading) {
    return (
      <Layout>
        <PageSkeleton
          title={isVietnamese ? "Yêu thích của tôi" : "My Favorites"}
          items={SKELETON_COUNT_MOVIE}
        />
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
              onClick={() => fetchFavorites(1)}
              className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded"
            >
              {isVietnamese ? "Thử lại" : "Retry"}
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-900 text-white">
        <Container withHeaderOffset>
          <div className="flex items-center gap-3 mb-8">
            <Heart className="text-red-500 fill-current" size={32} />
            <h1 className="text-3xl font-bold">
              {isVietnamese ? "Yêu thích của tôi" : "My Favorites"}
            </h1>
            <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm">
              {isVietnamese
                ? `${favorites.length} phim`
                : `${favorites.length} movie${favorites.length !== 1 ? "s" : ""}`}
            </span>
          </div>

          {favorites.length === 0 ? (
            <div className="text-center py-16">
              <Heart className="mx-auto mb-4 text-gray-600" size={64} />
              <h2 className="text-xl font-semibold mb-2 text-gray-400">
                {isVietnamese ? "Chưa có mục yêu thích" : "No favorites yet"}
              </h2>
              <p className="text-gray-500">
                {isVietnamese
                  ? "Hãy thêm phim vào danh sách yêu thích!"
                  : "Start adding movies to your favorites!"}
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

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-10 flex justify-center">
                  <Pagination
                    currentPage={page}
                    totalPages={totalPages}
                    onPageChange={(nextPage) => fetchFavorites(nextPage)}
                  />
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
