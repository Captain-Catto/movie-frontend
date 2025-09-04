"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Layout from "@/components/layout/Layout";
import MoviesGrid from "@/components/movie/MoviesGrid";
import MovieFilters, { FilterOptions } from "@/components/movie/MovieFilters";
import { MovieCardData } from "@/components/movie/MovieCard";
import { apiService } from "@/services/api";
import { mapMoviesToFrontend } from "@/utils/movieMapper";

export default function MoviesPage() {
  const router = useRouter();
  const [movies, setMovies] = useState<MovieCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleFilterChange = (filters: FilterOptions) => {
    // Chuyển sang trang browse với filters
    const params = new URLSearchParams();
    if (filters.countries?.length)
      params.set("countries", filters.countries.join(","));
    if (filters.genres?.length) params.set("genres", filters.genres.join(","));
    if (filters.years?.length) params.set("years", filters.years.join(","));
    if (filters.movieType) params.set("movieType", filters.movieType);
    if (filters.ratings?.length)
      params.set("ratings", filters.ratings.join(","));
    if (filters.versions?.length)
      params.set("versions", filters.versions.join(","));
    if (filters.sortBy && filters.sortBy !== "latest")
      params.set("sortBy", filters.sortBy);
    params.set("type", "movie");

    router.push(`/browse?${params.toString()}`);
  };

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await apiService.getMovies({
          page: 1,
          limit: 20,
          language: "en-US",
        });

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

        // Fallback to static data on error
        const fallbackMovies: MovieCardData[] = [
          {
            id: "movie1",
            title: "Loading...",
            aliasTitle: "Backend not available",
            poster:
              "https://images.unsplash.com/photo-1534809027769-b00d750a6bac?auto=format&fit=crop&w=500&q=80",
            href: "/movie/1",
            isComplete: false,
          },
        ];
        setMovies(fallbackMovies);
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, []);

  if (loading) {
    return (
      <Layout>
        <div className="pt-16">
          <div className="container mx-auto px-4">
            <h1 className="text-3xl font-bold text-white mb-8">🎬 Phim Lẻ</h1>

            {/* Filter skeleton */}
            <div className="mb-8">
              <div className="w-48 h-8 bg-gray-700/50 animate-pulse rounded mb-4"></div>
              <div className="w-96 h-10 bg-gray-700/50 animate-pulse rounded"></div>
            </div>

            {/* Movies grid skeleton */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {Array.from({ length: 18 }).map((_, index) => (
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
                    <div className="h-3 w-3/4 bg-gray-700/50 animate-pulse rounded" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="pt-16">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold text-white mb-8">🎬 Phim Lẻ</h1>

          {/* Filter Component */}
          <MovieFilters onFilterChange={handleFilterChange} className="mb-8" />

          {error && (
            <div className="bg-red-900/20 border border-red-500 text-red-200 px-4 py-2 rounded mb-4">
              Lỗi: {error}
            </div>
          )}
        </div>

        <MoviesGrid title="" movies={movies} className="py-8" />
      </div>
    </Layout>
  );
}
