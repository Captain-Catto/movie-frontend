"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Layout from "@/components/layout/Layout";
import MovieFilters, { FilterOptions } from "@/components/movie/MovieFilters";
import { MovieCardData } from "@/components/movie/MovieCard";
import { apiService } from "@/services/api";
import { mapMoviesToFrontend } from "@/utils/movieMapper";

export default function BrowsePage() {
  const searchParams = useSearchParams();
  const [movies, setMovies] = useState<MovieCardData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentFilters, setCurrentFilters] = useState<FilterOptions>({
    countries: [],
    movieType: "",
    ratings: [],
    genres: [],
    versions: [],
    years: [],
    customYear: "",
    sortBy: "latest",
  });
  const [pageTitle, setPageTitle] = useState("🎬 Duyệt Phim");

  const fetchMovies = async (filters: FilterOptions) => {
    try {
      setLoading(true);
      setError(null);

      const queryParams: any = {
        page: 1,
        limit: 20,
        language: "en-US",
      };

      if (filters.genres?.length) queryParams.genre = filters.genres[0];
      if (filters.years?.length) queryParams.year = parseInt(filters.years[0]);

      console.log("Fetching with filters:", queryParams);

      const response = await apiService.getMovies(queryParams);

      if (response.success && response.data) {
        const frontendMovies = mapMoviesToFrontend(response.data);
        const moviesWithCardData: MovieCardData[] = frontendMovies.map(
          (movie) => ({
            id: movie.id,
            title: movie.title,
            aliasTitle: movie.aliasTitle,
            poster: movie.poster,
            href: movie.href,
            year: movie.year,
            rating: movie.rating,
            genre: movie.genre,
            genres: movie.genres,
            description: movie.description,
            isComplete: true,
          })
        );

        setMovies(moviesWithCardData);
      } else {
        throw new Error(response.message || "Failed to fetch movies");
      }
    } catch (err) {
      console.error("Error fetching movies:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
      setMovies([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (filters: FilterOptions) => {
    setCurrentFilters(filters);
    fetchMovies(filters);
  };

  // Xử lý URL parameters từ các trang khác
  useEffect(() => {
    const countries =
      searchParams.get("countries")?.split(",").filter(Boolean) || [];
    const genres = searchParams.get("genres")?.split(",").filter(Boolean) || [];
    const years = searchParams.get("years")?.split(",").filter(Boolean) || [];
    const ratings =
      searchParams.get("ratings")?.split(",").filter(Boolean) || [];
    const versions =
      searchParams.get("versions")?.split(",").filter(Boolean) || [];
    const movieType = searchParams.get("movieType") || "";
    const sortBy = searchParams.get("sortBy") || "latest";
    const type = searchParams.get("type"); // movie, tv, trending

    // Cập nhật title dựa trên type
    switch (type) {
      case "movie":
        setPageTitle("🎬 Duyệt Phim Lẻ");
        break;
      case "tv":
        setPageTitle("📺 Duyệt Phim Bộ");
        break;
      case "trending":
        setPageTitle("🔥 Duyệt Phim Trending");
        break;
      default:
        setPageTitle("🎬 Duyệt Phim");
    }

    const filtersFromUrl: FilterOptions = {
      countries,
      movieType,
      ratings,
      genres,
      versions,
      years,
      customYear: "",
      sortBy,
    };

    setCurrentFilters(filtersFromUrl);
    fetchMovies(filtersFromUrl);
  }, [searchParams]);

  return (
    <Layout>
      <div className="pt-16">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold text-white mb-8">{pageTitle}</h1>

          <MovieFilters
            onFilterChange={handleFilterChange}
            initialFilters={currentFilters}
          />

          {error && (
            <div className="bg-red-900/20 border border-red-500 text-red-200 px-4 py-2 rounded mb-6">
              Lỗi: {error}
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {Array.from({ length: 15 }).map((_, index) => (
                <div key={index} className="sw-item group relative">
                  <div className="v-thumbnail block">
                    <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-gray-800">
                      <div className="absolute inset-0 bg-gray-700/50 animate-pulse" />
                      <div className="absolute top-2 right-2">
                        <div className="w-8 h-8 bg-gray-600/50 animate-pulse rounded-full" />
                      </div>
                    </div>
                  </div>
                  <div className="info mt-3 space-y-2">
                    <div className="h-4 bg-gray-700/50 animate-pulse rounded" />
                    <div className="h-3 w-2/3 bg-gray-700/50 animate-pulse rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {movies.map((movie) => (
                <div key={movie.id} className="group relative">
                  <div className="aspect-[2/3] rounded-lg overflow-hidden bg-gray-800">
                    <img
                      src={movie.poster}
                      alt={movie.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="absolute bottom-4 left-4 right-4">
                        <h3 className="text-white font-semibold text-sm mb-1 line-clamp-2">
                          {movie.title}
                        </h3>
                        {movie.year && (
                          <p className="text-gray-300 text-xs">{movie.year}</p>
                        )}
                        {movie.rating && (
                          <div className="flex items-center mt-1">
                            <span className="text-yellow-400 text-xs">★</span>
                            <span className="text-gray-300 text-xs ml-1">
                              {movie.rating}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && movies.length === 0 && !error && (
            <div className="text-center text-gray-400 py-12">
              <p>Không tìm thấy phim nào với bộ lọc hiện tại.</p>
              <p className="text-sm mt-2">
                Hãy thử thay đổi bộ lọc để xem kết quả khác.
              </p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
