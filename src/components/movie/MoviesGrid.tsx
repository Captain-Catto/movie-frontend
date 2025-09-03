"use client";

import MovieCard, { MovieCardData } from "./MovieCard";
import MovieCardSkeleton from "@/components/ui/MovieCardSkeleton";
import { useLoading } from "@/hooks/useLoading";

interface MoviesGridProps {
  title?: string;
  movies: MovieCardData[];
  showHeader?: boolean;
  className?: string;
}

const MoviesGrid = ({
  title = "Danh Sách Phim",
  movies,
  showHeader = true,
  className = "",
}: MoviesGridProps) => {
  const { isLoading } = useLoading({ delay: 800 });

  return (
    <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 ${className}`}>
      {showHeader && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white">{title}</h2>
          <p className="text-gray-400 mt-2">Tìm thấy {movies.length} phim</p>
        </div>
      )}

      <div className="cards-grid-wrapper">
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {Array.from({ length: 12 }).map((_, index) => (
              <MovieCardSkeleton key={index} />
            ))}
          </div>
        ) : movies.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
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

      {/* Pagination - Mock */}
      {movies.length > 0 && (
        <div className="flex justify-center mt-12">
          <div className="flex items-center space-x-2">
            <button className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors">
              &lt;
            </button>
            <button className="px-4 py-2 bg-red-500 text-white rounded-lg">
              1
            </button>
            <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors">
              2
            </button>
            <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors">
              3
            </button>
            <span className="text-gray-400">...</span>
            <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors">
              10
            </button>
            <button className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors">
              &gt;
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MoviesGrid;
