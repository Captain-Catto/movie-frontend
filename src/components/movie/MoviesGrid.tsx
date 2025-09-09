"use client";

import MovieCard, { MovieCardData } from "./MovieCard";
import MovieCardSkeleton from "@/components/ui/MovieCardSkeleton";
import { Pagination } from "@/components/ui/Pagination";
import { useLoading } from "@/hooks/useLoading";

interface MoviesGridProps {
  title?: string;
  movies: MovieCardData[];
  showHeader?: boolean;
  className?: string;
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
}

const MoviesGrid = ({
  title = "Danh Sách Phim",
  movies,
  showHeader = true,
  className = "",
  currentPage = 1,
  totalPages = 1,
  onPageChange,
}: MoviesGridProps) => {
  const { isLoading } = useLoading({ delay: 800 });

  // Debug log for pagination props
  console.log("🔍 MoviesGrid pagination props:", {
    currentPage,
    totalPages,
    hasOnPageChange: !!onPageChange,
    moviesCount: movies.length,
  });

  return (
    <div className={`mx-auto px-4 py-8 ${className}`}>
      <div className="cards-grid-wrapper">
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
            {Array.from({ length: 16 }).map((_, index) => (
              <MovieCardSkeleton key={index} />
            ))}
          </div>
        ) : movies.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
            {movies.map((movie, index) => (
              <MovieCard
                key={`${movie.tmdbId || movie.id || index}`}
                movie={movie}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg
                className="mx-auto w-16 h-16 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0012 15c-2.34 0-4.291-1.1-5.7-2.7"
                />
              </svg>
              <h3 className="text-lg font-medium text-white mb-2">
                Không có phim nào
              </h3>
              <p>Danh sách phim hiện tại trống</p>
            </div>
          </div>
        )}
      </div>

      {/* Pagination */}
      {movies.length > 0 && totalPages > 1 && onPageChange && (
        <div className="mt-12">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
            className="mt-8"
          />
        </div>
      )}
    </div>
  );
};

export default MoviesGrid;
