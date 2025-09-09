"use client";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Layout from "@/components/layout/Layout";
import MovieGrid from "@/components/movie/MovieGrid";
import LinkPagination from "@/components/ui/LinkPagination";
import { apiService } from "@/services/api";
import { mapMoviesToFrontend } from "@/utils/movieMapper";

export default function UpcomingPage() {
  const [movies, setMovies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const searchParams = useSearchParams();
  const currentPage = Number(searchParams.get("page")) || 1;
  const limit = 20;

  useEffect(() => {
    const fetchUpcomingMovies = async () => {
      setLoading(true);
      try {
        const response = await apiService.getUpcomingMovies({
          page: currentPage,
          limit: limit,
          language: "en-US",
        });

        if (response.success && response.data) {
          const mappedMovies = mapMoviesToFrontend(response.data);
          setMovies(mappedMovies);
          if (response.pagination) {
            setTotalPages(response.pagination.totalPages);
            setTotal(response.pagination.totalItems || 0);
          }
        }
      } catch (error) {
        console.error("Error fetching upcoming movies:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUpcomingMovies();
  }, [currentPage, limit]);

  return (
    <Layout>
      <div className="min-h-screen bg-gray-900 pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">
              Upcoming Movies
            </h1>
            <p className="text-gray-400">
              {total > 0 && `${total} upcoming movies`}
            </p>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            </div>
          )}

          {/* Movies Grid */}
          {!loading && movies.length > 0 && (
            <>
              <MovieGrid
                movies={movies}
                showFilters={false}
                containerPadding={false}
              />

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-12 flex justify-center">
                  <LinkPagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    basePath="/movies/upcoming"
                  />
                </div>
              )}
            </>
          )}

          {/* Empty State */}
          {!loading && movies.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg">No upcoming movies found</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
