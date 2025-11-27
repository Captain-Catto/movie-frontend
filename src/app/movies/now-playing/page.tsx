"use client";
import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Layout from "@/components/layout/Layout";
import MovieGrid from "@/components/movie/MovieGrid";
import LinkPagination from "@/components/ui/LinkPagination";
import { apiService } from "@/services/api";
import { mapMoviesToFrontend } from "@/utils/movieMapper";
import { MovieCardData } from "@/components/movie/MovieCard";

function NowPlayingPageContent() {
  const [movies, setMovies] = useState<MovieCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const searchParams = useSearchParams();
  const currentPage = Number(searchParams.get("page")) || 1;
  const limit = 20;

  useEffect(() => {
    const fetchNowPlayingMovies = async () => {
      setLoading(true);
      try {
        const response = await apiService.getNowPlayingMovies({
          page: currentPage,
          limit: limit,
          language: "en-US",
        });

        if (response.success && response.data) {
          const mappedMovies = mapMoviesToFrontend(response.data);
          setMovies(mappedMovies as MovieCardData[]);
          if (response.pagination) {
            setTotalPages(response.pagination.totalPages);
            const totalCount =
              typeof response.pagination.total === "number"
                ? response.pagination.total
                : response.pagination.totalItems || 0;
            setTotal(totalCount);
          }
        }
      } catch (error) {
        console.error("Error fetching now playing movies:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNowPlayingMovies();
  }, [currentPage, limit]);

  return (
    <Layout>
      <div className="min-h-screen bg-gray-900 pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">
              Now Playing Movies
            </h1>
            <p className="text-gray-400">
              {total > 0 && `${total} movies now playing in theaters`}
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
                    basePath="/movies/now-playing"
                  />
                </div>
              )}
            </>
          )}

          {/* Empty State */}
          {!loading && movies.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg">No movies found</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

export default function NowPlayingPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] items-center justify-center text-white">
          Loading now playing movies...
        </div>
      }
    >
      <NowPlayingPageContent />
    </Suspense>
  );
}
